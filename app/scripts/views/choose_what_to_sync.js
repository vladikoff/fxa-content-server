/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'views/form',
  'stache!templates/choose_what_to_sync',
  'lib/promise',
  'views/mixins/back-mixin',
  'views/mixins/service-mixin'
],
function (Cocktail, FormView, Template, p, BackMixin, ServiceMixin) {
  'use strict';

  var View = FormView.extend({
    template: Template,
    className: 'choose-what-to-sync',

    initialize: function (options) {
      // Account data is passed in from sign up flow.
      var data = this.ephemeralData();
      if (! data || ! data.account) {
        this.navigate('signup');
      }

      this._account = data && this.user.initAccount(data.account);
    },

    getAccount: function () {
      return this._account;
    },

    context: function () {
      var account = this.getAccount();

      return {
        email: account.get('email')
      };
    },

    submit: function () {
      var self = this;
      var account = self.getAccount();

      return p().then(function () {
        self.user.setAccount(account);

        return self.onSignUpSuccess(account);
      });
    },

    onSignUpSuccess: function (account) {
      var self = this;
      if (account.get('verified')) {
        // user was pre-verified, notify the broker.
        return self.broker.afterSignIn(account)
          .then(function (result) {
            if (! (result && result.halt)) {
              self.navigate('signup_complete');
            }
          });
      } else {
        self.navigate('confirm', {
          data: {
            account: account
          }
        });
      }
    }

  });

  Cocktail.mixin(
    View,
    ServiceMixin,
    BackMixin
  );

  return View;
});
