import type { QuestionType } from "../enums/questionType";

export interface BaseQuestionInterface {
  id: string;
  topicId: number;
  content: string;
  explanation?: string;
}

// multiple choice question interface
export interface MultipleChoiceOptionInterface {
  id: number;
  content: string;
  isCorrect: boolean;
}

export interface MultipleChoiceQuestionInterface extends BaseQuestionInterface {
  type: typeof QuestionType.MULTIPLE_CHOICE;
  items: MultipleChoiceOptionInterface[];
}

// true/false question interface
export interface TrueFalseItemInterface {
  id: number;
  content: string;
  isTrue: boolean;
}

export interface TrueFalseQuestionInterface extends BaseQuestionInterface {
  type: typeof QuestionType.TRUE_FALSE;
  items: TrueFalseItemInterface[];
}

// fill in the blank question interface
export interface FillInBlankQuestionInterface extends BaseQuestionInterface {
  type: typeof QuestionType.FILL_IN_BLANK;
  answer: string;
}

// ====================
// SITUATION
// ====================

export interface SituationQuestionItemInterface {
  id: string;

  content: string;

  items: MultipleChoiceOptionInterface[];

  explanation?: string;
}

export interface SituationQuestionInterface extends BaseQuestionInterface {
  type: typeof QuestionType.SITUATION;

  /**
   * Nội dung tình huống chung
   */
  content: string;

  /**
   * Các câu hỏi dựa trên cùng tình huống
   */
  questions: SituationQuestionItemInterface[];
}

export type QuestionInterface =
  | MultipleChoiceQuestionInterface
  | TrueFalseQuestionInterface
  | FillInBlankQuestionInterface
  | SituationQuestionInterface;
