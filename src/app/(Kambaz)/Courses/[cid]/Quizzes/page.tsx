"use client";
/*
  Quiz List Page - Req
  1 - Empty state prompting “Add Quiz”.
  2 - Displays sorted quiz list.
  3 - + Quiz creates default quiz and navigates to editor.
  4 - 3-dots menu: Edit, Delete, Publish/Unpublish, Preview.
  5 - Published quizzes show green check.
  6 - Clicking title opens Quiz Details.
*/

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as client from "../../client";
import { toast } from 'react-toastify'; // Toast notifications

// Component improts
import QuizzesControls from "./QuizzesControls";
import QuizListItem from "./QuizListItem";
import EmptyState from "./EmptyState";
import { getAvailabilityStatus, filterQuizzes } from "./quizUtils";

// Redux imports 
import { setQuizzes, deleteQuiz as deleteQuizAction } from "./reducer";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";


export default function Quizzes() {
  const { cid } = useParams();
  const router = useRouter();

  // Redux state
  const { quizzes } = useSelector((state: RootState) => state.quizzesReducer);
  const { currentUser } = useSelector((state: RootState) => state.accountReducer);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const isFaculty = currentUser?.role === "FACULTY";

  const displayFacultyStudent = isFaculty && !isPreviewing;

  /* Load quizzes from backend */
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await client.findQuizzesForCourse(cid as string);
        // Sort by available date
        dispatch(setQuizzes(data));
      } catch (e) {
        console.error("Failed to load quizzes:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [cid, dispatch]);

  /* CREATE QUIZ - Creates via API and navigates to editor */
  const handleCreateQuiz = async () => {
    try {
      const newQuiz = await client.createQuiz(cid as string, {
        title: "New Quiz",
        published: false,
        availableDate: null,
        untilDate: null,
        dueDate: null,
        points: 0,
        questions: [],
      });
      dispatch(setQuizzes([...quizzes, newQuiz]));
      toast.success("Quiz created!");
      router.push(`/Dashboard/Courses/${cid}/Quizzes/${newQuiz._id}/edit`);
    } catch (e) {
      console.error("Failed to create quiz:", e);
        toast.error("Failed to create quiz");
    }
  };

  /* DELETE QUIZ - Deletes via API and updates Redux */
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Delete this quiz?")) 
      return;
    try {
      await client.deleteQuiz(cid as string, quizId);
      dispatch(deleteQuizAction(quizId));
      toast.success("Quiz deleted!");
    } catch (e) {
      console.error("Failed to delete quiz:", e);
      toast.error("Failed to delete quiz");
    }
  };

  /* TOGGLE PUBLISH - Updates via API and reloads quizzes */
  const togglePublish = async (quiz: any) => {
    try {
      await client.publishQuiz(cid as string, quiz._id);
      const updatedQuizzes = await client.findQuizzesForCourse(cid as string);
      dispatch(setQuizzes(updatedQuizzes));
      toast.success(quiz.published ? "Quiz unpublished" : "Quiz published" );
    } catch (error) {
      console.error("Failed to toggle publish:", error);
      toast.error("Failed to update quiz");
    }
  };

  // /* Show published quizzes ONLY TO STUDENTS */
  const displayQuizzes = filterQuizzes(quizzes, searchTerm, displayFacultyStudent);

  // Protection against undefined CID
  if (!cid) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-warning">
          No course selected. Please select a course from the Dashboard.
        </div>
      </div>
    );
  }

    /* Loading state */
    if (loading) {
      return (
    <div className="container-fluid mt-4 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Loading quizzes...</p>
    </div>
      );
    }
    
  /* Render quiz list */
  return (
    <div className="container-fluid" id="wd-quizzes">

      {/* search bar and add quiz button */}
      <QuizzesControls
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      addQuiz={handleCreateQuiz}
      isFaculty={isFaculty}
      isPreviewing={isPreviewing}
      setIsPreviewing={setIsPreviewing}
      />

      {/* Quiz list container */}
      <ul className="list-group">

        {/* Section label */}
        <li className="list-group-item bg-light border-0">
          <h5 className="mb-0">
            <i className="bi bi-grip-vertical me-2"></i>
            Assignment Quizzes
          </h5>
        </li>

        {/* empty state */}
        {displayQuizzes.length === 0 ? (
          <EmptyState
          isFaculty={displayFacultyStudent}
          onCreateQuiz={handleCreateQuiz}
          />
        ) : (
          /* quiz item rows*/
          displayQuizzes.map((quiz: any) => (
            <QuizListItem
            key={quiz._id}
            quiz={quiz}
            cid={cid as string}
            isFaculty={displayFacultyStudent}
            onDelete={handleDeleteQuiz}
            onTogglePublish={togglePublish}
            getAvailabilityStatus={getAvailabilityStatus}
            />
          ))
        )}
        </ul>
        </div>
  ); 
}