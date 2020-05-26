'use strict';

const { debuglog } = require('util');
const request = require('request');
const cheerio = require('cheerio');
const _ = require('lodash');
const { getBusinessById, searchlisting } = require('./connection');
const {
  getProxy, getUserAgent, getReferer, legacyClientToClient,
  frontier, getClientNAP, delay, getAction, validateData, cleanData
} = require('./config.utils');

const debugData = debuglog('data');
const userAgent = getUserAgent();


/* istanbul ignore next */
const doConnection = (options, reqNum = 0) => {
  return new Promise((resolve, reject) => {
    if (options.url === '') {
      return reject({ message: 'No url to perform request' });
    }
    // cookies management
    // options.jar = request.jar();
    options.timeout = 15000;
    options.headers = {
      'accept': 'text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5',
      'cache-control': 'max-age=0',
      'connection': 'close',
      'Proxy-Connection': 'close',
      'accept-charset': 'IS-8859-1,utf-8;q=0.7,*;q=0.7',
      'accept-language': 'en-us,en;q=0.5',
      'pragma': '',
      'referer': getReferer(),
      'user-agent': userAgent
    };
    let requestLimit = 3;
    request(options, (error, response, body) => {
      if (response) {
        if (response.statusCode !== 200) {
          if (reqNum < requestLimit) {
            reqNum++;
            return resolve({ redirectsCount: reqNum });
          } else if (response.statusCode === 404 || response.statusCode === 403) {
            return reject({ noResults: 'not found' });
          } else {
            options.response = {
              ...response,
              ...body && body.status && {
                status: body.status
              },
              ...body && body.error && {
                error: body.error
              },
              ...body && body.data && {
                data: body.data
              }
            };
            return reject(options);
          }
        }
      } else {
        if (reqNum < requestLimit) {
          reqNum++;
          return resolve({ redirectsCount: reqNum });
        }
        return reject({ no_response: options });
      }
      if (error) {
        return reject(error);
      }
      return resolve(body);
    });
  })
    .then(response => {
      if (response && response.redirectsCount) {
        return delay(1000).then(() => {
          return doConnection(options, response.redirectsCount);
        });
      } else {
        return response;
      }
    })
    .catch(err => {
      return err;
    });
};

const getListingData = html => {
  let $ = cheerio.load(html);
  let name = $('.store-details h1.place-title').text().trim();
  let address = $('.store-details .place-address').html().replace(/<br>/g, ' ').replace(/\s+/g, ' ').trim();
  let phone = $('.store-details .place-phone').text().trim();
  return { name, address, phone };
};

const scrapeLink = data => {
  return new Promise(resolve => {
    doConnection({
      url: data.url,
      method: 'GET',
      proxy: `http://${data.proxy.username}:${data.proxy.password}@${data.proxy.server}:${data.proxy.port}/`
    })
      .then(getListingData)
      .then(listingResult => {
        listingResult.url = data.url;
        listingResult.query = data.query;
        return resolve(listingResult);
      })
      .catch(() => {
        /* istanbul ignore next */

        /* istanbul ignore next */
        return resolve(null);
      });
  });
};

const useId = async ({ data }) => {
  let id = _.get(data, 'submissions.localmint.id');
  let client = await getBusinessById({ id });
  if (client instanceof Object === false || client instanceof Object && (
    Object.keys(client).length < 1 || client.error || client.name === ''
    && client.address === '' && client.phone === '')) {
    return {
      results: false,
      query: `getById: ${id}`,
      message: 'not found'
    };
  }
  // let address = client.hide ? [] : [client.address.line1, client.address.line2];
  return {
    results: true,
    query: `getById: ${id}`,
    message: 'OK',
    result: [{
      name: client.name,
      address: client.address,
      url: client.url,
      phone: client.phone
    }]
  };
};

const useLink = async ({ data, proxy }) => {
  if (!data.link || !proxy) {
    return {
      results: false,
      query: data.link,
      message: 'not found'
    };
  }
  let scrapedResult = await scrapeLink({ proxy, url: data.link, query: data.link });
  if (scrapedResult instanceof Object === false || scrapedResult instanceof Object && (
    Object.keys(scrapedResult).length < 1 || scrapedResult.error || scrapedResult.name === ''
    && scrapedResult.address === '' && scrapedResult.phone === '')) {
    return {
      results: false,
      query: data.link,
      message: 'not found'
    };
  }
  delete scrapedResult.query;
  return {
    results: true,
    query: data.link,
    message: 'OK',
    result: [scrapedResult]
  };
};

const recursiveSearch = async ({ data }) => {
  let resultsArray = await searchlisting(data);
  let result = await frontier({ client: data, resultsArray });
  if (result.error && data.businessName.split(' ').length > 2) {
    let lastIndex = data.businessName.lastIndexOf(' ');
    data.businessName = data.businessName.substring(0, lastIndex);
    return await recursiveSearch({ data });
  } else if (result.error && data.businessName.split(' ').length <= 2) {
    return { results: false, message: 'not found', query: '' };
    /* istanbul ignore next */
  } else {
    return Promise.resolve(result);
  }
};

const mainProcess = async data => {
  data = legacyClientToClient(data);
  try {
    validateData(data);
  } catch (err) {
    return Promise.resolve({ message: err.message });
  }
  data = cleanData(data);
  let id = data.legacyClient ? data.legacyClient : data.clientId;
  id = id ? id : data.id;
  let action = getAction(data);

  debugData({ id });
  debugData('NAP', getClientNAP(data));
  debugData('Action', action);
  let proxy = await getProxy('search-proxy');
  try {
    const options = {
      get: async () => await useId({ data }),
      link: async () => await useLink({ data, proxy }),
      search: async () => await recursiveSearch({ data })
    };
    return Promise.resolve(await (options[action] || options.default)());
  } catch (error) {
    /* istanbul ignore next */
    return Promise.reject(error.message || error);
  }
};

exports = module.exports = {
  mainProcess,
  scrapeLink,
  getListingData,
  useLink,
  useId,
  recursiveSearch
};
