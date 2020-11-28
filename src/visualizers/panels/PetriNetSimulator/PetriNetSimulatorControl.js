/*globals define, WebGMEGlobal*/
define([
    'js/Constants',
    'js/Utils/GMEConcepts',
    'q'
], function (
    CONSTANTS,
    GMEConcepts,
    Q
) {

    'use strict';

    function PetriNetSimulatorControl(options) {

        this._logger = options.logger.fork('Control');

        this._client = options.client;

        // Initialize core collections and variables
        this._widget = options.widget;

        this._currentNodeId = null;
        this._currentNodeParentId = undefined;
        this._initWidgetEventHandlers();

        this._logger.debug('ctor finished');
    }

    PetriNetSimulatorControl.prototype._initWidgetEventHandlers = function () {
        this._widget.onClassifyBtnClicked = async () => {
            const pluginName = 'ClassifyPetriNet';
            const context = this._client.getCurrentPluginContext();
            context.managerConfig.namespace = 'petrinets';
            context.pluginConfig = {};
            const res = await Q.ninvoke(
                this._client,
                'runBrowserPlugin',
                pluginName,
                context
            );
            this._widget.displayClassificationResultsModal(res);
        };
    };

    PetriNetSimulatorControl.prototype.selectedObjectChanged = function (nodeId) {
        var self = this;

        self._logger.debug('activeObject nodeId \'' + nodeId + '\'');

        // Remove current territory patterns
        if (self._currentNodeId) {
            self._client.removeUI(self._territoryId);
        }

        self._currentNodeId = nodeId;
        self._currentNodeParentId = undefined;

        if (typeof self._currentNodeId === 'string') {
            // Put new node's info into territory rules
            self._selfPatterns = {};
            self._selfPatterns[nodeId] = {children: 1};  // Territory "rule"

            self._widget.setTitle('');


            self._territoryId = self._client.addUI(self, function (events) {
                self._eventCallback(events);
            });

            // Update the territory
            self._client.updateTerritory(self._territoryId, self._selfPatterns);

            self._selfPatterns[nodeId] = {children: 1};
            self._client.updateTerritory(self._territoryId, self._selfPatterns);
        }
    };

    // This next function retrieves the relevant node information for the widget
    PetriNetSimulatorControl.prototype._getObjectDescriptor = function (nodeId) {
        const node = this._client.getNode(nodeId);
        let desc;
        if (node) {
            const type = this._client.getNode(node.getBaseId()).getAttribute('name');
            if (type === 'PetriNet') {
                desc = {
                    id: node.getId(),
                    name: node.getAttribute('name'),
                    links: {}
                };
                const childrenIds = node.getChildrenIds();
                childrenIds.forEach(id => {
                    if (GMEConcepts.isConnection(id)) {
                        const childNode = this._client.getNode(id);
                        const type = this._client.getNode(childNode.getBaseId()).getAttribute('name');
                        const src = this._client.getNode(childNode.getPointerId('src'));
                        const dst = this._client.getNode(childNode.getPointerId('dst'));
                        if (type === 'P2T') {
                            desc.links[childNode.getId()] = {
                                src: {
                                    id: src.getId(),
                                    name: src.getAttribute('name'),
                                    type: this._client.getNode(src.getBaseId()).getAttribute('name'),
                                    markings: +src.getAttribute('marking')
                                },
                                dst: {
                                    id: dst.getId(),
                                    name: dst.getAttribute('name'),
                                    type: this._client.getNode(dst.getBaseId()).getAttribute('name'),
                                }
                            };
                        } else if (type === 'T2P') {
                            desc.links[childNode.getId()] = {
                                src: {
                                    id: src.getId(),
                                    name: src.getAttribute('name'),
                                    type: this._client.getNode(src.getBaseId()).getAttribute('name'),
                                },
                                dst: {
                                    id: dst.getId(),
                                    name: dst.getAttribute('name'),
                                    type: this._client.getNode(dst.getBaseId()).getAttribute('name'),
                                    markings: +dst.getAttribute('marking')
                                }
                            };
                        }
                    }
                });
                return desc;
            }
        }
    };

    /* * * * * * * * Node Event Handling * * * * * * * */
    PetriNetSimulatorControl.prototype._eventCallback = function (events) {
        var i = events ? events.length : 0,
            event;

        this._logger.debug('_eventCallback \'' + i + '\' items');

        while (i--) {
            event = events[i];
            switch (event.etype) {

            case CONSTANTS.TERRITORY_EVENT_LOAD:
                this._onLoad(event.eid);
                break;
            case CONSTANTS.TERRITORY_EVENT_UPDATE:
                this._onUpdate(event.eid);
                break;
            case CONSTANTS.TERRITORY_EVENT_UNLOAD:
                this._onUnload(event.eid);
                break;
            default:
                break;
            }
        }

        this._logger.debug('_eventCallback \'' + events.length + '\' items - DONE');
    };

    PetriNetSimulatorControl.prototype._onLoad = function (gmeId) {
        const desc = this._getObjectDescriptor(gmeId);
        if (desc) {
            this._widget.addNode(desc);
        }
    };

    PetriNetSimulatorControl.prototype._onUpdate = function (gmeId) {
        const desc = this._getObjectDescriptor(gmeId);
        if (desc) {
            this._widget.updateNode(desc);
        }
    };

    PetriNetSimulatorControl.prototype._onUnload = function (gmeId) {
        this._widget.removeNode(gmeId);
    };

    PetriNetSimulatorControl.prototype._stateActiveObjectChanged = function (model, activeObjectId) {
        if (this._currentNodeId === activeObjectId) {
            // The same node selected as before - do not trigger
        } else {
            this.selectedObjectChanged(activeObjectId);
        }
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    PetriNetSimulatorControl.prototype.destroy = function () {
        this._detachClientEventListeners();
        if (this._territoryId) {
            this._client.removeUI(this._territoryId);
        }
    };

    PetriNetSimulatorControl.prototype._attachClientEventListeners = function () {
        this._detachClientEventListeners();
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
    };

    PetriNetSimulatorControl.prototype._detachClientEventListeners = function () {
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
    };

    PetriNetSimulatorControl.prototype.onActivate = function () {
        this._attachClientEventListeners();

        if (typeof this._currentNodeId === 'string') {
            WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {suppressVisualizerFromNode: true});
        }
    };

    PetriNetSimulatorControl.prototype.onDeactivate = function () {
        this._detachClientEventListeners();
    };

    return PetriNetSimulatorControl;
});
