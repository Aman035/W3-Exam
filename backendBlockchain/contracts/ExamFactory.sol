// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import './Exam.sol';

/// @author Aman Gupta
/// @title Exam Factory Contract
contract ExamFactory {

    address payable public owner;
    Exam [] public deployedExams;
    uint256 public examFee;

    constructor() {
        owner = payable(msg.sender); 
        examFee =  5000000000000000; //0.005
    }

    function changeFee(uint256 _examFee) public {
        require(msg.sender == owner, "Not Authorized");
        examFee = _examFee;
    }

    /// @notice Deploys a new exam contract
    function createExam(string memory _questionPaper, string memory _passCode, string memory _remark, uint256 _startTime, uint256 _endTime) public payable{
        require(msg.value >= examFee, "Insufficient Amount");
        payable(owner).transfer(msg.value);
        Exam newExam = new Exam(msg.sender , owner, _questionPaper, _passCode, _remark, _startTime, _endTime);
        deployedExams.push(newExam);
    }
    
    /// @notice get all deployed exam contract 
    /// @return exam address type array
    function getDeplyedExams()public view returns(Exam[] memory){
        return  deployedExams;
    }
}