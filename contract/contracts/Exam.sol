// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/// @author Aman Gupta
/// @title Exam Contract
contract Exam {
    address public creator;
    address public servicer; // account responsible for updating data on behalf of a student
    string public examData; // IPFS Hash
    uint256 public startTime; // Exam startTime
    uint256 public endTime; // Exam endTime

    struct student {
        uint id;
        string meta;
        string sheetHash;
        string sheet;
    }
    student[] public enrolledStudents;

    constructor(address _creator, address _servicer, string memory _examData, uint256 _startTime, uint256 _endTime) {
        creator = _creator;
        servicer = _servicer;
        examData = _examData;
        startTime = _startTime;
        endTime = _endTime;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "msg.sender is not the creator");
        _;
    }

    modifier restricted() {
        require(msg.sender == servicer, "msg.sender cannot call this fn");
        _;
    }

    modifier examStarted() {
        require(block.timestamp >= startTime, "Exam has not begun yet !!!");
        _;
    }

    modifier examTime() {
        require(block.timestamp >= startTime, "Exam has not begun yet !!!");
        require(block.timestamp <= endTime, "Exam has already ended !!!");
        _;
    }

    modifier beforeDeadline() {
        require(block.timestamp <= endTime, "Exam has already ended !!!");
        _;
    }

    modifier isEnrolled(uint _studentId) {
        require(enrolledStudents.length > _studentId , "Student is not enrolled");
        _;
    }

    /// @notice modify the servicer account to provide flexibility if creator wants some other acount to handle data editing
    /// @param _servicer new servicer address
    function modifyServicer(address _servicer) public onlyCreator{
        servicer = _servicer;
    }

    /// @notice edit exam details - Probably don't use this
    /// @param _examData Exam Data IPFS Hash
    /// @param _startTime Exam starting Time
    /// @param _endTime Exam Ending Time ie. Deadline for sheet hash submission
    function editExam(
        string memory _examData,
        uint256 _startTime,
        uint256 _endTime
    ) public onlyCreator beforeDeadline {
        examData = _examData;
        startTime = _startTime;
        endTime = _endTime;
    }

    /// @notice enroll a new student
    /// @param _studentMeta student details
    function enroll(string memory _studentMeta) public restricted beforeDeadline {
        student memory newEnrollment;
        newEnrollment.id = enrolledStudents.length;
        newEnrollment.meta = _studentMeta;
        enrolledStudents.push(newEnrollment);
    }

    /// @notice add sheet hash before exam deadline
    /// @param _studentId address of student
    /// @param _sheetHash Hash of answer sheet
    function addSheetHash(uint _studentId, string memory _sheetHash) public restricted isEnrolled(_studentId) examTime {
        enrolledStudents[_studentId].sheetHash = _sheetHash;
    }

    /// @notice Add the actual answer sheet
    /// @param _studentId address of student
    /// @param _sheet IPFS hash of answer sheet file
    function addSheet(uint _studentId, string memory _sheet) public restricted isEnrolled(_studentId) examStarted {
        enrolledStudents[_studentId].sheet = _sheet;
    }

    /// @notice get details of all enrolled students
    /// @return array of type struct
    function getEnrolledStudents() public view returns(student[] memory){
        return enrolledStudents;
    }
}
