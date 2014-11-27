## 0.2.10 (2014-11-27)

### Features:
* Find all sections that use the selected variable (#[265](https://github.com/SC5/sc5-styleguide/pull/265))
* If a section does not use variables, list its sub-sections' variables (#[275](https://github.com/SC5/sc5-styleguide/pull/275))
* Scope user stylesheet to user markup if the browser supports it. Thank you @Janpot! (#[280](https://github.com/SC5/sc5-styleguide/pull/280))

### Fixes:
* Some headers are not activated due to scrollable area being too short (#[287](https://github.com/SC5/sc5-styleguide/pull/287))
* Fix #266: Do not replace pseudo selectors when they appear inside :not clause (#[279](https://github.com/SC5/sc5-styleguide/pull/279))
* Find used variables also from function parameters (#[267](https://github.com/SC5/sc5-styleguide/pull/267))

### Improvements:
* Show full error message in UI when compilation error happens (#[286](https://github.com/SC5/sc5-styleguide/pull/286))
* Disable "Save changes" button when socket connection is lost (#[282](https://github.com/SC5/sc5-styleguide/pull/282))
* Disable "Reset local changes" button if no variable is dirty (#[289](https://github.com/SC5/sc5-styleguide/pull/289))
* Allow scrollbars in content preview if content is too large (#[277](https://github.com/SC5/sc5-styleguide/pull/277))
* Highlight section header when scrolling (#[273](https://github.com/SC5/sc5-styleguide/pull/273))
* Re-style section headings (#[270](https://github.com/SC5/sc5-styleguide/pull/270))
* Whole section heading is now clickable anchor link (#[272](https://github.com/SC5/sc5-styleguide/pull/272))
* Do not use block section styles when main section does not have markup (#[274](https://github.com/SC5/sc5-styleguide/pull/274))
