<template>
  <div
    class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <div class="border-b border-slate-200 px-4 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold text-slate-800">
            Danh sách câu hỏi
          </h2>

          <p class="mt-1 text-xs text-slate-500">
            {{ completedCount }}/{{ questions.length }} câu đã làm
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100"
          @click="emit('reset')"
        >
          Làm lại
        </button>
      </div>
    </div>

    <div class="max-h-[650px] overflow-y-auto p-4">
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="(question, index) in questions"
          :key="question.id"
          type="button"
          class="flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition"
          :class="getQuestionClass(question.id)"
          :title="getQuestionTitle(question.id, index)"
          @click="emit('select-question', question.id)"
        >
          {{ index + 1 }}
        </button>
      </div>

      <div class="mt-5 space-y-2 border-t border-slate-200 pt-4">
        <div class="flex items-center gap-2 text-xs text-slate-600">
          <span class="h-3 w-3 rounded border border-blue-500 bg-blue-50"></span>
          Câu hiện tại
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-600">
          <span class="h-3 w-3 rounded border border-slate-300 bg-slate-100"></span>
          Đã trả lời, chưa kiểm tra
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-600">
          <span class="h-3 w-3 rounded bg-emerald-500"></span>
          Đã kiểm tra, trả lời đúng
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-600">
          <span class="h-3 w-3 rounded bg-red-500"></span>
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

const props = defineProps<{
  questions: QuestionInterface[];
  selectedQuestionId: string | null;
  userAnswers: Record<string, UserAnswer>;
}>();

const emit = defineEmits<{
  "select-question": [questionId: string];
  reset: [];
}>();

const completedCount = computed(() => {
  return props.questions.filter(
    (question) => props.userAnswers[question.id] !== undefined,
  ).length;
});

const isAnswerCorrect = (answer: UserAnswer): boolean => {
  switch (answer.type) {
    case QuestionType.MULTIPLE_CHOICE:
      return answer.isCorrect;

    case QuestionType.TRUE_FALSE: {
      const question = props.questions.find(
        (item) => item.id === answer.questionId,
      );

      if (
        !question ||
        question.type !== QuestionType.TRUE_FALSE
      ) {
        return false;
      }

      return answer.correctCount === question.items.length;
    }

    case QuestionType.FILL_IN_BLANK:
      return answer.isCorrect;
  }
};

const getQuestionClass = (questionId: string): string => {
  const isSelected =
    props.selectedQuestionId === questionId;

  const answer = props.userAnswers[questionId];

  if (isSelected) {
    return "border-blue-600 bg-blue-600 text-white ring-2 ring-blue-200";
  }

  if (!answer) {
    return "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50";
  }

  if (!answer.isChecked) {
    return "border-slate-300 bg-slate-100 text-slate-700 hover:border-blue-300";
  }

  if (isAnswerCorrect(answer)) {
    return "border-emerald-500 bg-emerald-500 text-white";
  }

  return "border-red-500 bg-red-500 text-white";
};

const getQuestionTitle = (
  questionId: string,
  index: number,
): string => {
  const answer = props.userAnswers[questionId];

  if (!answer) {
    return `Câu ${index + 1}: Chưa làm`;
  }

  if (!answer.isChecked) {
    return `Câu ${index + 1}: Chưa kiểm tra`;
  }

  return isAnswerCorrect(answer)
    ? `Câu ${index + 1}: Chính xác`
    : `Câu ${index + 1}: Chưa chính xác`;
};
</script>