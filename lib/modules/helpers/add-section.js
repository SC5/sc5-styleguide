var through = require('through2'),
  gutil = require('gulp-util'),
  File = require('vinyl'),
  minimist = require('minimist'),

  kssSplitter = require('../kss-splitter');

module.exports = function() {
  var throughOpts = {
      objectMode: true,
      allowHalfOpen: false
    };

  function bufferFileContents(file, enc, done) {
    console.log('I am file');
    this.push(file);
    done();
  };

  // Parameters
  var args = minimist(process.argv.slice(2)),
    params = {
      name: args.name || args.n,
      order: args.order || args.o
    };

  // Validate params

  if (!params.name) {
    gutil.beep();
    gutil.log(gutil.colors.red("Define name with --name=my-name"));
    return;
  }

  if (!params.order) {
    gutil.beep();
    gutil.log(gutil.colors.red("Define name with --order=1.2.3"));
    return;
  }

  params.order = params.order.toString();

  var sectionRegExp = /(Styleguide )([0-9]+(\.[0-9]+)*)/;

  var allFiles = [];

  function addSection(file) {
    changeNumber(file, params.order)
  }

  function isLess(left, right) {
    left = left.split(".");
    right = right.split(".");

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

  function ifBelongsToParent(parentSection, section) {
    var belongs = true;
    parentSection = parentSection && parentSection.split(".");
    section = section.split(".");

    parentSection && parentSection.forEach(function(val, n) {
      if (val !== section[n]) {
        belongs = false;
      }
    });
    return belongs;
  }

  function increaseSection(section, diff) {
    section = section.split(".");
    var last = section.pop();
    section.push(parseInt(last) + diff);
    return section.join(".");
  }

  function changeNumber(blocks, order) {
    return blocks.map(function(block){
      if (!block.kss) {
        return block;
      }
      var match = block.kss.match(sectionRegExp);
      var currentNumber = match[2];

      if (isLess(currentNumber, order)) {
        return block;
      }

      var parentSection = order.split(".");
      parentSection.pop();
      parentSection = parentSection.join(".");

      if (!ifBelongsToParent(parentSection, currentNumber)) {
        return block;
      }

      if (parentSection === currentNumber) {
        return block;
      }

      var newVal = increaseSection(currentNumber, 1);

      block.kss = block.kss.replace(sectionRegExp, "$1" + newVal);

      return block;
    });
  }

  function bufferFileContents(file, enc, done) {

    this.push(file);

    var contents = file.contents.toString(),
      syntax = 'css',
      parser = 'postcss',
      blocks = kssSplitter.getBlocks(contents, syntax, parser);

    blocks = changeNumber(blocks, params.order);

    allFiles.push({
      file: file,
      blocks: blocks
    })
    done();
  }

  return through(throughOpts, bufferFileContents, function(cb) {

    // write files back
    var stream = this;

    allFiles.forEach(function(fileSource){

      var content = fileSource.blocks.map(function(block){
        return block.kss + block.code;
      }).join('\n\n');

      stream.push(new File({
        path: fileSource.file.relative,
        contents: new Buffer(content)
      }));
    });

    cb();
  });

}
