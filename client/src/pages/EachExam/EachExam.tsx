import React from "react";
import { useParams } from "react-router-dom";
import "./EachExam.scss";

function EachExam() {
  const { examId } = useParams();

  return (
    <div>
      <h2>Exam ID: {examId}</h2>
      {/* render the details of the exam */}
    </div>
  );
}

export default EachExam;
