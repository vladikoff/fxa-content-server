/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var Constants = require('lib/constants');
  var Devices = require('models/devices');
  var ExperimentMixin = require('views/mixins/experiment-mixin');
  var FormView = require('views/form');
  var p = require('lib/promise');
  var ResendMixin = require('views/mixins/resend-mixin');
  var ResumeTokenMixin = require('views/mixins/resume-token-mixin');
  var ServiceMixin = require('views/mixins/service-mixin');
  var Template = require('stache!templates/confirm');

  var t = BaseView.t;

  var View = FormView.extend({
    template: Template,
    className: 'confirm',

    // used by unit tests
    VERIFICATION_POLL_IN_MS: Constants.VERIFICATION_POLL_IN_MS,

    initialize: function (options) {
      // Account data is passed in from sign up and sign in flows.
      // It's important for Sync flows where account data holds
      // ephemeral properties like unwrapBKey and keyFetchToken
      // that need to be sent to the browser.
      var data = this.ephemeralData();
      this._account = data && this.user.initAccount(data.account);

      this._devices = options.devices;

      // An empty Devices instance is created to render the initial view.
      // Data is only fetched once the panel has been opened.
      if (! this._devices) {
        this._devices = new Devices([], {
          notifier: options.notifier
        });
      }
    },

    getAccount: function () {
      return this._account;
    },

    context: function () {
      if (this.isInExperiment('openGmail')) {
        this.notifier.trigger('openGmail.triggered');
      }

      var email = this.getAccount().get('email');

      return {
        email: email,
        isOpenGmailButtonVisible: this._isOpenGmailButtonVisible(),
        safeEmail: encodeURIComponent(email)
      };
    },

    _isOpenGmailButtonVisible: function () {
      return this.isInExperimentGroup('openGmail', 'treatment');
    },

    events: {
      'click #open-gmail': '_gmailTabOpened',
      // validateAndSubmit is used to prevent multiple concurrent submissions.
      'click #resend': BaseView.preventDefaultThen('validateAndSubmit')
    },

    _bouncedEmailSignup: function () {
      this.ephemeralMessages.set('bouncedEmail', this.getAccount().get('email'));
      this.navigate('signup');
    },

    _gmailTabOpened: function () {
      this.notifier.trigger('openGmail.clicked');
    },

    beforeRender: function () {
      // user cannot confirm if they have not initiated a sign up.
      if (! this.getAccount().get('sessionToken')) {
        this.navigate('signup');
        return false;
      }
    },

    afterRender: function () {
      var graphic = this.$el.find('.graphic');
      graphic.addClass('pulse');

      this.transformLinks();
    },

    afterVisible: function () {
      var self = this;

      // the view is always rendered, but the confirmation poll may be
      // prevented by the broker. An example is Firefox Desktop where the
      // browser is already performing a poll, so a second poll is not needed.

      return self.broker.persistVerificationData(self.getAccount())
        .then(function () {
          return self.invokeBrokerMethod(
                    'beforeSignUpConfirmationPoll', self.getAccount());
        })
        .then(function () {
          var account = self.getSignedInAccount();

          setTimeout(function () {
            self.user.fetchAccountDevices(account, self._devices)
              .then(function () {
                console.log(self.user)
                console.log(self._devices)

                  // WAIT FOR SW NOTIFICATION
                  if ('serviceWorker' in navigator) {

                    navigator.serviceWorker.addEventListener("message", function handler(ev) {
                      navigator.serviceWorker.removeEventListener("message", handler);
                      console.log(ev.data);

                      self._waitForConfirmation()
                        .then(function () {
                          self.logViewEvent('verification.success');
                          self.notifier.trigger('verification.success');
                          return self.invokeBrokerMethod(
                            'afterSignUpConfirmationPoll', self.getAccount());
                        })
                        .then(function () {
                          // the user is definitely authenticated here.
                          if (self.relier.isDirectAccess()) {
                            self.navigate('settings', {
                              success: t('Account verified successfully')
                            });
                          } else {
                            self.navigate('signup_complete');
                          }
                        }, function (err) {
                          // The user's email may have bounced because it was invalid.
                          // Redirect them to the sign up page with an error notice.
                          if (AuthErrors.is(err, 'SIGNUP_EMAIL_BOUNCE')) {
                            self._bouncedEmailSignup();
                          } else {
                            self.displayError(err);
                          }
                        });

                    });

                    console.log('Service Worker activate');
                    navigator.serviceWorker.register('./sw.js').then(function (reg) {
                      console.log(reg);
                      reg.onupdatefound = function (evt) {
                        console.log('update:', evt);


                        var subscription;
                        navigator.serviceWorker.ready.then(
                          function (serviceWorkerRegistration) {
                            // Do we already have a push message subscription?
                            serviceWorkerRegistration.pushManager.subscribe({
                              userVisibleOnly: true
                            })
                              .then(function (sub) {
                                subscription = sub;
                                var endpoint = subscription.endpoint;
                                console.log('subscribed: ' + subscription);
                                console.log('endpoint:', endpoint);

                                self._devices.forEach(function (device) {
                                  console.log(device)
                                  console.log(device.get('id'))
                                  console.log(device.get('name'))
                                  var account = self.getAccount();
                                  account.updateDevice(device.get('id'), device.get('name'), {
                                    deviceCallback: endpoint,
                                    devicePublicKey: '468601214f60f4828b6cd5d51d9d99d212e7c73657978955f0f5a5b7e2fa1370'
                                  })
                                })
                              })
                              .catch(function (err) {
                                console.log('sub error');
                                console.log(err);
                              });
                          });

                      };
                    }).catch(function (error) {
                      console.log(error)
                    });


                  }
                });

          }, 4000)



        });
    },

    _waitForConfirmation: function () {
      var self = this;
      var account = self.getAccount();
      return self.fxaClient.recoveryEmailStatus(
          account.get('sessionToken'), account.get('uid'))
        .then(function (result) {
          if (result.verified) {
            account.set('verified', true);
            self.user.setAccount(account);
            return true;
          }

          var deferred = p.defer();

          // _waitForConfirmation will return a promise and the
          // promise chain remains unbroken.
          self.setTimeout(function () {
            deferred.resolve(self._waitForConfirmation());
          }, self.VERIFICATION_POLL_IN_MS);

          return deferred.promise;
        });
    },

    submit: function () {
      var self = this;

      self.logViewEvent('resend');
      return self.fxaClient.signUpResend(
        self.relier,
        self.getAccount().get('sessionToken'),
        {
          resume: self.getStringifiedResumeToken()
        }
      )
      .then(function () {
        self.displaySuccess();
      })
      .fail(function (err) {
        if (AuthErrors.is(err, 'INVALID_TOKEN')) {
          return self.navigate('signup', {
            error: err
          });
        }

        // unexpected error, rethrow for display.
        throw err;
      });
    },

    // The ResendMixin overrides beforeSubmit. Unless set to undefined,
    // Cocktail runs both the original version and the overridden version.
    beforeSubmit: undefined
  });

  Cocktail.mixin(
    View,
    ExperimentMixin,
    ResendMixin,
    ResumeTokenMixin,
    ServiceMixin
  );

  module.exports = View;
});
