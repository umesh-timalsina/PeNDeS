/*globals define, _, DEBUG, $*/
/*eslint-env browser*/

/**
 * Generated by DecoratorGenerator
 */


define([
    'js/Constants',
    'js/NodePropertyNames',
    '../Core/PetriNetsDecorator.Core',
    'js/Widgets/PartBrowser/PartBrowserWidget.DecoratorBase',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'css!./PetriNetsDecorator.PartBrowserWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             PetriNetsDecoratorCore,
             PartBrowserWidgetDecoratorBase,
             DiagramDesignerWidgetConstants,
             PetriNetsDecoratorDiagramDesignerWidgetTemplate) {

    'use strict';

    var DECORATOR_ID = 'PetriNetsDecoratorPartBrowserWidget';

    function PetriNetsDecoratorPartBrowserWidget(options) {
        var opts = _.extend({}, options);

        PartBrowserWidgetDecoratorBase.apply(this, [opts]);
        this.logger.debug('PetriNetsDecoratorPartBrowserWidget ctor');
        this._initializeDecorator({connectors: false});
    }

    _.extend(PetriNetsDecoratorPartBrowserWidget.prototype, PartBrowserWidgetDecoratorBase.prototype);
    _.extend(PetriNetsDecoratorPartBrowserWidget.prototype, PetriNetsDecoratorCore.prototype);


    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/
    PetriNetsDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    PetriNetsDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();
        this.skinParts.$name = this.$el.find('.name');
        this._renderContent();
    };

    PetriNetsDecoratorPartBrowserWidget.prototype.afterAppend = function () {
    };

    /**** Override from ModelDecoratorCore ****/
    PetriNetsDecoratorPartBrowserWidget.prototype._registerForNotification = function(portId) {
        var partId = this._metaInfo[CONSTANTS.GME_ID];

        this._control.registerComponentIDForPartID(portId, partId);
    };


    /**** Override from ModelDecoratorCore ****/
    PetriNetsDecoratorPartBrowserWidget.prototype._unregisterForNotification = function(portId) {
        var partId = this._metaInfo[CONSTANTS.GME_ID];
        this._control.unregisterComponentIDFromPartID(portId, partId);
    };

    return PetriNetsDecoratorPartBrowserWidget;
});