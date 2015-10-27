/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Route to report CSP Violations to metrics
 */
module.exports = function (options) {
  function isRateLimited() {
    var min = 0;
    var max = 10;
    var RATE_LIMIT = 1;
    var rand = min + Math.floor(Math.random() * (max - min + 1));

    return rand >= RATE_LIMIT;
  }

  return {
    method: 'post',
    path: '/_/csp-violation',
    process: function (req, res) {
      res.json({result: 'ok'});

      // TODO: Not sure how many CSP errors we will get
      // To avoid overflowing Heka logs rate limit the logging
      if (isRateLimited()) {
        return;
      }

      if (! req.body || ! req.body['csp-report'] || ! req.body['csp-report']['blocked-uri']) {
        return;
      }

      var today = new Date();
      today.setMinutes(0, 0, 0);

      var entry = {
        blocked: req.body['csp-report']['blocked-uri'],
        op: 'server.csp',
        time: today.toISOString()
      };

      process.stderr.write(JSON.stringify(entry) + '\n');
    }
  };
};
