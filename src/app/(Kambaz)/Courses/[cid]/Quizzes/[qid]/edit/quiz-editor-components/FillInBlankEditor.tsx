"use client";

interface FillBlankEditorProps {
  correctAnswers: string[];
  onChange: (correctAnswers: string[]) => void;
}

export default function FillBlankEditor({
  correctAnswers,
  onChange
}: FillBlankEditorProps) {

  const addAnswer = () => {
    onChange([...correctAnswers, ""]);
  };

  const removeAnswer = (index: number) => {
    if (correctAnswers.length <= 1) {
      alert("You must have at least 1 possible answer");
      return;
    }
    onChange(correctAnswers.filter((_, i) => i !== index));
  };

  const updateAnswer = (index: number, value: string) => {
    const updated = correctAnswers.map((answer, i) => 
      i === index ? value : answer
    );
    onChange(updated);
  };

  return (
    <div>
      <label className="form-label fw-semibold mb-3">Possible Correct Answers</label>
      
      <div className="mb-3">
        {correctAnswers.map((answer, index) => (
          <div key={index} className="mb-2 d-flex gap-2 align-items-center">
            <input
              type="text"
              className="form-control"
              value={answer}
              onChange={(e) => updateAnswer(index, e.target.value)}
              placeholder={`Possible answer ${index + 1}`}
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => removeAnswer(index)}
              disabled={correctAnswers.length <= 1}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-sm btn-outline-primary mb-3"
        onClick={addAnswer}
      >
        <i className="bi bi-plus-lg me-1"></i>
        Add Another Answer
      </button>

      <div className="alert alert-info small">
        <i className="bi bi-info-circle me-2"></i>
        Students can provide any of these answers. Add multiple variations to accept different correct responses.
        <div className="mt-2">
          <strong>Note:</strong> Your backend handles case-insensitive matching automatically.
        </div>
      </div>
    </div>
  );
}