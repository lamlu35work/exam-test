import { QuestionType } from "@/pkg/enums/questionType";

export interface MultipleChoiceUserAnswer {
  questionId: string;
  type: typeof QuestionType.MULTIPLE_CHOICE;
  selectedOptionId: number;
  isChecked: boolean;
  isCorrect: boolean;
}

export interface TrueFalseAnswerItem {
  itemId: number;
  value: boolean;
}

export interface TrueFalseUserAnswer {
  questionId: string;
  type: typeof QuestionType.TRUE_FALSE;
  answers: TrueFalseAnswerItem[];
  isCompleted: boolean;
  isChecked: boolean;
  correctCount: number;
}

export interface FillInBlankUserAnswer {
  questionId: string;
  type: typeof QuestionType.FILL_IN_BLANK;
  value: string;
  isChecked: boolean;
  isCorrect: boolean;
}

export type UserAnswer =
  | MultipleChoiceUserAnswer
  | TrueFalseUserAnswer
  | FillInBlankUserAnswer;