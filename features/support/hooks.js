var
  request = require('request'),
  config = require('./config.js'),
  fixtures = require('../fixtures.json'),
  kuzzleUrl = 'http://' + config.kuzzleHost + ':' + config.kuzzlePort,
  world = require('./world.js');

var hooks = function () {

  this.registerHandler('BeforeFeatures', function (event, callback) {
    browser
      .setViewportSize({width: 1920, height: 1080})
      .call(callback);
  });

  this.Before('@createIndex', function (scenario, callback) {
    console.log('@createIndex');
    initIndex.call(this, callback);
  });

  this.Before('@cleanDb', function (scenario, callback) {
    console.log('@cleanDb');
    initCollection.call(this, callback);
  });

  this.After('@unsubscribe', function (scenario, callback) {
    browser
      .click('.filters button.btn-unsubscribe')
      .call(callback);

    if (world.currentRoom) {
      world.currentRoom.unsubscribe();
      world.currentRoom = null;
    }
  });
};

var initIndex = function (callback) {
  var
    query = {
      controller: 'admin',
      action: 'createIndex',
      index: world.index
    },
    timeoutCallback = function () {
      setTimeout(() => {
        callback();
      }, 1000)
    };

  world.kuzzle
    .queryPromise(query, {})
    .then(timeoutCallback)
    .catch(timeoutCallback);
};

var initCollection = function (callback) {
  var query = {
    controller: 'bulk',
    action: 'import',
    index: world.index
  };

  var timeoutCallback = function () {
    setTimeout(() => {
      callback();
    }, 1000)
  };

  world.kuzzle
    .dataCollectionFactory(world.collection)
    .deletePromise()
    .then(() => {
      return world.kuzzle
        .queryPromise(query, fixtures[world.index][world.collection])
    })
    .then(timeoutCallback)
    .catch(timeoutCallback);
};

module.exports = hooks;
