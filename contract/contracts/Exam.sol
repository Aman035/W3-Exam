// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/// @author Aman Gupta
/// @title Exam Contract
contract Exam {
    address public creator; // exam creator
    address public servicer; // account responsible for updating data on behalf of a student
    string public examData; // IPFS Hash
    uint256 public startTime; // Exam startTime
    uint256 public endTime; // Exam endTime

    struct student {
        address wallet; // wallet address
        string meta; // other meta details
        string sheetHash; // sha256 Hash of sheet
        string sheet; // ipfs hash of actual sheet
    }
    student[] public enrolledStudents;
    mapping(address => bool) public isEnrolled;
    mapping(address => uint) public studentId;

    constructor(
        address _creator,
        address _servicer,
        string memory _examData,
        uint256 _startTime,
        uint256 _endTime
    ) {
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

    modifier afterDeadline() {
        require(block.timestamp >= endTime, "Exam has not ended yet!");
        _;
    }

    modifier onlyEnrolled() {
        require(isEnrolled[msg.sender], "You are not enrolled in this exam!");
        _;
    }

    modifier onlyNotEnrolled() {
        require(
            !isEnrolled[msg.sender],
            "You are already enrolled in this exam!"
        );
        _;
    }

    /// @notice modify the servicer account to provide flexibility if creator wants some other acount to handle data editing
    /// @param _servicer new servicer address
    function modifyServicer(address _servicer) public onlyCreator {
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
    function enroll(
        string memory _studentMeta
    ) public beforeDeadline onlyNotEnrolled {
        student memory newEnrollment;
        newEnrollment.wallet = msg.sender;
        newEnrollment.meta = _studentMeta;

        isEnrolled[msg.sender] = true;
        studentId[msg.sender] = enrolledStudents.length;

        enrolledStudents.push(newEnrollment);
    }

    /// @notice add sheet hash before exam deadline - Done By Servicer
    /// @param _wallet address of student
    /// @param _sheetHash Hash of answer sheet
    function addSheetHash(
        address _wallet,
        string memory _sheetHash
    ) public restricted examTime {
        require(isEnrolled[_wallet], "Student not enrolled in this exam!");

        uint id = studentId[_wallet];
        enrolledStudents[id].sheetHash = _sheetHash;
    }

    /// @notice Add the actual answer sheet
    /// @param _sheet IPFS hash of answer sheet file
    function addSheet(string memory _sheet) public onlyEnrolled afterDeadline {
        uint id = studentId[msg.sender];
        enrolledStudents[id].sheet = _sheet;
    }

    /// @notice get details of all enrolled students
    /// @return array of type struct
    function getEnrolledStudents() public view returns (student[] memory) {
        return enrolledStudents;
    }
}
