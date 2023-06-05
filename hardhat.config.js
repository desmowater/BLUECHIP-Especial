require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("hardhat-gas-reporter");

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      }
    },
  },
  networks: {
    mainnet: {
      url: "https://eth-mainnet.g.alchemy.com/v2/" + process.env.MAINNET_ALCHEMY_API_KEY,
      accounts: [`${process.env.FOR_CHARADAO_PRIVATE_KEY}`]
    },
    // mumbai: {
    //   url: process.env.POLYGON_MUMBAI_URL,
    //   accounts: [`${process.env.FOR_TEST_PRIVATE_KEY}`],
    // },
    goerli: {
      url: process.env.GOERLI_ALCHEMY_URL,
      accounts: [`${process.env.FOR_TEST_PRIVATE_KEY}`],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
    // apiKey: process.env.POLYGONSCAN_API_KEY
  },

};