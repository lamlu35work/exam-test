export const QuestionType = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
  FILL_IN_BLANK: "FILL_IN_BLANK",
  SITUATION: "SITUATION",
} as const;

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];
