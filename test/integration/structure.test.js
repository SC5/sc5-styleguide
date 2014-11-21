var gulp = require('gulp'),
    chai = require('chai'),
    expect = chai.expect,
    through = require('through2'),
    styleguide = require('requirefrom')('lib')('styleguide'),
    defaultSource = './test/projects/scss-project/source/**/*.scss',
    defaultConfig = {
      title: 'Test Styleguide',
      overviewPath: './test/projects/scss-project/source/test_overview.md',
      appRoot: '/my-styleguide-book',
      extraHead: [
        '<link rel="stylesheet" type="text/css" href="your/custom/style.css">',
        '<script src="your/custom/script.js"></script>'
      ],
      commonClass: ['custom-class-1', 'custom-class-2'],
      styleVariables: './test/projects/scss-project/source/styles/_styleguide_variables.scss',
      sass: {
        // Options passed to gulp-ruby-sass
      },
      filesConfig: []
    };

chai.config.includeStack = true;

function styleguideStream(source, config) {
  return gulp.src(source || defaultSource)
    .pipe(styleguide(config || defaultConfig));
}

// This collector collects all files from the stream to the array passed as parameter
function collector(collection) {
  return function(file, enc, cb) {
    if (!file.path) {
      return;
    }
    collection.push(file);
    cb();
  };
}

function findFile(files, name) {
  for (var i = files.length - 1; i >= 0; i--) {
    if (files[i].relative === name) {
      return files[i];
    }
  }
}

describe('index.html', function() {
  var indexHtml;
  this.timeout(5000);

  before(function(done) {
    var files = [];
    styleguideStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        indexHtml = findFile(files, 'index.html');
        done();
      })
    );
  });

  it('should exist', function() {
    expect(indexHtml).to.be.an('object');
  });

  it('should contain correct title', function() {
    expect(indexHtml.contents.toString()).to.contain('>Test Styleguide</title>');
  });

  it('should contain CSS style passed as parameter', function() {
    expect(indexHtml.contents.toString()).to.contain('<link rel="stylesheet" type="text/css" href="your/custom/style.css">');
  });

  it('should contain JS file passed as parameter', function() {
    expect(indexHtml.contents.toString()).to.contain('<script src="your/custom/script.js"></script>');
  });

  it('should contain filesConfig passed as parameter and in correct format', function() {
    expect(indexHtml.contents.toString()).to.contain('var filesConfig = []');
  });

  it('should define application root', function() {
    expect(indexHtml.contents.toString()).to.contain('<base href="/my-styleguide-book/" />')
  });
});

describe('styleguide_pseudo_styles.css', function() {
  var styleguideFile;
  this.timeout(5000);

  before(function(done) {
    var files = [];
    styleguideStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        styleguideFile = findFile(files, 'styleguide_pseudo_styles.css');
        done();
      })
    );
  });

  it('should exist', function() {
    expect(styleguideFile).to.be.an('object');
  });
});

describe('overview.html', function() {
  var overviewHtml;
  this.timeout(5000);

  before(function(done) {
    var files = [];

    styleguideStream().pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        overviewHtml = findFile(files, 'overview.html');
        done();
      })
    );
  });

  it('should exist', function() {
    expect(overviewHtml).to.be.an('object');
  });

  it('should have valid headers with sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<h1 class="sg">Title1</h1>');
    expect(overviewHtml.contents.toString()).to.contain('<h2 class="sg">Title2</h2>');
  });

  it('should have valid paragraph with sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<p class="sg">Ut turkish, wings, sit to go barista half');
  });

  it('should escape code snippets and add sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<pre class="sg"><code>&lt;div class=&quot;foobar&gt;Test code snippet&lt;/div&gt;\n</code></pre>');
  });

  it('should have valid links with sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<a class="sg" href="http://example.com">Example link</a>');
  });

  it('should have valid headers with sg class', function() {
    expect(overviewHtml.contents.toString()).to.contain('<h1 class="sg">Title1</h1>');
    expect(overviewHtml.contents.toString()).to.contain('<h2 class="sg">Title2</h2>');
  });
});

function sharedStyleguideCss() {
  it('should exist', function() {
    expect(this.styleguideFile).to.be.an('object');
  });

  it('should be processed correctly', function() {
    expect(this.styleguideFile.contents.toString()).to.contain('.section {\n  color: #ff0000;');
  });
}

function sharedStyleguideJSON() {
  it('should exist', function() {
    expect(this.jsonData).to.be.an('object');
  });

  it('should contain correct title', function() {
    expect(this.jsonData.config.title).to.eql('Test Styleguide');
  });

  it('should contain correct appRoot', function() {
    expect(this.jsonData.config.appRoot).to.eql('/my-styleguide-book');
  });

  it('should contain extra heads in correct format', function() {
    expect(this.jsonData.config.extraHead).to.eql(defaultConfig.extraHead[0] + '\n' + defaultConfig.extraHead[1]);
  });

  it('should contain all common classes', function() {
    expect(this.jsonData.config.commonClass).to.eql(['custom-class-1', 'custom-class-2']);
  });

  it('should contain all style variables from defined file', function() {
    var sassData = [
      {name: 'color-red', value: '#ff0000'},
      {name: 'color-green', value: '#00ff00'},
      {name: 'color-blue', value: '#0000ff'}
    ];
    expect(this.jsonData.config.settings).to.eql(sassData);
  });

  it('should not reveal outputPath', function() {
    expect(this.jsonData.config.outputPath).to.not.exist;
  });

  it('should have all the modifiers', function() {
    expect(this.jsonData.sections[1].modifiers.length).to.eql(4);
  });

  // Markup

  it('should print markup if defined', function() {
    expect(this.jsonData.sections[0].markup).to.not.be.empty;
  });

  it('should not print empty markup', function() {
    expect(this.jsonData.sections[2].markup).to.not.exist;
  });

  // Related CSS

  it('should not print empty CSS', function() {
    expect(this.jsonData.sections[1].css).to.not.exist;
  });

  it('should have section CSS', function() {
    expect(this.jsonData.sections[2].css).to.eql('.test-css {color: purple;}');
  });

  // Related variables

  it('should contain all related variables', function() {
    var relatedVariables = ['color-red', 'color-green', 'color-blue'];
    expect(this.jsonData.sections[3].variables).to.eql(relatedVariables);
  });

  it('should parse related variables also from modifiers', function() {
    var relatedVariables = ['color-red', 'color-green', 'color-blue'];
    expect(this.jsonData.sections[1].variables).to.eql(relatedVariables);
  });

  it('should not add variables if section does not contain related variables', function() {
    expect(this.jsonData.sections[2].variables).to.eql([]);
  })
}

describe('styleguide.css for SCSS project', function() {
  beforeEach(function(done) {
    var files = [],
      _this = this,
      source,
      config;

    config = defaultConfig;
    config.styleVariables = './test/projects/scss-project/source/styles/_styleguide_variables.scss';
    source = './test/projects/scss-project/source/**/*.scss';
    styleguideStream(source, config).pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        _this.styleguideFile = findFile(files, 'styleguide.css');
        done();
      })
    );
  });

  sharedStyleguideCss();
});

describe('styleguide.css for LESS project', function() {
  beforeEach(function(done) {
    var files = [],
      _this = this,
      source,
      config;

    config = defaultConfig;
    config.styleVariables = './test/projects/less-project/source/styles/_styleguide_variables.less';
    source = './test/projects/less-project/source/**/*.less';
    styleguideStream(source, config).pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        _this.styleguideFile = findFile(files, 'styleguide.css');
        done();
      })
    );
  });

  sharedStyleguideCss();
});

describe('styleguide.json for SCSS project', function() {
  beforeEach(function(done) {
    var files = [],
      _this = this,
      source,
      config;

    config = defaultConfig;
    config.styleVariables = './test/projects/scss-project/source/styles/_styleguide_variables.scss';
    source = './test/projects/scss-project/source/**/*.scss';
    styleguideStream(source, config).pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        _this.jsonData = JSON.parse(findFile(files, 'styleguide.json').contents);
        done();
      })
    );
  });

  sharedStyleguideJSON();
});

describe('styleguide.json for LESS project', function() {
  beforeEach(function(done) {
    var files = [],
      _this = this,
      source,
      config;

    config = defaultConfig;
    config.styleVariables = './test/projects/less-project/source/styles/_styleguide_variables.less';
    source = './test/projects/less-project/source/**/*.less';
    styleguideStream(source, config).pipe(
      through.obj({objectMode: true}, collector(files), function(callback) {
        _this.jsonData = JSON.parse(findFile(files, 'styleguide.json').contents);
        done();
      })
    );
  });

  sharedStyleguideJSON();
});
