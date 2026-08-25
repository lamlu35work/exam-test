<template>
  <div>
    <!-- =========================
         TÌNH HUỐNG
    ========================== -->
    <div class="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
      <div class="flex items-start gap-3">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white"
        >
          TH
        </div>

        <div class="min-w-0">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-blue-600"
          >
            Đọc tình huống sau và trả lời các câu hỏi
          </p>

          <p
            class="mt-2 whitespace-pre-line text-base leading-7 text-slate-800"
          >
            {{ question.content }}
          </p>
        </div>
      </div>
    </div>

    <!-- =========================
         CÁC CÂU HỎI CON
    ========================== -->
    <div class="mt-8 space-y-10">
      <section
        v-for="(subQuestion, questionIndex) in question.questions"
        :key="subQuestion.id"
        class="rounded-2xl border border-slate-200 bg-white p-5"
      >
        <!-- Tiêu đề câu -->
        <div class="flex items-start gap-3">
          <span
            class="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-2 text-sm font-bold text-slate-700"
          >
            {{ questionIndex + 1 }}
          </span>

          <h3 class="pt-1 text-base font-semibold leading-7 text-slate-800">
            {{ subQuestion.content }}
          </h3>
        </div>

        <!-- =========================
             OPTIONS
        ========================== -->
        <div class="mt-5 space-y-3">
          <button
            v-for="(option, optionIndex) in getShuffledItems(subQuestion.id)"
            :key="option.id"
            type="button"
            class="flex w-full items-start gap-3 rounded-xl border p-4 text-left transition"
            :class="getOptionClass(subQuestion.id, option)"
            :disabled="reviewMode"
            @click="selectOption(subQuestion.id, option.id)"
          >
            <!-- A / B / C / D -->
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              :class="getOptionLabelClass(subQuestion.id, option)"
            >
              {{ getOptionLabel(optionIndex) }}
            </span>

            <span class="pt-1 text-sm leading-6">
              {{ option.content }}
            </span>
          </button>
        </div>

        <!-- =========================
             RESULT
        ========================== -->
        <div
          v-if="shouldShowResult(subQuestion.id)"
          class="mt-5 rounded-xl border p-4"
          :class="
            isSubQuestionCorrect(subQuestion.id)
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-red-200 bg-red-50'
          "
        >
          <p
            class="text-sm font-semibold"
            :class="
              isSubQuestionCorrect(subQuestion.id)
                ? 'text-emerald-700'
                : 'text-red-700'
            "
          >
            <template v-if="getSelectedOptionId(subQuestion.id) === null">
              Bạn chưa trả lời câu hỏi này.
            </template>

            <template v-else-if="isSubQuestionCorrect(subQuestion.id)">
              Chính xác!
            </template>

            <template v-else> Đáp án bạn chọn chưa chính xác. </template>
          </p>

          <p
            v-if="getCorrectOption(subQuestion.id)"
            class="mt-2 text-sm text-slate-700"
          >
            Đáp án đúng:

            <span class="font-semibold text-emerald-700">
              {{ getCorrectOption(subQuestion.id)?.content }}
            </span>
          </p>
        </div>

        <!-- =========================
             PRACTICE: CHECK
        ========================== -->
        <div v-if="!examMode && !reviewMode" class="mt-5 flex justify-end">
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="getSelectedOptionId(subQuestion.id) === null"
            @click="checkAnswer(subQuestion.id)"
          >
            Kiểm tra đáp án
          </button>
        </div>

        <!-- =========================
             EXAM STATUS
        ========================== -->
        <div v-else-if="examMode" class="mt-5 flex justify-end">
          <span
            v-if="getSelectedOptionId(subQuestion.id) !== null"
            class="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700"
          >
            Đã trả lời
          </span>

          <span
            v-else
            class="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700"
          >
            Chưa trả lời
          </span>
        </div>

        <!-- =========================
             EXPLANATION
        ========================== -->
        <div
          v-if="shouldShowResult(subQuestion.id) && subQuestion.explanation"
          class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <p class="text-sm font-semibold text-slate-800">Giải thích</p>

          <p class="mt-1 text-sm leading-6 text-slate-600">
            {{ subQuestion.explanation }}
          </p>
        </div>
      </section>
    </div>

    <!-- =========================
         PROGRESS
    ========================== -->
    <div
      v-if="examMode"
      class="mt-8 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
    >
      <p class="text-sm text-slate-600">Tiến độ tình huống</p>

      <p class="text-sm font-semibold text-slate-800">
        {{ answeredCount }}/{{ question.questions.length }}
        câu
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";

import { QuestionType } from "@/pkg/enums/questionType";

import type {
  MultipleChoiceOptionInterface,
  SituationQuestionInterface,
} from "@/pkg/interfaces/question";

import type {
  SituationUserAnswer,
  SituationQuestionAnswerItem,
} from "@/pkg/interfaces/userAnswer";

/**
 * Props
 */
const props = withDefaults(
  defineProps<{
    question: SituationQuestionInterface;
    initialAnswer: SituationUserAnswer | null;
    examMode?: boolean;
    reviewMode?: boolean;
  }>(),
  {
    examMode: false,
    reviewMode: false,
  },
);

/**
 * Emits
 */
const emit = defineEmits<{
  answer: [payload: SituationUserAnswer];
}>();

/**
 * Đáp án hiện tại của từng câu con.
 *
 * Key = subQuestion.id
 */
const answers = reactive<Record<string, SituationQuestionAnswerItem>>({});

/**
 * Danh sách phương án đã được shuffle.
 *
 * Mỗi câu con giữ thứ tự shuffle riêng,
 * tránh shuffle lại sau mỗi lần chọn.
 */
const shuffledItems = reactive<Record<string, MultipleChoiceOptionInterface[]>>(
  {},
);

/**
 * Fisher-Yates shuffle.
 */
const shuffleItems = (
  items: MultipleChoiceOptionInterface[],
): MultipleChoiceOptionInterface[] => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
};

/**
 * Khởi tạo shuffled options cho tất cả câu con.
 */
const refreshShuffledItems = () => {
  Object.keys(shuffledItems).forEach((key) => {
    delete shuffledItems[key];
  });

  props.question.questions.forEach((subQuestion) => {
    shuffledItems[subQuestion.id] = shuffleItems(subQuestion.items);
  });
};

/**
 * Lấy options đã shuffle.
 */
const getShuffledItems = (
  questionId: string,
): MultipleChoiceOptionInterface[] => {
  return shuffledItems[questionId] ?? [];
};

/**
 * A, B, C, D...
 */
const getOptionLabel = (index: number): string => {
  return String.fromCharCode(65 + index);
};

/**
 * Lấy answer của câu con.
 */
const getAnswer = (questionId: string): SituationQuestionAnswerItem | null => {
  return answers[questionId] ?? null;
};

/**
 * Option id đang chọn.
 */
const getSelectedOptionId = (questionId: string): number | null => {
  return getAnswer(questionId)?.selectedOptionId ?? null;
};

/**
 * Lấy câu hỏi con.
 */
const getSubQuestion = (questionId: string) => {
  return (
    props.question.questions.find((item) => item.id === questionId) ?? null
  );
};

/**
 * Lấy option đúng.
 */
const getCorrectOption = (
  questionId: string,
): MultipleChoiceOptionInterface | null => {
  const subQuestion = getSubQuestion(questionId);

  if (!subQuestion) {
    return null;
  }

  return subQuestion.items.find((option) => option.isCorrect) ?? null;
};

/**
 * Kiểm tra câu con trả lời đúng.
 */
const isSubQuestionCorrect = (questionId: string): boolean => {
  const subQuestion = getSubQuestion(questionId);

  if (!subQuestion) {
    return false;
  }

  const selectedOptionId = getSelectedOptionId(questionId);

  if (selectedOptionId === null) {
    return false;
  }

  return (
    subQuestion.items.find((option) => option.id === selectedOptionId)
      ?.isCorrect === true
  );
};

/**
 * Có hiển thị kết quả câu con không.
 */
const shouldShowResult = (questionId: string): boolean => {
  if (props.reviewMode) {
    return true;
  }

  return getAnswer(questionId)?.isChecked === true;
};

/**
 * Người dùng chọn option.
 */
const selectOption = (questionId: string, optionId: number) => {
  if (props.reviewMode) {
    return;
  }

  const subQuestion = getSubQuestion(questionId);

  if (!subQuestion) {
    return;
  }

  const option = subQuestion.items.find((item) => item.id === optionId);

  if (!option) {
    return;
  }

  answers[questionId] = {
    questionId,
    selectedOptionId: optionId,

    /**
     * Đổi đáp án trong practice
     * -> reset trạng thái checked.
     */
    isChecked: false,

    isCorrect: option.isCorrect,
  };

  emitAnswer();
};

/**
 * Practice mode:
 * kiểm tra riêng một câu con.
 */
const checkAnswer = (questionId: string) => {
  if (props.examMode || props.reviewMode) {
    return;
  }

  const answer = getAnswer(questionId);

  if (!answer || answer.selectedOptionId === null) {
    return;
  }

  answer.isChecked = true;

  emitAnswer();
};

/**
 * Emit toàn bộ đáp án của tình huống.
 */
const emitAnswer = () => {
  emit("answer", {
    questionId: props.question.id,
    type: QuestionType.SITUATION,

    answers: props.question.questions.map((subQuestion) => {
      const answer = answers[subQuestion.id];

      return {
        questionId: subQuestion.id,

        selectedOptionId: answer?.selectedOptionId ?? null,

        /**
         * Trong exam luôn false.
         */
        isChecked: props.examMode ? false : (answer?.isChecked ?? false),

        isCorrect: answer?.isCorrect ?? false,
      };
    }),
  });
};

/**
 * Class option.
 */
const getOptionClass = (
  questionId: string,
  option: MultipleChoiceOptionInterface,
): string => {
  const selectedOptionId = getSelectedOptionId(questionId);

  const isSelected = selectedOptionId === option.id;

  /**
   * EXAM MODE
   */
  if (props.examMode) {
    return isSelected
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50";
  }

  /**
   * PRACTICE chưa check
   */
  if (!shouldShowResult(questionId)) {
    return isSelected
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50";
  }

  /**
   * Đáp án đúng
   */
  if (option.isCorrect) {
    return "border-emerald-500 bg-emerald-50 text-emerald-700";
  }

  /**
   * User chọn sai
   */
  if (isSelected) {
    return "border-red-500 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-white text-slate-500";
};

/**
 * Class vòng tròn A B C D.
 */
const getOptionLabelClass = (
  questionId: string,
  option: MultipleChoiceOptionInterface,
): string => {
  const isSelected = getSelectedOptionId(questionId) === option.id;

  if (props.examMode) {
    return isSelected
      ? "bg-blue-600 text-white"
      : "bg-slate-100 text-slate-600";
  }

  if (!shouldShowResult(questionId)) {
    return isSelected
      ? "bg-blue-600 text-white"
      : "bg-slate-100 text-slate-600";
  }

  if (option.isCorrect) {
    return "bg-emerald-600 text-white";
  }

  if (isSelected) {
    return "bg-red-600 text-white";
  }

  return "bg-slate-100 text-slate-500";
};

/**
 * Số câu con đã trả lời.
 */
const answeredCount = computed(() => {
  return props.question.questions.filter(
    (subQuestion) => getSelectedOptionId(subQuestion.id) !== null,
  ).length;
});

/**
 * Restore answer.
 */
const restoreAnswer = () => {
  /**
   * Clear answer cũ.
   */
  Object.keys(answers).forEach((key) => {
    delete answers[key];
  });

  props.question.questions.forEach((subQuestion) => {
    const storedAnswer = props.initialAnswer?.answers.find(
      (answer) => answer.questionId === subQuestion.id,
    );

    if (storedAnswer) {
      answers[subQuestion.id] = {
        questionId: subQuestion.id,

        selectedOptionId: storedAnswer.selectedOptionId,

        isChecked:
          props.examMode || props.reviewMode ? false : storedAnswer.isChecked,

        isCorrect: storedAnswer.isCorrect,
      };

      return;
    }

    answers[subQuestion.id] = {
      questionId: subQuestion.id,

      selectedOptionId: null,
      isChecked: false,
      isCorrect: false,
    };
  });
};

/**
 * Chỉ shuffle khi chuyển sang
 * Situation khác.
 */
watch(() => props.question.id, refreshShuffledItems, {
  immediate: true,
});

/**
 * Restore khi đổi:
 *
 * - situation
 * - initialAnswer
 * - examMode
 * - reviewMode
 */
watch(
  [
    () => props.question.id,
    () => props.initialAnswer,
    () => props.examMode,
    () => props.reviewMode,
  ],
  restoreAnswer,
  {
    immediate: true,
    deep: true,
  },
);
</script>
