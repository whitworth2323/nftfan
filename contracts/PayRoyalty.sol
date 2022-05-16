// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract TransferringContract {
    uint public amount;

    constructor() {
        amount = 10;
    }

    function transferToAddress(address _address, uint256 _amount) public payable {
        payable(_address).transfer(_amount);
    }

    function transferToCaller(uint256 _amount) public payable {
        payable(msg.sender).transfer(_amount);
    }

}