const { network } = require("hardhat")
const { devChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (!devChains.includes(network.name)) {
        log("Deploying RECs_P1...")
        const recs_p1 = await deploy("RECs_P1", {
            from: deployer,
            args: [],
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
        })

        log(`RECs_P1 deployed at ${recs_p1.address}`)

        if (process.env.ETHERSCAN_API_KEY) {
            await verify(recs_p1.address, [], "Phase1", "RECs_P1.sol")
        }
    } else {
        log("Deploying RECs_P1...")
        const recs_p1 = await deploy("RECs_P1", {
            from: deployer,
            args: [],
            log: true,
        })

        log(`RECs_P1 deployed at ${recs_p1.address}`)
    }
}

module.exports.tags = ["all", "Phase1"]
