/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {

  intern.functionalSuites = [
    'tests/functional/password_visibility',
    'tests/functional/oauth_sign_in',
    'tests/functional/oauth_sign_up',
    'tests/functional/oauth_sign_up_verification_redirect',
    'tests/functional/oauth_reset_password',
    'tests/functional/oauth_webchannel',
    'tests/functional/oauth_webchannel_keys',
    'tests/functional/oauth_preverified_sign_up',
    'tests/functional/oauth_iframe',
    'tests/functional/oauth_force_email',
    'tests/functional/oauth_permissions'
  ];

  return intern;
});
