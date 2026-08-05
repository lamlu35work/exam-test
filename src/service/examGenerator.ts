import { QuestionType } from "@/pkg/enums/questionType";

import type {
  MultipleChoiceQuestionInterface,
  QuestionInterface,
  TrueFalseQuestionInterface,
} from "@/pkg/interfaces/question";

const MULTIPLE_CHOICE_COUNT = 40;
const TRUE_FALSE_COUNT = 10;
const FILL_IN_BLANK_COUNT = 10;

/**
 * Trộn ngẫu nhiên mảng nhưng không thay đổi mảng ban đầu.
 */
const shuffleArray = <T>(items: readonly T[]): T[] => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
};

/**
 * Trộn thứ tự đáp án của câu trắc nghiệm.
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
 * Trộn thứ tự các mệnh đề của câu đúng/sai.
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
 * Loại bỏ topic ID bị trùng.
 */
const getUniqueTopicIds = (topicIds: readonly number[]): number[] => {
  return [...new Set(topicIds)];
};

/**
 * Phân bổ số lượng câu hỏi tương đối đều giữa các topic.
 *
 * Ví dụ:
 * totalCount = 10
 * topicIds = [1, 2, 3]
 *
 * Kết quả:
 * topic 1: 4 câu
 * topic 2: 3 câu
 * topic 3: 3 câu
 *
 * Thứ tự topic được trộn để phần dư không luôn rơi vào topic đầu tiên.
 */
const distributeCountByTopic = (
  totalCount: number,
  topicIds: readonly number[],
): Map<number, number> => {
  const allocation = new Map<number, number>();

  if (!topicIds.length) {
    return allocation;
  }

  const shuffledTopicIds = shuffleArray(topicIds);

  const baseCount = Math.floor(totalCount / shuffledTopicIds.length);
  const remainder = totalCount % shuffledTopicIds.length;

  shuffledTopicIds.forEach((topicId, index) => {
    allocation.set(topicId, baseCount + (index < remainder ? 1 : 0));
  });

  return allocation;
};

/**
 * Kiểm tra ID câu hỏi bị trùng.
 *
 * ID bị trùng có thể khiến giao diện lấy nhầm câu hỏi vì component
 * thường tìm câu hiện tại bằng question.id.
 */
const validateUniqueQuestionIds = (
  questions: readonly QuestionInterface[],
): void => {
  const existingIds = new Set<string>();
  const duplicateIds = new Set<string>();

  questions.forEach((question) => {
    if (existingIds.has(question.id)) {
      duplicateIds.add(question.id);
    }

    existingIds.add(question.id);
  });

  if (!duplicateIds.size) {
    return;
  }

  throw new Error(
    `Ngân hàng câu hỏi có ID bị trùng: ${Array.from(duplicateIds).join(", ")}.`,
  );
};

/**
 * Kiểm tra ngân hàng có đủ câu hỏi theo loại hay không.
 */
const validateAvailableQuestionCount = (
  availableCount: number,
  requiredCount: number,
  type: QuestionInterface["type"],
): void => {
  if (availableCount >= requiredCount) {
    return;
  }

  throw new Error(
    `Không đủ câu hỏi loại "${type}" trong các topic được chọn. ` +
      `Cần ${requiredCount} câu, hiện có ${availableCount} câu.`,
  );
};

/**
 * Chọn câu hỏi theo loại và phân bổ tương đối đều giữa các topic.
 *
 * Nếu một topic không đủ số câu được phân bổ, phần thiếu sẽ được
 * lấy ngẫu nhiên từ các câu còn lại thuộc những topic được phép.
 */
const selectQuestionsByType = (
  allQuestions: readonly QuestionInterface[],
  type: QuestionInterface["type"],
  requiredCount: number,
  topicIds: readonly number[],
): QuestionInterface[] => {
  const uniqueTopicIds = getUniqueTopicIds(topicIds);
  const allowedTopicIds = new Set(uniqueTopicIds);

  /**
   * Chỉ lấy câu đúng loại và thuộc topic được phép.
   */
  const questionsOfType = allQuestions.filter(
    (question) =>
      question.type === type && allowedTopicIds.has(question.topicId),
  );

  validateAvailableQuestionCount(questionsOfType.length, requiredCount, type);

  const allocation = distributeCountByTopic(requiredCount, uniqueTopicIds);

  const selectedQuestions: QuestionInterface[] = [];
  const selectedQuestionIds = new Set<string>();

  /**
   * Lấy số câu được phân bổ cho từng topic.
   */
  uniqueTopicIds.forEach((topicId) => {
    const requestedCount = allocation.get(topicId) ?? 0;

    if (requestedCount <= 0) {
      return;
    }

    const topicQuestions = shuffleArray(
      questionsOfType.filter((question) => question.topicId === topicId),
    );

    topicQuestions.slice(0, requestedCount).forEach((question) => {
      selectedQuestions.push(question);
      selectedQuestionIds.add(question.id);
    });
  });

  /**
   * Nếu có topic không đủ câu thì lấy bù từ các câu còn lại.
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

  if (selectedQuestions.length !== requiredCount) {
    throw new Error(
      `Không thể tạo đủ ${requiredCount} câu loại "${type}". ` +
        `Chỉ chọn được ${selectedQuestions.length} câu.`,
    );
  }

  /**
   * Chỉ trộn thứ tự bên trong cùng một nhóm loại câu hỏi.
   */
  return shuffleArray(selectedQuestions);
};

/**
 * Kiểm tra cấu trúc đề sau khi tạo:
 *
 * - Câu 1 đến 40: multiple_choice
 * - Câu 41 đến 50: true_false
 * - Câu 51 đến 60: fill_in_blank
 */
const validateGeneratedExam = (
  questions: readonly QuestionInterface[],
): void => {
  const expectedTotal =
    MULTIPLE_CHOICE_COUNT + TRUE_FALSE_COUNT + FILL_IN_BLANK_COUNT;

  if (questions.length !== expectedTotal) {
    throw new Error(
      `Đề thi phải có ${expectedTotal} câu nhưng hiện có ` +
        `${questions.length} câu.`,
    );
  }

  questions.forEach((question, index) => {
    const position = index + 1;

    if (
      position <= MULTIPLE_CHOICE_COUNT &&
      question.type !== QuestionType.MULTIPLE_CHOICE
    ) {
      throw new Error(
        `Câu ${position} phải là "${QuestionType.MULTIPLE_CHOICE}" ` +
          `nhưng nhận được "${question.type}". ID: "${question.id}".`,
      );
    }

    if (
      position > MULTIPLE_CHOICE_COUNT &&
      position <= MULTIPLE_CHOICE_COUNT + TRUE_FALSE_COUNT &&
      question.type !== QuestionType.TRUE_FALSE
    ) {
      throw new Error(
        `Câu ${position} phải là "${QuestionType.TRUE_FALSE}" ` +
          `nhưng nhận được "${question.type}". ID: "${question.id}".`,
      );
    }

    if (
      position > MULTIPLE_CHOICE_COUNT + TRUE_FALSE_COUNT &&
      question.type !== QuestionType.FILL_IN_BLANK
    ) {
      throw new Error(
        `Câu ${position} phải là "${QuestionType.FILL_IN_BLANK}" ` +
          `nhưng nhận được "${question.type}". ID: "${question.id}".`,
      );
    }
  });
};

/**
 * Tạo đề thi gồm:
 *
 * - 40 câu đầu: trắc nghiệm
 * - 10 câu tiếp theo: đúng/sai
 * - 10 câu cuối: điền từ
 *
 * Câu hỏi trong từng nhóm được chọn ngẫu nhiên.
 * Đáp án trắc nghiệm và các mệnh đề đúng/sai cũng được trộn.
 *
 * Không trộn lại toàn bộ đề sau khi ghép ba nhóm.
 */
export const generateExamQuestions = (
  allQuestions: readonly QuestionInterface[],
  topicIds: readonly number[],
): QuestionInterface[] => {
  const uniqueTopicIds = getUniqueTopicIds(topicIds);

  if (!uniqueTopicIds.length) {
    throw new Error("Không có topic để tạo đề thi.");
  }

  validateUniqueQuestionIds(allQuestions);

  /**
   * Câu 1 đến 40.
   */
  const multipleChoiceQuestions = selectQuestionsByType(
    allQuestions,
    QuestionType.MULTIPLE_CHOICE,
    MULTIPLE_CHOICE_COUNT,
    uniqueTopicIds,
  ).map((question) =>
    shuffleMultipleChoiceOptions(question as MultipleChoiceQuestionInterface),
  );

  /**
   * Câu 41 đến 50.
   */
  const trueFalseQuestions = selectQuestionsByType(
    allQuestions,
    QuestionType.TRUE_FALSE,
    TRUE_FALSE_COUNT,
    uniqueTopicIds,
  ).map((question) =>
    shuffleTrueFalseItems(question as TrueFalseQuestionInterface),
  );

  /**
   * Câu 51 đến 60.
   */
  const fillInBlankQuestions = selectQuestionsByType(
    allQuestions,
    QuestionType.FILL_IN_BLANK,
    FILL_IN_BLANK_COUNT,
    uniqueTopicIds,
  );

  /**
   * Không dùng shuffleArray tại đây.
   *
   * Nếu trộn toàn bộ mảng này, câu điền từ hoặc đúng/sai
   * có thể xuất hiện trong 40 câu đầu.
   */
  const generatedQuestions: QuestionInterface[] = [
    ...multipleChoiceQuestions,
    ...trueFalseQuestions,
    ...fillInBlankQuestions,
  ];

  validateGeneratedExam(generatedQuestions);

  /**
   * Có thể xóa console.table sau khi kiểm tra xong.
   */
  console.table(
    generatedQuestions.map((question, index) => ({
      position: index + 1,
      id: question.id,
      topicId: question.topicId,
      type: question.type,
    })),
  );

  return generatedQuestions;
};
