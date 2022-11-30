require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("hardhat-deploy")
require("@nomicfoundation/hardhat-chai-matchers")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.7",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        goerli: {
            url: GOERLI_RPC_URL || "",
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    gasReporter: {
        enabled: true,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        gasPriceApi:
            "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    },
    etherscan: {
        apiKey: {
            goerli: process.env.ETHERSCAN_API_KEY,
        },
    },
    // contractSizer: {
    //     alphaSort: true,
    //     disambiguatePaths: false,
    //     runOnCompile: true,
    //     strict: true,
    // },
}
