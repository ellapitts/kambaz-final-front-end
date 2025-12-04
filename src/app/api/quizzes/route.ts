import { NextRequest, NextResponse } from "next/server";
import { quizzes } from "../../(Kambaz)/Database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  if (courseId) {
    const filteredQuizzes = quizzes.filter((q: any) => q.courseId === courseId);
    return NextResponse.json(filteredQuizzes);
  }

  return NextResponse.json(quizzes);
}

export async function POST(request: NextRequest) {
  const quiz = await request.json();
  const newQuiz = {
    ...quiz,
    _id: new Date().getTime().toString(),
  };
  (quizzes as any[]).push(newQuiz);
  return NextResponse.json(newQuiz);
}
