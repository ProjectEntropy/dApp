# Entropy dApp

var entropy;
MetaCoin.deployed().then(function(instance) { entropy = instance })

### Get ABI

JSON.stringify(entropy.abi)


    parity --chain dev


### New Action

entropy.newAction( 0, "Buy Potatoes", { from: web3.eth.accounts[0] })


## Spin up

'npm run watch #continuously build the webpack bundle of javascript'
'truffle serve #setup webserver for the bundle + continuously compile Solidity'


## In order to build and run the frontend code *LOCALLY*, run
1. `yarn install` or `npm install` depending on your preference
2. make sure you have testrpc running , and change `truffle.js` to point to that network. e.g. `localhost:8545`.
3. `truffle compile` to create the json contract artifacts
4. `truffle migrate` to deploy the contracts onto the network
5. change the web3 provider in `app/main.js` to point to the testrpc server.
6. `npm run build` to compile the javascript and html assets into the `build` folder
7. `truffle serve` to serve the assets in the build folder
8. navigate to the host and port that truffle is serving (default, `localhost:8080`) in order to see the served assets

## In order to build and run the frontend code *IN DOCKER*, run
1. `docker-compose -f docker/docker-compose.yml up -d`
2. once the container starts, find the hash of the truffle3_container service and run `docker attach <hash>`
3. `yarn install` or `npm install` depending on your preference
4. change `truffle.js` to point to that network. this is `testrpc:8545` from inside the container
3. `truffle compile` to create the json contract artifacts
4. `truffle migrate` to deploy the contracts onto the network
5. change the web3 provider in `app/main.js` to point to the testrpc server. !! *this will be `localhost:7000`* !!
6. `npm run build` to compile the javascript and html assets into the `build` folder
7. `truffle serve` to serve the assets in the build folder
8. navigate to `localhost:7001/index.html` in your browser to see the served assets

## Possible upgrades
* Use the webpack hotloader to sense when contracts or javascript have been recompiled and rebuild the application
