/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/experiment'
], function (chai, ExperimentInterface) {
  'use strict';

  var assert = chai.assert;

  describe('lib/experiment', function () {
    //var experiment;
    //var windowMock;

    beforeEach(function () {
      /*windowMock = new WindowMock();
      experiment = new ExperimentInterface({
      });*/
    });

    describe('initialize', function () {
      it('requires options', function () {
        var experiment = new ExperimentInterface();
        assert.isFalse(experiment.initialized);
      });
    });


  });
});

