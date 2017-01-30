/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const Cocktail = require('cocktail');
  const FloatingPlaceholderMixin = require('views/mixins/floating-placeholder-mixin');
  const FormView = require('views/form');
  const ModalSettingsPanelMixin = require('views/mixins/modal-settings-panel-mixin');
  const SignedOutNotificationMixin = require('views/mixins/signed-out-notification-mixin');
  const t = require('views/base').t;
  const Template = require('stache!templates/settings/change_email_confirm');

  var View = FormView.extend({
    template: Template,
    className: 'change-email-confirm',
    viewName: 'settings.change-email-confirm',

    events: {
      'click .cancel-change': FormView.preventDefaultThen('_return'),
    },

    initialize () {
      this.on('modal-cancel', () => this._returnToClientList());
    },

    beforeRender () {
      // receive the device collection and the item to delete
      // if deleted the collection will be automatically updated in the settings panel.
      let newEmail = this.model.get('newEmail');
      let currentPassword = this.model.get('currentPassword');
      if (! newEmail || ! currentPassword) {
        return this._return();
      }

      this.client = clients.get(clientId);
    },

    context () {
      return {
        
        
      };
    },


    submit () {
      this._return();
    },

    _return () {
      this.navigate('settings/change_email');
    }
  });

  Cocktail.mixin(
    View,
    ModalSettingsPanelMixin,
    FloatingPlaceholderMixin,
    SignedOutNotificationMixin
  );

  module.exports = View;
});
