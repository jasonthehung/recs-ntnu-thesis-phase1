// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error Error__ZeroKW();
error Error__InvalidDevice();

contract RECs_P1 is Ownable, ERC20, ReentrancyGuard {
    // @ enum 是否為白名單
    enum Whitelist {
        Invalid,
        Valid
    }

    // @ Struct
    struct OwnerRecord {
        // * total amount of kW (able to mint ERC20)
        uint256 totalkW;
        // * device mapping to kW it produced
        mapping(address => uint256) devProduction;
        // * total number of devices' address
        address[] devArray;
    }

    // @ Mapping 裝置白名單
    mapping(address => Whitelist) public devWhitelist;

    // @ Mapping 裝置持有人
    mapping(address => address) public devToOwner;

    // @ Mapping
    mapping(address => OwnerRecord) private ownerTable;

    // @ Constructor
    constructor() ERC20("NTNU RECs", "REC") {
        _mint(msg.sender, 100);
    }

    // @ 檢查device是不是合法
    modifier onlyValidDev() {
        if (devWhitelist[msg.sender] == Whitelist.Invalid) {
            revert Error__InvalidDevice();
        }
        _;
    }

    // @ 檢查user是否可以mint REC token
    modifier onlyAvailableAmt() {
        if (ownerTable[msg.sender].totalkW == 0) {
            revert Error__ZeroKW();
        }
        _;
    }

    // @ Mint ERC20 (產生綠能憑證Token)
    function mintERC20() public nonReentrant {
        if (ownerTable[msg.sender].totalkW == 0) {
            revert Error__ZeroKW();
        }

        // * 取得總額
        uint256 amount = ownerTable[msg.sender].totalkW;

        // * 歸零總額kW
        ownerTable[msg.sender].totalkW = 0;

        // * 鑄造REC token
        _mint(msg.sender, amount);
    }

    // @ 裝置存證 (msg.sender = device's address)
    function attest(uint256 kW) public onlyValidDev nonReentrant {
        // * 查詢出裝置的持有人address
        address ownerAddr = devToOwner[msg.sender];

        // * 更新特定裝置產生的kW
        ownerTable[ownerAddr].devProduction[msg.sender] += kW;

        // * 更新持有人總共擁有的kW
        ownerTable[ownerAddr].totalkW += kW;
    }

    // @ 新增裝置到某特定的user
    function setNewDevice(
        address ownerAddr,
        address deviceAddr
    ) public onlyOwner {
        // * 裝置address對應到持有人address
        devToOwner[deviceAddr] = ownerAddr;

        // * 把裝置歸戶
        ownerTable[ownerAddr].devArray.push(deviceAddr);

        // * 設定該裝置為白名單之一
        setWhitelist(deviceAddr);
    }

    // @ 取得devArray
    function getDevArrayInTable(
        address ownerAddr
    ) public view returns (address[] memory) {
        // * 回傳特定owner的整個devArray
        return ownerTable[ownerAddr].devArray;
    }

    // @取得devProduction kW
    function getDevProduction(
        address owner,
        address deviceAddr
    ) public view returns (uint256 kW) {
        return ownerTable[owner].devProduction[deviceAddr];
    }

    // @ 取得ownerTablw的totalkW
    function getTotalKw(address owner) public view returns (uint256) {
        return ownerTable[owner].totalkW;
    }

    // @ 設定白名單
    function setWhitelist(address deviceAddr) internal {
        devWhitelist[deviceAddr] = Whitelist.Valid;
    }
}
