## 0.2.7 (2014-11-18)

### Features
* Parse section related variables to styleguide.json (#[188](https://github.com/SC5/sc5-styleguide/pull/188))
* Use Github readme as a demo project overview page (#[202](https://github.com/SC5/sc5-styleguide/pull/202))
* Don't bail out in case of parsing errors; emit compile error event to UI (#[201](https://github.com/SC5/sc5-styleguide/pull/201))

### Fixes
* Fix #191: Sort styleguide sections by reference number (#[197](https://github.com/SC5/sc5-styleguide/pull/197))
* Fix: Styles are no longer added twice in the demo project. Fixes Firefox icon font problem (#[195](https://github.com/SC5/sc5-styleguide/pull/195))
* Ometa splitter is not in use any more (#[198](https://github.com/SC5/sc5-styleguide/pull/198))

### Improvements
* Use new version of Gonzales (#[194](https://github.com/SC5/sc5-styleguide/pull/194))
* Move development instructions to own file, add TOC to readme (#[203](https://github.com/SC5/sc5-styleguide/pull/203))
* Refactor: use promises in styleguide.js, use named functions instead of comments, general readability improvements (#[193](https://github.com/SC5/sc5-styleguide/pull/193))
* Add gulp task "dev", a shorthand for watch with parameters (#[192](https://github.com/SC5/sc5-styleguide/pull/192))
* Add no-fail sass gulp task. Gulp build will fail and exit on sass errors, watches should not. (#[196](https://github.com/SC5/sc5-styleguide/pull/196))
