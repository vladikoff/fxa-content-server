/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var logger = require('mozlog')('server.statsd');
var StatsD = require('node-statsd');
var uaParser = require('ua-parser');

var config = require('./configuration');
var statsdConfig = config.get('statsd');

var host = statsdConfig.host;
var port = statsdConfig.port;
var sampleRate = statsdConfig.sample_rate;

var client = new StatsD(host, port);
var connected = true;

var STATSD_PREFIX = 'fxa.content.';

if (client.socket) {
  client.socket.on('error', function (error) {
     logger.error('Error in stats socket: ', error);
  });
} else {
  logger.error('StatsD failed to connect to ' + host + ':' + port);
  connected = false;
}

function StatsDCollector() {
  if(! connected) {
    logger.error('StatsD not connected.');
  }
}

StatsDCollector.prototype = {
  send: function (body) {
    if (body && body.events && body.events.length > 0) {
      logger.verbose(body.events);
      // see more about tags here: http://docs.datadoghq.com/guides/metrics/
      var tags = [
        'campaign:' + body.campaign,
        'context:' + body.context,
        'entrypoint:' + body.entrypoint,
        'migration:' + body.migration,
        'lang:' + body.lang,
        'marketing_clicked:' + body.marketingClicked,
        'marketing_link:' + body.marketingLink,
        'marketing_type:' + body.marketingType,
        'screen_device_pixel_ratio:' + body.devicePixelRatio,
        'screen_client_width:' + body.clientWidth,
        'screen_client_height:' + body.clientHeight,
        'screen_width:' + body.width,
        'screen_height:' + body.height,
        'service:' + body.service,
        // TODO: agent needs to be tested or use a UA parser to properly create tags
        'agent:' + body.agent
      ];

      var agent = uaParser.parse(body.agent);


      // TODO add ab: [] tags

      body.events.forEach(function (event) {
        if (event.type) {
          logger.verbose('sending ', event.type);
          client.increment(STATSD_PREFIX + event.type, 1, sampleRate, tags, function (err){
            //this only gets called once after all messages have been sent
            if (err){
              logger.error('StatsD error:', err);
            }
          });
        }

      });
    }

  }
};

module.exports = StatsDCollector;
