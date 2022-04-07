require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten:{
      url: 'https://eth-ropsten.alchemyapi.io/v2/xcvztxscUaPr3724vlQUxje4PrVQPIPU',
      accounts: ['33ede8065018c414286181e58dae5614508437057c2fa03973d5383da278ad49'] 
    }
  }
}

