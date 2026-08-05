import type { QuestionInterface } from "./question";
import type { UserAnswer } from "./userAnswer";

export interface ExamInterface {
  id: string;
  questions: QuestionInterface[];
  startedAt: number;
  expiresAt: number;
  submittedAt: number | null;
}

export interface ExamStateInterface {
  exam: ExamInterface;
  answers: Record<string, UserAnswer>;
  currentQuestionId: string | null;
}

export interface ExamResultInterface {
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  score: number;
}