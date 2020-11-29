/*eslint-env node*/
'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

config.seedProjects.basePaths = ['src/seeds/project'];
config.seedProjects.defaultProject = 'project';
config.requirejsPaths.showdown = './node_modules/showdown/dist/showdown.min';

validateConfig(config);
module.exports = config;
