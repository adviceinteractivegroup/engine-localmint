'use strict';

const gulp = require('gulp');
const zip = require('gulp-zip');
const AWS = require('aws-sdk');
// npm run upload accessKeyId secretAccessKey
// npm run zip-and-upload accessKeyId secretAccessKey
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET,
  region: 'us-east-1'
});
const lambda = new AWS.Lambda();
const fs = require('fs');
const name = 'engine-localmint';

gulp.task('zip', () => {
  return gulp.src([
    'index.js',
    'test.js',
    'lib/**/*',
    'utils/**/*',
    'node_modules/**/*',
    '!test/**/*',
    '!node_modules/gulp*/**/*',
    '!node_modules/lambda-local/**/*',
    '!node_modules/lambda-local',
    '!node_modules/gulp*/',
    '!node_modules/aws-sdk',
    '!node_modules/chai/',
    '!node_modules/mocha/',
    '!node_modules/ava/',
    '!node_modules/nyc/',
    '!node_modules/standard/',
    '!node_modules/standard/**/*',
    '!node_modules/ava/**/*',
    '!node_modules/nyc/**/*',
    '!node_modules/aws-sdk/**/*',
    '!node_modules/eslint/**/*'], { base: '.', allowEmpty: true })
    .pipe(zip(`${name}.zip`))
    .pipe(gulp.dest('dist'));
});

gulp.task('upload', done => {
  fs.readFile(`./dist/${name}.zip`, (err, file) => {
    if (err) {
      return false;
    }

    lambda.updateFunctionCode({
      FunctionName: name,
      ZipFile: file,
      Publish: true
    }, (error, data) => {
      console.log(`error: ${error}`);
      console.log(`data: ${data}`);
      done();
    });
  });
});

