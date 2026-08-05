<template>
  <div>
    <h2 class="text-lg font-semibold leading-7 text-slate-800">
      {{ question.content }}
    </h2>

    <div class="mt-6">
      <label
        :for="`answer-${question.id}`"
        class="mb-2 block text-sm font-semibold text-slate-700"
      >
        Câu trả lời
      </label>

      <input
        :id="`answer-${question.id}`"
        v-model="answer"
        type="text"
        autocomplete="off"
        placeholder="Nhập câu trả lời..."
        class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed"
        :class="inputClass"
        :disabled="reviewMode"
        @input="handleInput"
        @keyup.enter="handleEnter"
      />

      <!-- Kết quả -->
      <div
        v-if="showResult"
        class="mt-4 rounded-xl border p-4"
        :class="
          isCorrect
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-red-200 bg-red-50'
        "
      >
        <p
          class="text-sm font-semibold"
          :class="isCorrect ? 'text-emerald-700' : 'text-red-700'"
        >
          <template v-if="!answer.trim()">
            Bạn chưa trả lời câu hỏi này.
          </template>

          <template v-else-if="isCorrect"> Chính xác! </template>

          <template v-else> Câu trả lời chưa chính xác. </template>
        </p>

        <p class="mt-2 text-sm text-slate-700">
          Đáp án đúng:
          <span class="font-semibold text-emerald-700">
            {{ question.answer }}
          </span>
        </p>
      </div>
    </div>

    <!-- Nút kiểm tra trong practice -->
    <div v-if="!examMode && !reviewMode" class="mt-6 flex justify-end">
      <button
        type="button"
        class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!answer.trim()"
        @click="checkAnswer"
      >
        Kiểm tra đáp án
      </button>
    </div>

    <!-- Trạng thái trong bài thi -->
    <div v-else-if="examMode" class="mt-6 flex justify-end">
      <span
        v-if="answer.trim()"
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

    <!-- Giải thích -->
    <div
      v-if="showResult && question.explanation"
      class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <p class="text-sm font-semibold text-slate-800">Giải thích</p>

      <p class="mt-1 text-sm leading-6 text-slate-600">
        {{ question.explanation }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { QuestionType } from "@/pkg/enums/questionType";
import type { FillInBlankQuestionInterface } from "@/pkg/interfaces/question";
import type { FillInBlankUserAnswer } from "@/pkg/interfaces/userAnswer";

const props = withDefaults(
  defineProps<{
    question: FillInBlankQuestionInterface;
    initialAnswer: FillInBlankUserAnswer | null;
    examMode?: boolean;
    reviewMode?: boolean;
  }>(),
  {
    examMode: false,
    reviewMode: false,
  },
);

const emit = defineEmits<{
  answer: [payload: FillInBlankUserAnswer];
}>();

const answer = ref("");
const isChecked = ref(false);

/**
 * Hiển thị kết quả khi:
 * - đã bấm kiểm tra trong practice;
 * - đang ở chế độ xem lại sau khi nộp.
 */
const showResult = computed(() => {
  return props.reviewMode || isChecked.value;
});

/**
 * Chuẩn hóa câu trả lời.
 */
const normalizeAnswer = (value: string): string => {
  return value.trim().toLocaleLowerCase("vi-VN").replace(/\s+/g, " ");
};

/**
 * Kiểm tra đúng/sai.
 */
const isCorrect = computed(() => {
  return (
    normalizeAnswer(answer.value) === normalizeAnswer(props.question.answer)
  );
});

/**
 * Class của input.
 */
const inputClass = computed(() => {
  /**
   * Chế độ thi:
   * chỉ hiển thị trạng thái đã nhập, không tiết lộ kết quả.
   */
  if (props.examMode) {
    return answer.value.trim()
      ? "border-blue-400 bg-blue-50/40 text-slate-800 focus:border-blue-500 focus:ring-blue-100"
      : "border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-blue-100";
  }

  /**
   * Chưa kiểm tra trong practice.
   */
  if (!showResult.value) {
    return "border-slate-300 bg-white text-slate-800 focus:border-blue-500 focus:ring-blue-100";
  }

  /**
   * Sau khi kiểm tra hoặc xem lại.
   */
  return isCorrect.value
    ? "border-emerald-500 bg-emerald-50 text-emerald-700 focus:border-emerald-500 focus:ring-emerald-100"
    : "border-red-500 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-100";
});

/**
 * Emit đáp án lên component cha.
 */
const emitAnswer = (checked: boolean) => {
  emit("answer", {
    questionId: props.question.id,
    type: QuestionType.FILL_IN_BLANK,
    value: answer.value,

    // Trong chế độ thi luôn chưa kiểm tra.
    isChecked: props.examMode ? false : checked,

    isCorrect: isCorrect.value,
  });
};

/**
 * Khi người dùng nhập.
 */
const handleInput = () => {
  if (props.reviewMode) {
    return;
  }

  isChecked.value = false;

  emitAnswer(false);
};

/**
 * Kiểm tra trong practice.
 */
const checkAnswer = () => {
  if (props.examMode || props.reviewMode || !answer.value.trim()) {
    return;
  }

  isChecked.value = true;

  emitAnswer(true);
};

/**
 * Nhấn Enter.
 */
const handleEnter = () => {
  if (props.examMode || props.reviewMode) {
    return;
  }

  checkAnswer();
};

/**
 * Khôi phục câu trả lời đã lưu.
 */
const restoreAnswer = () => {
  answer.value = props.initialAnswer?.value ?? "";

  isChecked.value =
    props.examMode || props.reviewMode
      ? false
      : (props.initialAnswer?.isChecked ?? false);
};

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
