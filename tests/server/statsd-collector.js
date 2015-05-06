/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!../../server/lib/statsd-collector'
], function (intern, registerSuite, assert, configuration, StatsDCollector) {
  'use strict';

  var suite = {
    name: 'statsd-collector'
  };

  var UDP_PORT = 44444;
  var incoming_messages = {};

  var socket = dgram.createSocket('udp4');
  socket.on("message", function (msg, rinfo) {
    console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
  });

  socket.bind(UDP_PORT, function() {
  });

  // This test cannot be run remotely like the other tests in tests/server. So,
  // if production, just skip these tests (register a suite with no tests).
  if (intern.config.fxaProduction) {
    registerSuite(suite);
    return;
  }

  var metricsCollector = new StatsDCollector();

  suite['properly collects metrics events'] = function () {
    var dfd = this.async(1000);


    socket.close();
  };

  registerSuite(suite);
});
