## 0.2.6 (2014-11-14)

### Features
* Add header error state styles to styleguide (#[182](https://github.com/SC5/sc5-styleguide/pull/182))
* Integrate KSS splitter. Show related CSS styles in UI (#[181](https://github.com/SC5/sc5-styleguide/pull/181))
* Gonzales based KSS splitter + more complex tests (#[180](https://github.com/SC5/sc5-styleguide/pull/180))
* Notify the UI of sass compile errors (#[179](https://github.com/SC5/sc5-styleguide/pull/179))
* Fix: Support styleVariables parameter also when running styleguide executable (#[174](https://github.com/SC5/sc5-styleguide/pull/174))
* Possibility to define separate src for less and sass compiling (#[167](https://github.com/SC5/sc5-styleguide/pull/167))
* Show an error icon when socket is disconnected (#[168](https://github.com/SC5/sc5-styleguide/pull/168))
* Finetune socket disconnected icon styles (#[175](https://github.com/SC5/sc5-styleguide/pull/175))
* Store information if designer tool variable is changed. Smarter change merging (#[161](https://github.com/SC5/sc5-styleguide/pull/161))
* Do not list variables alphabetically in Designer Tool (#[157](https://github.com/SC5/sc5-styleguide/pull/157))

### Fixes
* Fix: Regexp splitter does not detect blocks correctly in some cases (#[177](https://github.com/SC5/sc5-styleguide/pull/177))
* Fix: Add missing width to disconnect icon styles (#[178](https://github.com/SC5/sc5-styleguide/pull/178))
* Hide socket connection icon and Designer Tool if socket is not used (#[173](https://github.com/SC5/sc5-styleguide/pull/173))
* Do not stop watch when SASS compile error occurs (#[165](https://github.com/SC5/sc5-styleguide/pull/165))
* Fix: Add input focus color back (#[164](https://github.com/SC5/sc5-styleguide/pull/164))
* Fixing default cursor value (#[176](https://github.com/SC5/sc5-styleguide/pull/176))
* Fix sass and less src parameter handling (#[170](https://github.com/SC5/sc5-styleguide/pull/170))
* Fix: Sync deleted and added variables in designer tool (#[158](https://github.com/SC5/sc5-styleguide/pull/158))

### Improvements
* Add test for SASS and LESS processing (#[183](https://github.com/SC5/sc5-styleguide/pull/183))
* Separate wrapper markup generator to its own module (#[163](https://github.com/SC5/sc5-styleguide/pull/163))
* Add coveralls configuration and install node-coveralls (#[160](https://github.com/SC5/sc5-styleguide/pull/160))
* Add Istanbul code coverage instrumentation and lcov report generation (#[159](https://github.com/SC5/sc5-styleguide/pull/159))
* Form renderer in a separate testable method (#[156](https://github.com/SC5/sc5-styleguide/pull/156))
