/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!./helpers/init-logging',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!../../server/lib/ga-collector',
  'intern/dojo/node!proxyquire'
], function (intern, registerSuite, assert, initLogging, config, GACollector, proxyquire) {
  var serverUrl = intern.config.fxaContentRoot.replace(/\/$/, '');

  var suite = {
    name: 'metrics'
  };

  suite['it works with GA'] = function () {
    var dfd = this.async(intern.config.asyncTimeout);
    var collect = new GACollector();
    var data = JSON.parse(fs.readFileSync('tests/server/fixtures/ga_body_1.json'));
    collect.write(data);
    console.log(collect);
  };

  registerSuite(suite);
});
