module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai'],

    // list of files / patterns to load in the browser
    files: [
      // components
      'lib/app/js/components/angular/angular.js',
      'lib/app/js/components/ui-router/release/angular-ui-router.js',
      'lib/app/js/components/angular-animate/angular-animate.js',
      'lib/app/js/components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
      'lib/app/js/components/angular-local-storage/dist/angular-local-storage.js',
      'lib/app/js/components/highlightjs/highlight.pack.js',
      'lib/app/js/components/angular-highlightjs/angular-highlightjs.js',
      'lib/app/js/components/oclazyload/dist/ocLazyLoad.js',
      'lib/app/js/components/angular-mocks/angular-mocks.js',
      'lib/app/js/components/ngprogress/build/ngProgress.js',
      'lib/app/js/components/angular-debounce/dist/angular-debounce.js',
      'lib/app/js/components/angular-scroll/angular-scroll.js',
      'lib/app/js/components/lodash/lodash.js',
      'lib/app/js/components/custom-event/index.js',
      // application code
      'lib/app/js/*.js',
      'lib/app/js/controllers/*.js',
      'lib/app/js/directives/*.js',
      'lib/app/js/services/*.js',
      // tests
      'test/angular/**/*.js',
      // application view templates
      { pattern: 'lib/app/views/**/*.html', included: false }
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // source files that you want to generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'lib/app/js/*.js': ['coverage'],
      'lib/app/js/!(components)/**/*.js': ['coverage']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],

    plugins: [
      'karma-mocha',
      'karma-sinon-chai',
      'karma-mocha-reporter',
      'karma-phantomjs-launcher',
      'karma-coverage'
    ],

    coverageReporter: {
      dir: 'coverage',
      subdir: '.',
      reporters: [
        { type: 'json',
          file: 'angular-unit-coverage.json'
        },
        { type: 'text',
          file: null
        }
      ]
    },

    // web server port
    port: 8080,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });

  config.set({
    proxies: {
        '/view/': 'http://localhost:' + config.port + '/base/lib/app/views/'
    }
  });

};
