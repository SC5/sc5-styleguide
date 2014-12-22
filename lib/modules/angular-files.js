'use strict';

module.exports = {

  /* Puts angular directives declared in sections into config */
  add: function(config, sections) {

    function add(content) {
      if (!config) {
        config = [];
      }
      config.push(content);
    }

    sections.forEach(function(section) {

      if (section['sg-angular-directive']) {

        section['sg-angular-directive'].files = section['sg-angular-directive'].file;
        if (!(section['sg-angular-directive'].files instanceof Array)) {
          section['sg-angular-directive'].files = [
            section['sg-angular-directive'].files
          ];
        }

        add(section['sg-angular-directive']);
      }
    });

    return config;

  }

};
