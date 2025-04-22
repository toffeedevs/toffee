import React, { useState } from "react";
import TextUpload from "../components/TextUpload";
import QuestionRenderer from "../components/QuestionRenderer";
import Stats from "../components/Stats";

export default function Dashboard() {
  const [questions, setQuestions] = useState([]);

  return (
    <div className="p-6">
      <TextUpload setQuestions={setQuestions} />
      {questions.length > 0 && <QuestionRenderer questions={questions} />}
      <Stats />
    </div>
  );
}
