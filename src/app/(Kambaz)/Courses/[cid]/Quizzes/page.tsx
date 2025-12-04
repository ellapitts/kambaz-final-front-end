"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { mockQuizzes, mockUser } from "./client";

export default function Quizzes() {
  const { cid } = useParams();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Simulate loading user - change to mockStudentUser to test student view
    setCurrentUser(mockUser);
    
    // Simulate loading quizzes
    setQuizzes(mockQuizzes);
  }, [cid]);

  const isFaculty = currentUser?.role === "FACULTY";

  const handleDeleteQuiz = (quizId: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      setQuizzes(quizzes.filter((q) => q._id !== quizId));
      alert("Quiz deleted!");
    }
  };

  const togglePublish = (quiz: any) => {
    const updated = { ...quiz, published: !quiz.published };
    setQuizzes(quizzes.map((q) => (q._id === quiz._id ? updated : q)));
  };

  const getAvailabilityStatus = (quiz: any) => {
    const now = new Date();
    const availableDate = quiz.availableDate ? new Date(quiz.availableDate) : null;
    const untilDate = quiz.untilDate ? new Date(quiz.untilDate) : null;

    if (!availableDate) return "Not Available";
    
    if (now < availableDate) {
      return `Not available until ${availableDate.toLocaleDateString()}`;
    }
    
    if (untilDate && now > untilDate) {
      return "Closed";
    }
    
    return "Available";
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter quizzes for students - only show published ones
  const displayQuizzes = isFaculty 
    ? filteredQuizzes 
    : filteredQuizzes.filter(q => q.published);

  return (
    <div id="wd-quizzes" className="container-fluid">
      {/* User Info Badge for Testing */}
      <div className="alert alert-info mb-3">
        Logged in as: <strong>{currentUser?.firstName} {currentUser?.lastName}</strong> ({currentUser?.role})
        <button 
          className="btn btn-sm btn-outline-primary ms-3"
          onClick={() => setCurrentUser(currentUser?.role === "FACULTY" ? { ...mockUser, role: "STUDENT" } : mockUser)}
        >
          Switch to {currentUser?.role === "FACULTY" ? "Student" : "Faculty"}
        </button>
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="input-group" style={{ maxWidth: "300px" }}>
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search for Quiz"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isFaculty && (
          <div>
            <Link
              href={`/Dashboard/Courses/${cid}/Quizzes/new`}
              className="btn btn-danger me-2"
            >
              <i className="bi bi-plus-lg"></i> Quiz
            </Link>
            <button className="btn btn-secondary">
              <i className="bi bi-three-dots-vertical"></i>
            </button>
          </div>
        )}
      </div>

      {/* Quiz List */}
      <ul className="list-group">
        <li className="list-group-item bg-light border-0">
          <h5 className="mb-0">
            <i className="bi bi-grip-vertical me-2"></i>
            Assignment Quizzes
          </h5>
        </li>

        {displayQuizzes.length === 0 ? (
          <li className="list-group-item text-center py-5">
            {isFaculty ? (
              <>
                <p className="text-muted">No quizzes yet</p>
                <Link
                  href={`/Dashboard/Courses/${cid}/Quizzes/new`}
                  className="btn btn-primary"
                >
                  <i className="bi bi-plus-lg"></i> Create Your First Quiz
                </Link>
              </>
            ) : (
              <p className="text-muted">No quizzes available</p>
            )}
          </li>
        ) : (
          displayQuizzes.map((quiz) => (
            <li
              key={quiz._id}
              className="list-group-item d-flex align-items-start py-3"
            >
              {isFaculty && (
                <i className="bi bi-grip-vertical text-muted me-3 mt-2"></i>
              )}
              
              <i className="bi bi-rocket-takeoff text-success me-3 mt-2" style={{fontSize: "1.5rem"}}></i>

              <div className="flex-grow-1">
                <Link
                  href={
                    isFaculty
                      ? `/Dashboard/Courses/${cid}/Quizzes/${quiz._id}`
                      : `/Dashboard/Courses/${cid}/Quizzes/${quiz._id}/take`
                  }
                  className="text-decoration-none text-dark fw-bold"
                >
                  {quiz.title}
                </Link>

                <div className="text-muted small mt-1">
                  <span className="me-3">
                    <strong>{getAvailabilityStatus(quiz)}</strong>
                  </span>
                  <span className="me-2">|</span>
                  <span className="me-3">
                    <strong>Due:</strong>{" "}
                    {quiz.dueDate
                      ? new Date(quiz.dueDate).toLocaleDateString()
                      : "No due date"}
                  </span>
                  <span className="me-2">|</span>
                  <span className="me-3">
                    {quiz.points || 0} pts
                  </span>
                  <span className="me-2">|</span>
                  <span>
                    {quiz.questions?.length || 0} Questions
                  </span>
                </div>
              </div>

              {isFaculty && (
                <div className="d-flex align-items-center">
                  {/* Publish Toggle */}
                  <button
                    className="btn btn-link text-decoration-none me-2"
                    onClick={() => togglePublish(quiz)}
                    title={quiz.published ? "Published" : "Unpublished"}
                  >
                    {quiz.published ? (
                      <span style={{ fontSize: "1.5rem" }}>✅</span>
                    ) : (
                      <span style={{ fontSize: "1.5rem" }}>🚫</span>
                    )}
                  </button>

                  {/* Context Menu */}
                  <div className="dropdown">
                    <button
                      className="btn btn-link text-dark"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link
                          className="dropdown-item"
                          href={`/Dashboard/Courses/${cid}/Quizzes/${quiz._id}`}
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Edit
                        </Link>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                        >
                          <i className="bi bi-trash me-2"></i>
                          Delete
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => togglePublish(quiz)}
                        >
                          <i
                            className={`bi ${
                              quiz.published
                                ? "bi-x-circle"
                                : "bi-check-circle"
                            } me-2`}
                          ></i>
                          {quiz.published ? "Unpublish" : "Publish"}
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link
                          className="dropdown-item"
                          href={`/Dashboard/Courses/${cid}/Quizzes/${quiz._id}/preview`}
                        >
                          <i className="bi bi-eye me-2"></i>
                          Preview
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}