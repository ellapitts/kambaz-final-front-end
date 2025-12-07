"use client";

interface MultipleChoiceEditorProps {
  choices: string[];
  correctAnswers: string[];
  onChange: (choices: string[], correctAnswers: string[]) => void;
}

export default function MultipleChoiceEditor({
  choices,
  correctAnswers,
  onChange
}: MultipleChoiceEditorProps) {

  const addChoice = () => {
    onChange([...choices, ""], correctAnswers);
  };

  const removeChoice = (index: number) => {
    if (choices.length <= 2) {
      alert("You must have at least 2 answer choices");
      return;
    }
    
    const removedChoice = choices[index];
    const newChoices = choices.filter((_, i) => i !== index);
    
    // Remove from correctAnswers if it was selected
    const newCorrectAnswers = correctAnswers.filter(a => a !== removedChoice);
    
    onChange(newChoices, newCorrectAnswers);
  };

  const updateChoice = (index: number, value: string) => {
    const oldValue = choices[index];
    const newChoices = choices.map((choice, i) => 
      i === index ? value : choice
    );
    
    // Update correctAnswers if this choice was selected
    const newCorrectAnswers = correctAnswers.map(answer => 
      answer === oldValue ? value : answer
    );
    
    onChange(newChoices, newCorrectAnswers);
  };

  const toggleCorrect = (choiceValue: string) => {
    const isCurrentlyCorrect = correctAnswers.includes(choiceValue);
    
    if (isCurrentlyCorrect) {
      // Remove from correct answers
      const newCorrectAnswers = correctAnswers.filter(a => a !== choiceValue);
      onChange(choices, newCorrectAnswers);
    } else {
      // Add to correct answers
      onChange(choices, [...correctAnswers, choiceValue]);
    }
  };

  return (
    <div>
      <label className="form-label fw-semibold mb-3">Answer Choices</label>
      
      <div className="mb-3">
        {choices.map((choice, index) => {
          const isCorrect = correctAnswers.includes(choice);
          
          return (
            <div key={index} className="mb-3 p-3 border rounded bg-light">
              <div className="d-flex align-items-start gap-3">
                {/* Checkbox to mark correct */}
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`choice-${index}`}
                    checked={isCorrect}
                    onChange={() => toggleCorrect(choice)}
                  />
                  <label className="form-check-label small text-muted" htmlFor={`choice-${index}`}>
                    Correct
                  </label>
                </div>

                {/* Choice text */}
                <div className="flex-grow-1">
                  <textarea
                    className="form-control"
                    rows={2}
                    value={choice}
                    onChange={(e) => updateChoice(index, e.target.value)}
                    placeholder={`Answer choice ${index + 1}`}
                  />
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeChoice(index)}
                  disabled={choices.length <= 2}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>

              {isCorrect && (
                <div className="mt-2">
                  <span className="badge bg-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Correct Answer
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={addChoice}
      >
        <i className="bi bi-plus-lg me-1"></i>
        Add Another Answer
      </button>

      <div className="alert alert-info mt-3 small">
        <i className="bi bi-info-circle me-2"></i>
        Check the box next to each correct answer. You can select multiple correct answers.
      </div>
    </div>
  );
}