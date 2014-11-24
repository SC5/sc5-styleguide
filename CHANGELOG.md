## 0.2.8 (2014-11-24)

### Features

* Show related variables in the designer tool (#[214](https://github.com/SC5/sc5-styleguide/pull/214))
* Add css.src option; can be used to control which files are bundled (#[237](https://github.com/SC5/sc5-styleguide/pull/237))

### Fixes

* Fix: Styles are no longer added twice in the demo project. Fixes Firefox icon font problem (#[195](https://github.com/SC5/sc5-styleguide/pull/195))
* Fix #191: Sort styleguide sections by reference number (#[197](https://github.com/SC5/sc5-styleguide/pull/197))

### Improvements

* Add gulp task "dev", a shorthand for watch with parameters (#[192](https://github.com/SC5/sc5-styleguide/pull/192))
* Use new version of Gonzales (#[194](https://github.com/SC5/sc5-styleguide/pull/194))
* Don't bail out in case of parsing errors; emit compile error event to UI (#[201](https://github.com/SC5/sc5-styleguide/pull/201)
* Improve designer tool not to overflow over content (#[220](https://github.com/SC5/sc5-styleguide/pull/220))
)
* Log error if two KSS sections have the same reference number (#[223](https://github.com/SC5/sc5-styleguide/pull/223))
* Show designer tool always. Disable variable saving when socket.io does not exists (#[244](https://github.com/SC5/sc5-styleguide/pull/244))
* Test that error callback is called on sass/less preprocessing errors (#[248](https://github.com/SC5/sc5-styleguide/pull/248))
