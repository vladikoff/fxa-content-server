/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var extend = require('extend');
var ua = require('universal-analytics');
var logger = require('mozlog')('server.ga');
var config = require('./configuration');

var PUBLIC_URL = config.get('public_url');
var ANALYTICS_ID = config.get('google_analytics_id');
var SIGNUP_FLOW = 'Firefox Accounts Sign-up Flow';

// note: if you use labels (el), then a value must be present (ev).
var GA_EVENTS = {
  'screen.signup': {
    ec: SIGNUP_FLOW,
    ea: 'page load',
    el: 'Sign Up Page',
    ev: 1
  },
  'signup.success': {
    ec: SIGNUP_FLOW,
    ea: 'registered',
    el: 'regular',
    ev: 1
  },
  'oauth.signup.success': {
    ec: SIGNUP_FLOW,
    ea: 'registered',
    el: 'oauth',
    ev: 1
  },
  'verify-email.verification.success': {
    ec: SIGNUP_FLOW,
    ea: 'verified email address'
  }
};

function GACollector() {
}

GACollector.prototype = {
  /**
   * Send a formatted metrics object to Google Analytics
   *
   * @param {Object} body
   */
  write: function (body) {
    console.log(body);
    if (! body || ! body.events || ! body.events.length > 0 || ! ANALYTICS_ID) {
      return;
    }

    var visitor = ua(ANALYTICS_ID, { https: true, debug: true });

    body.events.forEach(function (event) {
      if (event.type) {
        if (Object.prototype.hasOwnProperty.call(GA_EVENTS, event.type)) {
          console.log('got it', event.type);
          var gaEvent = GA_EVENTS[event.type];

          // see https://github.com/peaksandpies/universal-analytics/blob/master/AcceptableParams.md
          // for available list of parameters
          var gaData = {
            hitType: 'event',
            anonymizeIp: 1,
            dataSource: 'web',
            ua: body.agent,
            documentReferrer: body.referrer,
            campaignName: body.utm_campaign,
            campaignSource: body.utm_source,
            campaignMedium: body.utm_medium,
            documentHostName: PUBLIC_URL,
            // it is important to set geoid to NOTSET to avoid ip tracking
            geoid: 'NOTSET',
            uid: body.uniqueUserId,
            cid: body.uniqueUserId
          };

          extend(gaEvent, gaData);

          process.nextTick(function () {
            visitor.event(gaEvent).send(function (err) {
              if (err) {
                logger.error('Error in GA collector: ', err);
              }
            });
          });
        }
      }
    });
  }
};

module.exports = GACollector;
