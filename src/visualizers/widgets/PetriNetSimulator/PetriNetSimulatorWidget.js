/*globals define, $*/
define([
    './JointJSDashboard/build/JointDashboard',
    'text!./ClassificationResultsModal.html',
    'css!./JointJSDashboard/build/JointDashboard.css',
    'css!./styles/PetriNetSimulatorWidget.css'
], function (
    JointJSDashboard,
    ClassificationResultsModalTemplate
) {
    'use strict';

    var WIDGET_CLASS = 'petri-net-simulator';

    function PetriNetSimulatorWidget(logger, container) {
        this._logger = logger.fork('Widget');

        this._el = container;
        this.$modalEl = $(ClassificationResultsModalTemplate);
        this._initialize();
        this._currentGraph = null;
        this._logger.debug('ctor finished');
        this.currentWidth = 800;
        this.currentHeight = 800;
    }

    PetriNetSimulatorWidget.prototype._initialize = function () {
        // set widget class
        this._el.addClass(WIDGET_CLASS);
        // this.dashBoard.buildGraph();
        this.$modalEl.on('hidden.bs.modal', () => {
            this.$modalEl.find('.plugin-messages').empty();
        });
    };

    PetriNetSimulatorWidget.prototype._initDashboardEvents = function () {
        if (this.dashBoard) {
            this.dashBoard.events().addEventListener(
                'onClassifyClicked',
                () => this.onClassifyBtnClicked()
            );

            this.dashBoard.events().addEventListener(
                'onResetClicked',
                () => {
                    if (this._currentGraph) {
                        this.drawGraph(
                            this._currentGraph.links,
                            this._currentGraph.name,
                            this._currentGraph.doc,
                            this._currentGraph.extra
                        );
                    }
                }
            );
        }
    };

    PetriNetSimulatorWidget.prototype.displayClassificationResultsModal = function (result) {
        const $title = this.$modalEl.find('.petrinet-name');
        $title.text(result.messages[0].activeNode.name);

        const $pluginName = this.$modalEl.find('.plugin-name');
        $pluginName.text(result.pluginName);

        const $result = this.$modalEl.find('.plugin-result');
        $result.text(result.success ? 'SUCCESS' : 'ERROR');
        $result.addClass(result.success ? 'text-success' : 'text-danger');

        const $messages = this.$modalEl.find('.plugin-messages');
        result.messages.forEach(msg => {
            $messages.append(
                $(`<li class="list-group-item">${msg.message}</li>`)
            );
        });

        this.$modalEl.modal('show');
    };

    PetriNetSimulatorWidget.prototype.onWidgetContainerResize = function (width, height) {
        this._logger.debug('Widget is resizing...');
        if (this.dashBoard) {
            this.dashBoard.onDidResize(width, height);
        } else {
            this.currentWidth = width;
            this.currentHeight = height;
        }
    };

    PetriNetSimulatorWidget.prototype.addNode = function (desc) {
        if (desc) {
            this._currentGraph = desc;
            this.drawGraph(desc.links, desc.name, desc.doc, desc.extra);
        }
    };

    PetriNetSimulatorWidget.prototype.removeNode = function (/*gmeId*/) {
        if (this.dashBoard) {
            this.dashBoard.removeGraph();
        }
    };

    PetriNetSimulatorWidget.prototype.updateNode = function (desc) {
        this.addNode(desc);
    };

    PetriNetSimulatorWidget.prototype.drawGraph = function (links, title, doc, extra) {
        this._el.empty();
        this.dashBoard = new JointJSDashboard({target: this._el[0]});
        this._initDashboardEvents();
        this.dashBoard.buildGraph(links, title, doc, extra);
        this.dashBoard.onDidResize(this.currentWidth, this.currentHeight);
    };

    PetriNetSimulatorWidget.prototype.drawOnlyDashboard = function () {
        this._el.empty();
        this.dashBoard = new JointJSDashboard({target: this._el[0]});
        this._initDashboardEvents();
        this._el.height(this.currentWidth);
        this._el.width(this.currentHeight);
    };


    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    PetriNetSimulatorWidget.prototype.destroy = function () {
        if (this.dashBoard) {
            this._el.empty();
        }
    };

    PetriNetSimulatorWidget.prototype.onActivate = function () {
        this._logger.debug('PetriNetSimulatorWidget has been activated');
    };

    PetriNetSimulatorWidget.prototype.onDeactivate = function () {
        this._logger.debug('PetriNetSimulatorWidget has been deactivated');
    };

    return PetriNetSimulatorWidget;
});
