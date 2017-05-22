require('babel-register')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ropsten: {
      host: "testnet.project-entropy.com",
      port: 8545,
      network_id: 3
    }
  }
}
