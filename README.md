# PenDeS
[![GitHub Super-Linter](https://github.com/umesh-timalsina/PeNDeS/workflows/Lint%20Code%20Base/badge.svg?branch=main
)](https://github.com/marketplace/actions/super-linter)
![Tests](https://github.com/umesh-timalsina/PeNDeS/workflows/Tests/badge.svg?branch=main)
## About
**Petri Net Design Studio** (**P**en**D**e**S**) is a design studio built on top of [`webgme`](https://github.com/webgme/webgme) for the Petri nets Domain.
### Petri Nets
Petri nets are directed bi-partite graphs commonly used for modeling distributed systems. A petrinet has two types of
 elements **Place** (Usually depicted using a circle) and **Transition** (Usually depicted using a rectangle). Places
  are connected with each other using transitions and it a transition is enabled if every inplace for a transition
   has `marking > 0`. An enabled transition can be fired and firing an enabled transition decreases the marking of
    its inplaces by 1 while increasing the markings of output place by 1.
  

## Installation
[`nodejs`](https://nodejs.org/en/) and [`mongodb`](https://www.mongodb.com/) are required. After installing `node` and
 `mongo`, you can use the following commands to use this design studio:
 ```shell script
$ git clone https://github.com/umesh-timalsina/PeNDeS
$ cd PeNDeS
$ npm install
$ npm start
```

Finally, navigate to http://localhost:8888 for the design studio:

## Developers
The [`JointJSDashboard`](./src/visualizers/widgets/PetriNetSimulator/JointJSDashboard) a [`svelte`](https://svelte.dev/) component. While debugging the `PetriNetSimulator` visualizer, it is recommended to run the `watch-svelte` `npm` script for tracking changes in the `svelte` component. To do a debug start, follow the installtion
 instruction and in a separate terminal run `npm run watch-svelte`. 
