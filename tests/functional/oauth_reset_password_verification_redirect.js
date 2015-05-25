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
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
      FxaClient, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var PASSWORD = 'password';
  var TIMEOUT = 90 * 1000;
  var user;
  var email;
  var client;
  var accountData;

  registerSuite({
    name: 'oauth reset password verification redirect',

    setup: function () {
      // timeout after 90 seconds
      this.timeout = TIMEOUT;

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
    },

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      var self = this;

      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function (result) {
          accountData = result;
        })
        .then(function () {
          // clear localStorage to avoid polluting other tests.
          return FunctionalHelpers.clearBrowserState(self, {
            contentServer: true,
            '123done': true
          });
        });
    },

    'reset password, same browser, same window, verification_redirect=always': function () {
      var self = this;
    },

    'reset password, same browser, new window, verification_redirect=always': function () {
      var self = this;
    },

    'reset password, same browser, original window closed, verification_redirect=always': function () {
      var self = this;
    },

    'reset password, different browser, verification_redirect=always': function () {
      var self = this;
    },

  });

});
