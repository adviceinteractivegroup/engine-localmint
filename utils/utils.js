'use strict';
const { filterStopWords } = require('advice-util');
const _ = require('lodash');

const validateData = data => {
  if (!data) {
    throw new Error('The data is not correct');
  }
  if (!data.businessName) {
    throw new Error('There is not client businessName');
  }
  if (!data.city) {
    throw new Error('There is not client city');
  }
  if (!data.state) {
    throw new Error('There is not client state');
  }
  if (!data.street1) {
    throw new Error('There is not client street1');
  }
  if (!data.phone) {
    throw new Error('There is not client phone');
  }
};

/* istanbul ignore next */
const delay = t => new Promise(resolve => setTimeout(resolve, t));

/* istanbul ignore next */
const getClientNAP = data => {
  let street = [data.street1, data.street2].filter(Boolean).join(' ');
  let zipState = [data.postal, data.state].filter(Boolean).join(' ');
  let address = [street, data.city, zipState].filter(Boolean).join(', ');
  return {
    N: data.businessName,
    A: address,
    P: data.phone
  };
};

/* istanbul ignore next */
const cleanData = data => {
  data.businessName = filterStopWords(data.businessName.decodeURLpart().toLowerCase()).encodeURLpart(' ');
  data.city = data.city.decodeURLpart();
  data.state = data.state.decodeURLpart();
  data.street1 = data.street1.decodeURLpart();
  data.phone = data.phone ? data.phone.decodeURLpart() : '';
  data.street2 = data.street2 ? data.street2.decodeURLpart() : '';
  data.zip = data.state.replace(/[^0-9]/g, '') ? data.state.replace(/[^0-9]/g, '') : data.postal;
  return data;
};

const getAction = data => {
  if (_.get(data, 'submissions.localmint.id')) {
    return 'get';
  } else if (data.link) {
    return 'link';
  }
  return 'search';
};

const uniqueUrls = array => {
  let a = array.concat();
  for (let i = 0; i < a.length; ++i) {
    for (let j = i + 1; j < a.length; ++j) {
      if (a[i] && a[i] === a[j]) {
        a.splice(j--, 1);
      }
    }
  }
  return a;
};

exports = module.exports = {
  delay,
  getClientNAP,
  validateData,
  cleanData,
  getAction,
  uniqueUrls
};
