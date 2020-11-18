/* globals define, WebGMEGlobal */
/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */

'use strict';

define([], function () {
    const client = WebGMEGlobal.Client;
    const getMetaTypes = () => {
        return Object.fromEntries(client.getAllMetaNodes()
            .filter(node => node.getAttribute('name') !== 'FCO')
            .map(node => [
                node.getAttribute('name'), node.getId()
            ]));
    };

    const getDecoratedMetaTypes = () => {
        const metaTypes = getMetaTypes();
        delete metaTypes.T2P;
        delete metaTypes.P2T;
        return metaTypes;
    };

    const getChildrenOfType = (node, type) => {
        const metaNodeId = getMetaTypes()[type];
        if (metaNodeId) {
            return node.getChildrenIds().filter(id => {
                return client.isTypeOf(id, metaNodeId);
            }).map(id => client.getNode(id));
        }
    };

    const getMetaTypesInfo = function () {
        const TYPE_INFO = {};

        Object.entries(getMetaTypes()).forEach(([name, id]) => {
            TYPE_INFO[`is${name}`] = (objID) => {
                return client.isTypeOf(objID, id);
            };
        });
        return TYPE_INFO;
    };

    const getMetaTypeOf = function (gmeID) {
        const node = client.getNode(gmeID);
        if (node) {
            return client.getNode(node.getMetaTypeId()).getAttribute('name');
        }
    };

    return {
        getMetaTypes: getMetaTypes,
        getDecoratedMetaTypes: getDecoratedMetaTypes,
        getMetaTypesInfo: getMetaTypesInfo,
        getMetaTypeOf: getMetaTypeOf,
        getChildrenOfType: getChildrenOfType
    };
});
