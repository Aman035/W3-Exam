// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import './Exam.sol';

/// @author Aman Gupta
/// @title Exam Factory Contract
contract ExamFactory {

    address public owner;
    Exam [] public deployedExams;

    constructor() {
        owner = msg.sender;    
    }

    modifier onlyOwner {
      require(msg.sender == owner , "msg.sender is not the owner");
      _;
    }  

    /// @notice Deploys a new exam contract
    function createExam() public {
        Exam newExam = new Exam(msg.sender , owner);
        deployedExams.push(newExam);
    }
    
    /// @notice get all deployed exam contract 
    /// @return exam address type array
    function getDeplyedExams()public view returns(Exam[] memory){
        return  deployedExams;
    }

    /// @notice Contract destructor
    function destroy() public onlyOwner{
        selfdestruct(payable(owner));
    }
}