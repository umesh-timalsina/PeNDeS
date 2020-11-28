<script>
    import {onMount} from 'svelte';
    import 'jointjs/dist/joint.css';
    import * as dagre from 'dagre/dist/dagre.min';
    import * as graphlib from 'graphlib/dist/graphlib.min';
    import * as joint from 'jointjs/dist/joint';

    let eventElement, paperEl;
    let graph,
        paper,
        existingPlaces,
        paperWidth,
        paperHeight,
        existingTransitions,
        isFireable;

    const ENABLED_TRANSITION_ATTR = 'green',
        DISABLED_TRANSITION_ATTR = 'red';


    onMount(() => {
        defineCustomPlace();
        graph = getGraph();
        paper = getPaper();
        existingTransitions = {};
        existingPlaces = {};
        initializePaperEvents();
    });

    function initializePaperEvents() {
        if (paper) {
            paper.on('element:pointerdown', (elementView) => {
                const el = elementView.model;
                let tokenLinks = [];
                if (el instanceof joint.shapes.petrinets.Transition && isEnabledTransition(el)) {
                    const outBoundLinks = graph.getConnectedLinks(el, {
                        outbound: true
                    });
                    outBoundLinks.forEach(link => {
                        tokenLinks.push(link);
                        const dst = link.getTargetElement();
                        const srcTransition = link.getSourceElement();
                        const inPlaces = graph.getConnectedLinks(srcTransition, {
                            inbound: true
                        }).map(link => {
                            tokenLinks.push(link);
                            return link.getSourceElement();
                        });

                        const dstMarkingCount = +dst.attr('label/text');
                        dst.attr('label/text', dstMarkingCount + 1);
                        inPlaces.forEach(place => {
                            const srcMarkingCount = +place.attr('label/text');
                            place.attr('label/text', srcMarkingCount - 1);
                        });
                    });
                    sendToken(tokenLinks);
                    highlightEnabledTransitions();
                }
            });
        }
    }

    function sendToken(links) {
        links.forEach(link => {
            link.findView(paper).sendToken(
                joint.V('circle', {r: 5, fill: '#FFDF00'}),
                {duration: 1000}
            );
        });
    }

    function isEnabledTransition(transition) {
        return transition.attr('body/stroke') === ENABLED_TRANSITION_ATTR;
    }

    function getGraph() {
        return new joint.dia.Graph();
    }

    function getPaper(width, height) {
        const paper = new joint.dia.Paper({
            width: width || 600,
            height: height || 600,
            gridSize: 10,
            defaultAnchor: {name: 'modelCenter'},
            defaultConnectionPoint: {name: 'boundary'},
            defaultRouter: {name: 'normal'},
            model: graph ? graph : getGraph()
        });
        return paper;
    }

    function defineCustomPlace() {
        joint.shapes.petrinets = {};
        joint.shapes.petrinets.Place = joint.shapes.standard.Circle;
        joint.shapes.petrinets.Transition = joint.shapes.standard.Rectangle;
        joint.shapes.petrinets.Link = joint.shapes.standard.Link;
    }

    function onClassifyClicked() {
        const event = new CustomEvent('onClassifyClicked');
        eventElement.dispatchEvent(event);
    }

    function onResetClicked() {
        const event = new CustomEvent('onResetClicked');
        eventElement.dispatchEvent(event);
    }

    function getPlace(place) {
        if (existingPlaces[place.id]) {
            return existingPlaces[place.id];
        }
        const p = new joint.shapes.petrinets.Place({
            id: place.id
        }).resize(50, 50);

        p.attr('label/text', place.markings);
        existingPlaces[place.id] = p;
        return p;
    }

    function getTransition(transition) {
        if (existingTransitions[transition.id]) {
            return existingTransitions[transition.id];
        }
        const t = new joint.shapes.petrinets.Transition({
            id: transition.id,
            attrs: {
                text: {
                    'ref-y': -40,
                },
                body: {
                    fill: '#9586fd',
                    stroke: '#9586fd'
                }
            }
        }).resize(15, 50);
        t.attr('label/text', transition.name);
        existingTransitions[transition.id] = t;
        return t;
    }

    function getLink(src, dst) {
        const l = new joint.shapes.standard.Link();
        l.source(src);
        l.target(dst);
        return l;
    }

    function relayout() {
        joint.layout.DirectedGraph.layout(graph, {
            setLinkVertices: false,
            rankDir: 'LR',
            nodeSep: 100,
            rankSep: 100,
            dagre: dagre,
            graphlib: graphlib,
            marginX: 200,
            marginY: 200
        });
        paper.setDimensions(paperWidth - 20, paperHeight - 20);
        paper.scaleContentToFit({
            padding: 50,
            maxScale: 1.5
        });
    }

    function highlightEnabledTransitions() {
        let enabledCount = 0;
        graph.getElements().forEach(element => {
            if (element instanceof joint.shapes.petrinets.Transition) {
                const links = graph.getConnectedLinks(element, {
                    inbound: true
                });

                links.forEach(link => {
                    const src = link.getSourceElement();
                    if (src && +src.attr('label/text') > 0) {
                        enabledCount += 1;
                        element.attr('body/stroke', ENABLED_TRANSITION_ATTR);
                    } else if (src) {
                        element.attr('body/stroke', DISABLED_TRANSITION_ATTR);
                    }
                });
            }
        });
        isFireable = enabledCount > 0;
    }

    export function events() {
        return eventElement;
    }

    export function onDidResize(width, height) {
        if (paper) {
            paperWidth = width;
            paperHeight = height;
            relayout();
        }
    }

    export function removeGraph() {
        if (graph) {
            graph.clear();
            paperEl.innerHTML = '';
        }
    }

    export function buildGraph(links) {
        removeGraph();
        Object.values(links).forEach(link => {
            let place, transition, arrow;
            if (link.src.type === 'Place') {
                place = getPlace(link.src);
                transition = getTransition(link.dst);
                arrow = getLink(place, transition);
            } else if (link.src.type === 'Transition') {
                place = getPlace(link.dst);
                transition = getTransition(link.src);
                arrow = getLink(transition, place);
            }
            graph.addCells([place, transition]);
            graph.addCell([arrow]);
        });
        relayout();
        highlightEnabledTransitions();
        paperEl.appendChild(paper.el);
        paperEl = paperEl;
    }

</script>

<main bind:this={eventElement}>
    <nav class="navbar navbar-default">
        <div class="container-fluid">
            <div class="navbar-header">
                <button class="navbar-brand btn-clear" disabled>Petri Net Simulator</button>
            </div>
            <div class="collapse navbar-collapse">
                <div class="navbar-right">
                    <button type="button"
                            on:click|stopPropagation|preventDefault={onClassifyClicked}
                            class="btn btn-primary navbar-btn"
                    > Classify
                        <i class="fa fa-play-circle"></i></button>
                    <button type="button"
                            class="btn btn-danger navbar-btn"
                            on:click|stopPropagation|preventDefault={onResetClicked}
                    > Reset
                        <i class="fa fa-undo"></i></button>
                </div>
            </div>
        </div>
    </nav>
    {#if !isFireable}
        <div class="container reset-button-warn">
            <p class="text-danger">None of the transitions can be fired.
                Press the reset button to restart. </p>
        </div>
    {/if}
    <div bind:this={paperEl}></div>
</main>

<style>
    main {
        alignment: center;
        margin-left: 20px;
    }

    .reset-button-warn {
        margin-top: 20px;
    }
</style>
