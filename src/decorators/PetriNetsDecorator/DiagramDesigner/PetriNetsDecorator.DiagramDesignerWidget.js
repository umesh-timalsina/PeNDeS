/*globals define, _*/

/**
 * Generated by DecoratorGenerator
 */

define([
    'js/Constants',
    'js/NodePropertyNames',
    '../Core/PetriNetsDecorator.Core',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.DecoratorBase',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'css!./PetriNetsDecorator.DiagramDesignerWidget.css'
], function (
    CONSTANTS,
    nodePropertyNames,
    PetriNetsDecoratorCore,
    DiagramDesignerWidgetDecoratorBase,
    DiagramDesignerWidgetConstants
) {

    'use strict';

    var DECORATOR_ID = 'PetriNetsDecorator';

    function PetriNetsDecorator(options) {
        var opts = _.extend({}, options);

        DiagramDesignerWidgetDecoratorBase.apply(this, [opts]);

        this.name = '';
        this.logger.debug('PetriNetsDecorator ctor');
        this._initializeDecorator({connectors: true});

    }

    _.extend(PetriNetsDecorator.prototype, DiagramDesignerWidgetDecoratorBase.prototype);
    _.extend(PetriNetsDecorator.prototype, PetriNetsDecoratorCore.prototype);
    PetriNetsDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    PetriNetsDecorator.prototype.on_addTo = function () {
        this._renderContent();

    };

    PetriNetsDecorator.prototype.showSourceConnectors = function (params) {
        this.logger.debug('showSourceConnectors: ' + JSON.stringify(params));
        this.$sourceConnectors.show();
    };

    PetriNetsDecorator.prototype.showEndConnectors = function (params) {
        this.logger.debug('showEndConnectors: ' + JSON.stringify(params));
        this.$endConnectors.show();
    };

    PetriNetsDecorator.prototype.hideEndConnectors = function () {
        this.$endConnectors.hide();
    };

    PetriNetsDecorator.prototype.hideSourceConnectors = function () {
        this.$sourceConnectors.hide();
    };

    PetriNetsDecorator.prototype.initializeConnectors = function () {
        //find connectors
        this.$sourceConnectors = this.$el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS);
        this.$endConnectors = this.$el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS);

        // hide all connectors by default
        this.hideSourceConnectors();
        this.hideEndConnectors();
    };

    PetriNetsDecorator.prototype._registerForNotification = function (portId) {
        const partId = this._metaInfo[CONSTANTS.GME_ID];
        this._control.registerComponentIDForPartID(portId, partId);
    };

    PetriNetsDecorator.prototype._unregisterForNotification = function (portId) {
        const partId = this._metaInfo[CONSTANTS.GME_ID];
        this._control.unregisterComponentIDFromPartID(portId, partId);
    };

    PetriNetsDecorator.prototype.notifyComponentEvent = function (/*componentList*/) {
        this.update();
    };

    return PetriNetsDecorator;
});
