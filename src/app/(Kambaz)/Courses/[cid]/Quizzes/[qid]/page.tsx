"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { mockQuizzes } from "../client";

export default function QuizEditor() {
  const { cid, qid } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>({
    title: "Unnamed Quiz",
    description: "",
    quizType: "Graded Quiz",
    points: 0,
    assignmentGroup: "Quizzes",
    shuffleAnswers: true,
    timeLimit: 20,
    multipleAttempts: false,
    howManyAttempts: 1,
    showCorrectAnswers: "Immediately",
    accessCode: "",
    oneQuestionAtATime: true,
    webcamRequired: false,
    lockQuestionsAfterAnswering: false,
    dueDate: "",
    availableDate: "",
    untilDate: "",
    published: false,
    questions: [],
  });

  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (qid && qid !== "new") {
      // Load existing quiz
      const existingQuiz = mockQuizzes.find(q => q._id === qid);
      if (existingQuiz) {
        setQuiz(existingQuiz);
      }
    }
  }, [qid]);

  const handleSave = () => {
    // Calculate total points from questions
    const totalPoints = quiz.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    const updatedQuiz = { ...quiz, points: totalPoints };
    
    console.log("Saving quiz:", updatedQuiz);
    alert("Quiz saved successfully!");
  };

  const handleSaveAndPublish = () => {
    const totalPoints = quiz.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    const updatedQuiz = { ...quiz, points: totalPoints, published: true };
    
    console.log("Saving and publishing quiz:", updatedQuiz);
    alert("Quiz saved and published!");
    router.push(`/Dashboard/Courses/${cid}/Quizzes`);
  };

  const handleCancel = () => {
    router.push(`/Dashboard/Courses/${cid}/Quizzes`);
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href={`/Dashboard/Courses/${cid}/Quizzes`}>Quizzes</a>
              </li>
              <li className="breadcrumb-item active">
                {qid === "new" ? "New Quiz" : quiz.title}
              </li>
            </ol>
          </nav>
          <h3 className="mt-2">{qid === "new" ? "New Quiz" : "Edit Quiz"}</h3>
        </div>
        <div>
          <button className="btn btn-secondary me-2" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn btn-outline-secondary me-2" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-danger" onClick={handleSaveAndPublish}>
            Save & Publish
          </button>
        </div>
      </div>

      {/* Points Display */}
      <div className="alert alert-secondary">
        <strong>Points:</strong> {quiz.points || 0}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "questions" ? "active" : ""}`}
            onClick={() => setActiveTab("questions")}
          >
            Questions
          </button>
        </li>
      </ul>

      {/* Details Tab */}
      {activeTab === "details" && (
        <DetailsTab quiz={quiz} setQuiz={setQuiz} />
      )}

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <QuestionsTab quiz={quiz} setQuiz={setQuiz} />
      )}
    </div>
  );
}

// Details Tab Component
function DetailsTab({ quiz, setQuiz }: any) {
  return (
    <div className="card p-4">
      <div className="mb-3">
        <label className="form-label fw-bold">Title</label>
        <input
          type="text"
          className="form-control"
          value={quiz.title}
          onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Quiz Instructions:</label>
        <textarea
          className="form-control"
          rows={4}
          value={quiz.description}
          onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
          placeholder="Enter instructions for students..."
        />
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label fw-bold">Quiz Type</label>
          <select
            className="form-select"
            value={quiz.quizType}
            onChange={(e) => setQuiz({ ...quiz, quizType: e.target.value })}
          >
            <option>Graded Quiz</option>
            <option>Practice Quiz</option>
            <option>Graded Survey</option>
            <option>Ungraded Survey</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold">Assignment Group</label>
          <select
            className="form-select"
            value={quiz.assignmentGroup}
            onChange={(e) => setQuiz({ ...quiz, assignmentGroup: e.target.value })}
          >
            <option>Quizzes</option>
            <option>Exams</option>
            <option>Assignments</option>
            <option>Project</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <h5>Options</h5>
        <div className="card p-3">
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="shuffleAnswers"
              checked={quiz.shuffleAnswers}
              onChange={(e) => setQuiz({ ...quiz, shuffleAnswers: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="shuffleAnswers">
              Shuffle Answers
            </label>
          </div>

          <div className="mb-3">
            <label className="form-label">Time Limit (minutes)</label>
            <input
              type="number"
              className="form-control"
              style={{ maxWidth: "150px" }}
              value={quiz.timeLimit}
              onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="multipleAttempts"
              checked={quiz.multipleAttempts}
              onChange={(e) => setQuiz({ ...quiz, multipleAttempts: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="multipleAttempts">
              Allow Multiple Attempts
            </label>
          </div>

          {quiz.multipleAttempts && (
            <div className="mb-3 ms-4">
              <label className="form-label">How Many Attempts</label>
              <input
                type="number"
                className="form-control"
                style={{ maxWidth: "150px" }}
                value={quiz.howManyAttempts}
                onChange={(e) => setQuiz({ ...quiz, howManyAttempts: parseInt(e.target.value) || 1 })}
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Show Correct Answers</label>
            <select
              className="form-select"
              value={quiz.showCorrectAnswers}
              onChange={(e) => setQuiz({ ...quiz, showCorrectAnswers: e.target.value })}
            >
              <option>Immediately</option>
              <option>After due date</option>
              <option>Never</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Access Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="Optional access code"
              value={quiz.accessCode}
              onChange={(e) => setQuiz({ ...quiz, accessCode: e.target.value })}
            />
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="oneQuestionAtATime"
              checked={quiz.oneQuestionAtATime}
              onChange={(e) => setQuiz({ ...quiz, oneQuestionAtATime: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="oneQuestionAtATime">
              One Question at a Time
            </label>
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="webcamRequired"
              checked={quiz.webcamRequired}
              onChange={(e) => setQuiz({ ...quiz, webcamRequired: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="webcamRequired">
              Webcam Required
            </label>
          </div>

          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="lockQuestions"
              checked={quiz.lockQuestionsAfterAnswering}
              onChange={(e) => setQuiz({ ...quiz, lockQuestionsAfterAnswering: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="lockQuestions">
              Lock Questions After Answering
            </label>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <h5>Assign</h5>
        <div className="card p-3">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">Due</label>
              <input
                type="datetime-local"
                className="form-control"
                value={quiz.dueDate}
                onChange={(e) => setQuiz({ ...quiz, dueDate: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold">Available from</label>
              <input
                type="datetime-local"
                className="form-control"
                value={quiz.availableDate}
                onChange={(e) => setQuiz({ ...quiz, availableDate: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold">Until</label>
              <input
                type="datetime-local"
                className="form-control"
                value={quiz.untilDate}
                onChange={(e) => setQuiz({ ...quiz, untilDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Questions Tab Component
function QuestionsTab({ quiz, setQuiz }: any) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addQuestion = (type: string) => {
    const newQuestion = {
      _id: `q${Date.now()}`,
      type: type,
      title: `Question ${quiz.questions.length + 1}`,
      points: 1,
      question: "",
      choices: type === "multiple-choice" ? ["", "", "", ""] : type === "true-false" ? ["True", "False"] : [],
      correctAnswers: [],
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
    setEditingIndex(quiz.questions.length);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...quiz.questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuiz({ ...quiz, questions: updated });
  };

  const deleteQuestion = (index: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      const updated = quiz.questions.filter((_: any, i: number) => i !== index);
      setQuiz({ ...quiz, questions: updated });
      setEditingIndex(null);
    }
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updated = [...quiz.questions];
    updated[questionIndex].choices[choiceIndex] = value;
    setQuiz({ ...quiz, questions: updated });
  };

  const addChoice = (questionIndex: number) => {
    const updated = [...quiz.questions];
    updated[questionIndex].choices.push("");
    setQuiz({ ...quiz, questions: updated });
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    const updated = [...quiz.questions];
    updated[questionIndex].choices.splice(choiceIndex, 1);
    setQuiz({ ...quiz, questions: updated });
  };

  return (
    <div>
      {/* Add Question Dropdown */}
      <div className="dropdown mb-4">
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
        >
          <i className="bi bi-plus-lg"></i> New Question
        </button>
        <ul className="dropdown-menu">
          <li>
            <button className="dropdown-item" onClick={() => addQuestion("multiple-choice")}>
              <i className="bi bi-list-ul me-2"></i>
              Multiple Choice
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={() => addQuestion("true-false")}>
              <i className="bi bi-check2-square me-2"></i>
              True/False
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={() => addQuestion("fill-in-blank")}>
              <i className="bi bi-text-paragraph me-2"></i>
              Fill in the Blank
            </button>
          </li>
        </ul>
      </div>

      {/* Questions List */}
      {quiz.questions.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No questions yet. Click &quot;New Question&quot; to add one.
        </div>
      ) : (
        quiz.questions.map((q: any, index: number) => (
          <div key={q._id} className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <strong>{q.title}</strong>
                <span className="badge bg-secondary ms-2">{q.type}</span>
                <span className="ms-3 text-muted">{q.points} pts</span>
              </div>
              <div>
                <button
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                >
                  <i className="bi bi-pencil"></i> {editingIndex === index ? "Close" : "Edit"}
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteQuestion(index)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <div className="card-body">
              {editingIndex === index ? (
                <QuestionEditor
                  question={q}
                  index={index}
                  updateQuestion={updateQuestion}
                  updateChoice={updateChoice}
                  addChoice={addChoice}
                  removeChoice={removeChoice}
                  onSave={() => setEditingIndex(null)}
                />
              ) : (
                <div>
                  <p className="mb-1"><strong>Question:</strong> {q.question || <em className="text-muted">No question text</em>}</p>
                  {q.choices.length > 0 && (
                    <div className="mt-2">
                      <strong>Choices:</strong>
                      <ul className="mb-0">
                        {q.choices.map((choice: string, i: number) => (
                          <li key={i}>
                            {choice || <em className="text-muted">(empty)</em>}
                            {q.correctAnswers.includes(choice) && <span className="badge bg-success ms-2">Correct</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Question Editor Component
function QuestionEditor({ question, index, updateQuestion, updateChoice, addChoice, removeChoice, onSave }: any) {
  return (
    <div>
      <div className="mb-3">
        <label className="form-label fw-bold">Question Title</label>
        <input
          type="text"
          className="form-control"
          value={question.title}
          onChange={(e) => updateQuestion(index, "title", e.target.value)}
        />
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label fw-bold">Question Type</label>
          <select
            className="form-select"
            value={question.type}
            onChange={(e) => updateQuestion(index, "type", e.target.value)}
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="fill-in-blank">Fill in the Blank</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold">Points</label>
          <input
            type="number"
            className="form-control"
            value={question.points}
            onChange={(e) => updateQuestion(index, "points", parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Question Text</label>
        <textarea
          className="form-control"
          rows={3}
          value={question.question}
          onChange={(e) => updateQuestion(index, "question", e.target.value)}
          placeholder="Enter your question here..."
        />
      </div>

      {/* Multiple Choice Options */}
      {question.type === "multiple-choice" && (
        <div className="mb-3">
          <label className="form-label fw-bold">Answer Choices</label>
          <p className="text-muted small">Select the correct answer by clicking the radio button</p>
          {question.choices.map((choice: string, choiceIndex: number) => (
            <div key={choiceIndex} className="input-group mb-2">
              <span className="input-group-text">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={question.correctAnswers.includes(choice)}
                  onChange={() => updateQuestion(index, "correctAnswers", [choice])}
                />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder={`Choice ${choiceIndex + 1}`}
                value={choice}
                onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
              />
              {question.choices.length > 2 && (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => removeChoice(index, choiceIndex)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          ))}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => addChoice(index)}
          >
            <i className="bi bi-plus-lg"></i> Add Choice
          </button>
        </div>
      )}

      {/* True/False Options */}
      {question.type === "true-false" && (
        <div className="mb-3">
          <label className="form-label fw-bold">Correct Answer</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name={`tf-${index}`}
              id={`true-${index}`}
              checked={question.correctAnswers.includes("True")}
              onChange={() => updateQuestion(index, "correctAnswers", ["True"])}
            />
            <label className="form-check-label" htmlFor={`true-${index}`}>
              True
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name={`tf-${index}`}
              id={`false-${index}`}
              checked={question.correctAnswers.includes("False")}
              onChange={() => updateQuestion(index, "correctAnswers", ["False"])}
            />
            <label className="form-check-label" htmlFor={`false-${index}`}>
              False
            </label>
          </div>
        </div>
      )}

      {/* Fill in the Blank Options */}
      {question.type === "fill-in-blank" && (
        <div className="mb-3">
          <label className="form-label fw-bold">Possible Correct Answers</label>
          <p className="text-muted small">Enter all acceptable answers (case insensitive)</p>
          {(question.correctAnswers.length === 0 ? [""] : question.correctAnswers).map((answer: string, answerIndex: number) => (
            <div key={answerIndex} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder={`Answer ${answerIndex + 1}`}
                value={answer}
                onChange={(e) => {
                  const newAnswers = [...question.correctAnswers];
                  newAnswers[answerIndex] = e.target.value;
                  updateQuestion(index, "correctAnswers", newAnswers);
                }}
              />
              {question.correctAnswers.length > 1 && (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => {
                    const newAnswers = question.correctAnswers.filter((_: any, i: number) => i !== answerIndex);
                    updateQuestion(index, "correctAnswers", newAnswers);
                  }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          ))}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              updateQuestion(index, "correctAnswers", [...question.correctAnswers, ""]);
            }}
          >
            <i className="bi bi-plus-lg"></i> Add Answer
          </button>
        </div>
      )}

      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-primary" onClick={onSave}>
          <i className="bi bi-check-lg"></i> Update Question
        </button>
        <button className="btn btn-secondary" onClick={onSave}>
          Cancel
        </button>
      </div>
    </div>
  );
}