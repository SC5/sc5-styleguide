## 0.3.42 (2016-02-15)

### Improvements
* **Use PostCSS for customizing the view.** Fix #881. (#[883](https://github.com/SC5/sc5-styleguide/pull/883))<br/>
  *Good news: SC5 StyleGuide does not require any SASS in your environment!*<br/>
  If you provide `customColors` options to modify the SC5 StyleGuide view, note that from now one it does not
  require any SASS. Instead we use PostCSS with all the needed plugins. You will require to change the mixin
  declaration of `styleguide_custom_styles` to:
  ```css
  @define-mixin styleguide_custom_styles {
    /* Define your styles here */
  }
  ```
  You are free to use all the PostCSS features provided by plugins: nesting, variables, media, mixins, color
  calculations.<br/>
  Redefining SC5 StyleGuide variables did not change, the SASS-like syntax still works.
* Possibility to use complex wrappers. Fix #877. (#[878](https://github.com/SC5/sc5-styleguide/pull/878))

### Fixes
* Missing npm module doe local cache (#[880](https://github.com/SC5/sc5-styleguide/pull/880))
* Adding styles for table. (#[869](https://github.com/SC5/sc5-styleguide/pull/869))

### Documentation
* Do not recommend to run sc5-styleguide as a command line (#[879](https://github.com/SC5/sc5-styleguide/pull/879))
* Fixed broken links in demo (section 3.5) (#[860](https://github.com/SC5/sc5-styleguide/pull/860))

### Internal
* Use ES6 modules for unit tests (#[862](https://github.com/SC5/sc5-styleguide/pull/862))
* Jade cache, level 2  (#[865](https://github.com/SC5/sc5-styleguide/pull/865))
