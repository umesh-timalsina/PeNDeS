/*eslint-env node, mocha*/

describe('ClassifyPetriNet', function () {
    const testFixture = require('../../globals');
    const path = require('path');
    const {promisify}  = require('util');
    const gmeConfig = testFixture.getGmeConfig();
    const logger = testFixture.logger.fork('ClassifyPetriNet');
    const PluginCliManager = testFixture.WebGME.PluginCliManager;
    const manager = new PluginCliManager(null, logger, gmeConfig);
    const projectName = 'testProject';
    const pluginName = 'ClassifyPetriNet';
    const PROJECT_SEED = path.join(testFixture.PN_SEED_DIR, 'test', 'test.webgmex');
    manager.executePlugin = promisify(manager.executePlugin);
    manager.runPluginMain = promisify(manager.runPluginMain);
    const assert = require('assert');

    let gmeAuth,
        storage,
        context,
        pluginConfig;

    before(async function () {
        gmeAuth = await testFixture.clearDBAndGetGMEAuth(gmeConfig, projectName);
        storage = testFixture.getMemoryStorage(logger, gmeConfig, gmeAuth);
        await storage.openDatabase();
        const importParam = {
            projectSeed: PROJECT_SEED,
            projectName: projectName,
            branchName: 'master',
            logger: logger,
            gmeConfig: gmeConfig
        };

        const importResult = await testFixture.importProject(storage, importParam);
        const {project, commitHash} = importResult;
        await project.createBranch('test', commitHash);
        pluginConfig = {};
        context = {
            project: project,
            commitHash: commitHash,
            branchName: 'text',
            activeNode: '',
            namespace: 'petrinets'
        };
    });

    after(async function(){
        await storage.closeDatabase();
        await gmeAuth.unload();
    });

    it('should classify StateMachine', async function () {
        context.activeNode = testFixture.PETRI_NETS.STATE_MACHINE;
        const result = await manager.executePlugin(pluginName, pluginConfig, context);
        assert(result.success);
        const messages = result.messages.map(msg => msg.message);
        assert(messages.includes('This PetriNet is a State Machine'));
    });

    it('should classify Work Flow Net', async function () {
        context.activeNode = testFixture.PETRI_NETS.WORKFLOW_NET;
        const result = await manager.executePlugin(pluginName, pluginConfig, context);
        assert(result.success);
        const messages = result.messages.map(msg => msg.message);
        assert(messages.includes('This PetriNet is a Workflow Net'));
    });

    it('should classify Free Choice PetriNet', async function () {
        context.activeNode = testFixture.PETRI_NETS.FREE_CHOICE;
        const result = await manager.executePlugin(pluginName, pluginConfig, context);
        assert(result.success);
        const messages = result.messages.map(msg => msg.message);
        assert(messages.includes('This PetriNet is a Free Choice PetriNet'));
    });

    it('should classify Free Marked Graph', async function () {
        context.activeNode = testFixture.PETRI_NETS.MARKED_GRAPH;
        const result = await manager.executePlugin(pluginName, pluginConfig, context);
        assert(result.success);
        const messages = result.messages.map(msg => msg.message);
        assert(messages.includes('This PetriNet is a Marked Graph'));
    });

});
