"use client";

/**
 * ============================================================================
 * TAKE QUIZ PAGE - STUDENT QUIZ ATTEMPT
 * ============================================================================
 * 
 * @description
 * Allows students to take a quiz and submit their answers.
 * Unlike preview mode, this creates an attempt record in the database
 * and saves all answers for grading.
 * 
 * @features
 * - Start a new quiz attempt
 * - Answer all questions
 * - Auto-save answers (optional)
 * - Submit for grading
 * - View results after submission
 * - Enforce attempt limits
 * - Enforce time limits
 * - Require access code if configured
 * 
 * @workflow
 * 1. Check if quiz is available (published, dates)
 * 2. Check access code if required
 * 3. Check attempt limits (multipleAttempts, howManyAttempts)
 * 4. Start quiz attempt (POST to backend)
 * 5. Display questions and collect answers
 * 6. Submit attempt (POST to backend for grading)
 * 7. Display results
 * 
 * @displays
 * Before Starting:
 * - Quiz instructions
 * - Start Quiz button
 * - Access code input (if required)
 * - Attempt count warning (if applicable)
 * 
 * During Quiz:
 * - Timer (if time limit set)
 * - All questions with inputs
 * - Save Draft button (optional)
 * - Submit button
 * 
 * After Submission:
 * - Final score and percentage
 * - Correct/incorrect per question
 * - Points earned
 * - Option to view all attempts
 * 
 * @restrictions
 * - Students only (faculty should use Preview)
 * - Quiz must be published
 * - Within available date range
 * - Respects attempt limits
 * - Access code required if set
 * 
 * @backend
 * - POST /api/courses/:cid/quizzes/:qid/attempts - Start attempt
 * - PUT /api/courses/:cid/quizzes/:qid/attempts/:attemptId - Save answers
 * - POST /api/courses/:cid/quizzes/:qid/attempts/:attemptId/submit - Submit
 * - GET /api/courses/:cid/quizzes/:qid/attempts/latest - Get latest attempt
 * 
 * ============================================================================
 */

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import * as client from "../../../../client";
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";

export default function TakeQuiz() {
  // ============================================================================
  // STATE & ROUTE PARAMETERS
  // ============================================================================
  
  const { cid, qid } = useParams();
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.accountReducer);
  
  // Quiz data
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);
  
  // Answer tracking
  const [answers, setAnswers] = useState<any>({});
  
  // Submission state
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Access code
  const [accessCode, setAccessCode] = useState("");
  const [accessCodeVerified, setAccessCodeVerified] = useState(false);
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const isStudent = currentUser?.role === "STUDENT";

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  /**
   * Fetches quiz data and checks for existing attempts
   * Runs on component mount
   */
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await client.findQuizById(cid as string, qid as string);
        setQuiz(data);
        
        // Update browser tab
        if (data?.title) {
          document.title = `Take Quiz: ${data.title} | Kambaz`;
        }
        
        // Check for latest attempt
        try {
          const latestAttempt = await client.getLatestAttempt(cid as string, qid as string);
          if (latestAttempt && latestAttempt.completed) {
            // They have a completed attempt - show results
            setResults(latestAttempt);
            setSubmitted(true);
          }
        } catch (err) {
          // No previous attempts, that's fine
          console.log("No previous attempts found");
        }
        
      } catch (error) {
        console.error("Failed to load quiz:", error);
        toast.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [cid, qid]);

  // ============================================================================
  // TIMER EFFECT
  // ============================================================================
  
  /**
   * Countdown timer if quiz has time limit
   * Auto-submits when time runs out
   */
  useEffect(() => {
    if (quizStarted && quiz?.timeLimit && timeRemaining !== null) {
      if (timeRemaining <= 0) {
        handleSubmit();
        return;
      }
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining]);

  // ============================================================================
  // QUIZ ATTEMPT HANDLERS
  // ============================================================================

  /**
   * Verifies access code if required
   */
  const handleAccessCodeSubmit = () => {
    if (quiz.accessCode && accessCode !== quiz.accessCode) {
      toast.error("Incorrect access code");
      return;
    }
    setAccessCodeVerified(true);
  };

  /**
   * Starts a new quiz attempt
   * Creates attempt record in backend
   */
  const handleStartQuiz = async () => {
    try {
      // Start attempt in backend
      const attempt = await client.startQuizAttempt(cid as string, qid as string);
      setCurrentAttempt(attempt);
      setQuizStarted(true);
      
      // Initialize timer if time limit exists
      if (quiz.timeLimit) {
        setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
      }
      
      toast.success("Quiz started! Good luck!");
    } catch (error: any) {
      console.error("Failed to start quiz:", error);
      toast.error(error.response?.data?.error || "Failed to start quiz");
    }
  };

  /**
   * Updates answer for a specific question
   * Auto-saves to backend (optional feature)
   * 
   * @param questionId - MongoDB _id of the question
   * @param answer - Selected answer (string for MC/TF, string for Fill)
   */
  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev: any) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  /**
   * Saves answers without submitting (draft save)
   */
  const handleSaveDraft = async () => {
    if (!currentAttempt) return;
    
    try {
      const answersArray = Object.keys(answers).map(questionId => ({
        questionId,
        answer: [answers[questionId]]
      }));
      
      await client.saveQuizAnswers(
        cid as string, 
        qid as string, 
        currentAttempt._id,
        answersArray
      );
      
      toast.success("Answers saved!");
    } catch (error) {
      console.error("Failed to save answers:", error);
      toast.error("Failed to save answers");
    }
  };

  /**
   * Submits quiz for grading
   * Sends answers to backend for grading
   * Backend calculates score and marks as completed
   */
  const handleSubmit = async () => {
    if (!currentAttempt) return;
    
    if (!confirm("Are you sure you want to submit? You cannot change your answers after submission.")) {
      return;
    }
    
    try {
      // Format answers for backend
      const answersArray = Object.keys(answers).map(questionId => ({
        questionId,
        answer: [answers[questionId]]
      }));
      
      // Submit to backend for grading
      const gradedAttempt = await client.submitQuizAttempt(
        cid as string,
        qid as string,
        currentAttempt._id,
        answersArray
      );
      
      setResults(gradedAttempt);
      setSubmitted(true);
      toast.success("Quiz submitted successfully!");
      
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz");
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Formats seconds into MM:SS format for timer display
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Checks if quiz is available based on dates
   */
  const isQuizAvailable = () => {
    if (!quiz) return false;
    
    const now = new Date();
    const availableDate = quiz.availableDate ? new Date(quiz.availableDate) : null;
    const untilDate = quiz.untilDate ? new Date(quiz.untilDate) : null;
    
    if (availableDate && now < availableDate) return false;
    if (untilDate && now > untilDate) return false;
    
    return true;
  };

  // ============================================================================
  // RENDER GUARDS
  // ============================================================================

  /**
   * Authorization guard - Students only
   */
  if (!isStudent) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-warning">
          This page is for students only. Faculty should use the Preview feature.
        </div>
        <Link href={`/Courses/${cid}/Quizzes/${qid}/preview`} className="btn btn-primary me-2">
          Preview Quiz
        </Link>
        <Link href={`/Courses/${cid}/Quizzes/${qid}`} className="btn btn-secondary">
          Back to Quiz Details
        </Link>
      </div>
    );
  }

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div className="container-fluid mt-4 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Loading quiz...</p>
      </div>
    );
  }

  /**
   * Error state
   */
  if (!quiz) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger">Quiz not found</div>
        <Link href={`/Courses/${cid}/Quizzes`} className="btn btn-primary">
          Back to Quizzes
        </Link>
      </div>
    );
  }

  /**
   * Quiz not published
   */
  if (!quiz.published) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-warning">
          This quiz is not yet available. Please check back later.
        </div>
        <Link href={`/Courses/${cid}/Quizzes`} className="btn btn-primary">
          Back to Quizzes
        </Link>
      </div>
    );
  }

  /**
   * Quiz not available (date restrictions)
   */
  if (!isQuizAvailable()) {
    const availableDate = quiz.availableDate ? new Date(quiz.availableDate) : null;
    const untilDate = quiz.untilDate ? new Date(quiz.untilDate) : null;
    const now = new Date();
    
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-warning">
          {availableDate && now < availableDate && (
            <>This quiz will be available on {availableDate.toLocaleDateString()}</>
          )}
          {untilDate && now > untilDate && (
            <>This quiz closed on {untilDate.toLocaleDateString()}</>
          )}
        </div>
        <Link href={`/Courses/${cid}/Quizzes`} className="btn btn-primary">
          Back to Quizzes
        </Link>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="container-fluid mt-4" style={{ maxWidth: "900px" }}>
      
      {/* Quiz Title */}
      <h2 className="mb-4">{quiz.title}</h2>

      {/* PHASE 1: ACCESS CODE (if required and not verified) */}
      {quiz.accessCode && !accessCodeVerified && !quizStarted && !submitted && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-lock-fill text-warning me-2"></i>
              Access Code Required
            </h5>
            <p className="text-muted">This quiz requires an access code to begin.</p>
            <div className="row g-2 align-items-end">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <button 
                  className="btn btn-primary"
                  onClick={handleAccessCodeSubmit}
                >
                  Verify Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: QUIZ START SCREEN (before starting) */}
      {(!quiz.accessCode || accessCodeVerified) && !quizStarted && !submitted && (
        <div>
          {/* Instructions */}
          {quiz.description && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Instructions</h5>
                <div dangerouslySetInnerHTML={{ __html: quiz.description }} />
              </div>
            </div>
          )}

          {/* Quiz Info */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body text-center">
                  <div className="text-muted small">Total Points</div>
                  <div className="fs-4 fw-bold">{quiz.points}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body text-center">
                  <div className="text-muted small">Questions</div>
                  <div className="fs-4 fw-bold">{quiz.questions?.length || 0}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body text-center">
                  <div className="text-muted small">Time Limit</div>
                  <div className="fs-4 fw-bold">
                    {quiz.timeLimit ? `${quiz.timeLimit} min` : "None"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleStartQuiz}
            >
              <i className="bi bi-play-circle me-2"></i>
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: TAKING THE QUIZ (in progress) */}
      {quizStarted && !submitted && (
        <div>
          {/* Timer Bar (if time limit exists) */}
          {timeRemaining !== null && (
            <div className={`alert ${timeRemaining < 60 ? 'alert-danger' : 'alert-info'} mb-4`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <i className="bi bi-clock me-2"></i>
                  <strong>Time Remaining:</strong> {formatTime(timeRemaining)}
                </div>
                {timeRemaining < 60 && (
                  <span className="badge bg-danger">HURRY!</span>
                )}
              </div>
            </div>
          )}

          {/* Questions */}
          {quiz.questions && quiz.questions.length > 0 && (
            <div className="mb-4">
              {quiz.questions.map((question: any, index: number) => (
                <div key={question._id} className="card mb-3">
                  <div className="card-body">
                    {/* Question Header */}
                    <div className="d-flex justify-content-between mb-3">
                      <h5 className="mb-0">
                        Question {index + 1}
                        {question.title && `: ${question.title}`}
                      </h5>
                      <span className="badge bg-secondary">{question.points} pts</span>
                    </div>

                    {/* Question Text */}
                    <p className="mb-3">{question.question}</p>

                    {/* Multiple Choice */}
                    {question.type === "MULTIPLE_CHOICE" && (
                      <div>
                        {question.choices.map((choice: string, choiceIndex: number) => (
                          <div key={choiceIndex} className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`question-${question._id}`}
                              id={`q${question._id}-choice${choiceIndex}`}
                              value={choice}
                              checked={answers[question._id] === choice}
                              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            />
                            <label 
                              className="form-check-label"
                              htmlFor={`q${question._id}-choice${choiceIndex}`}
                            >
                              {choice}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True/False */}
                    {question.type === "TRUE_FALSE" && (
                      <div>
                        {["True", "False"].map((option) => (
                          <div key={option} className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`question-${question._id}`}
                              id={`q${question._id}-${option}`}
                              value={option}
                              checked={answers[question._id] === option}
                              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            />
                            <label 
                              className="form-check-label"
                              htmlFor={`q${question._id}-${option}`}
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fill in the Blank */}
                    {question.type === "FILL_IN_BLANK" && (
                      <div>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type your answer here..."
                          value={answers[question._id] || ""}
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-2 mb-4">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
            >
              <i className="bi bi-check-circle me-2"></i>
              Submit Quiz
            </button>
            <button 
              className="btn btn-outline-secondary btn-lg"
              onClick={handleSaveDraft}
            >
              <i className="bi bi-save me-2"></i>
              Save Draft
            </button>
          </div>
        </div>
      )}

      {/* PHASE 4: RESULTS (after submission) */}
      {submitted && results && (
        <div>
          {/* Results Summary Card */}
          <div className="card mb-4" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-check-circle me-2"></i>
                Quiz Submitted
              </h4>
            </div>
            <div className="card-body bg-light">
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="p-3">
                    <div className="text-muted small">Your Score</div>
                    <div className="h3 fw-bold text-success mb-0">
                      {results.score}/{results.totalPoints}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <div className="text-muted small">Percentage</div>
                    <div className="h3 fw-bold text-success mb-0">
                      {((results.score / results.totalPoints) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <div className="text-muted small">Grade</div>
                    <div className="h3 fw-bold text-success mb-0">
                      {((results.score / results.totalPoints) * 100) >= 90 ? 'A' :
                       ((results.score / results.totalPoints) * 100) >= 80 ? 'B' :
                       ((results.score / results.totalPoints) * 100) >= 70 ? 'C' :
                       ((results.score / results.totalPoints) * 100) >= 60 ? 'D' : 'F'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Results - Show only if showCorrectAnswers is enabled */}
          {quiz.showCorrectAnswers !== "NEVER" && results.answers && (
            <div className="mb-4">
              <h5 className="mb-3">Question Results</h5>
              {quiz.questions.map((question: any, index: number) => {
                const answer = results.answers.find((a: any) => a.questionId === question._id);
                const isCorrect = answer?.isCorrect;
                
                return (
                  <div 
                    key={question._id} 
                    className={`card mb-3 ${
                      isCorrect ? 'border-success' : 'border-danger'
                    }`}
                  >
                    <div className="card-body">
                      {/* Question Header with Score */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-secondary">Q{index + 1}</span>
                          <h6 className="mb-0">
                            {question.title || `Question ${index + 1}`}
                          </h6>
                        </div>
                        <div className="text-end">
                          {isCorrect ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle-fill me-1"></i>
                              Correct • {answer.pointsEarned}/{question.points} pts
                            </span>
                          ) : (
                            <span className="badge bg-danger">
                              <i className="bi bi-x-circle-fill me-1"></i>
                              Incorrect • 0/{question.points} pts
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="mb-3 text-muted">{question.question}</p>

                      {/* Show Answers Based on Question Type */}
                      {question.type === "MULTIPLE_CHOICE" && (
                        <div>
                          {question.choices.map((choice: string, idx: number) => {
                            const isStudentAnswer = answer?.answer[0] === choice;
                            const isCorrectAnswer = question.correctAnswers.includes(choice);
                            
                            return (
                              <div 
                                key={idx} 
                                className={`p-2 mb-2 rounded ${
                                  isCorrectAnswer ? 'bg-success bg-opacity-10 border border-success' :
                                  isStudentAnswer && !isCorrectAnswer ? 'bg-danger bg-opacity-10 border border-danger' :
                                  'bg-light'
                                }`}
                              >
                                <div className="d-flex align-items-center">
                                  <div className="flex-grow-1">
                                    {choice}
                                  </div>
                                  {isCorrectAnswer && (
                                    <i className="bi bi-check-circle-fill text-success ms-2"></i>
                                  )}
                                  {isStudentAnswer && !isCorrectAnswer && (
                                    <i className="bi bi-x-circle-fill text-danger ms-2"></i>
                                  )}
                                  {isStudentAnswer && (
                                    <span className="badge bg-secondary ms-2">Your Answer</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {question.type === "TRUE_FALSE" && (
                        <div>
                          {["True", "False"].map((option) => {
                            const isStudentAnswer = answer?.answer[0] === option;
                            const isCorrectAnswer = question.correctAnswers.includes(option);
                            
                            return (
                              <div 
                                key={option}
                                className={`p-2 mb-2 rounded ${
                                  isCorrectAnswer ? 'bg-success bg-opacity-10 border border-success' :
                                  isStudentAnswer && !isCorrectAnswer ? 'bg-danger bg-opacity-10 border border-danger' :
                                  'bg-light'
                                }`}
                              >
                                <div className="d-flex align-items-center">
                                  <div className="flex-grow-1">
                                    {option}
                                  </div>
                                  {isCorrectAnswer && (
                                    <i className="bi bi-check-circle-fill text-success ms-2"></i>
                                  )}
                                  {isStudentAnswer && !isCorrectAnswer && (
                                    <i className="bi bi-x-circle-fill text-danger ms-2"></i>
                                  )}
                                  {isStudentAnswer && (
                                    <span className="badge bg-secondary ms-2">Your Answer</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {question.type === "FILL_IN_BLANK" && (
                        <div>
                          <div className={`p-3 rounded ${
                            isCorrect ? 'bg-success bg-opacity-10 border border-success' : 
                            'bg-danger bg-opacity-10 border border-danger'
                          }`}>
                            <div className="mb-2">
                              <strong>Your Answer:</strong> {answer?.answer[0] || "(no answer)"}
                            </div>
                            <div>
                              <strong>Correct Answers:</strong> {question.correctAnswers.join(", ")}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Feedback (if incorrect) */}
                      {!isCorrect && (
                        <div className="alert alert-danger mt-3 mb-0 py-2 small">
                          <i className="bi bi-info-circle me-2"></i>
                          Review the correct answer above and try to understand why.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Message if answers are hidden */}
          {quiz.showCorrectAnswers === "NEVER" && (
            <div className="alert alert-info mb-4">
              <i className="bi bi-eye-slash me-2"></i>
              Your instructor has chosen not to show correct answers for this quiz.
            </div>
          )}

          {/* Navigation */}
          <div className="d-flex gap-2">
            <Link 
              href={`/Courses/${cid}/Quizzes`}
              className="btn btn-primary"
            >
              Back to Quizzes
            </Link>
            <Link 
              href={`/Courses/${cid}/Quizzes/${qid}`}
              className="btn btn-outline-secondary"
            >
              View Quiz Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}