"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as client from "@/app/client";

export default function QuizTake() {
  const { cid, qid } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (qid) {
      client.findQuizById(qid as string).then(setQuiz);
    }
  }, [qid]);

  if (!quiz) return <div>Loading...</div>;

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    // In a real app, this would submit to the backend
    alert("Quiz submitted!");
    router.push(`/Dashboard/Courses/${cid}/Quizzes`);
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>{quiz.title}</h3>
        <div>
          <span className="me-3">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">{currentQuestion.title}</h5>
          <small className="text-muted">{currentQuestion.points} pts</small>
        </div>
        <div className="card-body">
          <p className="card-text" dangerouslySetInnerHTML={{ __html: currentQuestion.question }}></p>
          
          {currentQuestion.type === "multiple-choice" && (
            <div className="list-group">
              {currentQuestion.choices.map((choice: string, index: number) => (
                <label key={index} className="list-group-item">
                  <input
                    className="form-check-input me-2"
                    type="radio"
                    name={currentQuestion._id}
                    checked={answers[currentQuestion._id] === choice}
                    onChange={() => handleAnswerChange(currentQuestion._id, choice)}
                  />
                  {choice}
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === "true-false" && (
            <div className="list-group">
              {["true", "false"].map((option) => (
                <label key={option} className="list-group-item">
                  <input
                    className="form-check-input me-2"
                    type="radio"
                    name={currentQuestion._id}
                    checked={answers[currentQuestion._id] === option}
                    onChange={() => handleAnswerChange(currentQuestion._id, option)}
                  />
                  {option === "true" ? "True" : "False"}
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === "fill-in-blank" && (
            <input
              type="text"
              className="form-control"
              value={answers[currentQuestion._id] || ""}
              onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <button
          className="btn btn-secondary"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
        >
          Previous
        </button>
        
        {isLastQuestion ? (
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Quiz
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
