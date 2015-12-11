'use strict';

var port;
var count = 1;
var self = this;

var title = 'SW: Title Text, Title Text, Title Text, Title Text, Title Text, Title Text, Title Text, Title Text, Title Text, Title Text';
var body = 'SW: Body Text (Chrome doesn\'t support data in 44) Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum';
var icon = 'icon.png';
var tag = '';
var targetUrl = 'https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/onnotificationclick';

self.addEventListener('push', function(event) {
  console.log('Received a push message::', event);
  console.log(event);

  if (event.data){
    var obj = event.data.json();
    title = obj.title;
    body = obj.body;
    icon = obj.icon;
    tag = obj.tag;
    targetUrl = obj.targetUrl;
  }

  event.waitUntil(clients.matchAll().then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      console.log('client.url' + client.url);
      client.postMessage("Push Event Count: " + count);
      count++;
    }
  }));

});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('pushsubscriptionchange: ', event);
});

self.addEventListener('registration', function(event) {
  console.log('registration: ', event);
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
  console.log('activate: ', event);
});

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
  console.log('install event: ', event);
});
