/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/test'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
      FxaClient, restmail, TestHelpers, FunctionalHelpers, Test) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var SIGNIN_PAGE_URL = config.fxaContentRoot + 'signin';
  var RESET_PAGE_URL = config.fxaContentRoot + 'reset_password';
  var CONFIRM_PAGE_URL = config.fxaContentRoot + 'confirm_reset_password';
  var COMPLETE_PAGE_URL_ROOT = config.fxaContentRoot + 'complete_reset_password';

  var PASSWORD = 'password';
  var TIMEOUT = 90 * 1000;
  var email;
  var code;
  var token;
  var client;

  var createRandomHexString = TestHelpers.createRandomHexString;

  function setTokenAndCodeFromEmail(emailAddress, emailNumber) {
    var fetchCount = emailNumber + 1;
    var user = TestHelpers.emailToUser(emailAddress);
    return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, fetchCount)
      .then(function (emails) {
        // token and code are hex values
        token = emails[emailNumber].html.match(/token=([a-f\d]+)/)[1];
        code = emails[emailNumber].html.match(/code=([a-f\d]+)/)[1];
      });
  }

  /**
   * Fill out the reset password form
   */
  function fillOutResetPassword(context, email) {
    return FunctionalHelpers.fillOutResetPassword(context, email);
  }

  /**
   * Programatically initiate a password reset using the
   * FxA Client. Saves the token and code.
   */
  function initiateResetPassword(context, emailAddress, emailNumber) {
    return client.passwordForgotSendCode(emailAddress)
      .then(function () {
        return setTokenAndCodeFromEmail(emailAddress, emailNumber);
      });
  }

  function openCompleteResetPassword(context, email, token, code) {
    var url = COMPLETE_PAGE_URL_ROOT + '?';

    var queryParams = [];
    if (email) {
      queryParams.push('email=' + encodeURIComponent(email));
    }

    if (token) {
      queryParams.push('token=' + encodeURIComponent(token));
    }

    if (code) {
      queryParams.push('code=' + encodeURIComponent(code));
    }

    url += queryParams.join('&');
    return context.get('remote').get(require.toUrl(url))
      .setFindTimeout(intern.config.pageLoadTimeout);
  }

  function testSuccessMessageVisible(context, message) {
    return context.get('remote')
      .setFindTimeout(intern.config.pageLoadTimeout)

      .then(FunctionalHelpers.visibleByQSA('.success'))
      .findByCssSelector('.success')
        .getVisibleText()
        .then(function (text) {
          var searchFor = new RegExp(message, 'i');
          assert.isTrue(searchFor.test(text));
        })
      .end();
  }

  function testAtSettingsWithVerifiedMessage(context) {
    return context.get('remote')
      .setFindTimeout(intern.config.pageLoadTimeout)

      .findByCssSelector('#fxa-settings-header')
      .end()

      .then(function () {
        return testSuccessMessageVisible(context, 'verified');
      });
  }

  registerSuite({
    name: 'reset_password flow',

    beforeEach: function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      var self = this;
      email = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD, { preVerified: true })
          .then(function () {
            // clear localStorage to avoid pollution from other tests.
            return FunctionalHelpers.clearBrowserState(self);
          });
    },


    'verifying a reset password unlocks an account': function () {
      var self = this;
      self.timeout = 90 * 1000;
      return client.accountLock(email, PASSWORD)
        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email)
            .findById('fxa-confirm-reset-password-header')
            .end()

            .then(function () {
              return FunctionalHelpers.openVerificationLinkSameBrowser(
                          self, email, 0);
            })

            // Complete the reset password in the new tab
            .switchToWindow('newwindow')

            .findById('fxa-complete-reset-password-header')
            .end()

            .then(function () {
              return FunctionalHelpers.fillOutCompleteResetPassword(self, PASSWORD, PASSWORD);
            })

            // this tab's success is seeing the reset password complete header.
            .then(function () {
              return testAtSettingsWithVerifiedMessage(self);
            })

            .closeCurrentWindow()
            // switch to the original window
            .switchToWindow('')
            .then(function (params) {
                console.log('this crashes...');
            })

            // settings view should fully load
            .findByCssSelector('#signout')
            .end()

            .then(FunctionalHelpers.visibleByQSA('.success'))
            .end()

            .findByCssSelector('#signout')
              .click()
            .end()

            .then(function () {
              return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
            })

            .findByCssSelector('#fxa-settings-header')
            .end();
        });
    }
  });
});
