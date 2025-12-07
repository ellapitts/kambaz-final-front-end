"use client";
/*
  Quiz editor 
  - allows faculty to edit quiz settings and details.
  - loads quiz by id, binds fields to local form state.
  - save (mock) updates local quiz data and returns to quiz details.
  - students see a read-only warning instead of the editor.
*/
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import * as client from "../../../../client";
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import { RootState } from "../../../../../store";

// Components
import QuizEditorHeader from "./QuizEditorHeader";
import QuizEditorTabs from "./QuizEditorTab";
import QuizDetailsTab from "./QuizDetailstab";
import QuizQuestions from "./QuizQuestions";

export default function QuizEditor() {
  const { cid, qid } = useParams();
  const router = useRouter();

  const { currentUser } = useSelector((state: RootState) => state.accountReducer);
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "questions">("details");

  const isFaculty = currentUser?.role === "FACULTY";

  /* Load quiz */
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await client.findQuizById(cid as string, qid as string);
        setQuiz(data);
      } catch (error) {
        console.error("Failed to load quiz:", error);
        toast.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [cid, qid]);

  /* Update helpers */
  const updateField = (name: string, value: any) => {
    setQuiz((prev: any) => ({ ...prev, [name]: value }));
  };

  const updateCheckbox = (name: string) => {
    setQuiz((prev: any) => ({ ...prev, [name]: !prev[name] }));
  };

  /* Save */
  const handleSave = async () => {
    if (!quiz) return;
    try {
      await client.updateQuiz(cid as string, qid as string, quiz);
      toast.success("Quiz saved!");
      router.push(`/Dashboard/Courses/${cid}/Quizzes/${qid}`);
    } catch (error) {
      console.error("Failed to save quiz:", error);
      toast.error("Failed to save quiz");
    }
  };

  /* Save and Publish */
  const handleSaveAndPublish = async () => {
    if (!quiz) return;
    try {
      await client.updateQuiz(cid as string, qid as string, { ...quiz, published: true });
      toast.success("Quiz saved and published!");
      router.push(`/Dashboard/Courses/${cid}/Quizzes`);
    } catch (error) {
      console.error("Failed to save and publish:", error);
      toast.error("Failed to save and publish quiz");
    }
  };

  /* Cancel */
  const handleCancel = () => {
    router.push(`/Dashboard/Courses/${cid}/Quizzes`);
  };

  /* Add question placeholder */
  const handleAddQuestion = () => {
    toast.info("Add question feature coming soon!");
  };

  /* Guards */
  if (!isFaculty) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger mb-3">
          Students cannot edit quizzes.
        </div>
        <Link href={`/Dashboard/Courses/${cid}/Quizzes`} className="btn btn-primary">
          Back to Quizzes
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid mt-4 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Loading quiz editor...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-warning">Quiz not found</div>
        <Link href={`/Dashboard/Courses/${cid}/Quizzes`} className="btn btn-primary">
          Back to Quizzes
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid" id="wd-quiz-editor">
      
      <QuizEditorHeader
        quizTitle={quiz.title}
        onCancel={handleCancel}
        onSave={handleSave}
        onSaveAndPublish={handleSaveAndPublish}
      />

      <hr />

      <QuizEditorTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "details" ? (
        <QuizDetailsTab
          quiz={quiz}
          updateField={updateField}
          updateCheckbox={updateCheckbox}
        />
      ) : (
        <QuizQuestions
          questions={quiz.questions || []}
          onAddQuestion={handleAddQuestion}
        />
      )}
    </div>
  );
}