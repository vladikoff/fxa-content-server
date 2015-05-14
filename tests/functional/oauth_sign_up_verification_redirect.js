/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/test',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, restmail, TestHelpers, Test, FunctionalHelpers) {
  'use strict';

  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = TOO_YOUNG_YEAR - 1;

  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'oauth sign up verification_redirect',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return FunctionalHelpers.clearBrowserState(this, {
        contentServer: true,
        '123done': true
      });
    },


    'signup, same browser different window, verification_redirect=always': function () {
      var self = this;
      self.timeout = 90 * 1000;

      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        // upgrade the content server oauth to include 'verification_redirect'
        .getCurrentUrl()
        .then(function (url) {
          return self.get('remote').get(require.toUrl(url + '&verification_redirect=always'));
        })
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
            self, email, 0);
        })

        .switchToWindow('newwindow')
        .setFindTimeout(intern.config.pageLoadTimeout)
        // this is an verification_redirect flow, both windows should login
        .findByCssSelector('#loggedin')
        .end()

        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end();
    },

  });

});
