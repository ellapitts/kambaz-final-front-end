"use client";

import { useState, useEffect } from "react";
import MultipleChoiceEditor from "./MultiChoiceEditor";
import TrueFalseEditor from "./TrueFalseEditor";
import FillBlankEditor from "./FillInBlankEditor";

interface QuestionEditorProps {
  question: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: any) => void;
}

export default function QuestionEditor({
  question,
  isOpen,
  onClose,
  onSave
}: QuestionEditorProps) {
  
  const [formData, setFormData] = useState<any>({
    title: "",
    type: "MULTIPLE_CHOICE",
    points: 1,
    question: "",
    choices: ["", ""],
    correctAnswers: []
  });

  // Load question data when editing
  useEffect(() => {
    if (question) {
      setFormData(question);
    } else {
      // Reset to defaults for new question
      setFormData({
        title: "",
        type: "MULTIPLE_CHOICE",
        points: 1,
        question: "",
        choices: ["", ""],
        correctAnswers: []
      });
    }
  }, [question, isOpen]);

  const handleTypeChange = (newType: string) => {
    // Reset type-specific fields when changing type
    const baseData = {
      title: formData.title,
      type: newType,
      points: formData.points,
      question: formData.question
    };

    switch(newType) {
      case 'MULTIPLE_CHOICE':
        setFormData({
          ...baseData,
          choices: ["", ""],
          correctAnswers: []
        });
        break;
      case 'TRUE_FALSE':
        setFormData({
          ...baseData,
          choices: ["True", "False"],
          correctAnswers: ["True"]
        });
        break;
      case 'FILL_IN_BLANK':
        setFormData({
          ...baseData,
          choices: [],
          correctAnswers: [""]
        });
        break;
    }
  };

  const handleSave = () => {
    // Validation
    if (!formData.title.trim()) {
      alert("Please enter a question title");
      return;
    }
    if (!formData.question.trim()) {
      alert("Please enter the question text");
      return;
    }
    if (formData.points <= 0) {
      alert("Points must be greater than 0");
      return;
    }

    // Type-specific validation
    if (formData.type === 'MULTIPLE_CHOICE') {
      const allFilled = formData.choices?.every((c: string) => c.trim());
      if (!allFilled || formData.choices.length < 2) {
        alert("Please provide at least 2 answer choices");
        return;
      }
      if (!formData.correctAnswers || formData.correctAnswers.length === 0) {
        alert("Please select at least one correct answer");
        return;
      }
    }

    if (formData.type === 'FILL_IN_BLANK') {
      const allFilled = formData.correctAnswers?.every((a: string) => a.trim());
      if (!allFilled || formData.correctAnswers?.length === 0) {
        alert("Please provide at least one possible answer");
        return;
      }
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {question ? 'Edit Question' : 'New Question'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Question Title */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Question Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Question 1"
              />
            </div>

            {/* Question Type & Points */}
            <div className="row mb-3">
              <div className="col-md-8">
                <label className="form-label fw-semibold">Question Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="FILL_IN_BLANK">Fill in the Blank</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Points</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) || 0 })}
                  min="1"
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Question</label>
              <textarea
                className="form-control"
                rows={3}
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter your question here..."
              />
              <div className="form-text small">
                This is the main question text students will see.
              </div>
            </div>

            <hr />

            {/* Type-specific editors */}
            {formData.type === 'MULTIPLE_CHOICE' && (
              <MultipleChoiceEditor
                choices={formData.choices || []}
                correctAnswers={formData.correctAnswers || []}
                onChange={(choices, correctAnswers) => 
                  setFormData({ ...formData, choices, correctAnswers })
                }
              />
            )}

            {formData.type === 'TRUE_FALSE' && (
              <TrueFalseEditor
                correctAnswer={formData.correctAnswers?.[0] || "True"}
                onChange={(answer) => 
                  setFormData({ 
                    ...formData, 
                    choices: ["True", "False"],
                    correctAnswers: [answer] 
                  })
                }
              />
            )}

            {formData.type === 'FILL_IN_BLANK' && (
              <FillBlankEditor
                correctAnswers={formData.correctAnswers || []}
                onChange={(correctAnswers) => 
                  setFormData({ ...formData, choices: [], correctAnswers })
                }
              />
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              {question ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}