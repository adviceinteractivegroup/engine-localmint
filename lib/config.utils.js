'use strict';

const path = require('path');
const utils = require('require-all')(path.join(__dirname, '.././utils'));
const advice_utils = require('advice-util');

module.exports = (function selfFunc () {
  let util = {};
  for (let key in utils) {
    if(key) {
      util = utils.config.mergeKeys(util, utils[key]);
    }
  }
  util = utils.config.mergeKeys(advice_utils, util);
  return util;
}());

