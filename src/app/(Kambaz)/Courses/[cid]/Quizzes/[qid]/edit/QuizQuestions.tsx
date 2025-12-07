"use client";

interface QuizQuestionsTabProps {
  questions: any[];
  onAddQuestion: () => void;
}

export default function QuizQuestions({
  questions,
  onAddQuestion
}: QuizQuestionsTabProps) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Questions ({questions.length})</h5>
        <button className="btn btn-primary" onClick={onAddQuestion}>
          <i className="bi bi-plus-lg me-2"></i>
          New Question
        </button>
      </div>

      {questions.length > 0 ? (
        <ul className="list-group">
          {questions.map((question: any, index: number) => (
            <li key={question._id || index} className="list-group-item">
              <div className="d-flex justify-content-between">
                <div>
                  <strong>{question.title || `Question ${index + 1}`}</strong>
                  <div className="text-muted small">
                    {question.type} | {question.points} pts
                  </div>
                </div>
                <div>
                  <button className="btn btn-sm btn-outline-primary me-2">
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="alert alert-info">
          No questions yet. Click &quoteNew Question&ldquo  to add questions to this quiz.
        </div>
      )}
    </div>
  );
}