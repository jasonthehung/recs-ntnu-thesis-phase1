const { run } = require("hardhat")

const verify = async (contractAddress, args, path = "", ...contract) => {
    console.log("Verifying contract...")

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
            contract: `contracts/${path}/${contract}.sol:${contract}`,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified.")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
