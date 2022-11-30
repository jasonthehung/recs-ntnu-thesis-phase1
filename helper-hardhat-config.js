const { ethers } = require("hardhat")

const devChains = ["hardhat", "localhost"]
const INITIAL_VALUE = ethers.utils.parseEther("2000000000")

const networkConfig = {
    5: {
        name: "goerli",
    },
}

module.exports = {
    networkConfig,
    devChains,
    INITIAL_VALUE,
}
