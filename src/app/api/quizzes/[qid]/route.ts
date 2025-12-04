import { NextRequest, NextResponse } from "next/server";
import { quizzes } from "../../../(Kambaz)/Database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qid: string }> }
) {
  const { qid } = await params;
  const quiz = quizzes.find((q: any) => q._id === qid);
  if (!quiz) {
    return new NextResponse("Quiz not found", { status: 404 });
  }
  return NextResponse.json(quiz);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ qid: string }> }
) {
  const { qid } = await params;
  const quizIndex = quizzes.findIndex((q: any) => q._id === qid);
  if (quizIndex === -1) {
    return new NextResponse("Quiz not found", { status: 404 });
  }
  const updates = await request.json();
  (quizzes as any[])[quizIndex] = { ...quizzes[quizIndex], ...updates };
  return NextResponse.json(quizzes[quizIndex]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ qid: string }> }
) {
  const { qid } = await params;
  const quizIndex = quizzes.findIndex((q: any) => q._id === qid);
  if (quizIndex === -1) {
    return new NextResponse("Quiz not found", { status: 404 });
  }
  (quizzes as any[]).splice(quizIndex, 1);
  return new NextResponse(null, { status: 204 });
}
