/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function () {
  // The array is converted into a RegExp
  var FRONTEND_ROUTES = [
    'cannot_create_account',
    'choose_what_to_sync',
    'clear',
    'complete_reset_password',
    'complete_signin',
    'confirm',
    'confirm_reset_password',
    'confirm_signin',
    'connect_another_device',
    'connect_another_device/why',
    'cookies_disabled',
    'force_auth',
    'legal',
    'oauth',
    'oauth/force_auth',
    'oauth/signin',
    'oauth/signup',
    'report_signin',
    'reset_password',
    'reset_password_confirmed',
    'reset_password_verified',
    'settings',
    'settings/avatar/camera',
    'settings/avatar/change',
    'settings/avatar/crop',
    'settings/avatar/gravatar',
    'settings/avatar/gravatar_permissions',
    'settings/change_email',
    'settings/change_password',
    'settings/clients',
    'settings/clients/disconnect',
    'settings/communication_preferences',
    'settings/delete_account',
    'settings/display_name',
    'signin',
    'signin_confirmed',
    'signin_permissions',
    'signin_reported',
    'signin_unblock',
    'signin_verified',
    'signup',
    'signup_confirmed',
    'signup_permissions',
    'signup_verified',
    'verify_email'
  ].join('|'); // prepare for use in a RegExp

  return {
    method: 'get',
    path: new RegExp('^/(' + FRONTEND_ROUTES + ')/?$'),
    process: function (req, res, next) {
      // setting the url to / will use the correct
      // index.html for either dev or prod mode.
      req.url = '/';
      next();
    }
  };
};
