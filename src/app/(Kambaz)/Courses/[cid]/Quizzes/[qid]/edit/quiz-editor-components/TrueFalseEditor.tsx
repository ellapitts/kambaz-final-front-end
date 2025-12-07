"use client";

interface TrueFalseEditorProps {
  correctAnswer: string;
  onChange: (correctAnswer: string) => void;
}

export default function TrueFalseEditor({
  correctAnswer,
  onChange
}: TrueFalseEditorProps) {
  
  const isTrue = correctAnswer === "True";
  
  return (
    <div>
      <label className="form-label fw-semibold mb-3">Correct Answer</label>
      
      <div className="d-flex gap-3">
        <div 
          className={`card p-3 flex-grow-1 cursor-pointer ${isTrue ? 'border-success border-2' : ''}`}
          onClick={() => onChange("True")}
          style={{ cursor: 'pointer' }}
        >
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="trueFalse"
              id="answerTrue"
              checked={isTrue}
              onChange={() => onChange("True")}
            />
            <label className="form-check-label fw-semibold" htmlFor="answerTrue">
              True
            </label>
          </div>
          {isTrue && (
            <div className="mt-2">
              <span className="badge bg-success">
                <i className="bi bi-check-circle me-1"></i>
                Correct Answer
              </span>
            </div>
          )}
        </div>

        <div 
          className={`card p-3 flex-grow-1 cursor-pointer ${!isTrue ? 'border-success border-2' : ''}`}
          onClick={() => onChange("False")}
          style={{ cursor: 'pointer' }}
        >
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="trueFalse"
              id="answerFalse"
              checked={!isTrue}
              onChange={() => onChange("False")}
            />
            <label className="form-check-label fw-semibold" htmlFor="answerFalse">
              False
            </label>
          </div>
          {!isTrue && (
            <div className="mt-2">
              <span className="badge bg-success">
                <i className="bi bi-check-circle me-1"></i>
                Correct Answer
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="alert alert-info mt-3 small">
        <i className="bi bi-info-circle me-2"></i>
        Select whether the statement in the question is True or False.
      </div>
    </div>
  );
}