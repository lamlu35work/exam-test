import { QuestionType } from "@/pkg/enums/questionType";

import type {
  MultipleChoiceQuestionInterface,
  QuestionInterface,
  TrueFalseQuestionInterface,
} from "@/pkg/interfaces/question";

const MULTIPLE_CHOICE_COUNT = 40;
const TRUE_FALSE_COUNT = 10;
const FILL_IN_BLANK_COUNT = 10;

const shuffleArray = <T>(items: T[]): T[] => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
};

/**
 * Trộn options của câu multiple choice.
 */
const shuffleMultipleChoiceOptions = (
  question: MultipleChoiceQuestionInterface,
): MultipleChoiceQuestionInterface => {
  return {
    ...question,
    items: shuffleArray(question.items),
  };
};

/**
 * Trộn các mệnh đề của câu true/false.
 */
const shuffleTrueFalseItems = (
  question: TrueFalseQuestionInterface,
): TrueFalseQuestionInterface => {
  return {
    ...question,
    items: shuffleArray(question.items),
  };
};

/**
 * Phân bổ số câu tương đối đều cho các topic.
 *
 * Ví dụ:
 * count = 10, có 3 topic
 * Kết quả phân bổ: 4, 3, 3
 */
const distributeCountByTopic = (
  totalCount: number,
  topicIds: number[],
): Map<number, number> => {
  const result = new Map<number, number>();

  if (!topicIds.length) {
    return result;
  }

  const baseCount = Math.floor(totalCount / topicIds.length);
  const remainder = totalCount % topicIds.length;

  topicIds.forEach((topicId, index) => {
    result.set(topicId, baseCount + (index < remainder ? 1 : 0));
  });

  return result;
};

/**
 * Lấy câu hỏi theo type và chia đều theo topic.
 *
 * Nếu topic nào thiếu câu, số lượng thiếu sẽ được lấy ngẫu nhiên
 * từ các topic còn lại.
 */
const selectQuestionsByType = (
  allQuestions: QuestionInterface[],
  type: QuestionInterface["type"],
  requiredCount: number,
  topicIds: number[],
): QuestionInterface[] => {
  const questionsOfType = allQuestions.filter(
    (question) => question.type === type,
  );

  if (questionsOfType.length < requiredCount) {
    throw new Error(
      `Không đủ câu hỏi loại "${type}". Cần ${requiredCount}, hiện có ${questionsOfType.length}.`,
    );
  }

  const allocation = distributeCountByTopic(
    requiredCount,
    shuffleArray(topicIds),
  );

  const selectedQuestions: QuestionInterface[] = [];
  const selectedQuestionIds = new Set<string>();

  topicIds.forEach((topicId) => {
    const topicQuestions = shuffleArray(
      questionsOfType.filter((question) => question.topicId === topicId),
    );

    const requestedCount = allocation.get(topicId) ?? 0;

    topicQuestions.slice(0, requestedCount).forEach((question) => {
      selectedQuestions.push(question);
      selectedQuestionIds.add(question.id);
    });
  });

  /**
   * Một số topic có thể không đủ câu.
   * Bù phần còn thiếu từ toàn bộ kho câu hỏi còn lại.
   */
  const missingCount = requiredCount - selectedQuestions.length;

  if (missingCount > 0) {
    const remainingQuestions = shuffleArray(
      questionsOfType.filter(
        (question) => !selectedQuestionIds.has(question.id),
      ),
    );

    selectedQuestions.push(...remainingQuestions.slice(0, missingCount));
  }

  if (selectedQuestions.length < requiredCount) {
    throw new Error(`Không thể tạo đủ ${requiredCount} câu loại "${type}".`);
  }

  return selectedQuestions;
};

export const generateExamQuestions = (
  allQuestions: QuestionInterface[],
  topicIds: number[],
): QuestionInterface[] => {
  if (!topicIds.length) {
    throw new Error("Không có topic để tạo đề thi.");
  }

  const multipleChoiceQuestions = selectQuestionsByType(
    allQuestions,
    QuestionType.MULTIPLE_CHOICE,
    MULTIPLE_CHOICE_COUNT,
    topicIds,
  ).map((question) =>
    shuffleMultipleChoiceOptions(question as MultipleChoiceQuestionInterface),
  );

  const trueFalseQuestions = selectQuestionsByType(
    allQuestions,
    QuestionType.TRUE_FALSE,
    TRUE_FALSE_COUNT,
    topicIds,
  ).map((question) =>
    shuffleTrueFalseItems(question as TrueFalseQuestionInterface),
  );

  const fillInBlankQuestions = selectQuestionsByType(
    allQuestions,
    QuestionType.FILL_IN_BLANK,
    FILL_IN_BLANK_COUNT,
    topicIds,
  );

  return shuffleArray([
    ...multipleChoiceQuestions,
    ...trueFalseQuestions,
    ...fillInBlankQuestions,
  ]);
};
