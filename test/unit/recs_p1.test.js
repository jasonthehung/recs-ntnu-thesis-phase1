const { assert } = require("chai")
const { deployments, ethers } = require("hardhat")

describe("RECS_P1 testing...", async () => {
    let deployer
    let recs_p1

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer

        await deployments.fixture(["all"])

        recs_p1 = await ethers.getContract("RECs_P1", deployer)
    })

    describe("Function `setDeviceToMap` testing... 🚨", async () => {
        it("Add one device to owner's table", async () => {
            // * 隨機產生device address
            const devAddr = await ethers.Wallet.createRandom().address

            // * 新增裝置到特定user的account table內
            const txResponse = await recs_p1.setNewDevice(deployer, devAddr)
            await txResponse.wait(1)

            // * 檢查user table內的資料是否正確 (DevArray)
            const devArrayInTable = await recs_p1.getDevArrayInTable(deployer)

            // * devArray長度要為1
            assert.equal(devArrayInTable.length, "1")
            // * table內的資料要和新增的device address相同
            assert.equal(devArrayInTable.toString(), devAddr)
        })

        it("Add ten devices to owner's table", async () => {
            // * Run ten times setDeviceToMap function
            for (let index = 0; index < 10; index++) {
                // * 隨機產生device address
                const devAddr = await ethers.Wallet.createRandom().address

                // * 新增裝置到特定user的account table內
                const txResponse = await recs_p1.setNewDevice(deployer, devAddr)
                await txResponse.wait(1)

                // * 檢查user table內的資料是否正確 (DevArray)
                const devArrayInTable = await recs_p1.getDevArrayInTable(
                    deployer
                )

                // * devArray長度要為1
                assert.equal(devArrayInTable.length, index + 1)
                // * table內的資料要和新增的device address相同
                assert.equal(devArrayInTable[index].toString(), devAddr)
            }
        })
    })

    describe("Function `attest` testing... 🚨", async () => {
        it("Single device attest", async () => {
            // * 隨機產生device address
            const devSinger = (await ethers.getSigners())[1]

            // * 新增裝置到特定user (deployer)的account table內
            const txResponse = await recs_p1.setNewDevice(
                deployer,
                devSinger.address
            )
            await txResponse.wait(1)

            // * recs_p1 contract connect to device
            const recs_p1_with_device = await recs_p1.connect(devSinger)

            // * attest function called by device (kW = 10)
            const txResponse_attest = await recs_p1_with_device.attest("10")
            await txResponse_attest.wait(1)

            // * 檢查devProduction是否為10
            const kW = await recs_p1.getDevProduction(
                deployer,
                devSinger.address
            )
            assert.equal(kW.toString(), "10")

            // * 檢查owner table的total kW
            const totalKw = await recs_p1.getTotalKw(deployer)
            assert.equal(totalKw.toString(), "10")
        })

        it("Multiple devices attest", async () => {
            // * 10個裝置個別存證一次，每次存10kW
            for (let index = 0; index < 10; index++) {
                // * 隨機產生device address
                const devSinger = (await ethers.getSigners())[index]

                // * 新增裝置到特定user (deployer)的account table內
                const txResponse = await recs_p1.setNewDevice(
                    deployer,
                    devSinger.address
                )
                await txResponse.wait(1)

                // * recs_p1 contract connect to device
                const recs_p1_with_device = await recs_p1.connect(devSinger)

                // * attest function called by device (kW = 10)
                const txResponse_attest = await recs_p1_with_device.attest("10")
                await txResponse_attest.wait(1)

                // * 檢查devProduction是否為10
                const kW = await recs_p1.getDevProduction(
                    deployer,
                    devSinger.address
                )
                assert.equal(kW.toString(), "10")
            }

            // * 檢查owner table的total kW
            const totalKw = await recs_p1.getTotalKw(deployer)
            assert.equal(totalKw.toString(), "100")
        })
    })

    describe("Function `mintERC20` testing... 🚨", async () => {
        let newOwner

        describe("100kW", async () => {
            // * 要先完成所有的setup和存證
            beforeEach(async () => {
                // * 隨機產生device address
                const devSinger = (await ethers.getSigners())[1]

                // * 隨機產生新的owner address
                newOwner = (await ethers.getSigners())[2]

                // * 新增裝置到特定user (deployer)的account table內
                const txResponse = await recs_p1.setNewDevice(
                    newOwner.address,
                    devSinger.address
                )
                await txResponse.wait(1)

                // * recs_p1 contract connect to device
                const recs_p1_with_device = await recs_p1.connect(devSinger)

                // * attest function called by device (kW = 10)
                const txResponse_attest = await recs_p1_with_device.attest(
                    "100"
                )
                await txResponse_attest.wait(1)
            })

            it("Mint 100 REC token (eg, 100kW)", async () => {
                // * recs_p1 contract connect to new owner address
                const recs_p1_with_newOwnerAddr = await recs_p1.connect(
                    newOwner
                )

                // * 讓User去mint ERC20 token
                const txResponse = await recs_p1_with_newOwnerAddr.mintERC20()
                await txResponse.wait(1)

                // * 檢查ERC20 token的餘額有沒有100個
                const balance = await recs_p1_with_newOwnerAddr.balanceOf(
                    newOwner.address
                )
                assert.equal(balance.toString(), "100")

                // * 檢查該user在mint ERC20 token之後，totalKw的記錄有沒有被歸零
                const totalKw = await recs_p1_with_newOwnerAddr.getTotalKw(
                    newOwner.address
                )
                assert.equal(totalKw.toString(), "0")
            })
        })

        describe("1000kW", async () => {
            // * 要先完成所有的setup和存證
            beforeEach(async () => {
                // * 隨機產生device address
                const devSinger = (await ethers.getSigners())[1]

                // * 隨機產生新的owner address
                newOwner = (await ethers.getSigners())[2]

                // * 新增裝置到特定user (deployer)的account table內
                const txResponse = await recs_p1.setNewDevice(
                    newOwner.address,
                    devSinger.address
                )
                await txResponse.wait(1)

                // * recs_p1 contract connect to device
                const recs_p1_with_device = await recs_p1.connect(devSinger)

                // * attest function called by device (kW = 1000)
                const txResponse_attest = await recs_p1_with_device.attest(
                    "1000"
                )
                await txResponse_attest.wait(1)
            })

            it("Mint 1000 REC token (eg, 1000kW)", async () => {
                // * recs_p1 contract connect to new owner address
                const recs_p1_with_newOwnerAddr = await recs_p1.connect(
                    newOwner
                )

                // * 讓User去mint ERC20 token
                const txResponse = await recs_p1_with_newOwnerAddr.mintERC20()
                await txResponse.wait(1)

                // * 檢查ERC20 token的餘額有沒有100個
                const balance = await recs_p1_with_newOwnerAddr.balanceOf(
                    newOwner.address
                )
                assert.equal(balance.toString(), "1000")

                // * 檢查該user在mint ERC20 token之後，totalKw的記錄有沒有被歸零
                const totalKw = await recs_p1_with_newOwnerAddr.getTotalKw(
                    newOwner.address
                )
                assert.equal(totalKw.toString(), "0")
            })
        })

        describe("10000kW", async () => {
            // * 要先完成所有的setup和存證
            beforeEach(async () => {
                // * 隨機產生device address
                const devSinger = (await ethers.getSigners())[1]

                // * 隨機產生新的owner address
                newOwner = (await ethers.getSigners())[2]

                // * 新增裝置到特定user (deployer)的account table內
                const txResponse = await recs_p1.setNewDevice(
                    newOwner.address,
                    devSinger.address
                )
                await txResponse.wait(1)

                // * recs_p1 contract connect to device
                const recs_p1_with_device = await recs_p1.connect(devSinger)

                // * attest function called by device (kW = 10000)
                const txResponse_attest = await recs_p1_with_device.attest(
                    "10000"
                )
                await txResponse_attest.wait(1)
            })

            it("Mint 10000 REC token (eg, 10000kW)", async () => {
                // * recs_p1 contract connect to new owner address
                const recs_p1_with_newOwnerAddr = await recs_p1.connect(
                    newOwner
                )

                // * 讓User去mint ERC20 token
                const txResponse = await recs_p1_with_newOwnerAddr.mintERC20()
                await txResponse.wait(1)

                // * 檢查ERC20 token的餘額有沒有100個
                const balance = await recs_p1_with_newOwnerAddr.balanceOf(
                    newOwner.address
                )
                assert.equal(balance.toString(), "10000")

                // * 檢查該user在mint ERC20 token之後，totalKw的記錄有沒有被歸零
                const totalKw = await recs_p1_with_newOwnerAddr.getTotalKw(
                    newOwner.address
                )
                assert.equal(totalKw.toString(), "0")
            })
        })

        describe("100000kW", async () => {
            // * 要先完成所有的setup和存證
            beforeEach(async () => {
                // * 隨機產生device address
                const devSinger = (await ethers.getSigners())[1]

                // * 隨機產生新的owner address
                newOwner = (await ethers.getSigners())[2]

                // * 新增裝置到特定user (deployer)的account table內
                const txResponse = await recs_p1.setNewDevice(
                    newOwner.address,
                    devSinger.address
                )
                await txResponse.wait(1)

                // * recs_p1 contract connect to device
                const recs_p1_with_device = await recs_p1.connect(devSinger)

                // * attest function called by device (kW = 100000)
                const txResponse_attest = await recs_p1_with_device.attest(
                    "100000"
                )
                await txResponse_attest.wait(1)
            })

            it("Mint 100000 REC token (eg, 100000kW)", async () => {
                // * recs_p1 contract connect to new owner address
                const recs_p1_with_newOwnerAddr = await recs_p1.connect(
                    newOwner
                )

                // * 讓User去mint ERC20 token
                const txResponse = await recs_p1_with_newOwnerAddr.mintERC20()
                await txResponse.wait(1)

                // * 檢查ERC20 token的餘額有沒有100個
                const balance = await recs_p1_with_newOwnerAddr.balanceOf(
                    newOwner.address
                )
                assert.equal(balance.toString(), "100000")

                // * 檢查該user在mint ERC20 token之後，totalKw的記錄有沒有被歸零
                const totalKw = await recs_p1_with_newOwnerAddr.getTotalKw(
                    newOwner.address
                )
                assert.equal(totalKw.toString(), "0")
            })
        })
    })
})
