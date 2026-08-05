<template>
  <div>
    <h2 class="text-lg font-semibold leading-7 text-slate-800">
      {{ question.content }}
    </h2>

    <div class="mt-6 space-y-3">
      <button
        v-for="(option, index) in shuffledItems"
        :key="option.id"
        type="button"
        class="flex w-full items-start gap-3 rounded-xl border p-4 text-left transition"
        :class="getOptionClass(option)"
        :disabled="reviewMode"
        @click="selectOption(option.id)"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          :class="getOptionLabelClass(option)"
        >
          {{ getOptionLabel(index) }}
        </span>

        <span class="pt-1 text-sm leading-6">
          {{ option.content }}
        </span>
      </button>
    </div>

    <!-- Thông báo kết quả -->
    <div
      v-if="showResult"
      class="mt-6 rounded-xl border p-4"
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
        <template v-if="selectedOptionId === null">
          Bạn chưa trả lời câu hỏi này.
        </template>

        <template v-else-if="isCorrect">
          Chính xác!
        </template>

        <template v-else>
          Đáp án bạn chọn chưa chính xác.
        </template>
      </p>

      <p
        v-if="correctOption"
        class="mt-2 text-sm text-slate-700"
      >
        Đáp án đúng:
        <span class="font-semibold text-emerald-700">
          {{ correctOption.content }}
        </span>
      </p>
    </div>

    <!-- Nút kiểm tra chỉ dùng trong practice -->
    <div
      v-if="!examMode && !reviewMode"
      class="mt-6 flex justify-end"
    >
      <button
        type="button"
        class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="selectedOptionId === null"
        @click="checkAnswer"
      >
        Kiểm tra đáp án
      </button>
    </div>

    <!-- Trạng thái trong bài thi -->
    <div
      v-else-if="examMode"
      class="mt-6 flex justify-end"
    >
      <span
        v-if="selectedOptionId !== null"
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
      <p class="text-sm font-semibold text-slate-800">
        Giải thích
      </p>

      <p class="mt-1 text-sm leading-6 text-slate-600">
        {{ question.explanation }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { QuestionType } from "@/pkg/enums/questionType";
import type {
  MultipleChoiceOptionInterface,
  MultipleChoiceQuestionInterface,
} from "@/pkg/interfaces/question";
import type { MultipleChoiceUserAnswer } from "@/pkg/interfaces/userAnswer";

const props = withDefaults(
  defineProps<{
    question: MultipleChoiceQuestionInterface;
    initialAnswer: MultipleChoiceUserAnswer | null;
    examMode?: boolean;
    reviewMode?: boolean;
  }>(),
  {
    examMode: false,
    reviewMode: false,
  },
);

const emit = defineEmits<{
  answer: [payload: MultipleChoiceUserAnswer];
}>();

const selectedOptionId = ref<number | null>(null);
const isChecked = ref(false);

const shuffledItems = ref<MultipleChoiceOptionInterface[]>([]);

/**
 * Sau khi nộp hoặc sau khi bấm kiểm tra trong practice
 * thì hiển thị kết quả.
 */
const showResult = computed(() => {
  return props.reviewMode || isChecked.value;
});

/**
 * Phương án người dùng đã chọn.
 */
const selectedOption = computed(() => {
  if (selectedOptionId.value === null) {
    return null;
  }

  return (
    props.question.items.find(
      (option) =>
        option.id === selectedOptionId.value,
    ) ?? null
  );
});

/**
 * Phương án đúng.
 */
const correctOption = computed(() => {
  return (
    props.question.items.find(
      (option) => option.isCorrect,
    ) ?? null
  );
});

/**
 * Người dùng trả lời đúng hay không.
 */
const isCorrect = computed(() => {
  return selectedOption.value?.isCorrect === true;
});

/**
 * Trộn mảng bằng Fisher–Yates.
 */
const shuffleItems = (
  items: MultipleChoiceOptionInterface[],
): MultipleChoiceOptionInterface[] => {
  const result = [...items];

  for (
    let index = result.length - 1;
    index > 0;
    index--
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index],
    ];
  }

  return result;
};

/**
 * Trộn các phương án của câu hiện tại.
 */
const refreshShuffledItems = () => {
  shuffledItems.value = shuffleItems(
    props.question.items,
  );
};

/**
 * Chuyển index thành A, B, C, D...
 */
const getOptionLabel = (
  index: number,
): string => {
  return String.fromCharCode(65 + index);
};

/**
 * Chọn một phương án.
 */
const selectOption = (
  optionId: number,
) => {
  if (props.reviewMode) {
    return;
  }

  const option = props.question.items.find(
    (item) => item.id === optionId,
  );

  if (!option) {
    return;
  }

  selectedOptionId.value = optionId;

  // Khi thay đổi đáp án trong practice,
  // hủy trạng thái kiểm tra cũ.
  isChecked.value = false;

  emitAnswer(option, false);
};

/**
 * Kiểm tra đáp án trong practice.
 */
const checkAnswer = () => {
  if (
    props.examMode ||
    props.reviewMode ||
    selectedOptionId.value === null
  ) {
    return;
  }

  const option = props.question.items.find(
    (item) =>
      item.id === selectedOptionId.value,
  );

  if (!option) {
    return;
  }

  isChecked.value = true;

  emitAnswer(option, true);
};

/**
 * Emit đáp án lên component cha.
 */
const emitAnswer = (
  option: MultipleChoiceOptionInterface,
  checked: boolean,
) => {
  emit("answer", {
    questionId: props.question.id,
    type: QuestionType.MULTIPLE_CHOICE,
    selectedOptionId: option.id,

    // Trong chế độ thi luôn là false.
    isChecked: props.examMode
      ? false
      : checked,

    isCorrect: option.isCorrect,
  });
};

/**
 * Class của toàn bộ phương án.
 */
const getOptionClass = (
  option: MultipleChoiceOptionInterface,
): string => {
  const isSelected =
    selectedOptionId.value === option.id;

  /**
   * Chế độ thi:
   * chỉ hiển thị phương án đã chọn bằng màu xanh dương.
   */
  if (props.examMode) {
    return isSelected
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50";
  }

  /**
   * Chưa kiểm tra trong practice.
   */
  if (!showResult.value) {
    return isSelected
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50";
  }

  /**
   * Sau khi kiểm tra hoặc sau khi nộp:
   * đáp án đúng luôn màu xanh lá.
   */
  if (option.isCorrect) {
    return "border-emerald-500 bg-emerald-50 text-emerald-700";
  }

  /**
   * Phương án sai mà người dùng chọn có màu đỏ.
   */
  if (isSelected) {
    return "border-red-500 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-white text-slate-500";
};

/**
 * Class của vòng tròn A, B, C, D.
 */
const getOptionLabelClass = (
  option: MultipleChoiceOptionInterface,
): string => {
  const isSelected =
    selectedOptionId.value === option.id;

  if (props.examMode) {
    return isSelected
      ? "bg-blue-600 text-white"
      : "bg-slate-100 text-slate-600";
  }

  if (!showResult.value) {
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
 * Khôi phục đáp án khi quay lại câu hỏi.
 */
const restoreAnswer = () => {
  selectedOptionId.value =
    props.initialAnswer?.selectedOptionId ?? null;

  /**
   * Trong exam không hiển thị trạng thái check.
   * Trong review luôn dùng showResult từ reviewMode.
   */
  isChecked.value =
    props.examMode || props.reviewMode
      ? false
      : (props.initialAnswer?.isChecked ?? false);
};

/**
 * Trộn phương án khi chuyển sang câu mới.
 *
 * Không watch initialAnswer ở đây để tránh trộn lại
 * sau mỗi lần người dùng chọn phương án.
 */
watch(
  () => props.question.id,
  refreshShuffledItems,
  {
    immediate: true,
  },
);

/**
 * Khôi phục đáp án khi:
 * - chuyển câu;
 * - dữ liệu localStorage thay đổi;
 * - chuyển từ exam sang review sau khi nộp.
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