'use strict';

const request = require('request');
const querystring = require('querystring');
const _ = require('lodash');
const {
  APIurl, credentials
} = require('./config.utils');

const doRequest = options => {
  options.headers = { ...options.header, ...credentials };
  return new Promise((res, rej) => {
    // const utill = require('util');
    // console.log(utill.inspect(options, false, null, true));
    request(options, (error, response, body) => {
      if (error) {
        return rej(error);
      }
      return res({ options, body });
    });
  });
};

const getBusinessById = async ({ id }) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `${/*APIurl[env] ||*/APIurl.production}/Listing?id=${id}`,
      json: true
    };
    return doRequest(options)
      .then(result => {
        // const utill = require('util');
        // console.log(utill.inspect(result, false, null, true));
        return resolve(result.body);
      })
      .catch(err => {
        return reject(err && err.message ? err.message : err);
      });
  });
};


const searchByParams = (searchType, params) => {
  let searchEndpoint;
  let searchParams;
  switch (searchType) {
    case 'ByNameNZip':
      searchParams = (({ businessName, postal }) => ({ name: businessName, zipcode: postal }))(params);
      searchEndpoint = 'SearchByName';
      break;
    case 'ByNameNZipNState':
      searchParams = (({ businessName, postal, state }) => ({ name: businessName, zipcode: postal, state }))(params);
      searchEndpoint = 'SearchByName';
      break;
    case 'ByPhone':
      searchParams = (({ phone }) => ({ phone }))(params);
      searchEndpoint = 'searchbyphone';
      break;
    case 'ByPhoneNZip':
      searchParams = (({ phone, postal }) => ({ phone, zipcode: postal }))(params);
      searchEndpoint = 'searchbyphone';
      break;
    case 'ByNameNPhone':
      searchParams = (({ businessName, phone }) => ({ name: businessName, phone }))(params);
      searchEndpoint = 'searchbyNamePhone';
      break;
    default:
      searchParams = (({ businessName, postal }) => ({ name: businessName, zipcode: postal }))(params);
      searchEndpoint = 'SearchByName';
      break;
  }

  return new Promise(ret => {
    let query = `${/*APIurl[env] || */APIurl.production}/${searchEndpoint}?${querystring.stringify(searchParams)}`;
    let options = {
      method: 'GET',
      url: query,
      json: true
    };
    return doRequest(options)
      .then(result => {
        result.body = result.body.map(resp => {
          resp.query = query;
          return resp;
        });
        return ret(result.body);
      })
      .catch(err => {
        console.log(`Error in ${searchEndpoint}`, err.message || err);
        ret(false);
        // rej(err && err.message ? err.message : err)
      });
  });
};

const searchlisting = data => {
  return new Promise((ret, rej) => {
    return Promise.all([
      searchByParams('ByNameNZip', data),
      searchByParams('ByNameNZipNState', data),
      searchByParams('ByPhone', data),
      searchByParams('ByPhoneNZip', data),
      searchByParams('ByNameNPhone', data)
    ])
      // .then(r => {
      //   const utill = require('util');
      //   console.log(utill.inspect(r, false, null, true));
      //   return r;
      // })
      .then(results =>
        _.uniqBy([].concat.apply([], results), 'url')
          .filter(result => result.status === 'ACTIVE' || result.status === 'AVAILABLE')
          .map(({ query, name, address, phone, url }) => ({ query, name, address, phone, url }))
      )
      // .then(frontier)
      // .then(res => res.result && Array.isArray(res.result) && res.result.length ? res.result[0] : false)
      .then(res => ret(res))
      .catch(err => rej(err && err.message ? err.message : err));
  });
};

module.exports = {
  getBusinessById,
  searchlisting
};
