import axios from "axios";
export { profile } from "./(Kambaz)/Account/client";

const QUIZZES_API = "/api/quizzes";

export const findQuizzesForCourse = async (courseId: string) => {
  const response = await axios.get(`${QUIZZES_API}?courseId=${courseId}`);
  return response.data;
};

export const findQuizById = async (quizId: string) => {
  const response = await axios.get(`${QUIZZES_API}/${quizId}`);
  return response.data;
};

export const createQuiz = async (courseId: string, quiz: any) => {
  const response = await axios.post(QUIZZES_API, { ...quiz, courseId });
  return response.data;
};

export const updateQuiz = async (quizId: string, quiz: any) => {
  const response = await axios.put(`${QUIZZES_API}/${quizId}`, quiz);
  return response.data;
};

export const deleteQuiz = async (quizId: string) => {
  const response = await axios.delete(`${QUIZZES_API}/${quizId}`);
  return response.data;
};
