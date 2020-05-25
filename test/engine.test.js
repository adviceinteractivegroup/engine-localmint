'use strict';

const should = require('chai').should();
const { assert, expect } = require('chai');
const { getListingData, scrapeLink, useLink, useId, recursiveSearch } = require('../lib/engine');
const client = require('./lambda/client');
const clientNoResults = require('./lambda/no-results');
const { client1, client2, client3, client4, client5, client6, client7, client8, client9 } = require('./clients');
const htmlMock = require('./html.listing.mock');
const { getProxy } = require('../lib/config.utils');


describe('localmint', function () {
  describe('getListingData', () => {
    it('should return a valid search url', () => {
      let result = getListingData(htmlMock);
      should.exist(result);
      expect({
        name: 'Apple Store',
        address: '239 Los Cerritos Center Cerritos CA 90703',
        phone: 'Phone: (562) 356-1555'
      })
        .to.be.deep.eq(result);
    });
  });

  describe('scrapeLink', function () {
    this.timeout(15000);
    it('should return the correct NAP, also the same url and link', async () => {
      let proxy = await getProxy('search-proxy');
      let link = 'https://www.localmint.com/us/apple-store-los-cerritos-hours-90764';
      let result = await scrapeLink({ proxy, url: link, query: link });
      should.exist(result);
      expect(result).to.be.deep.eq({
        name: 'Apple Store',
        address: '239 Los Cerritos Center Cerritos CA 90703',
        phone: 'Phone: (562) 356-1555',
        url: 'https://www.localmint.com/us/apple-store-los-cerritos-hours-90764',
        query: 'https://www.localmint.com/us/apple-store-los-cerritos-hours-90764'
      });
    });
  });

  describe('useLink', function () {
    this.timeout(15000);

    it('should return results true with all the correct response', async () => {
      let proxy = await getProxy('search-proxy');
      let link = 'https://www.localmint.com/us/apple-store-los-cerritos-hours-90764';
      let result = await useLink({ proxy, data: { link } });
      should.exist(result);
      expect(result).to.be.deep.eq({
        results: true,
        query: 'https://www.localmint.com/us/apple-store-los-cerritos-hours-90764',
        message: 'OK',
        result:
          [{
            name: 'Apple Store',
            address: '239 Los Cerritos Center Cerritos CA 90703',
            phone: 'Phone: (562) 356-1555',
            url: 'https://www.localmint.com/us/apple-store-los-cerritos-hours-90764'
          }]
      });
    });
  });

  describe('useId', function () {
    this.timeout(15000);

    it('should return results true with all the correct response', async () => {
      let result = await useId({
        data: {
          submissions: {
            localmint: {
              id: 636452
            }
          }
        }
      });
      should.exist(result);
      expect(result).to.be.deep.eq({
        results: true,
        query: 'getById: 636452',
        message: 'OK',
        result:
          [{
            address: "675 Town Square Blvd, Suite 200, Garland, TX, 75040",
            name: "Frontline Source Group",
            phone: "(972) 544-6310",
            url: "https://www.localmint.com/us/frontline-source-group-garland-hours-636452"
          }]
      });
    });
  });

  describe('recursiveSearch', function () {
    this.timeout(15000);

    it('should return results true with all the correct response', async () => {
      let result = await recursiveSearch({ data: client });
      should.exist(result);
      expect(result).to.be.deep.eq({
        results: true,
        query: 'https://api.localmint.com/api/advicelocal/SearchByName?name=Frontline%20Source%20Group&zipcode=75040',
        message: 'OK',
        result:
          [{
            address: "675 Town Square Blvd, Suite 200, Garland, TX, 75040",
            name: "Frontline Source Group",
            phone: "(972) 544-6310",
            url: "https://www.localmint.com/us/frontline-source-group-garland-hours-636452"
          }]
      });
    });
  });

  // describe('areThereResults', () => {
  //   it('should return true', function fnTest(done) {
  //     this.timeout(20000);
  //     this.retries(3);
  //     let result = areThereResults(htmlMock);
  //     should.exist(result);
  //     expect(result).to.equal(true);
  //     done();
  //   });
  // });

  // describe('scrapeLink', () => {
  //   it('should return an array of results in json format', function fnTest(done) {
  //     this.timeout(58000);
  //     this.retries(3);
  //     let link = 'https://www.chamberofcommerce.com/united-states/texas/mckinney/marketing-consultants-professional-practices/1331726808-advice-interactive-group';
  //     getProxy('search-proxy')
  //       .then(proxy => ({ proxy, url: link, query: link }))
  //       .then(scrapeLink)
  //       .then(results => {
  //         should.exist(results);
  //         assert.isObject(results);
  //         assert.propertyVal(results, 'name', 'Advice Interactive Group');
  //         assert.propertyVal(results, 'address', '7850 Collin McKinney Pkwy Mckinney, TX 75070');
  //         assert.propertyVal(results, 'url', 'https://www.chamberofcommerce.com/united-states/texas/mckinney/marketing-consultants-professional-practices/1331726808-advice-interactive-group');
  //         assert.propertyVal(results, 'query', 'https://www.chamberofcommerce.com/united-states/texas/mckinney/marketing-consultants-professional-practices/1331726808-advice-interactive-group');
  //         assert.propertyVal(results, 'phone', '(214) 310-1356');
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  // });

  // describe('getlinks', () => {
  //   it('should return the query and the html string', async function () {
  //     this.timeout(20000);
  //     this.retries(3);
  //     let query = 'https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX';
  //     let proxy = await getProxy('search-proxy')
  //     let result = await getlinks({ html: htmlMock });
  //     expect([
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/computers-advertising-internet/1336981498-advice-interactive-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/computers-advertising-internet/1337273195-advice-interactive-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/1335258819-advice-interactive-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/computers-advertising-internet/12667356-advice-interactive-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/marketing-consultants-professional-practices/1331726808-advice-interactive-group'
  //     ]).to.include.members(result);
  //   });
  // });

  // describe('getHtml', () => {
  //   it('should return the query and the html string', async function () {
  //     this.timeout(20000);
  //     this.retries(3);
  //     let query = 'https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX';
  //     let proxy = await getProxy('search-proxy')
  //     let result = await getHtml({ proxy, query });
  //     should.exist(result);
  //     assert.isObject(result);
  //     should.exist(result.html);
  //     should.exist(result.query);
  //   });
  // });

  // describe('getListOfListings', () => {
  //   it('should return an array of unique listing urls', async function fn() {
  //     this.timeout(10000);
  //     let proxy = await getProxy('search-proxy');
  //     let queries = [
  //       'https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX',
  //       'https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX&pg=2',
  //       'https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX&pg=3'
  //     ];
  //     let links = await getListOfListings({ queries, proxy });
  //     expect([
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/scientific-and-technical-consultants/1338830233-cybase-systems-and-consulting-group-llc',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/attorneys/1331592856-the-mccraw-law-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/tax-return-preparation/1329350581-tax-assistance-group-mckinney',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/landscape-architects/47122660-williams-design-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/special-risks-insurance/6521299-pierce-insurance-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/immigration-naturalization-and-custom-attorneys/2011760309-herman-legal-group-llc',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/marketing-consultants-professional-practices/1331726808-advice-interactive-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/personal-services/43883832-neal-group-llc',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/family-and-general-practice-physicians/23983825-holiner-psychiatric-group-the',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/12628743-the-decker-group-at-first-united-bank',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/insurance/2003756097-paine-insurance-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/financial-planning-consultants-and-services/2000842856-tate-financial-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/tax-services/2011549465-mclaughlins-tax-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/legal-services/1338857393-ramage-law-group',
  //       'https://www.chamberofcommerce.com/united-states/texas/mckinney/attorneys/1331468172-the-mccraw-law-group'])
  //       .to.include.members(links)
  //   });
  // });

  // describe('getResults', () => {
  //   it('should return an array of results in json format', async function fnTest() {
  //     let html = htmlMock;
  //     this.timeout(28000);
  //     this.retries(3);
  //     let query = '["https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX",' +
  //       '"https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX&pg=2",' +
  //       '"https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX&pg=3"]';
  //     let urls = ['https://www.chamberofcommerce.com/united-states/texas/mckinney/marketing-consultants-professional-practices/1331726808-advice-interactive-group'];
  //     let proxy = await getProxy('search-proxy');
  //     let results = await getResults({ urls, query, proxy });
  //     expect([{
  //       name: 'Advice Interactive Group',
  //       address: '7850 Collin McKinney Pkwy Mckinney, TX 75070',
  //       phone: '(214) 310-1356',
  //       url: 'https://www.chamberofcommerce.com/united-states/texas/mckinney/marketing-consultants-professional-practices/1331726808-advice-interactive-group',
  //       query: '["https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX",' +
  //         '"https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX&pg=2",' +
  //         '"https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX&pg=3"]'
  //     }]).to.eql(results);
  //   });
  // });

  // describe('mainProcess no data', () => {
  //   it('should return "not found" message', function fnTest(done) {
  //     this.timeout(28000);
  //     this.retries(3);
  //     mainProcess(clientNoResults)
  //       .then((result) => {
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'message');
  //         assert.property(result, 'query');
  //         assert.propertyVal(result, 'message', 'not found');
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  //   it('should return "The data is not correct" message', function fnTest(done) {
  //     this.timeout(28000);
  //     this.retries(3);
  //     mainProcess(null)
  //       .then((result) => {
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'message', 'The data is not correct');
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  //   it('should return "There is not client businessName" message', function fnTest(done) {
  //     this.timeout(10000);
  //     this.retries(3);
  //     mainProcess({ city: 'Scott+Depot', state: 'WV+25560', street1: '9374+Teays+Valley+Road' })
  //       .then((result) => {
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'message', 'There is not client businessName');
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  //   it('should return "There is not client city" message', function fnTest(done) {
  //     this.timeout(10000);
  //     this.retries(3);
  //     mainProcess({ businessName: 'Foster+Supply+Inc', state: 'WV+25560', street1: '9374+Teays+Valley+Road' })
  //       .then((result) => {
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'message', 'There is not client city');
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  //   it('should return "There is not client state" message', function fnTest(done) {
  //     this.timeout(10000);
  //     this.retries(3);
  //     mainProcess({ businessName: 'Foster+Supply+Inc', city: 'Scott+Depot', street1: '9374+Teays+Valley+Road' })
  //       .then((result) => {
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'message', 'There is not client state');
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  //   it('should return "There is not client street1" message', function fnTest(done) {
  //     this.timeout(10000);
  //     this.retries(3);
  //     mainProcess({ businessName: 'Foster+Supply+Inc', city: 'Scott+Depot', state: 'WV+25560' })
  //       .then((result) => {
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'message', 'There is not client street1');
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  // });

  // describe('mainProcess', () => {
  //   it('test id should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(40000);
  //     this.retries(0);
  //     let clientCopy = JSON.parse(JSON.stringify(client));
  //     clientCopy.submissions = {
  //       chamber: {
  //         id: 2011519323
  //       }
  //     };
  //     mainProcess(clientCopy)
  //       .then(result => {
  //         expect(result).to.be.deep.eql({
  //           results: true,
  //           query: 'getById: 2011519323',
  //           message: 'OK',
  //           result:
  //             [{
  //               name: 'Amen Roofing & Construction',
  //               address: '20823 FM 2854 Rd, Montgomery, TX, 77316',
  //               url: 'https://www.chamberofcommerce.com/united-states/texas/montgomery/roofing-contractors-and-consultants/2011519323-amen-roofing-construction',
  //               phone: '9364945351'
  //             }]
  //         })
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  //   it('test id should return not found', function fnTest(done) {
  //     this.timeout(40000);
  //     this.retries(0);
  //     let tempClient = JSON.parse(JSON.stringify(client));
  //     tempClient.submissions = {
  //       chamber: {
  //         id: 20115193239999
  //       }
  //     };
  //     mainProcess(tempClient)
  //       .then((result) => {
  //         expect(result).to.deep.include({
  //           results: false,
  //           query: 'getById: 20115193239999',
  //           message: 'not found'
  //         })
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  //   it('test link should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(40000);
  //     this.retries(0);
  //     let clientCopy = Object.assign({}, client, {});
  //     clientCopy.link = 'https://www.chamberofcommerce.com/united-states/texas/mckinney/marketing-consultants-professional-practices/1331726808-advice-interactive-group';
  //     mainProcess(clientCopy)
  //       .then((result) => {
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         assert.property(result, 'query');
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  //   it('test link should return "not found"', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     let tempClient = JSON.parse(JSON.stringify(client));
  //     tempClient.link = 'https://www.binxg.com/local?lid=YN873x210801347789441071899'
  //     mainProcess(tempClient)
  //       .then((result) => {
  //         expect(result).to.deep.include({
  //           results: false,
  //           query: tempClient.link,
  //           message: 'not found'
  //         })
  //         done();
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });

  //   it('test 1 should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     mainProcess(client)
  //       .then((result) => {
  //         console.log(result);
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         assert.property(result, 'query');
  //         done();
  //         // message: 'OK',
  //         //   results: true,
  //         //     query: 'https://www.chamberofcommerce.com/search/results?what=advice+interactive+group&where=McKinney%2C+TX',
  //         //       result:
  //         // [{
  //         //   name: 'Advice Interactive Group',
  //         //   address: '7850 Collin McKinney Pkwy Mckinney, TX 75070',
  //         //   phone: '+1-214-310-1356',
  //         //   url: 'https://www.chamberofcommerce.com/united-states/texas/mckinney/marketing-consultants-professional-practices/1331726808-advice-interactive-group'
  //         // }] 
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });

  //   it('test 2 should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     mainProcess(client1)
  //       .then((result) => {
  //         console.log(result);
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result, 'query');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         done();
  //         // message: 'OK',
  //         //   results: true,
  //         //     query: 'https://www.chamberofcommerce.com/search/results?what=your%20cbd%20store%20madison%20al&where=Madison',
  //         //       result:
  //         // [{
  //         //   url: 'https://www.chamberofcommerce.com/madison-al/1339574095-your-cbd-store-madison-al',
  //         //   name: 'Your CBD Store - Madison, AL',
  //         //   address: '8760 Madison Boulevard,  Madison, Alabama 35758',
  //         //   phone: '(256) 542-3400'
  //         // }] 
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });

  //   it('test 3 should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     mainProcess(client2)
  //       .then((result) => {
  //         console.log(result);
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result, 'query');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         done();
  //         // message: 'OK',
  //         //   results: true,
  //         //     query: 'https://www.chamberofcommerce.com/search/results?what=windsor%20court&where=Knoxville',
  //         //       result:
  //         // [{
  //         //   url: 'https://www.chamberofcommerce.com/knoxville-tn/1339574053-windsor-court',
  //         //   name: 'Windsor Court',
  //         //   address: '614 Cedar Ln Ofc 2,  Knoxville, Tennessee 37912',
  //         //   phone: '(865) 688-5872'
  //         // }] 
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });

  //   it('test 4 should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     mainProcess(client3)
  //       .then((result) => {
  //         console.log(result);
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result, 'query');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         done();
  //         // message: 'OK',
  //         //   results: true,
  //         //     query: 'https://www.chamberofcommerce.com/search/results?what=nashville%20center%20for%20aesthetic%20dentistry%20dennis%20j&where=Brentwood',
  //         //       result:
  //         // [{
  //         //   url: 'https://www.chamberofcommerce.com/brentwood-tn/5056099-nashville-center-for-aesthetic-dentistry',
  //         //   name: 'Nashville Center For Aesthetic Dentistry',
  //         //   address: '105 Powell Ct Ste 101,  Brentwood, Tennessee 37027',
  //         //   phone: '(615) 371-8878'
  //         // }]
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });

  //   it('test 5 should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     mainProcess(client4)
  //       .then((result) => {
  //         console.log(result);
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result, 'query');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         done();
  //         // message: 'OK',
  //         //   results: true,
  //         //     query: 'https://www.chamberofcommerce.com/search/results?what=leader+surgical+associates+upmc&where=York%2C+PA',
  //         //       result:
  //         // [{
  //         //   name: 'Leader Surgical Associates',
  //         //   address: '25 Monument Rd Ste 260 York, PA 17403',
  //         //   phone: '+1-717-741-3449',
  //         //   url: 'https://www.chamberofcommerce.com/united-states/pennsylvania/york/physicians-and-surgeon/2004721815-leader-surgical-associates'
  //         // }]
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });

  //   it('test 6 should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     mainProcess(client5)
  //       .then((result) => {
  //         console.log(result);
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result, 'query');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         done();
  //         // message: 'OK',
  //         //   results: true,
  //         //     query: 'https://www.chamberofcommerce.com/search/results?what=vintage%20at%20emory%20road&where=Powell',
  //         //       result:
  //         // [{
  //         //   url: 'https://www.chamberofcommerce.com/powell-tn/1339574025-vintage-at-emory-road',
  //         //   name: 'Vintage at Emory Road',
  //         //   address: '7401 Vintage Pointe Way,  Powell, Tennessee 37849',
  //         //   phone: '(865) 512-6430'
  //         // }] 
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });

  //   it('test 7 should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     mainProcess(client6)
  //       .then((result) => {
  //         console.log(result);
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result, 'query');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         done();
  //         // message: 'OK',
  //         //   results: true,
  //         //     query: 'https://www.chamberofcommerce.com/search/results?what=amber+searcy&where=Austin%2C+TX',
  //         //       result:
  //         // [{
  //         //   name: 'Amber Searcy',
  //         //   address: '4715 South Lamar Boulevard #101-B Austin, TX 78745',
  //         //   phone: '+1-830-534-3327',
  //         //   url: 'https://www.chamberofcommerce.com/united-states/texas/austin/video-games-arcades/2011518185-amber-searcy'
  //         // }]
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });

  //   it('test 8 should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     mainProcess(client7)
  //       .then((result) => {
  //         console.log(result);
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result, 'query');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         done();
  //         // message: 'OK',
  //         //   results: true,
  //         //     query: 'https://www.chamberofcommerce.com/search/results?what=the%20sutton&where=Atlanta',
  //         //       result:
  //         // [{
  //         //   url: 'https://www.chamberofcommerce.com/atlanta-ga/1339573927-the-sutton',
  //         //   name: 'The Sutton',
  //         //   address: '2955 Peachtree rd Nw,  Atlanta, Georgia 30305',
  //         //   phone: '(404) 939-9595'
  //         // }] 
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });

  //   it('test 9 should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     mainProcess(client8)
  //       .then((result) => {
  //         console.log(result);
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result, 'query');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         done();
  //         // message: 'OK',
  //         //   results: true,
  //         //     query: 'https://www.chamberofcommerce.com/search/results?what=the%20pointe%20at%20vinings&where=Atlanta',
  //         //       result:
  //         // [{
  //         //   url: 'https://www.chamberofcommerce.com/atlanta-ga/11388539-the-pointe-at-vinings',
  //         //   name: 'The Pointe at Vinings',
  //         //   address: '50 Adams Lake Blvd Se,  Atlanta, Georgia 30339',
  //         //   phone: '(770) 333-3000'
  //         // }] 
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });

  //   it('test 10 should return the best listing candidate as a json object', function fnTest(done) {
  //     this.timeout(48000);
  //     this.retries(0);
  //     mainProcess(client9)
  //       .then((result) => {
  //         console.log(result);
  //         should.exist(result);
  //         assert.isObject(result);
  //         assert.property(result, 'result');
  //         assert(Array.isArray(result.result));
  //         assert(result.result.length > 0);
  //         assert.property(result.result[0], 'name');
  //         assert.property(result.result[0], 'address');
  //         assert.property(result.result[0], 'phone');
  //         assert.property(result.result[0], 'url');
  //         assert.property(result, 'query');
  //         assert.property(result, 'message');
  //         assert.propertyVal(result, 'results', true);
  //         done();
  //         // message: 'OK',
  //         //   results: true,
  //         //     query: 'https://www.chamberofcommerce.com/search/results?what=all+stage+sound&where=Laytonsville%2C+MD',
  //         //       result:
  //         // [{
  //         //   name: 'All Stage And Sound, Inc',
  //         //   address: '21500 Laytonsville Rd Laytonsville, MD 20882',
  //         //   phone: '+1-301-977-3686',
  //         //   url: 'https://www.chamberofcommerce.com/united-states/maryland/laytonsville/business-associations/3029441-all-stage-and-sound-inc'
  //         // }] 
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         should.not.exist(err);
  //         done();
  //       });
  //   });
  // });
});
