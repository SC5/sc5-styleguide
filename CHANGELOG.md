## 2.0.1 (2017-06-28)

* fix sidenav animation (#[1102](https://github.com/SC5/sc5-styleguide/pull/1102))

## 2.0.0 (2017-06-27)
**Breaking change**
Breaking change: Nodejs versions under 1 are no longer supported.

* Replace smart quotes with straight quotes (#[1096](https://github.com/SC5/sc5-styleguide/pull/1096))
* hamburger menu closed by default (#[1100](https://github.com/SC5/sc5-styleguide/pull/1100))

### Credits

Thanks to [Patrizio Sotgiu](https://github.com/patriziosotgiu) for contribution into this release.


## 1.9.0 (2017-06-02)

**Breaking change**
Breaking change: Option excludeDefaultStyles changed to includeDefaultStyles for better clarification. The default value of this option is true. (#[for more details](https://github.com/SC5/sc5-styleguide#build-options))
* Fix #1088 customstyles missing on clean install (#[1093](https://github.com/SC5/sc5-styleguide/pull/1093)) (#[1094](https://github.com/SC5/sc5-styleguide/pull/1094))

* Added build option showReferenceNumbers (#[1089](https://github.com/SC5/sc5-styleguide/pull/1089))


## 1.8.1 (2017-05-08)

* Fix #1082 exclude global styles by parameter (#[1085](https://github.com/SC5/sc5-styleguide/pull/1085))

## 1.8.0 (2017-05-05)

* Feature exclude default styles (#[1081](https://github.com/SC5/sc5-styleguide/pull/1081))

## 1.7.0 (2017-05-04)

* Update angular version (#[1078](https://github.com/SC5/sc5-styleguide/pull/1078))
* escape hljs attributed div and markdown-it version update (#[1075](https://github.com/SC5/sc5-styleguide/pull/1075))
* Output meaningful error message to the console; (#[1074](https://github.com/SC5/sc5-styleguide/pull/1074), closes [#1054](https://github.com/SC5/sc5-styleguide/issues/1054))

Thanks to @DanielaValero for helping this release happen!


## 1.6.0 (2017-04-10)

*** Feature
* Deploy landing page from folder (#[1062](https://github.com/SC5/sc5-styleguide/pull/1062))

### Improvement
* Update README.md Grunt Example (#[1068](https://github.com/SC5/sc5-styleguide/pull/1068))

### Fixes
* change the order of styles so that styleguide styles can override app… (#[1069](https://github.com/SC5/sc5-styleguide/pull/1069))

### Credits

Thanks to [Dandy Umlauft](https://github.com/beam2web) for contribution into this release.


## 1.5.0 (2017-01-18)

### Updates
* Switch from Jade to Pug. Fix #993 (#[1060](https://github.com/SC5/sc5-styleguide/pull/1060))

### Improvement
* Only subsections are navigable if hideSectionsOnMainSection option is true (#[1059](https://github.com/SC5/sc5-styleguide/pull/1059))

### Fixes
* Fixed sockets to reload styleguide pages on code changes. Fix #1045 (#[1055](https://github.com/SC5/sc5-styleguide/pull/1055))
* docs: Removed duplicate command line arg (#[1057](https://github.com/SC5/sc5-styleguide/pull/1057))
* Fix layout and mobile toggle for sidenav  option (#[1056](https://github.com/SC5/sc5-styleguide/pull/1056))

### Credits

Thanks to [Jeremy AAsum](https://github.com/jaasum) for contribution into this release.


## 1.4.1 (2017-01-03)

*** Feature
* hideSubsectionsOnMainSection option added for show/hide subsections on main section view (#[1052](https://github.com/SC5/sc5-styleguide/pull/1052))
* favIcon option added (#[1048](https://github.com/SC5/sc5-styleguide/pull/1048))

## 1.4.0 (2016-12-28)

### Updates
* Update Gonzales parser to version 4. Fix #1038 (#[1049](https://github.com/SC5/sc5-styleguide/pull/1049))

### Fixes
* Parse additional params correctly if many modifiers are in use. Fix #1037 (#[1050](https://github.com/SC5/sc5-styleguide/pull/1050))

### Internal
* Updated README.md with svg badge (#[1046](https://github.com/SC5/sc5-styleguide/pull/1046))

## 1.3.3 (2016-11-28)

*** Feature 
* showMarkupSection option added for show/hide markup section (#[1039](https://github.com/SC5/sc5-styleguide/pull/1039))
*** Improvement
* In mobile layout sidenav is hidden by default (#[1040](https://github.com/SC5/sc5-styleguide/pull/1040))


## 1.3.2 (2016-11-17)

*** Improvement
* Improvements and bug fixes for side navigation (#[1034](https://github.com/SC5/sc5-styleguide/pull/1034))

## 1.3.1 (2016-11-11)

### Fixes
* Allow trailing spaces in between KSS parameters. Fix#1027 (#[1031](https://github.com/SC5/sc5-styleguide/pull/1031))
* Bump to socket.io 1.4.0 (#[1032](https://github.com/SC5/sc5-styleguide/pull/1032))

### Internal
* Officially support node@6.9. Fix#1025. (#[1026](https://github.com/SC5/sc5-styleguide/pull/1026))

### Credits

Thanks to [Marinho Brandão](https://github.com/marinho) for contribution into this release.

## 1.3.0 (2016-11-04)

### Features
* Allow to run multiple styleguide servers on different ports. Fix #1019 (#[1021](https://github.com/SC5/sc5-styleguide/pull/1021))
* Build option to disable server log. Fix #1007 (#[1022](https://github.com/SC5/sc5-styleguide/pull/1022))

### Fixes
* Fix#1017 Parse SCSS variable declarations without spaces (#[1018](https://github.com/SC5/sc5-styleguide/pull/1018))

### Internal
* Unit test for not considering spaces in variable definitions (#[1020](https://github.com/SC5/sc5-styleguide/pull/1020))

## 1.2.0 (2016-09-16)

### Fixes
* Fix broken scrollbar on overview anchor tags and also fix navbar (#[1006](https://github.com/SC5/sc5-styleguide/pull/1006))

### Improvement
* Update gonzales-pe to a newer version (#[1002](https://github.com/SC5/sc5-styleguide/pull/1002))

### Credits

Thanks to [Sascha Egerer](https://github.com/sascha-egerer)
for making this release happen.

## 1.1.3 (2016-09-02)

### Fixes
* Fix to return the ocLazyLoading promise on resolve (#[998](https://github.com/SC5/sc5-styleguide/pull/998))
* Fix sideNav undefined error in console (#[1004](https://github.com/SC5/sc5-styleguide/pull/1004))
* Fix a styleguide styling issue regarding the $content-max-width scss variable (#[1003](https://github.com/SC5/sc5-styleguide/pull/1003))

### Credits

Thanks to [Camilo Vasco](https://github.com/kmilov) and [Alastair Hodgson] (https://github.com/stikoo)
for making this release happen.

## 1.1.2 (2016-08-23)

### Improvements
* fix navbar loading hiccups (#[994](https://github.com/SC5/sc5-styleguide/pull/994))

### Fixes
* fix the huge delay during gulp dev task (#[995](https://github.com/SC5/sc5-styleguide/pull/995))
* fix Removed appRoot property from socket.io script src to stop 404 (#[989](https://github.com/SC5/sc5-styleguide/pull/989))

### Credits

Thanks to [Jim Doyle](https://github.com/superelement)
for making this release happen.

## 1.1.1 (2016-08-04)

### Improvement
* class name added to shadow-dom and section (#[985](https://github.com/SC5/sc5-styleguide/pull/985))

## 1.1.0 (2016-08-03)

### Features
* Configurable dependencies (#[974](https://github.com/SC5/sc5-styleguide/pull/974))

### Improvements
* Avoid nested paragraphs in description (#[980](https://github.com/SC5/sc5-styleguide/pull/980))
* #961 Tweak bemto.jade path dynamically (#[962](https://github.com/SC5/sc5-styleguide/pull/962))
* Test for $var: $var; declarations in SCSS Fix #496.  (#[954](https://github.com/SC5/sc5-styleguide/pull/954))
* enhanced custom styles accessibility to navbar by adding class names … (#[972](https://github.com/SC5/sc5-styleguide/pull/972))

### Fixes
* Fix angular-mocks version (#[973](https://github.com/SC5/sc5-styleguide/pull/973))
* Scrolling from javascript not working when overflow: auto is set on body. (#[956](https://github.com/SC5/sc5-styleguide/pull/956), closes [#42](https://github.com/SC5/sc5-styleguide/issues/42))

### Documentation
* Typos in readme.md (#[971](https://github.com/SC5/sc5-styleguide/pull/971))
* Link to a blog post about advanced adjustment (#[952](https://github.com/SC5/sc5-styleguide/pull/952))

### Credits

Thanks to [Gambit3](https://github.com/gambit3), [Marc](https://github.com/soulfresh).
[Philippe Vayssière](https://github.com/PhilippeVay) and [Yutaro Miyazaki](https://github.com/vwxyutarooo)
for making this release to happen.


## 1.0.0 (2016-05-24)

### Improvements
* Use new version of gonzales and traverse for LESS (#[947](https://github.com/SC5/sc5-styleguide/pull/947))<br/>
  Thanks to this change, we should get rid of many parsing bugs.
* Upgrade packages (#[933](https://github.com/SC5/sc5-styleguide/pull/933))
* Return server instance when calling styleguide.server() (#[948](https://github.com/SC5/sc5-styleguide/pull/948))
* Fix css for search field (#[935](https://github.com/SC5/sc5-styleguide/pull/935))
* Optimize filter setVariables (#[946](https://github.com/SC5/sc5-styleguide/pull/946))

### Internal improvements
* Test for !optional in SCSS. Fix #757 (#[950](https://github.com/SC5/sc5-styleguide/pull/950))
* Test for @supports in CSS. Fix #944 (#[949](https://github.com/SC5/sc5-styleguide/pull/949))

### Credits

Thanks to [Sascha Egerer](https://github.com/sascha-egerer), [Matti Suur-Askola](https://github.com/mattisa) and
[Marc](https://github.com/soulfresh) for making this release to happen!

## 0.3.47 (2016-05-11)

* Fix typo in README.md (#[936](https://github.com/SC5/sc5-styleguide/pull/936))
* Section page displays subsection details links (#[938](https://github.com/SC5/sc5-styleguide/pull/938))
* Additional links in the documentation (#[930](https://github.com/SC5/sc5-styleguide/pull/930))
* Upgrade to angular 1.5 and latest phantomjs (#[924](https://github.com/SC5/sc5-styleguide/pull/924))

## 0.3.46 (2016-04-20)

### Features
* Feature side navigation switch added (#[920](https://github.com/SC5/sc5-styleguide/pull/920))
* Third navigation level added in side navigation (##[920](https://github.com/SC5/sc5-styleguide/pull/920))
* Menu styles added for mobile view in side navigation (##[920](https://github.com/SC5/sc5-styleguide/pull/920))

### Improvements
* Prevent to load sections on main navigation level (##[920](https://github.com/SC5/sc5-styleguide/pull/920))

## 0.3.45 (2016-03-21)

### Features
* Add possibility to have includes in jade markup (#[911](https://github.com/SC5/sc5-styleguide/pull/911))
* Add ID attributes to quickly select sections and rendered markup. Fix #905 (#[906](https://github.com/SC5/sc5-styleguide/pull/906))

### Internal improvements
* Fix #904. Updating the babel package. (#[910](https://github.com/SC5/sc5-styleguide/pull/910))

### Credits

Thanks to [Matthew Shooks](https://github.com/shooksm) and [Quentin Devauchelle](https://github.com/Qt-dev) for making
this release happen.

## 0.3.44 (2016-03-02)

* Add abbility to register custom processors to modify the styleguide data (#[899](https://github.com/SC5/sc5-styleguide/pull/899))
* Helper for adding a new section. Fix #894 (#[897](https://github.com/SC5/sc5-styleguide/pull/897))

### Fixes
* Add missing jshint dependency (#[900](https://github.com/SC5/sc5-styleguide/pull/900))
* Fix #895 render overview code blocks using angular-highlightjs markup (#[896](https://github.com/SC5/sc5-styleguide/pull/896))

### Thanks

Thanks to [Sascha Egerer](https://github.com/sascha-egerer) and [Matthew Shooks](https://github.com/shooksm) for
helping this release happening!

## 0.3.43 (2016-02-17)

* Process CSS file with helpers (#[892](https://github.com/SC5/sc5-styleguide/pull/892))
* Generate demo website in accord to new source. Fix #886 (#[889](https://github.com/SC5/sc5-styleguide/pull/889))

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

## 0.3.41 (2015-12-09)

### Features
* Use PostCSS parser to split comment and code blocks. Fix #856 (#[857](https://github.com/SC5/sc5-styleguide/pull/857))
* Options to inject custom HTML in beginning or in the end of <body> tag (#[849](https://github.com/SC5/sc5-styleguide/pull/849))
* Replace inserts in wrappers (#[847](https://github.com/SC5/sc5-styleguide/pull/847))

### Internal

* Output good wishes for those who release on friday (#[837](https://github.com/SC5/sc5-styleguide/pull/837))
* Added npm install and gulp update to DEVELOPMENT.md. fix #853 #852 (#[854](https://github.com/SC5/sc5-styleguide/pull/854))

## 0.3.40 (2015-11-25)

### Features
* Mark the menu as active if its subsection is currently showed. Fix #747 (#[843](https://github.com/SC5/sc5-styleguide/pull/843))
* Support node 0.12 and 4.2 (#[834](https://github.com/SC5/sc5-styleguide/pull/834))

### Fixes
* Update gulp-pleeease for node@4.x. Fix #828. (#[833](https://github.com/SC5/sc5-styleguide/pull/833))

### Internal
* Don´t run clean when building for dev (#[845](https://github.com/SC5/sc5-styleguide/pull/845))
* Update dependencies (#[842](https://github.com/SC5/sc5-styleguide/pull/842))
* Run clean task before build to remove previous build results (#[841](https://github.com/SC5/sc5-styleguide/pull/841))
* Process sass files before giving them to styleguide for applying (#[840](https://github.com/SC5/sc5-styleguide/pull/840))

## 0.3.39 (2015-11-10)

### Features
* BEM+Jade support in HTML<br/>
  Thanks to [Gleb Mikheev](https://github.com/glebmachine)

### Fixes

* Use ES6 arrow functions for tests and gulp (#[817](https://github.com/SC5/sc5-styleguide/pull/817))

### Internal

* Install the packages from npm (#[827](https://github.com/SC5/sc5-styleguide/pull/827))
* Fix #783. Process table tags in markdown (#[823](https://github.com/SC5/sc5-styleguide/pull/823))

## 0.3.37 (2015-10-08)

* Fix #807. Typo in code (#[813](https://github.com/SC5/sc5-styleguide/pull/813))
* Get rid of "multiline" package and use ES6 feature instead (#[814](https://github.com/SC5/sc5-styleguide/pull/814))
* Teach sg-insert to include components with modifiers (#[808](https://github.com/SC5/sc5-styleguide/pull/808))<br/>
  Thanks [Thomas Kräftner](https://github.com/kraftner)
* Implement read-only mode. Possibility to disable variable saving (#[806](https://github.com/SC5/sc5-styleguide/pull/806))

## 0.3.36 (2015-09-24)

### Features

* Possibility to protect server with basic HTTP authentication (#[802](https://github.com/SC5/sc5-styleguide/pull/802))

### Fixes

* Correct path to helper elements CSS. (#[800](https://github.com/SC5/sc5-styleguide/pull/800), closes [#799](https://github.com/SC5/sc5-styleguide/issues/799)) Thanks @kraftner!
* Prevent "failed to load babel-core" message when running gulp. (#[796](https://github.com/SC5/sc5-styleguide/pull/796))

## 0.3.35 (2015-09-21)

### Features

* Possibility to remove sg-styles in markdown with sg-no-style attribute (#[794](https://github.com/SC5/sc5-styleguide/pull/794))

### Improvements

* Use Babel in gulpfiles. Fix #766 (#[774](https://github.com/SC5/sc5-styleguide/pull/774))
* Improve UI and customization variables (#[791](https://github.com/SC5/sc5-styleguide/pull/791))

### Fixes

* Fix typo in README (#[792](https://github.com/SC5/sc5-styleguide/pull/792))

## 0.3.34 (2015-09-14)

### Fixes

* Fix demo styleguide KSS examples (#[787](https://github.com/SC5/sc5-styleguide/pull/787))
* Rename the resultant CSS file to fix the empty demo problem (#[789](https://github.com/SC5/sc5-styleguide/pull/789))

### Improvements

* Possibility to include all section elements in fullscreen mode (#[788](https://github.com/SC5/sc5-styleguide/pull/788))
* Renamed wrappedMarkup property into renderMarkupPropery (#[785](https://github.com/SC5/sc5-styleguide/pull/785))

## 0.3.33 (2015-09-07)

### Improvements

* Possibility to define custom color for header source text and header background (#[776](https://github.com/SC5/sc5-styleguide/pull/776))
* Use newer travis infrastructure (#[777](https://github.com/SC5/sc5-styleguide/pull/777))
* Do not mention dev branch in the docs (#[773](https://github.com/SC5/sc5-styleguide/pull/773))

### Fixes

* Fix issue when lazy loaded element overwrote last module with the same name (#[775](https://github.com/SC5/sc5-styleguide/pull/775))

## 0.3.32 (2015-09-02)

* Support extends in LESS with newest Gonzales-PE (Fix #726) (#[733](https://github.com/SC5/sc5-styleguide/pull/733))
* Improve setup instructions, spelling, consistency (PR to dev branch) (#[764](https://github.com/SC5/sc5-styleguide/pull/764))
* Show KSS parse errors (#[768](https://github.com/SC5/sc5-styleguide/pull/768))

## 0.3.31 (2015-08-26)

* Navigation arrows for a full screen mode are removed by default (#[756](https://github.com/SC5/sc5-styleguide/pull/756))

## 0.3.29 (2015-08-13)

* Do not use Helvetica Neue. Fix #742 (#[746](https://github.com/SC5/sc5-styleguide/pull/746))
* Missing files in dist. Fix #734 (#[745](https://github.com/SC5/sc5-styleguide/pull/745))

## 0.3.28 (2015-08-06)

* Name the main CSS file with prefix. (Fix #737) (#[738](https://github.com/SC5/sc5-styleguide/pull/738))
* Grunt example is missing overviewPath (#[732](https://github.com/SC5/sc5-styleguide/pull/732))
* Missing lines in TOC (#[731](https://github.com/SC5/sc5-styleguide/pull/731))

## 0.3.27 (2015-07-23)

* Make navigation links for a fullscreen view the same when visited and not (#[717](https://github.com/SC5/sc5-styleguide/pull/717))
* Inserting other section's markup by the reference number (#[723](https://github.com/SC5/sc5-styleguide/pull/723))
* Event about re-rendered component should be emmited on any drawing. Fix #719 (#[725](https://github.com/SC5/sc5-styleguide/pull/725))
* Fix #701. Allow markup to refer to an html file (#[721](https://github.com/SC5/sc5-styleguide/pull/721))
* Fix. Removed forgotten console.log (#[724](https://github.com/SC5/sc5-styleguide/pull/724))

## 0.3.26 (2015-07-15)

### Features

* Allow variable chaining (#[707](https://github.com/SC5/sc5-styleguide/pull/707)) Thanks @paul-barry-kenzan!
* Implement #700. onRendered event (#[705](https://github.com/SC5/sc5-styleguide/pull/705))

### Improvements

* Refactor variable setter. Fixes variable saving issues. Add test cases (#[708](https://github.com/SC5/sc5-styleguide/pull/708))
* Prefixed css classes with sg- so they don't conflict with user's css (#[706](https://github.com/SC5/sc5-styleguide/pull/706)) Thanks @wini16!

### Fixes

* Correct path to helper elements CSS (#[699](https://github.com/SC5/sc5-styleguide/pull/699))
* Correct path to favico for styleguides hosted in subfolders (#[698](https://github.com/SC5/sc5-styleguide/pull/698))
* Correct path to icons when StyleGuide is in a subfolder (#[697](https://github.com/SC5/sc5-styleguide/pull/697))

## 0.3.25 (2015-07-01)

### Fixes

* Fix SASS variable parsing. Pass correct syntax to SCSS parser (#[687](https://github.com/SC5/sc5-styleguide/pull/687))

## 0.3.24 (2015-06-23)

### Features

* PostCSS variable parsing support (#[680](https://github.com/SC5/sc5-styleguide/pull/680))

### Fixes

* Support all options via cli (#[679](https://github.com/SC5/sc5-styleguide/pull/679)) Thanks @kr3l!
* Add missing default option to section header variables (#[674](https://github.com/SC5/sc5-styleguide/pull/674))

## 0.3.23 (2015-06-16)

### Fixes

* Support special characters on page title and on designer tool, (#[670](https://github.com/SC5/sc5-styleguide/pull/670), closes [#664](https://github.com/SC5/sc5-styleguide/issues/664))
* Fix: Ignored blocks should not change line numbering (#[669](https://github.com/SC5/sc5-styleguide/pull/669))
* Fix '{{color.value}} does not conform to the required format' warnings (#[665](https://github.com/SC5/sc5-styleguide/pull/665))

### Improvements

* Throttle scroll events. Optimize scroll performance (#[666](https://github.com/SC5/sc5-styleguide/pull/666))
* Update dependencies (#[668](https://github.com/SC5/sc5-styleguide/pull/668))
* Add customizable section header colors (#[667](https://github.com/SC5/sc5-styleguide/pull/667))

## 0.3.22 (2015-06-11)

### Fixes

* Fix issue when override mixin gets replaced with the empty one. Add test case (#[660](https://github.com/SC5/sc5-styleguide/pull/660))

## 0.3.21 (2015-06-11)

### Features

* Show line number indicating where variable is defined (#[653](https://github.com/SC5/sc5-styleguide/pull/653))

### Improvements

* Add directory of custom colors file to SASS includePaths (#[656](https://github.com/SC5/sc5-styleguide/pull/656))
* Possibility to override internal styles using mixin (#[654](https://github.com/SC5/sc5-styleguide/pull/654))
* Add NPM badge to README (#[651](https://github.com/SC5/sc5-styleguide/pull/651))
* Update dependencies (#[657](https://github.com/SC5/sc5-styleguide/pull/657))

## 0.3.20 (2015-06-09)

## Features

* Possibility to define custom UI colors (#[645](https://github.com/SC5/sc5-styleguide/pull/645))
* Add customColors documentation (#[648](https://github.com/SC5/sc5-styleguide/pull/648))

### Fixes

* Minor fixes. Remove extra header margin and fix typo (#[646](https://github.com/SC5/sc5-styleguide/pull/646))
* Fix SCSS mixing parsing and add tests, (#[643](https://github.com/SC5/sc5-styleguide/pull/643), closes [#477](https://github.com/SC5/sc5-styleguide/issues/477))

### Improvements

* Clean up default suffix on variable values (#[647](https://github.com/SC5/sc5-styleguide/pull/647))
* Update dependencies (#[644](https://github.com/SC5/sc5-styleguide/pull/644))

## 0.3.19 (2015-06-03)

### Fixes

* Update designer tool references when switching page (#[638](https://github.com/SC5/sc5-styleguide/pull/638))
* Fix color helper not to overflow from container (#[636](https://github.com/SC5/sc5-styleguide/pull/636))

### Improvements

* Upgrade gonzales-pe to 3.0.0-29 (#[637](https://github.com/SC5/sc5-styleguide/pull/637))

## 0.3.18 (2015-06-02)

### Fixes

* Fix header element in the demo styleguide (#[632](https://github.com/SC5/sc5-styleguide/pull/632))

## 0.3.17 (2015-06-02)

### Fixes

* Fix: Render angular components properly when using modifiers (#[629](https://github.com/SC5/sc5-styleguide/pull/629))
* Fix: Parser should not crash on empty files (#[628](https://github.com/SC5/sc5-styleguide/pull/628))
* Update README gulp example (#[622](https://github.com/SC5/sc5-styleguide/pull/622)) Thanks @bassettsj!

## 0.3.16 (2015-05-19)

### Fixes

  * Fix updating variables should only change variable declarations (#[617](https://github.com/SC5/sc5-styleguide/pull/617))
  * Fix styleguide color block height (#[612](https://github.com/SC5/sc5-styleguide/pull/612))
  * Remove neat-grid. Fixes leaking style issues (#[609](https://github.com/SC5/sc5-styleguide/pull/609))

### Improvements

  * Make TOC automatically (#[614](https://github.com/SC5/sc5-styleguide/pull/614))
  * Update lodash to 0.3.8 (#[611](https://github.com/SC5/sc5-styleguide/pull/611))

## 0.3.15 (2015-04-27)

### Fixes

* Fix accidentally changed action color (#[605](https://github.com/SC5/sc5-styleguide/pull/605))

### Improvements

* npm dependencies updated (#[606](https://github.com/SC5/sc5-styleguide/pull/606))
* gonzales-pe upgrades to 3.0.0-26 (#[591](https://github.com/SC5/sc5-styleguide/pull/591))

## 0.3.14 (2015-04-25)

### Fixes

* Allow anchor links in the overview file. Fixes [#599](https://github.com/SC5/sc5-styleguide/issues/599) (#[602](https://github.com/SC5/sc5-styleguide/pull/602))
* Fix fullscreen mode links when disableHtml5Mode is enabled. Fixes [#597](https://github.com/SC5/sc5-styleguide/issues/597) (#[598](https://github.com/SC5/sc5-styleguide/pull/598))

### Improvements

* Support passing --disable-html5-mode on the command line. Thanks @alekstorm! (#[596](https://github.com/SC5/sc5-styleguide/pull/596))
* Disable HTML5 mode by default when internal server is not used (#[594](https://github.com/SC5/sc5-styleguide/pull/594))
* Update lodash (#[593](https://github.com/SC5/sc5-styleguide/pull/593))
* Update footer logo (#[590](https://github.com/SC5/sc5-styleguide/pull/590))

## 0.3.13 (2015-04-20)

### Improvements

* Do not expose all configuration params to index.html JSON (#[586](https://github.com/SC5/sc5-styleguide/pull/586))
* Improve static asset documentation (#[585](https://github.com/SC5/sc5-styleguide/pull/585))
* Update Npm dependencies (#[580](https://github.com/SC5/sc5-styleguide/pull/580))

## 0.3.12 (2015-04-16)

### Fixes

* Respect ignored blocks in kss-splitter, (#[579](https://github.com/SC5/sc5-styleguide/pull/579), closes [#577](https://github.com/SC5/sc5-styleguide/issues/577))
* Replace marked library with markdown-it, (#[578](https://github.com/SC5/sc5-styleguide/pull/578), closes [#569](https://github.com/SC5/sc5-styleguide/issues/569))

## 0.3.11 (2015-04-14)

### Features

* Add possibility to ignore parts of the style files from processing (#[568](https://github.com/SC5/sc5-styleguide/pull/568))
* Add possibility to disable HTML5 history API. Implements #534 (#[574](https://github.com/SC5/sc5-styleguide/pull/574))

### Fixes

* Fix list styles in overview page, (#[570](https://github.com/SC5/sc5-styleguide/pull/570), closes [#559](https://github.com/SC5/sc5-styleguide/issues/559))

### Improvements

* Improve variable parser tests (#[572](https://github.com/SC5/sc5-styleguide/pull/572))
* Add serialized configuration to index.html (#[573](https://github.com/SC5/sc5-styleguide/pull/573))

## 0.3.10 (2015-04-09)

### Fixes

* Downgrade gonzales to 3.0.0-12. Due to vast amount of issues with the newer gonzales the version is downgraded to 3.0.0-12

### Improvements

* Improve variable parsing tests (#[564](https://github.com/SC5/sc5-styleguide/pull/564))
* Remove outdated information from development instructions (#[558](https://github.com/SC5/sc5-styleguide/pull/558))

## 0.3.9 (2015-04-07)

### Features

* Implement horizontal navigation bar (#[550](https://github.com/SC5/sc5-styleguide/pull/550))
* Allow markdown and HTML in KSS header and description, implement #492 (#[543](https://github.com/SC5/sc5-styleguide/pull/543))

### Fixes

* Fix: LESS variables not resolved properly in markup (#[549](https://github.com/SC5/sc5-styleguide/pull/549), closes [#546](https://github.com/SC5/sc5-styleguide/issues/546)). Thanks @cognivator!
* Fix through2 obj call syntax (#[542](https://github.com/SC5/sc5-styleguide/pull/542))

### Improvements

* Catch errors when finding used variables (#[548](https://github.com/SC5/sc5-styleguide/pull/548))
* Upgrade gonzales to 3.0.0-16 (#[541](https://github.com/SC5/sc5-styleguide/pull/541))
* New route for search. Do not allow searches less than 3 chars (#[544](https://github.com/SC5/sc5-styleguide/pull/544))
* Define border also on input focus styles (#[552](https://github.com/SC5/sc5-styleguide/pull/552))

## 0.3.8 (2015-03-30)

### Fixes

* Fix fullscreen mode when using disableEncapsulation option (#[536](https://github.com/SC5/sc5-styleguide/pull/536))
* Change CSS order to prevent leakages when not using encapsulation (#[532](https://github.com/SC5/sc5-styleguide/pull/532))
* Allow loading multiple directives, (#[527](https://github.com/SC5/sc5-styleguide/pull/527), closes [#517](https://github.com/SC5/sc5-styleguide/issues/517))
* Regex was matching substring of variable name, (#[525](https://github.com/SC5/sc5-styleguide/pull/525), closes [#500](https://github.com/SC5/sc5-styleguide/issues/500))
* Fix basic plain CSS support, (#[523](https://github.com/SC5/sc5-styleguide/pull/523), closes [#507](https://github.com/SC5/sc5-styleguide/issues/507))
* Fixed section modifier in fullscreen mode (#[511](https://github.com/SC5/sc5-styleguide/pull/511))

### Improvements

* Support windows linebreaks when parsing additional KSS params (#[530](https://github.com/SC5/sc5-styleguide/pull/530))
* Explanations on how to use additional CSS (#[528](https://github.com/SC5/sc5-styleguide/pull/528))
* Update JSCS. Fix code styling issues (#[524](https://github.com/SC5/sc5-styleguide/pull/524))
* Update all dependencies except gonzales-pe (#[521](https://github.com/SC5/sc5-styleguide/pull/521))
* Instructions to add multiple --kss-source (#[513](https://github.com/SC5/sc5-styleguide/pull/513))

### Features

* Add possibility to disable shadow DOM encapsulation (#[531](https://github.com/SC5/sc5-styleguide/pull/531))

## 0.3.7 (2015-03-12)

* Add initial version of navigation buttons to fullscreen mode (#[475](https://github.com/SC5/sc5-styleguide/pull/475))
* Fix fullscreen navigation tests (#[1](https://github.com/SC5/sc5-styleguide/pull/1))
* Fix broken header link. (#[474](https://github.com/SC5/sc5-styleguide/pull/474), closes [#463](https://github.com/SC5/sc5-styleguide/issues/463))


## 0.3.6 (2015-02-11)

### Fixes
* Fix KSS parsing failing on an empty file (#[467](https://github.com/SC5/sc5-styleguide/pull/467))
* Revert gonzales to old version, fixes variable parsing issues (#[470](https://github.com/SC5/sc5-styleguide/pull/470))

### Improvements
* Reimplement Shadow DOM wrapping, fixes using Angular directives in shadowDom (#[468](https://github.com/SC5/sc5-styleguide/pull/468))


## 0.3.5 (2015-02-04)

### Fixes
* Fix sections being grouped based on start of section number (Fix #447) (#[449](https://github.com/SC5/sc5-styleguide/pull/449))
* Fix syntax error in the readme code example (#[445](https://github.com/SC5/sc5-styleguide/pull/445))
* Fix CLI argument `overviewPath` not taken into account (#[453](https://github.com/SC5/sc5-styleguide/pull/453))

### Internal improvements
* Refactor and further modularize CLI and add unit tests (#[446](https://github.com/SC5/sc5-styleguide/pull/446))
* Use the new version of Gonzales with {} AST and native map, and remove gonzales-ast package. (#[455](https://github.com/SC5/sc5-styleguide/pull/455))
* Unit and integration test improvements
* Update and clean out unused npm dependencies


## 0.3.4 (2015-01-23)

### Fixes
* Typo in CLI `--commonClass` argument (#[443](https://github.com/SC5/sc5-styleguide/pull/443))


## 0.3.3 (2015-01-22)

### Fixes
* Downgrade socket.io to 1.2.1 to fix socket port resolving issues (#[438](https://github.com/SC5/sc5-styleguide/pull/438))


## 0.3.2 (2015-01-21)

### Fixes
* Fix: apply socket event listener functions correctly through angular root scope (#[433](https://github.com/SC5/sc5-styleguide/pull/433))

### Improvements
* Restore full changelog from GitHub history (#[434](https://github.com/SC5/sc5-styleguide/pull/434))


## 0.3.1 (2015-01-21)

### Improvements
* Do not hide compile errors when fixing validation errors (#[429](https://github.com/SC5/sc5-styleguide/pull/429))
* Relay server port to socket.io client, defer socket event listener registrations until connection (#[430](https://github.com/SC5/sc5-styleguide/pull/430))


## 0.3.0 (2015-01-20)
* *Breaking change:* Remove internal style preprocessing (#[Merge pull request #386](https://github.com/SC5/sc5-styleguide/pull/386))
  * Since style preprocessing is not anymore part of the styleguide, it is now possible to use your preferred preprocessor. See README for the new API documentation.


## 0.2.19 (2015-01-19)

### Features
* Add variable syntax checking on save and show error on UI (#[412](https://github.com/SC5/sc5-styleguide/pull/412))

### Fixes
* Ensure variables' order in the Designer Tool is the same as in the source file (#[419](https://github.com/SC5/sc5-styleguide/pull/419))
* Fix running `npm run demo` when parent project already has gulp as dependency (#[414](https://github.com/SC5/sc5-styleguide/pull/414))


## 0.2.18 (2015-01-15)

### Features
* Create 404 page. Use ui-sref to generate internal links (#[402](https://github.com/SC5/sc5-styleguide/pull/402))

### Improvements
* Parse only the given syntax when parsing variables (#[406](https://github.com/SC5/sc5-styleguide/pull/406))
* Hide progress bar when socket connection is lost (#[398](https://github.com/SC5/sc5-styleguide/pull/398))

### Internal changes
* Fix tests when running with newest KSS (#[394](https://github.com/SC5/sc5-styleguide/pull/394))


## 0.2.17 (2015-01-08)

### Features
* Example to shows colors with functions (#[379](https://github.com/SC5/sc5-styleguide/pull/379))
* --port help added to CLI (#[376](https://github.com/SC5/sc5-styleguide/pull/376))

### Fixes
* Clean up custom KSS params before processing KSS (#[385](https://github.com/SC5/sc5-styleguide/pull/385))
* Remove defined in texts in variables. Update KSS example data (#[373](https://github.com/SC5/sc5-styleguide/pull/373))

### Internal changes
* Move gulp test tasks to own file (#[383](https://github.com/SC5/sc5-styleguide/pull/383))
* Move bin/styleguide to lib/cli.js (#[384](https://github.com/SC5/sc5-styleguide/pull/384))
* Improve npm integration tests (#[382](https://github.com/SC5/sc5-styleguide/pull/382))
* Add npm package integration test (#[378](https://github.com/SC5/sc5-styleguide/pull/378))
* Correct markup for code in README (#[367](https://github.com/SC5/sc5-styleguide/pull/367))


## 0.2.16 (2014-12-22)

### Features
* Declare Angular directives in KSS comments (#[364](https://github.com/SC5/sc5-styleguide/pull/364))

### Improvements
* Show variable source file name(s) (#[360](https://github.com/SC5/sc5-styleguide/pull/360))
* Nice looking designer tool for mobile devices (#[359](https://github.com/SC5/sc5-styleguide/pull/359))
* Hide absolute paths on client (#[358](https://github.com/SC5/sc5-styleguide/pull/358))
* Save only changed variables (#[355](https://github.com/SC5/sc5-styleguide/pull/355))

### Internal changes
* Add Dockerfile to run demo in docker container (#[357](https://github.com/SC5/sc5-styleguide/pull/357))
* Minor fixes to releasing instruction (#[349](https://github.com/SC5/sc5-styleguide/pull/349))


## 0.2.15 (2014-12-17)

### Critical and major changes
* Find variable declarations from every file. Use styleVariables to filter selected files (#[344](https://github.com/SC5/sc5-styleguide/pull/344))
* Feature: Custom KSS parameter for wrapper markup (#[338](https://github.com/SC5/sc5-styleguide/pull/338))
  **The syntax for declaring a component wrapper has been changed. It is not compartible anymore. When updating change
  you wrapper components according to [documentation](https://github.com/SC5/sc5-styleguide#wrapper-markup).**

### Fixes
* Allow empty single-line comments (#[345](https://github.com/SC5/sc5-styleguide/pull/345))
* Fixes failed styleguide generation when section modifier has no markup (#[343](https://github.com/SC5/sc5-styleguide/pull/343))
* Fix: Do not detect @imports as variables (#[342](https://github.com/SC5/sc5-styleguide/pull/342))

### Internal changes
* Instruction how to deal with branches (#[346](https://github.com/SC5/sc5-styleguide/pull/346))


## 0.2.14 (2014-12-10)

### Fixes
* Fix test directive when running gulp dev (#[335](https://github.com/SC5/sc5-styleguide/pull/335))
* Fix: Include demo-gulpfile.js to NPM package. Fixes demo (#[339](https://github.com/SC5/sc5-styleguide/pull/339))
* Fix typo in demo gulp file (#[336](https://github.com/SC5/sc5-styleguide/pull/336))

### Improvements
* Remove unused scoped styles from processing flow (#[337](https://github.com/SC5/sc5-styleguide/pull/337))


## 0.2.13 (2014-12-08)

### Fixes
* Fix addWrapper issue when styleguide config is not yet loaded (#[320](https://github.com/SC5/sc5-styleguide/pull/320))
* Fix issues when styleVariables is undefined (#[319](https://github.com/SC5/sc5-styleguide/pull/319))

### Improvements
* Add lazy loaded directive example to demo project. Use separated gulp file to run demo (#[322](https://github.com/SC5/sc5-styleguide/pull/322))
* Add debounce to search box.  (#[327](https://github.com/SC5/sc5-styleguide/pull/327))
* Append link elements to head instead of writing to document (#[331](https://github.com/SC5/sc5-styleguide/pull/331))


## 0.2.12 (2014-12-03)

### Features
* Insert user markup in shadowRoot or lightDom depending on browser support (#[310](https://github.com/SC5/sc5-styleguide/pull/310))

### Fixes
* Fix: Parse at-rules to separate stylesheet. Fixes font problems with shadow DOM (#[309](https://github.com/SC5/sc5-styleguide/pull/309))
* Fix common class: add a custom wrapper element with the defined class... (#[308](https://github.com/SC5/sc5-styleguide/pull/308))
* Fix: Handle extraHead parameter properly when it is a string (#[305](https://github.com/SC5/sc5-styleguide/pull/305))
* Fix: Apply shadow DOM styles properly on fullscreen mode (#[306](https://github.com/SC5/sc5-styleguide/pull/306))

### Improvements
* Watch variable file changes when running executable with watch parameter (#[314](https://github.com/SC5/sc5-styleguide/pull/314))


## 0.2.11 (2014-12-01)

### Features
* Possibility to pass a single stylefile to executable (#[301](https://github.com/SC5/sc5-styleguide/pull/301))

### Fixes
* Fix: Find variables that have double parenthesis. Simplify variable parser (#[292](https://github.com/SC5/sc5-styleguide/pull/292))
* Fix #241: Depend on Gonzales 3.0.0-12 (Parse variables in Bootstrap) (#[291](https://github.com/SC5/sc5-styleguide/pull/291))

### Improvements
* Add find variable -icons to designer tool markup (#[299](https://github.com/SC5/sc5-styleguide/pull/299))
* Remove unneeded dependencies. Update all dependencies (#[297](https://github.com/SC5/sc5-styleguide/pull/297))
* jshint: Enforce captilized identifiers (#[296](https://github.com/SC5/sc5-styleguide/pull/296))
* Instead of ignoring files, explicitly specify what is included in the npm tarball (#[294](https://github.com/SC5/sc5-styleguide/pull/294))


## 0.2.10 (2014-11-27)

### Features
* Find all sections that use the selected variable (#[265](https://github.com/SC5/sc5-styleguide/pull/265))
* If a section does not use variables, list its sub-sections' variables (#[275](https://github.com/SC5/sc5-styleguide/pull/275))
* Scope user stylesheet to user markup if the browser supports it. Thank you @Janpot! (#[280](https://github.com/SC5/sc5-styleguide/pull/280))

### Fixes
* Some headers are not activated due to scrollable area being too short (#[287](https://github.com/SC5/sc5-styleguide/pull/287))
* Fix #266: Do not replace pseudo selectors when they appear inside :not clause (#[279](https://github.com/SC5/sc5-styleguide/pull/279))
* Find used variables also from function parameters (#[267](https://github.com/SC5/sc5-styleguide/pull/267))

### Improvements
* Show full error message in UI when compilation error happens (#[286](https://github.com/SC5/sc5-styleguide/pull/286))
* Disable "Save changes" button when socket connection is lost (#[282](https://github.com/SC5/sc5-styleguide/pull/282))
* Disable "Reset local changes" button if no variable is dirty (#[289](https://github.com/SC5/sc5-styleguide/pull/289))
* Allow scrollbars in content preview if content is too large (#[277](https://github.com/SC5/sc5-styleguide/pull/277))
* Highlight section header when scrolling (#[273](https://github.com/SC5/sc5-styleguide/pull/273))
* Re-style section headings (#[270](https://github.com/SC5/sc5-styleguide/pull/270))
* Whole section heading is now clickable anchor link (#[272](https://github.com/SC5/sc5-styleguide/pull/272))
* Do not use block section styles when main section does not have markup (#[274](https://github.com/SC5/sc5-styleguide/pull/274))


## 0.2.9 (2014-11-25)

### Features
* Support 3-character shorthand CSS colors (#[258](https://github.com/SC5/sc5-styleguide/pull/258))
* Support color values also in the middle of the variable string (#[256](https://github.com/SC5/sc5-styleguide/pull/256))

### Fixes
* Fix color picker and footer styles (#[263](https://github.com/SC5/sc5-styleguide/pull/263))
* Fix navigation ng-class using multiple conditional classes (#[262](https://github.com/SC5/sc5-styleguide/pull/262))
* Fix #255: Do not pollute previews with inheritable styles (#[260](https://github.com/SC5/sc5-styleguide/pull/260))
* Fix: Npm run demo should work without dev dependencies (#[259](https://github.com/SC5/sc5-styleguide/pull/259))


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


## 0.2.5 (2014-11-04)
* Implement possibility to reset local variable changes (#[152](https://github.com/SC5/sc5-styleguide/pull/152))
* Functional page title on fullscreen mode. Implement and improve tests (#[151](https://github.com/SC5/sc5-styleguide/pull/151))
* Commented Parser (#[147](https://github.com/SC5/sc5-styleguide/pull/147))
* Page title rendered according to section (#[148](https://github.com/SC5/sc5-styleguide/pull/148))
* Sync designer tool variables when there are server side changes (#[144](https://github.com/SC5/sc5-styleguide/pull/144))
* Styleguide service listens to socket events (#[143](https://github.com/SC5/sc5-styleguide/pull/143))
* Refactor localstorage handling. Persist designer tool visibility (#[142](https://github.com/SC5/sc5-styleguide/pull/142))
* Emit progress information from gulp task to client. Implement progress bar (#[140](https://github.com/SC5/sc5-styleguide/pull/140))
* Get socket returns promise and sassVariables --> styleVariables (#[135](https://github.com/SC5/sc5-styleguide/pull/135))
* Prevent watch server crashing when there is style syntax error (#[139](https://github.com/SC5/sc5-styleguide/pull/139))
* Improve designer tool UI. Add examples to styleguide (#[136](https://github.com/SC5/sc5-styleguide/pull/136))
* Make sure that elements does not overlap modifier label (#[133](https://github.com/SC5/sc5-styleguide/pull/133))
* Fullscreen controller handles markup parsing instead of directive (#[132](https://github.com/SC5/sc5-styleguide/pull/132))
* Inherited wrappers (#[134](https://github.com/SC5/sc5-styleguide/pull/134))

### Internal code changes
* getPreprocessStream moved into separate module (#[154](https://github.com/SC5/sc5-styleguide/pull/154))
* getMarkdownStream moved into separate module (#[153](https://github.com/SC5/sc5-styleguide/pull/153))
* Declare angular dependencies for components in inline array (#[150](https://github.com/SC5/sc5-styleguide/pull/150))
* Move maximum code to lib/modules (#[149](https://github.com/SC5/sc5-styleguide/pull/149))
* Separate module for parsing KSS (detached from styleguide.js) (#[145](https://github.com/SC5/sc5-styleguide/pull/145))
* Use real parser to update changed variables to source SASS/LESS file (#[137](https://github.com/SC5/sc5-styleguide/pull/137))
* Update GCC in travis.yml. Fix build (#[138](https://github.com/SC5/sc5-styleguide/pull/138))


## 0.2.3 (2014-10-21)
* Move variable parsing logic to external lib. Implement initial tests (#[98](https://github.com/SC5/sc5-styleguide/pull/98))
* Variable saving moved to Variable service (#[97](https://github.com/SC5/sc5-styleguide/pull/97))
* Remove decodeHTML filter as native solution is available (#[94](https://github.com/SC5/sc5-styleguide/pull/94))
* Features/modular css 4 app (#[93](https://github.com/SC5/sc5-styleguide/pull/93))
* Find sass variables with config parameter instead of magic file. Fix socket.io target paths (#[91](https://github.com/SC5/sc5-styleguide/pull/91))
* Fix fullscreen to work also with first level items (#[89](https://github.com/SC5/sc5-styleguide/pull/89))
* Fixed double inclusion of Angular dependencies (#[90](https://github.com/SC5/sc5-styleguide/pull/90))
* Add commonClass option that is added to every preview block (#[87](https://github.com/SC5/sc5-styleguide/pull/87))
* Possibility to display a single element as full page (#[88](https://github.com/SC5/sc5-styleguide/pull/88))
* Fixed section.markup: false (#[86](https://github.com/SC5/sc5-styleguide/pull/86))
* Fix designer mode (#[84](https://github.com/SC5/sc5-styleguide/pull/84))
* Fix dynamic SASS variables (#[80](https://github.com/SC5/sc5-styleguide/pull/80))
* Do not reveal output path to public configuration (#[74](https://github.com/SC5/sc5-styleguide/pull/74))
* Upgrade to angular 1.3.0 (#[82](https://github.com/SC5/sc5-styleguide/pull/82))
* Add david dependency badge (#[83](https://github.com/SC5/sc5-styleguide/pull/83))
* Tests for MainCtrl (#[79](https://github.com/SC5/sc5-styleguide/pull/79))
* Socket.io is optional (#[78](https://github.com/SC5/sc5-styleguide/pull/78))
* Describe in docs that a server should resolve paths into appRoot (#[77](https://github.com/SC5/sc5-styleguide/pull/77))
* Fix: Overview.md is not rendered (#[76](https://github.com/SC5/sc5-styleguide/pull/76))
* Update jscs to 1.7.1. Fix tests (#[75](https://github.com/SC5/sc5-styleguide/pull/75))
* Remove unused stream-assert-gulp (#[72](https://github.com/SC5/sc5-styleguide/pull/72))
* Update jscs to 1.7.0. Fix coding conventions (#[73](https://github.com/SC5/sc5-styleguide/pull/73))


## 0.2.1 (2014-10-14)
* Added appRoot configuration parameter that allows to run application from sub-folder.


## 0.2.0 (2014-10-14)
* Breaking change: The styleguide is now fully generated in memory. The results should be written to disk using the output stream instead of outputPath parameter
* Possibility to define custom title
* Improved documentation and tests
* Less production dependencies
* Easy to run demo project


## 0.1.0 (2014-10-07)
* First NPM release
