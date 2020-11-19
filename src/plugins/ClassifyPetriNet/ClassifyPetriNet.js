/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */
/*globals define*/
/*eslint-env node, browser*/

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase'
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase
) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    const NAMESPACE = 'petrinets';

    class ClassifyPetriNet extends PluginBase {
        constructor() {
            super();
            this.pluginMetadata = pluginMetadata;
        }

        async main(callback) {
            const activeNode = this.activeNode;

            try {
                if (this.namespace !== NAMESPACE) {
                    throw new Error('Please run the plugin using petrinets namespace');
                }

                if (this.core.getMetaType(activeNode) !== this.META.PetriNet) {
                    throw new Error('Active node is not of type PetriNet');
                }

                await this.classifyPetriNet(activeNode);
                this.result.setSuccess(true);
            } catch (e) {
                this.logger.error(e.message);
                this.result.setSuccess(false);
            }
            callback(null, this.result);
        }

        async classifyPetriNet(petriNet) {
            const {places, transitions} = await this._getPetriNetMap(petriNet);
            const isStateMachine = this._isStateMachine(transitions);
            const isMarkedGraph = this._isMarkedGraph(places);
            const isFreeChoicePetriNet = this._isFreeChoicePetriNet(transitions);
            const isWorkFlowNet = this._isWorkFlowNet(places, transitions);
            return {
                isStateMachine,
                isMarkedGraph,
                isFreeChoicePetriNet,
                isWorkFlowNet
            };
        }

        async _getPetriNetMap(petriNet) {
            const children = await this.core.loadChildren(petriNet);
            const places = {};
            const transitions = {};
            children.forEach(child => {
                const name = this.core.getAttribute(child, 'name');
                if (this.core.getMetaType(child) === this.META.Place) {
                    places[this.core.getPath(child)] = {
                        name: name,
                        inTransitions: new Set(),
                        outTransitions: new Set()
                    };
                } else if (this.core.getMetaType(child) === this.META.Transition) {
                    transitions[this.core.getPath(child)] = {
                        name: name,
                        inPlaces: new Set(),
                        outPlaces: new Set()
                    };
                }
            });

            children.forEach(child => {
                if (this.core.getMetaType(child) === this.META.P2T) {
                    const inPlacePath = this.core.getPointerPath(child, 'src');
                    const dstTransitionPath = this.core.getPointerPath(child, 'dst');
                    places[inPlacePath].outTransitions.add(dstTransitionPath);
                    transitions[dstTransitionPath].inPlaces.add(inPlacePath);
                } else if (this.core.getMetaType(child) === this.META.T2P) {
                    const outPlacePath = this.core.getPointerPath(child, 'dst');
                    const srcTransitionPath = this.core.getPointerPath(child, 'src');
                    places[outPlacePath].inTransitions.add(srcTransitionPath);
                    transitions[srcTransitionPath].outPlaces.add(outPlacePath);
                }
            });

            return {places, transitions};
        }

        _isFreeChoicePetriNet(transitions) {
            const allInPlaces = new Set();
            let size = 0;
            Object.values(transitions).forEach(transition => {
                transition.inPlaces.forEach(inPlace => allInPlaces.add(inPlace));
                size += transition.inPlaces.size;
            });
            return size === allInPlaces.size;
        }

        _isStateMachine(transitions) {
            return Object.values(transitions)
                .every(transition => {
                    return (transition.inPlaces.size === 1 &&
                        transition.outPlaces.size === 1);
                });
        }

        _isMarkedGraph(places) {
            return Object.values(places).every(place => {
                return (place.inTransitions.size === 1 &&
                    place.outTransitions.size === 1);
            });
        }

        _isWorkFlowNet(/*places, transitions*/) {
            return false;
        }
    }

    return ClassifyPetriNet;
});
