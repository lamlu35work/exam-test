import { QuestionType } from "@/pkg/enums/questionType";

import type {
  QuestionInterface,
  MultipleChoiceQuestionInterface,
  FillInBlankQuestionInterface,
  SituationQuestionInterface,
} from "@/pkg/interfaces/question";

/**
 * ========================================
 * EXAM CONFIG
 * ========================================
 *
 * Cấu trúc đề:
 *
 * 48 câu Multiple Choice
 *
 * 2 Situation
 * - mỗi Situation có 3 câu trắc nghiệm con
 * - tổng = 6 câu
 *
 * 6 câu Fill In Blank
 *
 * Tổng câu được chấm:
 *
 * 48 + 6 + 6 = 60
 *
 * Tổng object trong examQuestions:
 *
 * 48 + 2 + 6 = 56
 */

export const EXAM_MULTIPLE_CHOICE_COUNT = 48;

export const EXAM_SITUATION_COUNT = 2;

export const EXAM_FILL_IN_BLANK_COUNT = 6;

/**
 * Mỗi situation chuẩn của đề
 * phải có 3 câu hỏi con.
 */
export const SITUATION_SUB_QUESTION_COUNT = 3;

/**
 * Tổng số câu thực tế được chấm.
 */
export const EXAM_TOTAL_QUESTION_COUNT =
  EXAM_MULTIPLE_CHOICE_COUNT +
  EXAM_SITUATION_COUNT * SITUATION_SUB_QUESTION_COUNT +
  EXAM_FILL_IN_BLANK_COUNT;

/**
 * Tổng số block được hiển thị.
 *
 * 48 MCQ
 * +
 * 2 Situation
 * +
 * 6 Fill In Blank
 *
 * = 56
 */
export const EXAM_TOTAL_BLOCK_COUNT =
  EXAM_MULTIPLE_CHOICE_COUNT + EXAM_SITUATION_COUNT + EXAM_FILL_IN_BLANK_COUNT;

/**
 * ========================================
 * SHUFFLE
 * ========================================
 */

/**
 * Fisher-Yates shuffle.
 *
 * Không thay đổi mảng gốc.
 */
export const shuffleArray = <T>(source: readonly T[]): T[] => {
  const result = [...source];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
};

/**
 * ========================================
 * TYPE GUARDS
 * ========================================
 */

const isMultipleChoiceQuestion = (
  question: QuestionInterface,
): question is MultipleChoiceQuestionInterface => {
  return question.type === QuestionType.MULTIPLE_CHOICE;
};

const isFillInBlankQuestion = (
  question: QuestionInterface,
): question is FillInBlankQuestionInterface => {
  return question.type === QuestionType.FILL_IN_BLANK;
};

const isSituationQuestion = (
  question: QuestionInterface,
): question is SituationQuestionInterface => {
  return question.type === QuestionType.SITUATION;
};

/**
 * ========================================
 * SITUATION VALIDATION
 * ========================================
 */

/**
 * Chỉ lấy Situation hợp lệ.
 *
 * Một Situation trong đề hiện tại
 * bắt buộc phải có đúng 3 câu con.
 */
const isValidSituationQuestion = (
  question: SituationQuestionInterface,
): boolean => {
  if (!Array.isArray(question.questions)) {
    return false;
  }

  if (question.questions.length !== SITUATION_SUB_QUESTION_COUNT) {
    return false;
  }

  /**
   * Mỗi câu con phải:
   *
   * - có id
   * - có content
   * - có items
   * - có đúng 4 đáp án
   * - có chính xác 1 đáp án đúng
   */
  return question.questions.every((subQuestion) => {
    if (!subQuestion.id || !subQuestion.content) {
      return false;
    }

    if (!Array.isArray(subQuestion.items)) {
      return false;
    }

    if (subQuestion.items.length !== 4) {
      return false;
    }

    const correctAnswerCount = subQuestion.items.filter(
      (item) => item.isCorrect === true,
    ).length;

    return correctAnswerCount === 1;
  });
};

/**
 * ========================================
 * QUESTION COUNT
 * ========================================
 */

/**
 * Số câu được chấm của một block.
 *
 * MCQ:
 * 1
 *
 * Fill in blank:
 * 1
 *
 * Situation:
 * số câu con
 *
 * Ví dụ:
 *
 * Situation có 3 sub questions
 * -> 3 câu được chấm.
 */
export const getQuestionScoreCount = (question: QuestionInterface): number => {
  if (question.type === QuestionType.SITUATION) {
    return question.questions.length;
  }

  return 1;
};

/**
 * Tính tổng số câu thực tế
 * trong một đề đã generate.
 */
export const getTotalExamQuestionCount = (
  questions: QuestionInterface[],
): number => {
  return questions.reduce((total, question) => {
    return total + getQuestionScoreCount(question);
  }, 0);
};

/**
 * ========================================
 * GENERATE EXAM
 * ========================================
 */

export const generateExamQuestions = (
  allQuestions: QuestionInterface[],
): QuestionInterface[] => {
  /**
   * =========================
   * MULTIPLE CHOICE
   * =========================
   */

  const multipleChoicePool = allQuestions.filter(isMultipleChoiceQuestion);

  /**
   * =========================
   * SITUATION
   * =========================
   *
   * Chỉ lấy situation có
   * đúng 3 câu hỏi con.
   */

  const situationPool = allQuestions
    .filter(isSituationQuestion)
    .filter(isValidSituationQuestion);

  /**
   * =========================
   * FILL IN BLANK
   * =========================
   */

  const fillInBlankPool = allQuestions.filter(isFillInBlankQuestion);

  /**
   * =========================
   * VALIDATE POOL
   * =========================
   */

  if (multipleChoicePool.length < EXAM_MULTIPLE_CHOICE_COUNT) {
    throw new Error(
      [
        "Không đủ câu MULTIPLE_CHOICE.",
        `Cần: ${EXAM_MULTIPLE_CHOICE_COUNT}.`,
        `Hiện có: ${multipleChoicePool.length}.`,
      ].join(" "),
    );
  }

  if (situationPool.length < EXAM_SITUATION_COUNT) {
    throw new Error(
      [
        "Không đủ câu SITUATION hợp lệ.",
        `Cần: ${EXAM_SITUATION_COUNT}.`,
        `Hiện có: ${situationPool.length}.`,
        `Mỗi SITUATION phải có đúng ${SITUATION_SUB_QUESTION_COUNT} câu con.`,
      ].join(" "),
    );
  }

  if (fillInBlankPool.length < EXAM_FILL_IN_BLANK_COUNT) {
    throw new Error(
      [
        "Không đủ câu FILL_IN_BLANK.",
        `Cần: ${EXAM_FILL_IN_BLANK_COUNT}.`,
        `Hiện có: ${fillInBlankPool.length}.`,
      ].join(" "),
    );
  }

  /**
   * =========================
   * RANDOM QUESTIONS
   * =========================
   */

  const multipleChoiceQuestions = shuffleArray(multipleChoicePool).slice(
    0,
    EXAM_MULTIPLE_CHOICE_COUNT,
  );

  const situationQuestions = shuffleArray(situationPool).slice(
    0,
    EXAM_SITUATION_COUNT,
  );

  const fillInBlankQuestions = shuffleArray(fillInBlankPool).slice(
    0,
    EXAM_FILL_IN_BLANK_COUNT,
  );

  /**
   * =========================
   * BUILD EXAM
   * =========================
   *
   * Không shuffle toàn bộ.
   *
   * Giữ đúng cấu trúc:
   *
   * 1 - 48:
   * MCQ
   *
   * 49 - 54:
   * 2 Situation × 3 sub questions
   *
   * 55 - 60:
   * Fill In Blank
   */

  const examQuestions: QuestionInterface[] = [
    ...multipleChoiceQuestions,
    ...situationQuestions,
    ...fillInBlankQuestions,
  ];

  /**
   * =========================
   * FINAL VALIDATION
   * =========================
   */

  if (examQuestions.length !== EXAM_TOTAL_BLOCK_COUNT) {
    throw new Error(
      [
        "Sai số lượng block của đề.",
        `Expected: ${EXAM_TOTAL_BLOCK_COUNT}.`,
        `Actual: ${examQuestions.length}.`,
      ].join(" "),
    );
  }

  const totalQuestionCount = getTotalExamQuestionCount(examQuestions);

  if (totalQuestionCount !== EXAM_TOTAL_QUESTION_COUNT) {
    throw new Error(
      [
        "Sai tổng số câu được chấm.",
        `Expected: ${EXAM_TOTAL_QUESTION_COUNT}.`,
        `Actual: ${totalQuestionCount}.`,
      ].join(" "),
    );
  }

  return examQuestions;
};

/**
 * ========================================
 * EXAM STATISTICS
 * ========================================
 *
 * Dùng để debug hoặc hiển thị.
 */

export interface ExamQuestionStatistics {
  multipleChoiceCount: number;
  situationCount: number;
  situationSubQuestionCount: number;
  fillInBlankCount: number;

  /**
   * Số block:
   * 56
   */
  blockCount: number;

  /**
   * Tổng số câu được chấm:
   * 60
   */
  totalQuestionCount: number;
}

export const getExamQuestionStatistics = (
  questions: QuestionInterface[],
): ExamQuestionStatistics => {
  const multipleChoiceCount = questions.filter(
    (question) => question.type === QuestionType.MULTIPLE_CHOICE,
  ).length;

  const situations = questions.filter(isSituationQuestion);

  const situationCount = situations.length;

  const situationSubQuestionCount = situations.reduce(
    (total, situation) => total + situation.questions.length,
    0,
  );

  const fillInBlankCount = questions.filter(
    (question) => question.type === QuestionType.FILL_IN_BLANK,
  ).length;

  return {
    multipleChoiceCount,
    situationCount,
    situationSubQuestionCount,
    fillInBlankCount,

    blockCount: questions.length,

    totalQuestionCount: getTotalExamQuestionCount(questions),
  };
};
