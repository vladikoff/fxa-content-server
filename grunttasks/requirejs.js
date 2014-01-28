/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('requirejs', {
    dist: {
      options: {
        almond: true,
        name: 'main',
        baseUrl: 'app/scripts',
        mainConfigFile: 'app/scripts/config.js',
        out: 'dist/scripts/main.js',
        replaceRequireScript: [{
          files: ['dist/index.html'],
          module: 'main'
        }]
      }
    }
  });
};
