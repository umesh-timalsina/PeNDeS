/*eslint-env node*/

var testFixture = require('webgme/test/_globals'),
    WEBGME_CONFIG_PATH = '../config';

var WebGME = testFixture.WebGME,
    gmeConfig = require(WEBGME_CONFIG_PATH),
    getGmeConfig = function () {
        'use strict';
        // makes sure that for each request it returns with a unique object and tests will not interfere
        if (!gmeConfig) {
            // if some tests are deleting or unloading the config
            gmeConfig = require(WEBGME_CONFIG_PATH);
        }
        return JSON.parse(JSON.stringify(gmeConfig));
    };

WebGME.addToRequireJsPaths(gmeConfig);

testFixture.getGmeConfig = getGmeConfig;
testFixture.PETRI_NETS = {
    WORKFLOW_NET: '/R/V',
    STATE_MACHINE: '/R/k',
    MARKED_GRAPH: '/R/W',
    FREE_CHOICE: '/R/h'
};
testFixture.PN_SEED_DIR = testFixture.path.join(__dirname, '..', 'src', 'seeds');

module.exports = testFixture;
