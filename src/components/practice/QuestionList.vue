<template>
  <div
    class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <!-- =====================================================
         HEADER
    ====================================================== -->
    <div class="border-b border-slate-200 px-4 py-4">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-semibold text-slate-800">Danh sách câu hỏi</h2>

          <p class="mt-1 text-xs text-slate-500">
            {{ completedCount }}/{{ questions.length }} câu đã làm
          </p>
        </div>

        <button
          type="button"
          class="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 active:bg-red-200"
          @click="emit('reset')"
        >
          Làm lại
        </button>
      </div>
    </div>

    <!-- =====================================================
         QUESTION GRID
    ====================================================== -->
    <div class="max-h-[650px] overflow-y-auto p-4">
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="(question, index) in questions"
          :key="question.id"
          type="button"
          class="flex aspect-square min-h-[42px] items-center justify-center rounded-lg border text-sm font-semibold transition"
          :class="getQuestionClass(question.id)"
          :title="getQuestionTitle(question.id, index)"
          @click="emit('select-question', question.id)"
        >
          {{ index + 1 }}
        </button>
      </div>

      <!-- =====================================================
           LEGEND
      ====================================================== -->
      <div class="mt-5 space-y-2 border-t border-slate-200 pt-4">
        <div class="flex items-center gap-2 text-xs text-slate-600">
          <span class="h-3 w-3 rounded border border-blue-500 bg-blue-50" />

          Câu hiện tại
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-600">
          <span class="h-3 w-3 rounded border border-slate-300 bg-slate-100" />

          Đã trả lời, chưa kiểm tra
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-600">
          <span class="h-3 w-3 rounded bg-emerald-500" />

          Đã kiểm tra, trả lời đúng
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-600">
          <span class="h-3 w-3 rounded bg-red-500" />

          Đã kiểm tra, chưa đúng
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { QuestionType } from "@/pkg/enums/questionType";

import type { QuestionInterface } from "@/pkg/interfaces/question";

import type { UserAnswer } from "@/pkg/interfaces/userAnswer";

/**
 * =========================================================
 * PROPS
 * =========================================================
 */

const props = defineProps<{
  questions: QuestionInterface[];

  selectedQuestionId: string | null;

  userAnswers: Record<string, UserAnswer>;
}>();

/**
 * =========================================================
 * EMITS
 * =========================================================
 */

const emit = defineEmits<{
  "select-question": [questionId: string];

  reset: [];
}>();

/**
 * =========================================================
 * GET QUESTION
 * =========================================================
 */

const getQuestionById = (questionId: string): QuestionInterface | undefined => {
  return props.questions.find((question) => question.id === questionId);
};

/**
 * =========================================================
 * ANSWERED
 * =========================================================
 *
 * Kiểm tra question đã có câu trả lời hay chưa.
 *
 * Với Situation:
 * phải kiểm tra answers[] thay vì chỉ
 * kiểm tra object cha tồn tại.
 */

const isAnswerStarted = (answer: UserAnswer): boolean => {
  switch (answer.type) {
    /**
     * Multiple choice:
     * đã chọn option.
     */
    case QuestionType.MULTIPLE_CHOICE:
      return typeof answer.selectedOptionId === "number";

    /**
     * True / False:
     * đã có ít nhất một answer.
     */
    case QuestionType.TRUE_FALSE:
      return answer.answers.length > 0;

    /**
     * Fill in blank:
     * có nội dung.
     */
    case QuestionType.FILL_IN_BLANK:
      return answer.value.trim().length > 0;

    /**
     * Situation:
     * chỉ cần có ít nhất một
     * sub-question được chọn.
     */
    case QuestionType.SITUATION:
      return answer.answers.some(
        (item) => typeof item.selectedOptionId === "number",
      );

    default:
      return false;
  }
};

/**
 * =========================================================
 * COMPLETED COUNT
 * =========================================================
 */

const completedCount = computed(() => {
  return props.questions.filter((question) => {
    const answer = props.userAnswers[question.id];

    if (!answer) {
      return false;
    }

    return isAnswerStarted(answer);
  }).length;
});

/**
 * =========================================================
 * IS ANSWER CHECKED
 * =========================================================
 *
 * Đây là phần sửa lỗi chính.
 *
 * Không còn dùng trực tiếp:
 *
 * answer.isChecked
 *
 * vì SituationUserAnswer không có
 * isChecked ở cấp cha.
 */

const isAnswerChecked = (answer: UserAnswer): boolean => {
  switch (answer.type) {
    case QuestionType.MULTIPLE_CHOICE:
      return answer.isChecked;

    case QuestionType.TRUE_FALSE:
      return answer.isChecked;

    case QuestionType.FILL_IN_BLANK:
      return answer.isChecked;

    case QuestionType.SITUATION: {
      /**
       * Situation chưa có answer nào.
       */
      if (answer.answers.length === 0) {
        return false;
      }

      /**
       * Lấy question gốc để biết
       * Situation có bao nhiêu câu con.
       */
      const question = getQuestionById(answer.questionId);

      if (!question || question.type !== QuestionType.SITUATION) {
        return false;
      }

      /**
       * Chỉ coi toàn bộ Situation
       * là "đã kiểm tra" khi:
       *
       * - có đủ answer cho các câu con
       * - tất cả đều isChecked
       *
       * Ví dụ:
       *
       * Situation có 3 câu.
       * mới làm q1 => chưa hoàn tất block.
       *
       * làm đủ q1 q2 q3 và check hết
       * => checked.
       */
      return question.questions.every((subQuestion) => {
        const subAnswer = answer.answers.find(
          (item) => item.questionId === subQuestion.id,
        );

        return subAnswer?.isChecked === true;
      });
    }

    default:
      return false;
  }
};

/**
 * =========================================================
 * ANSWER CORRECT
 * =========================================================
 */

const isAnswerCorrect = (answer: UserAnswer): boolean => {
  switch (answer.type) {
    /**
     * MULTIPLE CHOICE
     */
    case QuestionType.MULTIPLE_CHOICE:
      return answer.isCorrect;

    /**
     * TRUE / FALSE
     */
    case QuestionType.TRUE_FALSE: {
      const question = getQuestionById(answer.questionId);

      if (!question || question.type !== QuestionType.TRUE_FALSE) {
        return false;
      }

      return answer.correctCount === question.items.length;
    }

    /**
     * FILL IN BLANK
     */
    case QuestionType.FILL_IN_BLANK:
      return answer.isCorrect;

    /**
     * SITUATION
     */
    case QuestionType.SITUATION: {
      const question = getQuestionById(answer.questionId);

      if (!question || question.type !== QuestionType.SITUATION) {
        return false;
      }

      /**
       * Situation chỉ hiển thị màu xanh
       * cho cả block khi:
       *
       * - tất cả câu con đều có answer
       * - tất cả đều checked
       * - tất cả đều correct
       *
       * Việc này CHỈ dùng cho màu
       * QuestionList.
       *
       * Không ảnh hưởng cách tính điểm
       * từng câu con trong Exam.
       */
      return question.questions.every((subQuestion) => {
        const subAnswer = answer.answers.find(
          (item) => item.questionId === subQuestion.id,
        );

        return (
          subAnswer !== undefined &&
          subAnswer.isChecked === true &&
          subAnswer.isCorrect === true
        );
      });
    }

    default:
      return false;
  }
};

/**
 * =========================================================
 * SITUATION PROGRESS
 * =========================================================
 */

const getSituationProgress = (
  answer: UserAnswer,
): {
  answered: number;
  checked: number;
  correct: number;
  total: number;
} | null => {
  if (answer.type !== QuestionType.SITUATION) {
    return null;
  }

  const question = getQuestionById(answer.questionId);

  if (!question || question.type !== QuestionType.SITUATION) {
    return null;
  }

  let answered = 0;
  let checked = 0;
  let correct = 0;

  for (const subQuestion of question.questions) {
    const subAnswer = answer.answers.find(
      (item) => item.questionId === subQuestion.id,
    );

    if (!subAnswer) {
      continue;
    }

    if (typeof subAnswer.selectedOptionId === "number") {
      answered++;
    }

    if (subAnswer.isChecked) {
      checked++;
    }

    if (subAnswer.isChecked && subAnswer.isCorrect) {
      correct++;
    }
  }

  return {
    answered,
    checked,
    correct,
    total: question.questions.length,
  };
};

/**
 * =========================================================
 * QUESTION CLASS
 * =========================================================
 */

const getQuestionClass = (questionId: string): string => {
  const isSelected = props.selectedQuestionId === questionId;

  const answer = props.userAnswers[questionId];

  /**
   * Current question luôn ưu tiên
   * màu xanh.
   */
  if (isSelected) {
    return [
      "border-blue-600",
      "bg-blue-600",
      "text-white",
      "ring-2",
      "ring-blue-200",
    ].join(" ");
  }

  /**
   * Chưa trả lời.
   */
  if (!answer || !isAnswerStarted(answer)) {
    return [
      "border-slate-200",
      "bg-white",
      "text-slate-600",
      "hover:border-blue-300",
      "hover:bg-blue-50",
    ].join(" ");
  }

  /**
   * Đã trả lời nhưng
   * chưa kiểm tra hoàn tất.
   */
  if (!isAnswerChecked(answer)) {
    return [
      "border-slate-300",
      "bg-slate-100",
      "text-slate-700",
      "hover:border-blue-300",
    ].join(" ");
  }

  /**
   * Đã kiểm tra + đúng.
   */
  if (isAnswerCorrect(answer)) {
    return ["border-emerald-500", "bg-emerald-500", "text-white"].join(" ");
  }

  /**
   * Đã kiểm tra + sai.
   */
  return ["border-red-500", "bg-red-500", "text-white"].join(" ");
};

/**
 * =========================================================
 * QUESTION TITLE
 * =========================================================
 */

const getQuestionTitle = (questionId: string, index: number): string => {
  const answer = props.userAnswers[questionId];

  const questionNumber = index + 1;

  /**
   * Chưa làm.
   */
  if (!answer || !isAnswerStarted(answer)) {
    return `Câu ${questionNumber}: Chưa làm`;
  }

  /**
   * Situation:
   * hiển thị progress chi tiết.
   */
  if (answer.type === QuestionType.SITUATION) {
    const progress = getSituationProgress(answer);

    if (!progress) {
      return `Câu ${questionNumber}: Chưa làm`;
    }

    /**
     * Chưa kiểm tra hết.
     */
    if (!isAnswerChecked(answer)) {
      return [
        `Câu ${questionNumber}`,
        `Đã làm ${progress.answered}/${progress.total}`,
        `Đã kiểm tra ${progress.checked}/${progress.total}`,
      ].join(" · ");
    }

    /**
     * Đúng toàn bộ.
     */
    if (isAnswerCorrect(answer)) {
      return [
        `Câu ${questionNumber}`,
        `Đúng ${progress.correct}/${progress.total}`,
      ].join(" · ");
    }

    /**
     * Có câu sai.
     */
    return [
      `Câu ${questionNumber}`,
      `Đúng ${progress.correct}/${progress.total}`,
      `Sai ${progress.total - progress.correct}`,
    ].join(" · ");
  }

  /**
   * Normal question chưa check.
   */
  if (!isAnswerChecked(answer)) {
    return `Câu ${questionNumber}: Chưa kiểm tra`;
  }

  /**
   * Normal question checked.
   */
  return isAnswerCorrect(answer)
    ? `Câu ${questionNumber}: Chính xác`
    : `Câu ${questionNumber}: Chưa chính xác`;
};
</script>
