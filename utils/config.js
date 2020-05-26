'use strict';

const mergeKeys = (obj1, obj2) => {
  let obj3 = {};
  for (let attrname in obj1) {
    if (attrname) {
      obj3[attrname] = obj1[attrname];
    }
  }
  for (let attrname in obj2) {
    if (attrname) {
      obj3[attrname] = obj2[attrname];
    }
  }
  return obj3;
};

const credentials = {
  'api-token': 'b99ce917-e4f2-4131-b0f0-aaa0957484f0'
};
const APIurl = {
  production: 'https://api.localmint.com/api/advicelocal',
  staging: 'https://testing-api.localmint.com/api/advicelocal'
};

exports = module.exports = {
  mergeKeys,
  APIurl,
  credentials
};
