/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


require([
  'backbone',
  'router',
  'lib/translator',
  'lib/session',
  'lib/url',
  'lib/channels/web',
  'lib/channels/fx-desktop'
],
function (
  Backbone,
  Router,
  Translator,
  Session,
  Url,
  WebChannel,
  FxDesktopChannel
) {
  window.router = new Router();

  // IE8 does not support window.navigator.language. Set a default of English.
  window.translator = new Translator(window.navigator.language || 'en');

  // Don't start backbone until we have our translations
  translator.fetch(function () {
    // Get the party started
    Backbone.history.start({ pushState: true });

    // The channel must be initialized after Backbone.history so that the
    // Backbone does not override the page the channel sets.
    Session.channel = getChannel();
  });

  function getChannel() {
    var context = Url.searchParam('context');
    var channel;

    if (context === 'fx_desktop_v1') {
      // Firefox for desktop native=>FxA glue code.
      channel = new FxDesktopChannel();
    } else {
      // default to the web channel that doesn't do anything yet.
      channel = new WebChannel();
    }

    channel.init();
    return channel;
  }
});


