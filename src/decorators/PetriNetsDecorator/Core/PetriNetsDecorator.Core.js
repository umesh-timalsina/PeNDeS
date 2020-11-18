/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */
/* globals define, $, _*/
/* eslint-env broswser */
'use strict';

define([
    'js/Constants',
    './PetriNetsDecorator.META',
    './PetriNetsDecorator.Constants',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'text!./PetrinetsDecorator.html',
    'text!../default.svg',
    'text!../Icons/Marking.svg'
], function (
    CONSTANTS,
    PetriNetsDecoratorMETA,
    PetriNetsDecoratorConstants,
    DiagramDesignerWidgetConstants,
    PetriNetsDecoratorTemplate,
    DefaultSVGTemplate,
    MarkingSVGTemplate
) {
    const SVG_ICON_PATH = '/decorators/PetriNetsDecorator/Icons/',
        errorSVGTemplate = $(DefaultSVGTemplate),
        markingSVGTemplate = $(MarkingSVGTemplate).find('g.marking');
    let svgCache = {};

    const PetriNetsDecoratorCore = function () {
    };

    PetriNetsDecoratorCore.prototype.$DOMBase = function () {
        return $(PetriNetsDecoratorTemplate);
    }();

    PetriNetsDecoratorCore.prototype.getTerritoryQuery = function () {
        let territoryRule = {};
        territoryRule[this._metaInfo[CONSTANTS.GME_ID]] = {children: 1};
        return territoryRule;
    };

    PetriNetsDecoratorCore.prototype._initializeDecorator = function (params) {
        this.TYPE_INFO = PetriNetsDecoratorMETA.getMetaTypesInfo();
        this.META_TYPES = PetriNetsDecoratorMETA.getMetaTypes();
        this.DECORATED_META_TYPES = PetriNetsDecoratorMETA.getDecoratedMetaTypes();
        this.$name = undefined;
        this._displayConnectors = false;

        if (params && params.connectors) {
            this._displayConnectors = params.connectors;
        }

        if (Object.keys(svgCache || {}).length === 0) {
            const metaTypes = this.DECORATED_META_TYPES;
            Object.keys(metaTypes).forEach(metaType => {
                const svgURL = SVG_ICON_PATH + metaType + '.svg';
                $.ajax(svgURL, {async: false})
                    .done(data => {
                        svgCache[metaType] = $(data.childNodes[0]);
                    }).fail(() => {
                });
            });
        }
    };

    PetriNetsDecoratorCore.prototype.getSVGByMetaType = function (gmeID) {
        const metaName = PetriNetsDecoratorMETA.getMetaTypeOf(gmeID);
        const isPlace = this.TYPE_INFO.isPlace(gmeID);
        if (svgCache[metaName]) {
            return svgCache[metaName].clone();
        }
        return errorSVGTemplate.clone();
    };

    PetriNetsDecoratorCore.prototype.getErrorSVG = function () {
        return errorSVGTemplate.clone();
    };

    PetriNetsDecoratorCore.prototype.doSearch = function (searchDesc) {
        return false;
    };

    PetriNetsDecoratorCore.prototype._renderContent = function () {
        const node = this.getCurrentNode();
        if (node) {
            if (DEBUG) {
                this.$el.attr({'data-id': node.getId()});
            }

            this.skinParts.$name = this.$el.find('.name');

            this.$el.find('.svg-container').empty();

            this.skinParts.$svg = this.getSVGByMetaType(node.getId());
            if (this.TYPE_INFO.isPlace(node.getId())) {
                this.appendMarkingSVGs();
            }

            if (this.skinParts.$svg) {
                this.$el.find('.svg-container').append(this.skinParts.$svg);
                this.skinParts.$connectorContainer = this.$el.find('.connector-container');
                this.skinParts.$connectorContainer.empty();
            } else {
                this.$el.find('.svg-container').append(this.getErrorSVG());
            }
        }
        this.update();

    };

    PetriNetsDecoratorCore.prototype.update = function () {
        this._update();

        if (this._displayConnectors) {
            this.initializeConnectors();
        }
    };

    PetriNetsDecoratorCore.prototype._update = function () {
        this._updateName();
        this._updatePorts();
    };

    PetriNetsDecoratorCore.prototype._updateName = function () {
        const node = this.getCurrentNode();
        if (node && this.skinParts.$name) {
            const name = this.TYPE_INFO.isPlace(node.getId()) ?
                node.getAttribute('name') + ' - ' + node.getAttribute('marking') :
                node.getAttribute('name');

            this.skinParts.$name.text(name);
        }
    };

    PetriNetsDecoratorCore.prototype.getCurrentNode = function () {
        const client = this._control._client;
        const gmeID = this._metaInfo[CONSTANTS.GME_ID];
        return client.getNode(gmeID);
    };

    PetriNetsDecoratorCore.prototype._updatePorts = function () {
        var gmeID = this._metaInfo[CONSTANTS.GME_ID],
            isTypePlace = this.TYPE_INFO.isPlace(gmeID),
            isTypeTransition = this.TYPE_INFO.isTransition(gmeID),
            len = 4,
            portId,
            SVGWidth = parseInt(this.skinParts.$svg.attr('width')),
            SVGHeight = parseInt(this.skinParts.$svg.attr('height')),
            PortWidth = PetriNetsDecoratorConstants.PORT_WIDTH,
            FIXTURE = isTypeTransition ? SVGWidth + PortWidth / 2 : 0;

        if (isTypePlace || isTypeTransition) {
            // reinitialize the port coordinates with an empty object
            this._connectionAreas = {};
            this.skinParts.$connectorContainer.empty();

            // positioning the connectors' connection areas
            // LEFT
            this._connectionAreas[0] = {
                "x1": FIXTURE,
                "y1": SVGHeight / 2
            }
            // RIGHT
            this._connectionAreas[1] = {
                "x1": SVGWidth + FIXTURE,
                "y1": SVGHeight / 2
            }

            if (isTypePlace) {

                // TOP
                this._connectionAreas[2] = {
                    "x1": SVGWidth / 2,
                    "y1": 0
                }
                // BOTTOM
                this._connectionAreas[3] = {
                    "x1": SVGWidth / 2,
                    "y1": SVGHeight
                }
            }

            while (len--) {
                portId = 3 - len;
                // render connector
                var connectorE = $('<div/>', {'class': DiagramDesignerWidgetConstants.CONNECTOR_CLASS});

                if (portId === 3) {
                    connectorE.addClass(PetriNetsDecoratorConstants.BOTTOM_PORT_CLASS);
                } else if (portId === 2) {
                    connectorE.addClass(PetriNetsDecoratorConstants.TOP_PORT_CLASS);
                } else if (portId === 1) {
                    connectorE.addClass(PetriNetsDecoratorConstants.RIGHT_PORT_CLASS);
                } else {
                    connectorE.addClass(PetriNetsDecoratorConstants.LEFT_PORT_CLASS);
                }

                connectorE.css({
                    'top': this._connectionAreas[portId].y1 - PortWidth,
                    'left': this._connectionAreas[portId].x1 - PortWidth
                });

                if (this._displayConnectors) {

                    // register connectors for creating connections
                    if (this.hostDesignerItem) {
                        this.hostDesignerItem.registerConnectors(connectorE);
                    } else {
                        this.logger.error("Decorator's hostDesignerItem is not set");
                    }

                    this.skinParts.$connectorContainer.append(connectorE);
                }

                if (isTypeTransition && portId === 1) {
                    break;
                }
            }
        }
    };

    PetriNetsDecoratorCore.prototype.getConnectionAreas = function (id/*, isEnd, connectionMetaInfo*/) {
        var result = [],
            LEN = 20, // length of stem that can stick out of the connector before connections can turn
            ANGLES = [180, 0, 270, 90], // L, R, T, B
            gmeID = this._metaInfo[CONSTANTS.GME_ID],
            isTypeTransition = this.TYPE_INFO.isTransition(gmeID),
            isTypePlace = this.TYPE_INFO.isPlace(gmeID);

        //by default return the bounding box edges midpoints
        if(isTypeTransition || isTypePlace){
            if (id === undefined || id === this.hostDesignerItem.id) {

                for (var i = 0; i < ANGLES.length; i++) {

                    result.push({
                        "id": i,
                        "x1": this._connectionAreas[i].x1, // x's and y's determine the lines where connections can be drawn on
                        "y1": this._connectionAreas[i].y1,
                        "x2": this._connectionAreas[i].x1,
                        "y2": this._connectionAreas[i].y1,
                        "angle1": ANGLES[i], // angles determine from which direction between two angles connections can be drawn
                        "angle2": ANGLES[i],
                        "len": LEN
                    });

                    if (isTypeTransition && i === 1) {
                        break;
                    }
                }
            }
        }

        return result;
    };

    PetriNetsDecoratorCore.prototype._renderMetaTypeSpecificParts = function () {

    };

    PetriNetsDecoratorCore.prototype._registerForNotification = function (portId) {

    };

    PetriNetsDecoratorCore.prototype._unregisterForNotification = function (portId) {

    };

    PetriNetsDecoratorCore.prototype.appendMarkingSVGs = function () {
        const numMarkings = +(this.getCurrentNode().getAttribute(PetriNetsDecoratorConstants.MARKING));
        const markingSVGContainer = this.skinParts.$svg.find('.markings').empty();

        const svgWidth = +this.skinParts.$svg.attr('width');
        const svgHeight = +this.skinParts.$svg.attr('height');
        const xPos = svgWidth / 2 - PetriNetsDecoratorConstants.MARKING_OFFSET;
        const yPos = svgHeight / 2 - PetriNetsDecoratorConstants.MARKING_OFFSET;
        if (numMarkings > 0 && numMarkings <= PetriNetsDecoratorConstants.MAX_MARKINGS_COUNT) {
            for (let j = 0; j < numMarkings; j++) {
                const marking = markingSVGTemplate.clone();
                let translationStr = `translate(${xPos}, ${yPos})`;

                if (j > 0 && j < 5) {
                    const xPosOffset = j >= 3 ? 6.0 : 8.5;
                    if (j > 0 && j % 2 === 0) {
                        translationStr = `translate(${(j - 1) * xPosOffset + xPos}, ${yPos})`;
                    } else if (j > 0 && j % 2 !== 0) {
                        translationStr = `translate(${-j * xPosOffset + xPos}, ${yPos})`;
                    }
                } else if (j >= 5 && j < 9) {
                    const yPosOffset = j >= 7 ? 6.0 : 9.0;

                    if (j % 2 === 0) {
                        translationStr = `translate(${xPos}, ${yPos + (j - 5) * yPosOffset})`;
                    } else {
                        translationStr = `translate(${xPos}, ${yPos - (j - 4) * yPosOffset})`;
                    }
                } else if (j >= 9) {
                    const yPosOffset = j === 11 ? 6.0 : 9.0;
                    const xPosOffset = 8.5;
                    if (j % 2 === 0) {
                        translationStr = `translate(${xPos + xPosOffset}, ${yPos + (j - 9) * yPosOffset})`;
                    } else {
                        translationStr = `translate(${xPos - xPosOffset}, ${yPos - (j - 8) * yPosOffset})`;
                    }
                }

                marking.attr(
                    'transform',
                    translationStr
                );
                markingSVGContainer[0].appendChild(marking[0]);
            }

        }
    };

    return PetriNetsDecoratorCore;
})
;
