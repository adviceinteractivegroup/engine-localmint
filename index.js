'use strict';

const {mainProcess} = require('./lib/engine');

const handler = (data, context)=>{
  let timeIni = Date.now();
  mainProcess(data)
    .then(processResponse=> {
      processResponse.elapsedTime = Date.now() - timeIni;
      context.done(null, processResponse);
    })
    .catch(err=>context.done(JSON.stringify(err)));
};

exports = module.exports = {
  handler,
  mainProcess
};
