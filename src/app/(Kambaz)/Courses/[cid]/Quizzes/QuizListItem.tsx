"use client";
import Link from "next/link";
import { Dropdown } from "react-bootstrap";
import { IoEllipsisVertical } from "react-icons/io5";
import { FaCheckCircle, FaBan, FaPencilAlt } from "react-icons/fa";
import { FcDeleteDatabase } from "react-icons/fc";
import { MdPublish, MdPreview } from "react-icons/md";
/**
 * Individual quiz item in the list
 * Displays quiz info and faculty action buttons
 */
interface QuizListItemProps {
  quiz: any;
  cid: string;
  isFaculty: boolean;
  isStudent: boolean;
  onDelete: (quizId: string) => void;
  onTogglePublish: (quiz: any) => void;
  getAvailabilityStatus: (quiz: any) => string;
}

export default function QuizListItem({
  quiz,
  cid,
  isFaculty,
  isStudent;
  onDelete,
  onTogglePublish,
  getAvailabilityStatus
}: QuizListItemProps) {
  return (
    <li className="list-group-item d-flex align-items-start py-3 px-2">
      {/* Drag handle (FACULTY only) */}
      {isFaculty && (
        <i className="bi bi-grip-vertical text-muted me-3 mt-2"></i>
      )}

      {/* Quiz icon */}
      <i 
      className="bi bi-rocket-takeoff text-success me-3 mt-2"
      style={{ fontSize: "1.5rem" }}></i>

      {/* title + metadata */}
      <div className="flex-grow-1">
        {/* quiz details (or Take view for students) */}
        <Link
          href={
            isFaculty
              ? `/Courses/${cid}/Quizzes/${quiz._id}`
              : `/Courses/${cid}/Quizzes/${quiz._id}/take`
          }
          className="fw-bold text-dark text-decoration-none"
        >
          {quiz.title}
        </Link>
        
        {/* Metadata: availability, due, points, questions */}
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
          <span className="me-3">{quiz.points || 0} pts</span>
          <span className="me-2">|</span>
          <span>{quiz.questions?.length || 0} Questions</span>
        </div>
      </div>

      {/* Faculty actions: Publish + 3-dot menu */}
      {isFaculty && (
        <div className="d-flex align-items-center">
          
          {/* Publish/Unpublish toggle - outside dropdown clickable */}
          <button
            className="btn btn-link text-decoration-none p-0 me-2"
            onClick={() => onTogglePublish(quiz)}
            title={quiz.published ? "Click to unpublish" : "Click to publish"}
          >
            {quiz.published ? (
              <FaCheckCircle className="text-success fs-3"></FaCheckCircle>
            ) : (
              <FaBan className="text-secondary fs-3"></FaBan>
            )}
          </button>

          {/* Delete Button 3-dots dropdown menu */}
            <Dropdown>
              <Dropdown.Toggle
              variant="link"
              className="text-dark p-0 border-0 bg-transparent"
              style={{ boxShadow: 'none'}}
              id={`dropdown-${quiz._id}`}
              >
                <IoEllipsisVertical className="fs-4" />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
              {/* Edit - Blue button */}
              <Dropdown.Item 
                as={Link}
                href={`/Courses/${cid}/Quizzes/${quiz._id}/edit`}
              >
                <FaPencilAlt className="me-2 text-primary"></FaPencilAlt>
                  Edit
              </Dropdown.Item>

              {/* Delete Red */}
              <Dropdown.Item onClick={() => onDelete(quiz._id)}>
                <FcDeleteDatabase className="me-2 text-danger">
                </FcDeleteDatabase>
                Delete
              </Dropdown.Item>

              {/* Publish (green) /Unpublish (yellow)  */}
              <Dropdown.Item onClick={() => onTogglePublish(quiz)}>
                <MdPublish className={`bi ${quiz.published ? "bi-x-circle text-warning" : "bi-check-circle text-success"} me-2`}></MdPublish>
                {quiz.published ? "Unpublish" : "Publish"}
              </Dropdown.Item>

              <Dropdown.Divider />

               {/* Preview  - Purple info*/}
              <Dropdown.Item 
                as={Link}
                href={`/Courses/${cid}/Quizzes/${quiz._id}/preview`}
              >
                <MdPreview className="bi bi-eye me-2 text-info"></MdPreview>Preview
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

                {/* Metadata: availability, due, points, questions */}
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
          <span className="me-3">{quiz.points || 0} pts</span>
          <span className="me-2">|</span>
          <span>{quiz.questions?.length || 0} Questions</span>
        </div>

        {/* Student-only: last score and attempts */}
        {isStudent && (
          <div className="text-muted small">
            Score: {quiz.latestScore != null ? quiz.latestScore : "—"}
            {" · "}
            Attempts: {quiz.attemptCount ?? 0}
          </div>
        )}

              )}
            </li>
          );
        }