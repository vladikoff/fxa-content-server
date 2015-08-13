/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/experiments/base'
],
function (chai, Experiment) {
  'use strict';

  var assert = chai.assert;
  var experiment;

  describe('lib/experiments/base', function () {
    beforeEach(function () {
      experiment = new Experiment({
        /*
         .----------------.  .----------------.  .----------------.  .----------------.
         | .--------------. || .--------------. || .--------------. || .--------------. |
         | |  _________   | || |     ____     | || |  ________    | || |     ____     | |
         | | |  _   _  |  | || |   .'    `.   | || | |_   ___ `.  | || |   .'    `.   | |
         | | |_/ | | \_|  | || |  /  .--.  \  | || |   | |   `. \ | || |  /  .--.  \  | |
         | |     | |      | || |  | |    | |  | || |   | |    | | | || |  | |    | |  | |
         | |    _| |_     | || |  \  `--'  /  | || |  _| |___.' / | || |  \  `--'  /  | |
         | |   |_____|    | || |   `.____.'   | || | |________.'  | || |   `.____.'   | |
         | |              | || |              | || |              | || |              | |
         | '--------------' || '--------------' || '--------------' || '--------------' |
         '----------------'  '----------------'  '----------------'  '----------------'
         */
      });
    });

    afterEach(function () {
    });

    describe('initialize', function () {
      it('initializes', function () {
        assert.isTrue(true);
        experiment.initialize();
      });
    });
  });
});
