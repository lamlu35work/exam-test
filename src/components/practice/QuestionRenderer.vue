<template>
  <MultipleChoiceQuestion
    v-if="question.type === QuestionType.MULTIPLE_CHOICE"
    :question="question"
    :initial-answer="
      initialAnswer?.type === QuestionType.MULTIPLE_CHOICE
        ? initialAnswer
        : null
    "
    :exam-mode="examMode"
    :review-mode="reviewMode"
    @answer="handleAnswer"
  />

  <TrueFalseQuestion
    v-else-if="question.type === QuestionType.TRUE_FALSE"
    :question="question"
    :initial-answer="
      initialAnswer?.type === QuestionType.TRUE_FALSE
        ? initialAnswer
        : null
    "
    :exam-mode="examMode"
    :review-mode="reviewMode"
    @answer="handleAnswer"
  />

  <FillInBlankQuestion
    v-else-if="question.type === QuestionType.FILL_IN_BLANK"
    :question="question"
    :initial-answer="
      initialAnswer?.type === QuestionType.FILL_IN_BLANK
        ? initialAnswer
        : null
    "
    :exam-mode="examMode"
    :review-mode="reviewMode"
    @answer="handleAnswer"
  />

  <SituationQuestion
    v-else-if="question.type === QuestionType.SITUATION"
    :question="question"
    :initial-answer="
      initialAnswer?.type === QuestionType.SITUATION
        ? initialAnswer
        : null
    "
    :exam-mode="examMode"
    :review-mode="reviewMode"
    @answer="handleAnswer"
  />
</template>

<script setup lang="ts">
import { QuestionType } from "@/pkg/enums/questionType";
import type { QuestionInterface } from "@/pkg/interfaces/question";
import type { UserAnswer } from "@/pkg/interfaces/userAnswer";

import MultipleChoiceQuestion from "./MultipleChoiceQuestion.vue";
import TrueFalseQuestion from "./TrueFalseQuestion.vue";
import FillInBlankQuestion from "./FillInBlankQuestion.vue";
import SituationQuestion from "./SituationQuestion.vue";

withDefaults(
  defineProps<{
    question: QuestionInterface;
    initialAnswer: UserAnswer | null;
    examMode?: boolean;
    reviewMode?: boolean;
  }>(),
  {
    examMode: false,
    reviewMode: false,
  },
);

const emit = defineEmits<{
  answer: [payload: UserAnswer];
}>();

const handleAnswer = (payload: UserAnswer) => {
  emit("answer", payload);
};
</script>