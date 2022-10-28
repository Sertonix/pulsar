#!/usr/bin/env node

'use strict';

const cleanCaches = require('./lib/clean-caches');
const cleanDependencies = require('./lib/clean-dependencies');
const cleanOutputDirectory = require('./lib/clean-output-directory');
const killRunningEditorInstances = require('./lib/kill-running-atom-instances');

async function clean() {
  killRunningEditorInstances();
  return Promise.all([
    cleanDependencies(),
    cleanCaches(),
    cleanOutputDirectory()
  ]);
}

clean()
  .then(() => {
    process.exit(0);
  })
  .catch(e => {
    throw e;
  });
