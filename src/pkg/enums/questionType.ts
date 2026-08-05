export const QuestionType = {
    MULTIPLE_CHOICE: "multiple_choice",
    TRUE_FALSE: "true_false",
    FILL_IN_BLANK: "fill_in_blank",
} as const;

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];