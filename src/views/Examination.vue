<template>
  <div class="min-h-screen bg-slate-100">
    <!-- Thanh mobile -->
    <header
      v-if="exam"
      class="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm lg:hidden"
    >
      <div class="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-500">
            Câu {{ currentQuestionIndex + 1 }}/{{ examQuestions.length }}
          </p>

          <p class="mt-0.5 truncate text-sm font-semibold text-slate-800">
            Bài thi thử
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <!-- Đồng hồ mobile -->
          <div
            v-if="!isSubmitted"
            class="rounded-lg px-3 py-2 text-sm font-bold tabular-nums"
            :class="
              remainingSeconds <= 300
                ? 'bg-red-50 text-red-600'
                : 'bg-blue-50 text-blue-700'
            "
          >
            {{ formattedTime }}
          </div>

          <div
            v-else
            class="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
          >
            Đã nộp
          </div>

          <!-- Mở danh sách câu hỏi -->
          <button
            type="button"
            class="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50"
            aria-label="Mở danh sách câu hỏi"
            @click="openQuestionSidebar"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>

            <span
              v-if="unansweredCount > 0 && !isSubmitted"
              class="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white"
            >
              {{ unansweredCount }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <div class="p-3 sm:p-4 lg:p-6">
      <div
        class="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6"
      >
        <!-- Nội dung bài thi -->
        <main
          class="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:min-h-[650px] lg:rounded-2xl lg:p-6"
        >
          <template v-if="currentQuestion">
            <!-- Header câu hỏi -->
            <div
              class="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 lg:mb-6"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-500">
                  Câu {{ currentQuestionIndex + 1 }}/{{ examQuestions.length }}
                </p>

                <p class="mt-1 text-xs text-slate-400">
                  Chủ đề {{ currentQuestion.topicId }}
                </p>
              </div>

              <!-- Đồng hồ desktop -->
              <div
                v-if="!isSubmitted"
                class="hidden rounded-xl px-4 py-2 text-lg font-bold tabular-nums lg:block"
                :class="
                  remainingSeconds <= 300
                    ? 'bg-red-50 text-red-600'
                    : 'bg-blue-50 text-blue-700'
                "
              >
                {{ formattedTime }}
              </div>

              <!-- Trạng thái desktop -->
              <div
                v-else
                class="hidden rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 lg:block"
              >
                Đã nộp bài
              </div>

              <!-- Nút danh sách mobile -->
              <button
                type="button"
                class="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden"
                @click="openQuestionSidebar"
              >
                <svg
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M8 6h13" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M3 6h.01" />
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                </svg>

                Danh sách
              </button>
            </div>

            <!-- Component câu hỏi -->
            <div
              class="min-w-0"
              :class="isSubmitted ? 'pointer-events-none select-none' : ''"
            >
              <QuestionRenderer
                :key="currentQuestion.id"
                :question="currentQuestion"
                :initial-answer="currentUserAnswer"
                :exam-mode="!isSubmitted"
                :review-mode="isSubmitted"
                @answer="handleAnswer"
              />
            </div>

            <!-- Điều hướng -->
            <div
              class="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 lg:mt-8"
            >
              <button
                type="button"
                class="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4"
                :disabled="currentQuestionIndex <= 0"
                @click="selectPreviousQuestion"
              >
                Câu trước
              </button>

              <button
                type="button"
                class="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4"
                :disabled="currentQuestionIndex >= examQuestions.length - 1"
                @click="selectNextQuestion"
              >
                Câu tiếp theo
              </button>
            </div>
          </template>

          <!-- Chưa bắt đầu -->
          <div
            v-else
            class="flex min-h-[500px] items-center justify-center px-4 lg:min-h-[600px]"
          >
            <div class="text-center">
              <div
                class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
              >
                <svg
                  class="h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path
                    d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                  />
                </svg>
              </div>

              <h1 class="mt-5 text-2xl font-bold text-slate-800">
                Bài thi thử
              </h1>

              <p class="mt-2 text-sm text-slate-500">
                60 câu hỏi trong thời gian 60 phút
              </p>

              <div
                class="mx-auto mt-5 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4 text-left"
              >
                <p class="text-sm font-semibold text-slate-700">
                  Cấu trúc đề thi
                </p>

                <div class="mt-3 space-y-2 text-sm text-slate-600">
                  <p>• Câu 1–40: Trắc nghiệm</p>
                  <p>• Câu 41–50: Đúng/Sai</p>
                  <p>• Câu 51–60: Điền từ</p>
                </div>
              </div>

              <button
                type="button"
                class="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                @click="startNewExam"
              >
                Bắt đầu thi
              </button>
            </div>
          </div>
        </main>

        <!-- Danh sách câu hỏi desktop -->
        <aside class="hidden min-w-0 lg:block">
          <div
            class="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <h2 class="font-semibold text-slate-800">Danh sách câu hỏi</h2>

              <p class="mt-1 text-xs text-slate-500">
                {{ answeredCount }}/{{ examQuestions.length }} câu đã làm
              </p>
            </div>

            <!-- Kết quả -->
            <div
              v-if="isSubmitted"
              class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p class="text-sm font-semibold text-slate-800">
                Kết quả bài thi
              </p>

              <p class="mt-2 text-3xl font-bold text-blue-700">
                {{ correctAnswerCount }}/{{ examQuestions.length }}
              </p>

              <p class="mt-1 text-xs text-slate-500">câu trả lời đúng</p>

              <div class="mt-4 grid grid-cols-3 gap-2 text-center">
                <div class="rounded-lg bg-emerald-50 px-2 py-3">
                  <p class="text-lg font-bold text-emerald-700">
                    {{ correctAnswerCount }}
                  </p>

                  <p class="mt-1 text-[11px] text-emerald-600">Đúng</p>
                </div>

                <div class="rounded-lg bg-red-50 px-2 py-3">
                  <p class="text-lg font-bold text-red-700">
                    {{ incorrectAnswerCount }}
                  </p>

                  <p class="mt-1 text-[11px] text-red-600">Sai</p>
                </div>

                <div class="rounded-lg bg-amber-50 px-2 py-3">
                  <p class="text-lg font-bold text-amber-700">
                    {{ unansweredCount }}
                  </p>

                  <p class="mt-1 text-[11px] text-amber-600">Chưa làm</p>
                </div>
              </div>
            </div>

            <!-- Grid câu hỏi desktop -->
            <div
              v-if="examQuestions.length"
              class="mt-4 grid grid-cols-5 gap-2"
            >
              <button
                v-for="(question, index) in examQuestions"
                :key="question.id"
                type="button"
                class="flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition"
                :class="getQuestionButtonClass(question)"
                :title="getQuestionButtonTitle(question, index)"
                @click="selectQuestion(question.id)"
              >
                {{ index + 1 }}
              </button>
            </div>

            <!-- Chú thích trước khi nộp -->
            <div
              v-if="examQuestions.length && !isSubmitted"
              class="mt-5 space-y-2 border-t border-slate-200 pt-4"
            >
              <div class="flex items-center gap-2 text-xs text-slate-600">
                <span
                  class="h-3 w-3 rounded border border-blue-300 bg-blue-50"
                ></span>

                Đã trả lời
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-600">
                <span
                  class="h-3 w-3 rounded border border-slate-300 bg-white"
                ></span>

                Chưa trả lời
              </div>
            </div>

            <!-- Chú thích sau khi nộp -->
            <div
              v-if="isSubmitted"
              class="mt-5 space-y-2 border-t border-slate-200 pt-4"
            >
              <div class="flex items-center gap-2 text-xs text-slate-600">
                <span class="h-3 w-3 rounded bg-emerald-500"></span>

                Câu trả lời đúng
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-600">
                <span class="h-3 w-3 rounded bg-red-500"></span>

                Câu trả lời sai
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-600">
                <span
                  class="h-3 w-3 rounded border border-amber-300 bg-amber-50"
                ></span>

                Câu chưa trả lời
              </div>
            </div>

            <!-- Nộp bài -->
            <button
              v-if="exam && !isSubmitted"
              type="button"
              class="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              @click="submitExam(false)"
            >
              Nộp bài
            </button>

            <!-- Làm đề mới -->
            <button
              v-else-if="isSubmitted"
              type="button"
              class="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              @click="confirmStartNewExam"
            >
              Làm đề mới
            </button>
          </div>
        </aside>
      </div>
    </div>

    <!-- Overlay mobile -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <button
        v-if="isQuestionSidebarOpen"
        type="button"
        class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
        aria-label="Đóng danh sách câu hỏi"
        @click="closeQuestionSidebar"
      />
    </Transition>

    <!-- Sidebar mobile -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="isQuestionSidebarOpen"
        class="fixed inset-y-0 right-0 z-50 flex w-[90%] max-w-[400px] flex-col bg-slate-100 shadow-2xl lg:hidden"
      >
        <!-- Header sidebar -->
        <div
          class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-4"
        >
          <div>
            <h2 class="font-semibold text-slate-900">Danh sách câu hỏi</h2>

            <p class="mt-1 text-xs text-slate-500">
              {{ answeredCount }}/{{ examQuestions.length }} câu đã làm
            </p>
          </div>

          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Đóng danh sách câu hỏi"
            @click="closeQuestionSidebar"
          >
            <svg
              class="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <!-- Nội dung sidebar -->
        <div class="flex-1 overflow-y-auto overscroll-contain p-3">
          <div
            class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <!-- Kết quả mobile -->
            <div
              v-if="isSubmitted"
              class="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p class="text-sm font-semibold text-slate-800">
                Kết quả bài thi
              </p>

              <p class="mt-2 text-3xl font-bold text-blue-700">
                {{ correctAnswerCount }}/{{ examQuestions.length }}
              </p>

              <p class="mt-1 text-xs text-slate-500">câu trả lời đúng</p>

              <div class="mt-4 grid grid-cols-3 gap-2 text-center">
                <div class="rounded-lg bg-emerald-50 px-2 py-3">
                  <p class="text-lg font-bold text-emerald-700">
                    {{ correctAnswerCount }}
                  </p>

                  <p class="mt-1 text-[11px] text-emerald-600">Đúng</p>
                </div>

                <div class="rounded-lg bg-red-50 px-2 py-3">
                  <p class="text-lg font-bold text-red-700">
                    {{ incorrectAnswerCount }}
                  </p>

                  <p class="mt-1 text-[11px] text-red-600">Sai</p>
                </div>

                <div class="rounded-lg bg-amber-50 px-2 py-3">
                  <p class="text-lg font-bold text-amber-700">
                    {{ unansweredCount }}
                  </p>

                  <p class="mt-1 text-[11px] text-amber-600">Chưa làm</p>
                </div>
              </div>
            </div>

            <!-- Grid câu hỏi mobile -->
            <div
              v-if="examQuestions.length"
              class="grid grid-cols-5 gap-2"
              :class="{ 'mt-4': isSubmitted }"
            >
              <button
                v-for="(question, index) in examQuestions"
                :key="question.id"
                type="button"
                class="flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition"
                :class="getQuestionButtonClass(question)"
                :title="getQuestionButtonTitle(question, index)"
                @click="selectQuestionFromSidebar(question.id)"
              >
                {{ index + 1 }}
              </button>
            </div>

            <!-- Chú thích mobile trước khi nộp -->
            <div
              v-if="examQuestions.length && !isSubmitted"
              class="mt-5 space-y-2 border-t border-slate-200 pt-4"
            >
              <div class="flex items-center gap-2 text-xs text-slate-600">
                <span
                  class="h-3 w-3 rounded border border-blue-300 bg-blue-50"
                ></span>

                Đã trả lời
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-600">
                <span
                  class="h-3 w-3 rounded border border-slate-300 bg-white"
                ></span>

                Chưa trả lời
              </div>
            </div>

            <!-- Chú thích mobile sau khi nộp -->
            <div
              v-if="isSubmitted"
              class="mt-5 space-y-2 border-t border-slate-200 pt-4"
            >
              <div class="flex items-center gap-2 text-xs text-slate-600">
                <span class="h-3 w-3 rounded bg-emerald-500"></span>

                Câu trả lời đúng
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-600">
                <span class="h-3 w-3 rounded bg-red-500"></span>

                Câu trả lời sai
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-600">
                <span
                  class="h-3 w-3 rounded border border-amber-300 bg-amber-50"
                ></span>

                Câu chưa trả lời
              </div>
            </div>

            <!-- Nộp bài mobile -->
            <button
              v-if="exam && !isSubmitted"
              type="button"
              class="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              @click="submitExam(false)"
            >
              Nộp bài
            </button>

            <!-- Làm đề mới mobile -->
            <button
              v-else-if="isSubmitted"
              type="button"
              class="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              @click="confirmStartNewExam"
            >
              Làm đề mới
            </button>
          </div>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import dataTopics from "@/data/topic.json";
import dataQuestions from "@/data/chuyen_nganh.json";

import { QuestionType } from "@/pkg/enums/questionType";
import { generateExamQuestions } from "@/service/examGenerator";

import type { QuestionInterface } from "@/pkg/interfaces/question";
import type { TopicInterface } from "@/pkg/interfaces/topic";
import type { ExamInterface } from "@/pkg/interfaces/exam";
import type { UserAnswer } from "@/pkg/interfaces/userAnswer";

import QuestionRenderer from "@/components/practice/QuestionRenderer.vue";

const EXAM_DURATION_SECONDS = 60 * 60;

const allQuestions = dataQuestions as QuestionInterface[];

const exam = ref<ExamInterface | null>(null);
const answers = ref<Record<string, UserAnswer>>({});
const currentQuestionId = ref<string | null>(null);
const remainingSeconds = ref(EXAM_DURATION_SECONDS);

const isQuestionSidebarOpen = ref(false);

let timerId: number | null = null;

/**
 * Danh sách câu hỏi trong đề.
 */
const examQuestions = computed<QuestionInterface[]>(() => {
  return exam.value?.questions ?? [];
});

/**
 * Đã nộp bài hay chưa.
 */
const isSubmitted = computed(() => {
  return exam.value?.submittedAt != null;
});

/**
 * Câu hỏi hiện tại.
 */
const currentQuestion = computed<QuestionInterface | null>(() => {
  if (!currentQuestionId.value) {
    return null;
  }

  return (
    examQuestions.value.find(
      (question) => question.id === currentQuestionId.value,
    ) ?? null
  );
});

/**
 * Vị trí câu hỏi hiện tại.
 */
const currentQuestionIndex = computed(() => {
  if (!currentQuestionId.value) {
    return -1;
  }

  return examQuestions.value.findIndex(
    (question) => question.id === currentQuestionId.value,
  );
});

/**
 * Câu trả lời của câu hiện tại.
 */
const currentUserAnswer = computed<UserAnswer | null>(() => {
  if (!currentQuestion.value) {
    return null;
  }

  return answers.value[currentQuestion.value.id] ?? null;
});

/**
 * Chuẩn hóa đáp án điền từ.
 */
const normalizeAnswer = (value: string): string => {
  return value.trim().toLocaleLowerCase("vi-VN").replace(/\s+/g, " ");
};

/**
 * Kiểm tra câu hỏi đã trả lời đầy đủ hay chưa.
 */
const isQuestionAnswered = (question: QuestionInterface): boolean => {
  const answer = answers.value[question.id];

  if (!answer) {
    return false;
  }

  switch (question.type) {
    case QuestionType.MULTIPLE_CHOICE:
      return (
        answer.type === QuestionType.MULTIPLE_CHOICE &&
        typeof answer.selectedOptionId === "number"
      );

    case QuestionType.TRUE_FALSE:
      if (answer.type !== QuestionType.TRUE_FALSE) {
        return false;
      }

      return (
        answer.answers.length === question.items.length &&
        question.items.every((item) =>
          answer.answers.some(
            (selectedAnswer) => selectedAnswer.itemId === item.id,
          ),
        )
      );

    case QuestionType.FILL_IN_BLANK:
      return (
        answer.type === QuestionType.FILL_IN_BLANK &&
        answer.value.trim().length > 0
      );

    default:
      return false;
  }
};

/**
 * Chấm đúng/sai một câu hỏi.
 */
const isQuestionCorrect = (question: QuestionInterface): boolean => {
  const answer = answers.value[question.id];

  if (!answer) {
    return false;
  }

  switch (question.type) {
    case QuestionType.MULTIPLE_CHOICE: {
      if (answer.type !== QuestionType.MULTIPLE_CHOICE) {
        return false;
      }

      const selectedOption = question.items.find(
        (item) => item.id === answer.selectedOptionId,
      );

      return selectedOption?.isCorrect === true;
    }

    case QuestionType.TRUE_FALSE: {
      if (answer.type !== QuestionType.TRUE_FALSE) {
        return false;
      }

      if (answer.answers.length !== question.items.length) {
        return false;
      }

      return question.items.every((item) => {
        const selectedAnswer = answer.answers.find(
          (answerItem) => answerItem.itemId === item.id,
        );

        return selectedAnswer?.value === item.isTrue;
      });
    }

    case QuestionType.FILL_IN_BLANK:
      if (answer.type !== QuestionType.FILL_IN_BLANK) {
        return false;
      }

      return normalizeAnswer(answer.value) === normalizeAnswer(question.answer);

    default:
      return false;
  }
};

/**
 * Số câu đã trả lời.
 */
const answeredCount = computed(() => {
  return examQuestions.value.filter((question) => isQuestionAnswered(question))
    .length;
});

/**
 * Số câu đúng.
 */
const correctAnswerCount = computed(() => {
  if (!isSubmitted.value) {
    return 0;
  }

  return examQuestions.value.filter((question) => isQuestionCorrect(question))
    .length;
});

/**
 * Số câu sai, không tính câu chưa trả lời.
 */
const incorrectAnswerCount = computed(() => {
  if (!isSubmitted.value) {
    return 0;
  }

  return examQuestions.value.filter(
    (question) => isQuestionAnswered(question) && !isQuestionCorrect(question),
  ).length;
});

/**
 * Số câu chưa trả lời.
 */
const unansweredCount = computed(() => {
  return examQuestions.value.filter((question) => !isQuestionAnswered(question))
    .length;
});

/**
 * Định dạng thời gian MM:SS.
 */
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60);
  const seconds = remainingSeconds.value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
});

/**
 * Mở sidebar mobile.
 */
const openQuestionSidebar = () => {
  isQuestionSidebarOpen.value = true;
};

/**
 * Đóng sidebar mobile.
 */
const closeQuestionSidebar = () => {
  isQuestionSidebarOpen.value = false;
};

/**
 * Xóa toàn bộ bài thi hiện tại.
 *
 * Vì không sử dụng localStorage, bài thi chỉ tồn tại trong bộ nhớ
 * của component hiện tại.
 */
const clearCurrentExam = () => {
  stopTimer();
  closeQuestionSidebar();

  exam.value = null;
  answers.value = {};
  currentQuestionId.value = null;
  remainingSeconds.value = EXAM_DURATION_SECONDS;
};

/**
 * Đóng sidebar bằng phím Escape.
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeQuestionSidebar();
  }
};

/**
 * Khóa cuộn trang khi sidebar đang mở.
 */
watch(isQuestionSidebarOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? "hidden" : "";
});

/**
 * Tạo ID bài thi.
 */
const createExamId = (): string => {
  return `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

/**
 * Dừng đồng hồ.
 */
const stopTimer = () => {
  if (timerId === null) {
    return;
  }

  window.clearInterval(timerId);
  timerId = null;
};

/**
 * Cập nhật thời gian còn lại ngay lập tức.
 */
const updateRemainingTime = () => {
  if (!exam.value || isSubmitted.value) {
    return;
  }

  const secondsLeft = Math.max(
    0,
    Math.ceil((exam.value.expiresAt - Date.now()) / 1000),
  );

  remainingSeconds.value = secondsLeft;

  if (secondsLeft <= 0) {
    submitExam(true);
  }
};

/**
 * Khởi động đồng hồ.
 */
const startTimer = () => {
  stopTimer();
  updateRemainingTime();

  timerId = window.setInterval(() => {
    if (!exam.value || isSubmitted.value) {
      stopTimer();
      return;
    }

    updateRemainingTime();
  }, 1000);
};

/**
 * Bắt đầu đề thi mới.
 */
const startNewExam = () => {
  const topics = dataTopics as TopicInterface[];
  const topicIds = topics.map((topic) => topic.id);

  try {
    clearCurrentExam();

    const questions = generateExamQuestions(allQuestions, topicIds);

    const startedAt = Date.now();

    exam.value = {
      id: createExamId(),
      questions,
      startedAt,
      expiresAt: startedAt + EXAM_DURATION_SECONDS * 1000,
      submittedAt: null,
    };

    answers.value = {};
    currentQuestionId.value = questions[0]?.id ?? null;
    remainingSeconds.value = EXAM_DURATION_SECONDS;

    startTimer();
  } catch (error) {
    console.error(error);

    window.alert(
      error instanceof Error ? error.message : "Không thể tạo đề thi.",
    );
  }
};

/**
 * Xác nhận tạo đề mới.
 */
const confirmStartNewExam = () => {
  const shouldStart = window.confirm(
    "Bạn có chắc muốn tạo một đề thi mới không? Kết quả đề hiện tại sẽ bị xóa.",
  );

  if (!shouldStart) {
    return;
  }

  startNewExam();
};

/**
 * Nhận đáp án từ QuestionRenderer.
 */
const handleAnswer = (answer: UserAnswer) => {
  if (isSubmitted.value) {
    return;
  }

  answers.value = {
    ...answers.value,
    [answer.questionId]: answer,
  };
};

/**
 * Chọn câu hỏi.
 */
const selectQuestion = (questionId: string) => {
  const questionExists = examQuestions.value.some(
    (question) => question.id === questionId,
  );

  if (!questionExists) {
    return;
  }

  currentQuestionId.value = questionId;
};

/**
 * Chọn câu hỏi từ sidebar mobile.
 */
const selectQuestionFromSidebar = (questionId: string) => {
  selectQuestion(questionId);
  closeQuestionSidebar();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/**
 * Chuyển sang câu trước.
 */
const selectPreviousQuestion = () => {
  const previousQuestion = examQuestions.value[currentQuestionIndex.value - 1];

  if (!previousQuestion) {
    return;
  }

  selectQuestion(previousQuestion.id);
};

/**
 * Chuyển sang câu tiếp theo.
 */
const selectNextQuestion = () => {
  const nextQuestion = examQuestions.value[currentQuestionIndex.value + 1];

  if (!nextQuestion) {
    return;
  }

  selectQuestion(nextQuestion.id);
};

/**
 * Class của nút số câu.
 */
const getQuestionButtonClass = (question: QuestionInterface): string => {
  const isCurrent = currentQuestionId.value === question.id;

  let statusClass: string;

  if (isSubmitted.value) {
    if (!isQuestionAnswered(question)) {
      statusClass = "border-amber-300 bg-amber-50 text-amber-700";
    } else if (isQuestionCorrect(question)) {
      statusClass = "border-emerald-500 bg-emerald-500 text-white";
    } else {
      statusClass = "border-red-500 bg-red-500 text-white";
    }
  } else if (isQuestionAnswered(question)) {
    statusClass =
      "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400";
  } else {
    statusClass =
      "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50";
  }

  if (isCurrent) {
    return `${statusClass} ring-2 ring-blue-500 ring-offset-2`;
  }

  return statusClass;
};

/**
 * Tooltip của nút số câu.
 */
const getQuestionButtonTitle = (
  question: QuestionInterface,
  index: number,
): string => {
  if (!isSubmitted.value) {
    return isQuestionAnswered(question)
      ? `Câu ${index + 1}: Đã trả lời`
      : `Câu ${index + 1}: Chưa trả lời`;
  }

  if (!isQuestionAnswered(question)) {
    return `Câu ${index + 1}: Chưa trả lời`;
  }

  return isQuestionCorrect(question)
    ? `Câu ${index + 1}: Chính xác`
    : `Câu ${index + 1}: Trả lời sai`;
};

/**
 * Nộp bài.
 */
const submitExam = (isAutoSubmit: boolean) => {
  if (!exam.value || isSubmitted.value) {
    return;
  }

  if (!isAutoSubmit) {
    const message =
      unansweredCount.value > 0
        ? `Bạn còn ${unansweredCount.value} câu chưa làm. Bạn có chắc muốn nộp bài không?`
        : "Bạn có chắc muốn nộp bài không?";

    if (!window.confirm(message)) {
      return;
    }
  }

  exam.value = {
    ...exam.value,
    submittedAt: Date.now(),
  };

  remainingSeconds.value = 0;

  stopTimer();
  closeQuestionSidebar();

  if (isAutoSubmit) {
    window.alert("Đã hết thời gian. Bài thi được tự động nộp.");
  }
};

/**
 * Khi quay lại tab, cập nhật lại đồng hồ dựa trên expiresAt.
 */
const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    updateRemainingTime();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("visibilitychange", handleVisibilityChange);

  document.body.style.overflow = "";

  /**
   * Khi chuyển khỏi route chứa component này,
   * toàn bộ bài thi và đáp án sẽ bị xóa.
   */
  clearCurrentExam();
});
</script>
