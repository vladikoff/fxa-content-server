/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const BackMixin = require('views/mixins/back-mixin');
  const BaseView = require('views/base');
  const Cocktail = require('cocktail');
  const FloatingPlaceholderMixin = require('views/mixins/floating-placeholder-mixin');
  const FormView = require('views/form');
  const ExperimentMixin = require('views/mixins/experiment-mixin');
  const PasswordMixin = require('views/mixins/password-mixin');
  const PasswordStrengthMixin = require('views/mixins/password-strength-mixin');
  const ServiceMixin = require('views/mixins/service-mixin');
  const SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  const Template = require('stache!templates/settings/change_email');

  var View = FormView.extend({
    template: Template,
    className: 'change-email',
    viewName: 'settings.change-email',

    context () {
      return {
      };
    },

    submit () {
      this.hideError();
      this.navigate('settings/change_email_confirm', {
        currentPassword: this.$('#current_password').val(),
        newEmail: this.$('#new_email').val()
      });
    }

  });

  Cocktail.mixin(
    View,
    ExperimentMixin,
    PasswordMixin,
    PasswordStrengthMixin,
    FloatingPlaceholderMixin,
    SettingsPanelMixin,
    ServiceMixin,
    BackMixin
  );

  module.exports = View;
});
