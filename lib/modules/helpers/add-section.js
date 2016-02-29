var through = require('through2'),
  path = require('path'),
  gutil = require('gulp-util'),
  File = require('vinyl'),
  minimist = require('minimist'),

  kssSplitter = require('../kss-splitter');

module.exports = function(options) {
  var throughOpts = {
      objectMode: true,
      allowHalfOpen: false
    };

  // Parameters
  var args = minimist(process.argv.slice(2)),
    params = {
      name: args.name || args.n,
      order: args.order || args.o
    };

  var parsers = options && options.parsers || 'undefined';

  // Validate params

  if (!params.name) {
    gutil.beep();
    gutil.log(gutil.colors.red('Define name with --name=my-name'));
    return;
  }

  if (!params.order) {
    gutil.beep();
    gutil.log(gutil.colors.red('Define name with --order=1.2.3'));
    return;
  }

  params.order = params.order.toString();

  var sectionRegExp = /(Styleguide )([0-9]+(\.[0-9]+)*)/;

  var allFiles = [];

  var nearestSibling = null;

  function isLess(left, right) {
    left = left.split('.');
    right = right.split('.');

    var l = false;

    for (var i = 0; i < Math.max(left.length, right.length); i++) {
      if (parseInt(left[i]) < parseInt(right[i])) {
        l = true;
        break;
      }
      if (parseInt(left[i]) > parseInt(right[i])) {
        l = false;
        break;
      }
    }

    return l;
  }

  function getFinalZeros(number) {
     var match = number.match(/^(\d+(?:\.\d+)*?)((?:\.0)*)$/);
     return {
       full: number,
       pure: match[1],
       zeros: match[2]
     };
  }

  /*function isEqual(left, right) {
    var findZeros = /^(\d+(?:\.\d+)*?)((?:\.0)*)$/;
    // Remove ending zeros
    left = left.match(findZeros);
    if (left !== null) {
      left = left[1];
    } else {
      return false;
    }
    right = right.match(findZeros);
    if (right !== null) {
      right = right[1];
    } else {
      return false;
    }

    return (left === right);
  }*/

  function ifBelongsToParent(parentSection, section) {
    var belongs = true;
    parentSection = parentSection && parentSection.split('.');
    section = section.split('.');

    parentSection && parentSection.forEach(function(val, n) {
      if (val !== section[n]) {
        belongs = false;
      }
    });
    return belongs;
  }

  function increaseSection(section, newSection, diff) {
    // remove final zeros
    var normalizedSection = getFinalZeros(section);
    var normalizedSectionArray = normalizedSection.pure.split('.');

    var normalizedNewSection = getFinalZeros(newSection);
    var normalizedNewSectionArray = normalizedNewSection.pure.split('.');

    // Shold increase the same register as there are in new section
    var registerIndex = normalizedNewSectionArray.length - 1;
    if (normalizedSectionArray[registerIndex]) {
      normalizedSectionArray[registerIndex] = parseInt(normalizedSectionArray[registerIndex]) + diff;
    }

    return normalizedSectionArray.join('.') + normalizedSection.zeros;
  }

  function changeNumber(blocks, order, fileIndex) {
    return blocks.map(function(block){
      if (!block.kss) {
        return block;
      }
      var match = block.kss.match(sectionRegExp);
      var currentNumber = match[2];

      if (isLess(currentNumber, order)) {
        return block;
      }

      var parentSection = order.split('.');
      parentSection.pop();
      parentSection = parentSection.join('.');

      if (!ifBelongsToParent(parentSection, currentNumber)) {
        return block;
      }

      /*if (isEqual(parentSection, currentNumber)) {
        console.log('isEqual', parentSection, currentNumber);
        return block;
      }*/

      var newVal = increaseSection(currentNumber, order, 1);

      block.kss = block.kss.replace(sectionRegExp, '$1' + newVal);
      allFiles[fileIndex].modified = true;

      return block;
    });
  }

  function bufferFileContents(file, enc, done) {

    this.push(file);

    var contents = file.contents.toString(),
      syntax = path.extname(file.path).substring(1),
      parser = parsers  ? parsers[syntax] : 'undefined',
      blocks = kssSplitter.getBlocks(contents, syntax, parser);

    // check if a block is nearest sibling;
    blocks.forEach(function(block, index) {
      if (!block.kss) {
        return;
      }
      var match = block.kss.match(sectionRegExp);
      var currentNumber = match[2];
      if (!nearestSibling) {
        nearestSibling = {
          number: currentNumber,
          file: file,
          blockIndex: index
        };
        return;
      }

      // to become a nearestSibling currentNumber should be
      // less than newNumber but more than actual nearestSibling
      if (isLess(currentNumber, params.order) && !isLess(currentNumber, nearestSibling.number)) {
        nearestSibling = {
          number: currentNumber,
          file: file,
          blockIndex: index
        };
      }
    });

    allFiles.push({
      file: file,
      blocks: blocks,
      syntax: syntax
    });
    done();
  }

  return through(throughOpts, bufferFileContents, function(cb) {

    // increment numbers
    allFiles.forEach(function(fileSource, k) {
      var blocks = changeNumber(fileSource.blocks, params.order, k);
      fileSource.blocks = blocks;
      allFiles[k] = fileSource;
    });

    // add new section
    allFiles.forEach(function(fileSource, k) {
      if(fileSource.file.path === nearestSibling.file.path) {

        var newContent = [
          params.name,
          '',
          'Styleguide ' + params.order
        ];
        if (fileSource.syntax === 'css' || fileSource.syntax === 'scss') {
          newContent.unshift('/*');
          newContent.push('*/');
        }
        if (fileSource.syntax === 'less' || fileSource.syntax === 'sass') {
          newContent = newContent.map(function(line){
            return '// ' + line;
          });
        }

        fileSource.blocks.splice(nearestSibling.blockIndex + 1, 0, {
          kss: newContent.join('\n') + '\n\n',
          code: ''
        });
        fileSource.modified = true;
        allFiles[k] = fileSource;
      }
    });

    // write files back
    var stream = this;

    allFiles.forEach(function(fileSource){

      var content = fileSource.modified ? fileSource.blocks.map(function(block){
        return block.kss + block.code;
      }).join('') : fileSource.file.contents;

      stream.push(new File({
        path: fileSource.file.relative,
        contents: new Buffer(content)
      }));
    });

    cb();
  });

};
