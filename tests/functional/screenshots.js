/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!request',
  'intern/node_modules/dojo/node!fs'
], function (intern, registerSuite, assert, require, request, fs) {
  'use strict';

  var url = intern.config.fxaContentRoot;
  var screenshotEndpoint = 'http://127.0.0.1:10092' + '/screenshot';
  var SCREENSHOT_WIDTH = 1024;
  var SCREENSHOT_HEIGHT = 768;

  var pages = [
    'v1/complete_reset_password',
    'v1/verify_email',
    '',
    'signin',
    'signup',
    'signup_complete',
    'cannot_create_account',
    'verify_email',
    'confirm',
    'settings',
    'change_password',
    'legal',
    // legal are all redirected to the language detected
    // by sniffing headers, barring that, using en-US as
    // the fallback.
    'legal/terms',
    'legal/privacy',
    // invalid-locale should be redirected to en-US
    'invalid-locale/legal/terms',
    'invalid-locale/legal/privacy',
    // yay!
    'en-US/legal/terms',
    'en-US/legal/privacy',
    'reset_password',
    'confirm_reset_password',
    'complete_reset_password',
    'reset_password_complete',
    'force_auth',
    'delete_account',
    'non_existent',
    'cookies_disabled',
    'clear',
    'boom'
  ];

  var suite = {
    name: 'pages'
  };

  var visitFn = function (path) {
    return function () {
      var name = this.name;

      return this.get('remote')
        .get(require.toUrl(url + path))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('#stage header')
        .end()
        .setWindowSize(1024, 768)
        .sleep(5000)
        .takeScreenshot()
        .then(function(buffer) {
          var r = request({
            url: screenshotEndpoint,
            method: 'POST'
          }, function optionalCallback (err, httpResponse, body) {
            if (err) {
              return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body);
          });
          var form = r.form();
          form.append('project', 'fxa-content-server');
          form.append('name', name);
          form.append('time', Date.now());
          form.append('width', SCREENSHOT_WIDTH);
          form.append('height', SCREENSHOT_HEIGHT);
          form.append('screenshot', buffer);
        })
    };
  };

  pages.forEach(function (path) {
    suite['fxa_' + path] = visitFn(path);
  });

  registerSuite(suite);
});
