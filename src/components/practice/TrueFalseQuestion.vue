<template>
  <div>
    <h2 class="text-lg font-semibold leading-7 text-slate-800">
      {{ question.content }}
    </h2>

    <div class="mt-6 space-y-4">
      <div
        v-for="(item, index) in shuffledItems"
        :key="item.id"
        class="rounded-xl border p-4 transition"
        :class="getItemClass(item.id, item.isTrue)"
      >
        <div class="flex items-start gap-3">
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600"
          >
            {{ String.fromCharCode(97 + index) }}
          </span>

          <div class="flex-1">
            <p class="pt-1 text-sm leading-6 text-slate-700">
              {{ item.content }}
            </p>

            <p
              v-if="showResult"
              class="mt-2 text-xs font-semibold"
              :class="
                isItemCorrect(item.id, item.isTrue)
                  ? 'text-emerald-600'
                  : 'text-red-600'
              "
            >
              {{
                isItemCorrect(item.id, item.isTrue)
                  ? "Chính xác"
                  : `Sai — đáp án đúng là ${item.isTrue ? "Đúng" : "Sai"}`
              }}
            </p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 pl-11">
          <button
            type="button"
            class="rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
            :class="getAnswerButtonClass(item.id, true, item.isTrue)"
            :disabled="reviewMode"
            @click="selectAnswer(item.id, true)"
          >
            Đúng
          </button>

          <button
            type="button"
            class="rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
            :class="getAnswerButtonClass(item.id, false, item.isTrue)"
            :disabled="reviewMode"
            @click="selectAnswer(item.id, false)"
          >
            Sai
          </button>
        </div>
      </div>
    </div>

    <div
      class="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
    >
      <div>
        <p class="text-sm text-slate-600">
          Đã chọn
          <span class="font-semibold text-slate-800">
            {{ answeredCount }}/{{ question.items.length }}
          </span>
          mệnh đề
        </p>

        <p
          v-if="showResult"
          class="mt-1 text-sm font-semibold"
          :class="
            correctCount === question.items.length
              ? 'text-emerald-600'
              : 'text-red-600'
          "
        >
          Đúng {{ correctCount }}/{{ question.items.length }} mệnh đề
        </p>
      </div>

      <button
        v-if="!examMode && !reviewMode"
        type="button"
        class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!isCompleted"
        @click="checkAnswer"
      >
        Kiểm tra đáp án
      </button>

      <span
        v-else-if="examMode && isCompleted"
        class="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700"
      >
        Đã trả lời
      </span>

      <span
        v-else-if="examMode"
        class="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700"
      >
        Chưa hoàn thành
      </span>
    </div>

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
import { computed, reactive, ref, watch } from "vue";

import { QuestionType } from "@/pkg/enums/questionType";
import type {
  TrueFalseItemInterface,
  TrueFalseQuestionInterface,
} from "@/pkg/interfaces/question";
import type {
  TrueFalseAnswerItem,
  TrueFalseUserAnswer,
} from "@/pkg/interfaces/userAnswer";

const props = withDefaults(
  defineProps<{
    question: TrueFalseQuestionInterface;
    initialAnswer: TrueFalseUserAnswer | null;
    examMode?: boolean;
    reviewMode?: boolean;
  }>(),
  {
    examMode: false,
    reviewMode: false,
  },
);

const emit = defineEmits<{
  answer: [payload: TrueFalseUserAnswer];
}>();

const shuffledItems = ref<TrueFalseItemInterface[]>([]);

const answers = reactive<Record<number, boolean>>({});

const isChecked = ref(false);

const showResult = computed(() => {
  return props.reviewMode || isChecked.value;
});

const answeredCount = computed(() => {
  return props.question.items.filter((item) => answers[item.id] !== undefined)
    .length;
});

const isCompleted = computed(() => {
  return (
    props.question.items.length > 0 &&
    answeredCount.value === props.question.items.length
  );
});

const correctCount = computed(() => {
  return props.question.items.filter((item) => answers[item.id] === item.isTrue)
    .length;
});

const shuffleItems = (
  items: TrueFalseItemInterface[],
): TrueFalseItemInterface[] => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
};

const refreshShuffledItems = () => {
  shuffledItems.value = shuffleItems(props.question.items);
};

const getSelectedAnswers = (): TrueFalseAnswerItem[] => {
  return props.question.items
    .filter((item) => answers[item.id] !== undefined)
    .map((item) => ({
      itemId: item.id,
      value: answers[item.id]!,
    }));
};

const emitAnswer = () => {
  emit("answer", {
    questionId: props.question.id,
    type: QuestionType.TRUE_FALSE,
    answers: getSelectedAnswers(),
    isCompleted: isCompleted.value,
    isChecked: props.examMode ? false : isChecked.value,
    correctCount: correctCount.value,
  });
};

const selectAnswer = (itemId: number, value: boolean) => {
  if (props.reviewMode) {
    return;
  }

  answers[itemId] = value;

  isChecked.value = false;

  emitAnswer();
};

const checkAnswer = () => {
  if (props.examMode || props.reviewMode || !isCompleted.value) {
    return;
  }

  isChecked.value = true;

  emitAnswer();
};

const isItemCorrect = (itemId: number, correctValue: boolean): boolean => {
  return answers[itemId] === correctValue;
};

const getItemClass = (itemId: number, correctValue: boolean): string => {
  if (props.examMode) {
    return answers[itemId] !== undefined
      ? "border-blue-200 bg-blue-50/40"
      : "border-slate-200 bg-white";
  }

  if (!showResult.value) {
    return "border-slate-200 bg-white";
  }

  return isItemCorrect(itemId, correctValue)
    ? "border-emerald-500 bg-emerald-50"
    : "border-red-500 bg-red-50";
};

const getAnswerButtonClass = (
  itemId: number,
  buttonValue: boolean,
  correctValue: boolean,
): string => {
  const selectedValue = answers[itemId];
  const isSelected = selectedValue === buttonValue;

  if (props.examMode) {
    return isSelected
      ? "border-blue-500 bg-blue-600 text-white"
      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50";
  }

  if (!showResult.value) {
    return isSelected
      ? "border-blue-500 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50";
  }

  if (buttonValue === correctValue) {
    return "border-emerald-500 bg-emerald-100 text-emerald-700";
  }

  if (isSelected) {
    return "border-red-500 bg-red-100 text-red-700";
  }

  return "border-slate-200 bg-white text-slate-400";
};

const clearAnswers = () => {
  Object.keys(answers).forEach((key) => {
    delete answers[Number(key)];
  });
};

const restoreAnswer = () => {
  clearAnswers();

  props.initialAnswer?.answers.forEach((answer) => {
    answers[answer.itemId] = answer.value;
  });

  isChecked.value =
    props.examMode || props.reviewMode
      ? false
      : (props.initialAnswer?.isChecked ?? false);
};

watch(() => props.question.id, refreshShuffledItems, {
  immediate: true,
});

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
