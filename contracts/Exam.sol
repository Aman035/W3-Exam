// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/// @author Aman Gupta
/// @title Exam Contract
contract Exam {
    address public creator;
    /// servicer account is responsible for updating data on behalf of a student
    address public servicer;
    string public questionPaper;
    string public passCode;
    string public remark;
    uint256 public deadline;

    struct enrolled {
        string name;
        uint256 submissionTime;
        string sheetHash;
        string sheet;
    }
    enrolled[] public enrolledStudents;
    mapping(address => uint) public enrollmentId;

    constructor(address _creator, address _servicer) {
        creator = _creator;
        servicer = _servicer;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "msg.sender is not the creator");
        _;
    }

    modifier restricted() {
        require(msg.sender == servicer, "msg.sender cannot call this fn");
        _;
    }

    modifier beforeDeadline() {
        require(block.timestamp <= deadline, "Time Limit Exceeded !!!");
        _;
    }

    modifier isEnrolled(address _student) {
        require(enrollmentId[_student] > 0 , "This address is not enrolled");
        _;
    }

    /// @notice modify the servicer account to provide flexibility if creator wants some other acount to handle data editing
    /// @param _servicer new servicer address
    function modifyServicer(address _servicer) public onlyCreator{
        servicer = _servicer;
    }

    /// @notice edit exam details
    /// @param _questionPaper IPFS hash of file
    /// @param _passCode Encrypted Pass Code for accessing question file
    /// @param _remark IPFS hash of any remark / details of exam
    /// @param _deadline Deadline of sheet hash submission
    function editExam(
        string memory _questionPaper,
        string memory _passCode,
        string memory _remark,
        uint256 _deadline
    ) public onlyCreator {
        questionPaper = _questionPaper;
        passCode = _passCode;
        remark = _remark;
        deadline = _deadline;
    }

    /// @notice enroll a new student
    /// @param _student address of student
    /// @param _name name of student
    function enroll(address _student, string memory _name) public restricted beforeDeadline {
        enrolled memory newEnrollment;
        newEnrollment.name = _name;
        enrolledStudents.push(newEnrollment);
        enrollmentId[_student] = enrolledStudents.length;
    }

    /// @notice add sheet hash before exam deadline
    /// @param _student address of student
    /// @param _sheetHash Hash of answer sheet
    function addSheetHash(address _student, string memory _sheetHash) public restricted isEnrolled(_student) beforeDeadline {
        uint id = enrollmentId[_student];
        enrolledStudents[id-1].sheetHash = _sheetHash;
    }

    /// @notice Add the actual answer sheet
    /// @param _student address of student
    /// @param _sheet IPFS hash of answer sheet file
    function addSheet(address _student, string memory _sheet) public restricted isEnrolled(_student){
        uint id = enrollmentId[_student];
        enrolledStudents[id-1].sheet = _sheet;
    }

    /// @notice get details of all enrolled students
    /// @return array of type struct
    function getEnrolledStudents() public view returns(enrolled [] memory){
        return enrolledStudents;
    }

    /// @notice Contract destructor
    function destroy() public onlyCreator {
        selfdestruct(payable(creator));
    }
}
