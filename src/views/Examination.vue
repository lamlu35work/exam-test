<template>
  <div class="min-h-screen bg-slate-100">
    <!-- =====================================================

         MOBILE HEADER

    ====================================================== -->

    <header
      class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden"
    >
      <div class="flex min-h-[60px] items-center justify-between gap-3 px-3">
        <!-- Current question -->

        <div class="min-w-0">
          <template v-if="currentQuestion">
            <p class="text-sm font-semibold text-slate-800">
              {{ currentQuestionNumberLabel }}/{{ totalQuestionCount }}
            </p>

            <p class="mt-0.5 truncate text-xs text-slate-500">
              Chủ đề {{ currentQuestion.topicId }}
            </p>
          </template>

          <template v-else>
            <p class="text-sm font-semibold text-slate-800">Bài thi thử</p>
          </template>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <!-- Mobile timer -->

          <div
            v-if="exam && !isSubmitted"
            class="rounded-xl px-3 py-2 text-sm font-bold tabular-nums"
            :class="
              remainingSeconds <= 300
                ? 'bg-red-50 text-red-600'
                : 'bg-blue-50 text-blue-700'
            "
          >
            {{ formattedTime }}
          </div>

          <div
            v-else-if="isSubmitted"
            class="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
          >
            Đã nộp
          </div>

          <!-- Open question drawer -->

          <button
            v-if="exam"
            type="button"
            class="flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm active:bg-slate-100"
            @click="openQuestionDrawer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />

              <path d="M9 9h6" />

              <path d="M9 13h6" />

              <path d="M9 17h3" />
            </svg>

            <span class="hidden min-[380px]:inline"> Danh sách </span>
          </button>
        </div>
      </div>
    </header>

    <!-- =====================================================

         MAIN

    ====================================================== -->

    <div class="px-3 py-3 sm:px-4 sm:py-4 lg:p-6">
      <div
        class="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6"
      >
        <!-- =================================================

             QUESTION CONTENT

        ================================================== -->

        <main
          class="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:min-h-[650px] lg:p-6"
        >
          <template v-if="currentQuestion">
            <!-- Header desktop -->

            <div
              class="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 lg:mb-6"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-500">
                  {{ currentQuestionNumberLabel }}/{{ totalQuestionCount }}
                </p>

                <p class="mt-1 text-xs text-slate-400">
                  Chủ đề {{ currentQuestion.topicId }}
                </p>
              </div>

              <!-- Desktop timer -->

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

              <!-- Submitted desktop -->

              <div
                v-else
                class="hidden rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 lg:block"
              >
                Đã nộp bài
              </div>
            </div>

            <!-- Question -->

            <div :class="isSubmitted ? 'pointer-events-none select-none' : ''">
              <QuestionRenderer
                :key="currentQuestion.id"
                :question="currentQuestion"
                :initial-answer="currentUserAnswer"
                :exam-mode="!isSubmitted"
                :review-mode="isSubmitted"
                @answer="handleAnswer"
              />
            </div>

            <!-- =================================================

                 NAVIGATION

            ================================================== -->

            <div
              class="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 sm:mt-8"
            >
              <button
                type="button"
                class="min-h-[44px] flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4"
                :disabled="currentQuestionIndex <= 0"
                @click="selectPreviousQuestion"
              >
                Câu trước
              </button>

              <button
                type="button"
                class="min-h-[44px] flex-1 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4"
                :disabled="currentQuestionIndex >= examQuestions.length - 1"
                @click="selectNextQuestion"
              >
                Câu tiếp theo
              </button>
            </div>

            <!-- Mobile question list shortcut -->

            <button
              type="button"
              class="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 lg:hidden"
              @click="openQuestionDrawer"
            >
              Xem danh sách 60 câu
            </button>
          </template>

          <!-- =================================================

               NOT STARTED

          ================================================== -->

          <div
            v-else
            class="flex min-h-[calc(100dvh-105px)] items-center justify-center px-4 py-10 lg:min-h-[500px]"
          >
            <div class="max-w-sm text-center">
              <div
                class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  />

                  <path d="M14 2v6h6" />

                  <path d="m9 15 2 2 4-4" />
                </svg>
              </div>

              <h1 class="mt-5 text-2xl font-bold text-slate-800">
                Bài thi thử
              </h1>

              <p class="mt-2 text-sm leading-6 text-slate-500">
                60 câu hỏi trong thời gian 60 phút
              </p>

              <div
                class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left"
              >
                <div class="flex items-center justify-between gap-3 text-sm">
                  <span class="text-slate-500"> Trắc nghiệm </span>

                  <strong class="text-slate-800"> Câu 1–48 </strong>
                </div>

                <div
                  class="mt-3 flex items-center justify-between gap-3 text-sm"
                >
                  <span class="text-slate-500"> Tình huống </span>

                  <strong class="text-slate-800"> Câu 49–54 </strong>
                </div>

                <div
                  class="mt-3 flex items-center justify-between gap-3 text-sm"
                >
                  <span class="text-slate-500"> Điền từ </span>

                  <strong class="text-slate-800"> Câu 55–60 </strong>
                </div>
              </div>

              <button
                type="button"
                class="mt-6 min-h-[48px] w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 sm:w-auto"
                @click="startNewExam"
              >
                Bắt đầu thi
              </button>
            </div>
          </div>
        </main>

        <!-- =================================================

             DESKTOP QUESTION LIST

        ================================================== -->

        <aside class="hidden min-w-0 lg:block">
          <div
            class="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <QuestionPanel />
          </div>
        </aside>
      </div>
    </div>

    <!-- =====================================================

         MOBILE OVERLAY

    ====================================================== -->

    <Transition name="drawer-overlay">
      <button
        v-if="isQuestionDrawerOpen"
        type="button"
        aria-label="Đóng danh sách câu hỏi"
        class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
        @click="closeQuestionDrawer"
      />
    </Transition>

    <!-- =====================================================

         MOBILE QUESTION DRAWER

    ====================================================== -->

    <Transition name="drawer-right">
      <aside
        v-if="isQuestionDrawerOpen"
        class="exam-mobile-drawer fixed inset-y-0 right-0 z-50 flex w-[min(92vw,390px)] flex-col bg-white shadow-2xl lg:hidden"
      >
        <!-- Header -->

        <div
          class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3"
        >
          <div class="min-w-0 pr-3">
            <h2 class="truncate font-semibold text-slate-900">
              Danh sách câu hỏi
            </h2>

            <p class="mt-0.5 text-xs text-slate-500">
              {{ answeredCount }}/{{ totalQuestionCount }}

              câu đã làm
            </p>
          </div>

          <button
            type="button"
            aria-label="Đóng"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
            @click="closeQuestionDrawer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
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

        <!-- Scroll area -->

        <div
          class="exam-drawer-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4"
        >
          <!-- Result -->

          <div
            v-if="isSubmitted"
            class="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <p class="text-sm font-semibold text-slate-800">Kết quả bài thi</p>

            <p class="mt-2 text-3xl font-bold text-blue-700">
              {{ correctAnswerCount }}/{{ totalQuestionCount }}
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

          <!-- Question grid -->

          <div v-if="examQuestions.length" class="mt-4 grid grid-cols-5 gap-2">
            <button
              v-for="(question, index) in examQuestions"
              :key="question.id"
              type="button"
              class="flex aspect-square min-h-[44px] items-center justify-center rounded-lg border text-sm font-semibold transition"
              :class="getQuestionButtonClass(question)"
              :title="getQuestionButtonTitle(question, index)"
              @click="selectQuestionFromDrawer(question.id)"
            >
              {{ getQuestionDisplayLabel(question, index) }}
            </button>
          </div>

          <!-- Legend before submit -->

          <div
            v-if="examQuestions.length && !isSubmitted"
            class="mt-5 space-y-2 border-t border-slate-200 pt-4"
          >
            <div class="flex items-center gap-2 text-xs text-slate-600">
              <span class="h-3 w-3 rounded border border-blue-300 bg-blue-50" />

              Đã trả lời
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-600">
              <span class="h-3 w-3 rounded border border-slate-300 bg-white" />

              Chưa trả lời
            </div>
          </div>

          <!-- Legend after submit -->

          <div
            v-if="isSubmitted"
            class="mt-5 space-y-2 border-t border-slate-200 pt-4"
          >
            <div class="flex items-center gap-2 text-xs text-slate-600">
              <span class="h-3 w-3 rounded bg-emerald-500" />

              Câu trả lời đúng
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-600">
              <span class="h-3 w-3 rounded bg-red-500" />

              Câu trả lời sai
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-600">
              <span
                class="h-3 w-3 rounded border border-amber-300 bg-amber-50"
              />

              Câu chưa trả lời
            </div>
          </div>

          <!-- Submit -->

          <button
            v-if="exam && !isSubmitted"
            type="button"
            class="mt-6 min-h-[48px] w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white active:bg-red-700"
            @click="submitExamFromDrawer"
          >
            Nộp bài
          </button>

          <!-- New exam -->

          <button
            v-else-if="isSubmitted"
            type="button"
            class="mt-6 min-h-[48px] w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white active:bg-blue-700"
            @click="confirmNewExamFromDrawer"
          >
            Làm đề mới
          </button>
        </div>
      </aside>
    </Transition>

    <!-- =====================================================
         CUSTOM CONFIRM / ALERT MODAL
    ====================================================== -->
    <ConfirmModal
      v-model="modal.open"
      :title="modal.title"
      :message="modal.message"
      :variant="modal.variant"
      :confirm-text="modal.confirmText"
      :cancel-text="modal.cancelText"
      :show-cancel="modal.showCancel"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";

import { onBeforeRouteLeave } from "vue-router";

import dataQuestions from "@/data/chuyen_nganh.json";

import { QuestionType } from "@/pkg/enums/questionType";

import { generateExamQuestions } from "@/service/examGenerator";

import type { QuestionInterface } from "@/pkg/interfaces/question";

import type { ExamInterface, ExamStateInterface } from "@/pkg/interfaces/exam";

import type { UserAnswer } from "@/pkg/interfaces/userAnswer";

import QuestionRenderer from "@/components/practice/QuestionRenderer.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";

/**

 * =========================================================

 * STORAGE

 * =========================================================

 *

 * localStorage:

 * lưu toàn bộ đề để reload khôi phục.

 *

 * sessionStorage:

 * đánh dấu rằng tab hiện tại chính là tab đang làm bài.

 */

const EXAM_STORAGE_KEY = "current-exam";

const EXAM_SESSION_KEY = "current-exam-active-session";

const EXAM_DURATION_SECONDS = 60 * 60;

/**

 * =========================================================

 * DATA

 * =========================================================

 */

const allQuestions = dataQuestions as QuestionInterface[];

const exam = ref<ExamInterface | null>(null);

const answers = ref<Record<string, UserAnswer>>({});

const currentQuestionId = ref<string | null>(null);

const remainingSeconds = ref(EXAM_DURATION_SECONDS);

const isQuestionDrawerOpen = ref(false);

let timerId: number | null = null;

type ExamModalAction = "submit" | "new-exam" | null;
type ExamModalVariant = "info" | "warning" | "danger" | "success";

interface ExamModalState {
  open: boolean;
  title: string;
  message: string;
  variant: ExamModalVariant;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
  action: ExamModalAction;
}

const modal = ref<ExamModalState>({
  open: false,
  title: "",
  message: "",
  variant: "info",
  confirmText: "Đồng ý",
  cancelText: "Hủy",
  showCancel: true,
  action: null,
});

const openModal = (options: Partial<ExamModalState>) => {
  modal.value = {
    open: true,
    title: options.title ?? "Thông báo",
    message: options.message ?? "",
    variant: options.variant ?? "info",
    confirmText: options.confirmText ?? "Đồng ý",
    cancelText: options.cancelText ?? "Hủy",
    showCancel: options.showCancel ?? true,
    action: options.action ?? null,
  };
};

const closeModal = () => {
  modal.value.open = false;
  modal.value.action = null;
};

/**

 * =========================================================

 * QUESTIONS

 * =========================================================

 */

const examQuestions = computed<QuestionInterface[]>(() => {
  return exam.value?.questions ?? [];
});

const isSubmitted = computed(() => {
  return exam.value?.submittedAt != null;
});

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

const currentQuestionIndex = computed(() => {
  if (!currentQuestionId.value) {
    return -1;
  }

  return examQuestions.value.findIndex(
    (question) => question.id === currentQuestionId.value,
  );
});

const currentUserAnswer = computed<UserAnswer | null>(() => {
  if (!currentQuestion.value) {
    return null;
  }

  return answers.value[currentQuestion.value.id] ?? null;
});

/**
 * =========================================================
 * SCORING / DISPLAY HELPERS
 * =========================================================
 *
 * exam.questions chứa 56 block:
 * - 48 MULTIPLE_CHOICE
 * - 2 SITUATION
 * - 6 FILL_IN_BLANK
 *
 * Nhưng 2 SITUATION có 3 câu con / tình huống,
 * nên tổng số câu được chấm là 60.
 */

type SituationSubAnswerLike = {
  questionId?: string;
  subQuestionId?: string;
  id?: string;
  selectedOptionId?: number | null;
  optionId?: number | null;
  value?: number | string | null;
};

type SituationAnswerLike = {
  type?: unknown;
  answers?: SituationSubAnswerLike[] | Record<string, unknown>;
};

const getQuestionScoreCount = (question: QuestionInterface): number => {
  if (question.type === QuestionType.SITUATION) {
    return question.questions.length;
  }

  return 1;
};

const totalQuestionCount = computed(() => {
  return examQuestions.value.reduce(
    (total, question) => total + getQuestionScoreCount(question),
    0,
  );
});

const getQuestionStartNumber = (questionIndex: number): number => {
  let number = 1;

  for (let index = 0; index < questionIndex; index++) {
    const question = examQuestions.value[index];

    if (question) {
      number += getQuestionScoreCount(question);
    }
  }

  return number;
};

const getQuestionDisplayLabel = (
  question: QuestionInterface,
  index: number,
): string => {
  const start = getQuestionStartNumber(index);

  if (question.type === QuestionType.SITUATION) {
    const end = start + question.questions.length - 1;
    return `${start}–${end}`;
  }

  return String(start);
};

const currentQuestionNumberLabel = computed(() => {
  if (!currentQuestion.value || currentQuestionIndex.value < 0) {
    return "Câu";
  }

  const label = getQuestionDisplayLabel(
    currentQuestion.value,
    currentQuestionIndex.value,
  );

  return currentQuestion.value.type === QuestionType.SITUATION
    ? `Tình huống · Câu ${label}`
    : `Câu ${label}`;
});

/**
 * Lấy selectedOptionId của một câu con trong SITUATION.
 *
 * Hỗ trợ 2 kiểu lưu:
 *
 * 1. Answer cha:
 *    answers[parentSituationId] = {
 *      type: SITUATION,
 *      answers: [
 *        { questionId: "..._q1", selectedOptionId: 1 },
 *        ...
 *      ]
 *    }
 *
 * 2. Fallback answer từng câu con:
 *    answers[subQuestionId] = {
 *      selectedOptionId: 1,
 *      ...
 *    }
 */
const getSituationSelectedOptionId = (
  parentQuestionId: string,
  subQuestionId: string,
): number | null => {
  const parentAnswer = answers.value[parentQuestionId] as unknown as
    | SituationAnswerLike
    | undefined;

  const nestedAnswers = parentAnswer?.answers;

  if (Array.isArray(nestedAnswers)) {
    const nestedAnswer = nestedAnswers.find((item) => {
      const id = item.questionId ?? item.subQuestionId ?? item.id;

      return id === subQuestionId;
    });

    if (nestedAnswer) {
      if (typeof nestedAnswer.selectedOptionId === "number") {
        return nestedAnswer.selectedOptionId;
      }

      if (typeof nestedAnswer.optionId === "number") {
        return nestedAnswer.optionId;
      }

      if (typeof nestedAnswer.value === "number") {
        return nestedAnswer.value;
      }

      if (
        typeof nestedAnswer.value === "string" &&
        nestedAnswer.value.trim() !== "" &&
        Number.isFinite(Number(nestedAnswer.value))
      ) {
        return Number(nestedAnswer.value);
      }
    }
  } else if (nestedAnswers && typeof nestedAnswers === "object") {
    const nestedAnswer = nestedAnswers[subQuestionId] as
      | SituationSubAnswerLike
      | number
      | undefined;

    if (typeof nestedAnswer === "number") {
      return nestedAnswer;
    }

    if (nestedAnswer && typeof nestedAnswer === "object") {
      if (typeof nestedAnswer.selectedOptionId === "number") {
        return nestedAnswer.selectedOptionId;
      }

      if (typeof nestedAnswer.optionId === "number") {
        return nestedAnswer.optionId;
      }

      if (typeof nestedAnswer.value === "number") {
        return nestedAnswer.value;
      }
    }
  }

  /**
   * Fallback:
   * một số component có thể emit answer từng câu con
   * và parent đang lưu trực tiếp theo subQuestionId.
   */
  const directAnswer = answers.value[subQuestionId] as unknown as
    | SituationSubAnswerLike
    | undefined;

  if (directAnswer) {
    if (typeof directAnswer.selectedOptionId === "number") {
      return directAnswer.selectedOptionId;
    }

    if (typeof directAnswer.optionId === "number") {
      return directAnswer.optionId;
    }

    if (typeof directAnswer.value === "number") {
      return directAnswer.value;
    }

    if (
      typeof directAnswer.value === "string" &&
      directAnswer.value.trim() !== "" &&
      Number.isFinite(Number(directAnswer.value))
    ) {
      return Number(directAnswer.value);
    }
  }

  return null;
};

const getSituationAnsweredCount = (question: QuestionInterface): number => {
  if (question.type !== QuestionType.SITUATION) {
    return 0;
  }

  return question.questions.reduce((count, subQuestion) => {
    return (
      count +
      (getSituationSelectedOptionId(question.id, subQuestion.id) !== null
        ? 1
        : 0)
    );
  }, 0);
};

const getSituationCorrectCount = (question: QuestionInterface): number => {
  if (question.type !== QuestionType.SITUATION) {
    return 0;
  }

  return question.questions.reduce((count, subQuestion) => {
    const selectedOptionId = getSituationSelectedOptionId(
      question.id,
      subQuestion.id,
    );

    if (selectedOptionId === null) {
      return count;
    }

    const selectedOption = subQuestion.items.find(
      (option) => option.id === selectedOptionId,
    );

    return count + (selectedOption?.isCorrect === true ? 1 : 0);
  }, 0);
};

const getSituationIncorrectCount = (question: QuestionInterface): number => {
  if (question.type !== QuestionType.SITUATION) {
    return 0;
  }

  return (
    getSituationAnsweredCount(question) - getSituationCorrectCount(question)
  );
};

/**

 * =========================================================

 * NORMALIZE FILL IN BLANK

 * =========================================================

 */

const normalizeAnswer = (value: string): string => {
  return value.trim().toLocaleLowerCase("vi-VN").replace(/\s+/g, " ");
};

/**

 * =========================================================

 * ANSWERED

 * =========================================================

 *

 * Giữ nguyên logic hiện tại của project.

 */

const isQuestionAnswered = (question: QuestionInterface): boolean => {
  /**
   * Với SITUATION:
   * block được xem là "đã trả lời" nếu có ít nhất 1 câu con đã chọn.
   *
   * Lưu ý:
   * thống kê answeredCount bên dưới vẫn đếm từng câu con độc lập.
   */
  if (question.type === QuestionType.SITUATION) {
    return getSituationAnsweredCount(question) > 0;
  }

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

 * =========================================================

 * CORRECT

 * =========================================================

 */

const isQuestionCorrect = (question: QuestionInterface): boolean => {
  /**
   * Với SITUATION:
   * chỉ dùng để tô màu cho block cha sau khi nộp.
   * Block chỉ xanh khi tất cả câu con đã trả lời và đều đúng.
   *
   * Điểm thực tế vẫn được tính từng câu con trong correctAnswerCount.
   */
  if (question.type === QuestionType.SITUATION) {
    return (
      getSituationAnsweredCount(question) === question.questions.length &&
      getSituationCorrectCount(question) === question.questions.length
    );
  }

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

    case QuestionType.FILL_IN_BLANK: {
      if (answer.type !== QuestionType.FILL_IN_BLANK) {
        return false;
      }

      return normalizeAnswer(answer.value) === normalizeAnswer(question.answer);
    }

    default:
      return false;
  }
};

/**

 * =========================================================

 * STATISTICS

 * =========================================================

 */

const answeredCount = computed(() => {
  let count = 0;

  for (const question of examQuestions.value) {
    if (question.type === QuestionType.SITUATION) {
      count += getSituationAnsweredCount(question);
      continue;
    }

    if (isQuestionAnswered(question)) {
      count++;
    }
  }

  return count;
});

const correctAnswerCount = computed(() => {
  if (!isSubmitted.value) {
    return 0;
  }

  let count = 0;

  for (const question of examQuestions.value) {
    if (question.type === QuestionType.SITUATION) {
      count += getSituationCorrectCount(question);
      continue;
    }

    if (isQuestionCorrect(question)) {
      count++;
    }
  }

  return count;
});

const incorrectAnswerCount = computed(() => {
  if (!isSubmitted.value) {
    return 0;
  }

  let count = 0;

  for (const question of examQuestions.value) {
    if (question.type === QuestionType.SITUATION) {
      count += getSituationIncorrectCount(question);
      continue;
    }

    if (isQuestionAnswered(question) && !isQuestionCorrect(question)) {
      count++;
    }
  }

  return count;
});

const unansweredCount = computed(() => {
  return Math.max(0, totalQuestionCount.value - answeredCount.value);
});

/**

 * =========================================================

 * TIMER

 * =========================================================

 */

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60);

  const seconds = remainingSeconds.value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,

    "0",
  )}`;
});

const createExamId = (): string => {
  return `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

/**

 * =========================================================

 * SESSION

 * =========================================================

 */

const createSessionMarker = () => {
  sessionStorage.setItem(EXAM_SESSION_KEY, "active");
};

const removeSessionMarker = () => {
  sessionStorage.removeItem(EXAM_SESSION_KEY);
};

/**

 * =========================================================

 * PERSIST

 * =========================================================

 */

const persistExam = () => {
  if (!exam.value) {
    return;
  }

  const state: ExamStateInterface = {
    exam: exam.value,

    answers: answers.value,

    currentQuestionId: currentQuestionId.value,
  };

  localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(state));
};

/**

 * =========================================================

 * TIMER CONTROL

 * =========================================================

 */

const stopTimer = () => {
  if (timerId === null) {
    return;
  }

  window.clearInterval(timerId);

  timerId = null;
};

const startTimer = () => {
  stopTimer();

  timerId = window.setInterval(() => {
    if (!exam.value || isSubmitted.value) {
      stopTimer();

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
  }, 1000);
};

/**

 * =========================================================

 * DESTROY EXAM

 * =========================================================

 *

 * Dùng khi:

 *

 * - user back

 * - chuyển route

 * - quay sang trang khác trong app

 *

 * KHÔNG chạy khi reload.

 */

const destroyExam = () => {
  stopTimer();

  exam.value = null;

  answers.value = {};

  currentQuestionId.value = null;

  remainingSeconds.value = EXAM_DURATION_SECONDS;

  localStorage.removeItem(EXAM_STORAGE_KEY);

  removeSessionMarker();

  closeQuestionDrawer();
};

/**

 * =========================================================

 * START NEW EXAM

 * =========================================================

 */

const startNewExam = () => {
  try {
    stopTimer();

    localStorage.removeItem(EXAM_STORAGE_KEY);

    /**

     * Đánh dấu tab này đang giữ bài thi.

     */

    createSessionMarker();

    const questions = generateExamQuestions(allQuestions);

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

    persistExam();

    startTimer();

    scrollToTop();
  } catch (error) {
    removeSessionMarker();

    console.error(error);

    openModal({
      title: "Không thể tạo đề",
      message: error instanceof Error ? error.message : "Không thể tạo đề thi.",
      variant: "danger",
      confirmText: "Đóng",
      showCancel: false,
      action: null,
    });
  }
};

/**

 * =========================================================

 * CONFIRM NEW

 * =========================================================

 */

const confirmStartNewExam = () => {
  openModal({
    title: "Làm đề mới",
    message:
      "Kết quả và đáp án của bài thi hiện tại sẽ bị xóa. Bạn có chắc muốn tạo đề mới không?",
    variant: "warning",
    confirmText: "Tạo đề mới",
    cancelText: "Hủy",
    showCancel: true,
    action: "new-exam",
  });
};

/**

 * =========================================================

 * HANDLE ANSWER

 * =========================================================

 */

const handleAnswer = (answer: UserAnswer) => {
  if (isSubmitted.value) {
    return;
  }

  answers.value = {
    ...answers.value,

    [answer.questionId]: answer,
  };

  persistExam();
};

/**

 * =========================================================

 * SELECT QUESTION

 * =========================================================

 */

const selectQuestion = (questionId: string) => {
  const exists = examQuestions.value.some(
    (question) => question.id === questionId,
  );

  if (!exists) {
    return;
  }

  currentQuestionId.value = questionId;

  persistExam();
};

/**

 * Safari:

 *

 * không dùng behavior smooth ở đây.

 * Safari mobile có thể giật khi

 * address bar thay đổi height.

 */

const scrollToTop = () => {
  if (window.innerWidth >= 1024) {
    return;
  }

  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,

      behavior: "auto",
    });
  });
};

const selectPreviousQuestion = () => {
  const previousQuestion = examQuestions.value[currentQuestionIndex.value - 1];

  if (!previousQuestion) {
    return;
  }

  selectQuestion(previousQuestion.id);

  scrollToTop();
};

const selectNextQuestion = () => {
  const nextQuestion = examQuestions.value[currentQuestionIndex.value + 1];

  if (!nextQuestion) {
    return;
  }

  selectQuestion(nextQuestion.id);

  scrollToTop();
};

/**

 * =========================================================

 * QUESTION BUTTON

 * =========================================================

 */

const getQuestionButtonClass = (question: QuestionInterface): string => {
  const isCurrent = currentQuestionId.value === question.id;
  let statusClass: string;

  if (question.type === QuestionType.SITUATION) {
    const answered = getSituationAnsweredCount(question);
    const correct = getSituationCorrectCount(question);
    const total = question.questions.length;

    if (isSubmitted.value) {
      if (answered < total) {
        statusClass = "border-amber-300 bg-amber-50 text-amber-700";
      } else if (correct === total) {
        statusClass = "border-emerald-500 bg-emerald-500 text-white";
      } else {
        statusClass = "border-red-500 bg-red-500 text-white";
      }
    } else if (answered > 0) {
      statusClass =
        "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400";
    } else {
      statusClass =
        "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50";
    }
  } else if (isSubmitted.value) {
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

const getQuestionButtonTitle = (
  question: QuestionInterface,
  index: number,
): string => {
  const label = getQuestionDisplayLabel(question, index);

  if (question.type === QuestionType.SITUATION) {
    const answered = getSituationAnsweredCount(question);
    const correct = getSituationCorrectCount(question);
    const total = question.questions.length;

    if (!isSubmitted.value) {
      return `Câu ${label}: ${answered}/${total} câu đã trả lời`;
    }

    return `Câu ${label}: ${correct}/${total} đúng · ${answered}/${total} đã làm`;
  }

  if (!isSubmitted.value) {
    return isQuestionAnswered(question)
      ? `Câu ${label}: Đã trả lời`
      : `Câu ${label}: Chưa trả lời`;
  }

  if (!isQuestionAnswered(question)) {
    return `Câu ${label}: Chưa trả lời`;
  }

  return isQuestionCorrect(question)
    ? `Câu ${label}: Chính xác`
    : `Câu ${label}: Trả lời sai`;
};

/**

 * =========================================================

 * SUBMIT

 * =========================================================

 */

const performSubmitExam = (isAutoSubmit: boolean) => {
  if (!exam.value || isSubmitted.value) {
    return;
  }

  exam.value = {
    ...exam.value,
    submittedAt: Date.now(),
  };

  stopTimer();
  persistExam();

  if (isAutoSubmit) {
    openModal({
      title: "Hết thời gian",
      message: "Đã hết thời gian làm bài. Bài thi đã được tự động nộp.",
      variant: "info",
      confirmText: "Xem kết quả",
      showCancel: false,
      action: null,
    });
  }
};

const submitExam = (isAutoSubmit: boolean) => {
  if (!exam.value || isSubmitted.value) {
    return;
  }

  if (isAutoSubmit) {
    performSubmitExam(true);
    return;
  }

  const message =
    unansweredCount.value > 0
      ? `Bạn còn ${unansweredCount.value} câu chưa làm. Bạn có chắc muốn nộp bài không?`
      : "Bạn có chắc muốn nộp bài không?";

  openModal({
    title: "Nộp bài",
    message,
    variant: "warning",
    confirmText: "Nộp bài",
    cancelText: "Tiếp tục làm",
    showCancel: true,
    action: "submit",
  });
};

const handleModalConfirm = () => {
  const action = modal.value.action;

  closeModal();

  switch (action) {
    case "submit":
      performSubmitExam(false);
      break;

    case "new-exam":
      startNewExam();
      break;

    default:
      break;
  }
};

const handleModalCancel = () => {
  closeModal();
};

/**

 * =========================================================

 * MOBILE DRAWER

 * =========================================================

 */

const lockBodyScroll = () => {
  document.documentElement.classList.add("exam-drawer-open");

  document.body.classList.add("exam-drawer-open");
};

const unlockBodyScroll = () => {
  document.documentElement.classList.remove("exam-drawer-open");

  document.body.classList.remove("exam-drawer-open");
};

const openQuestionDrawer = () => {
  if (!exam.value) {
    return;
  }

  isQuestionDrawerOpen.value = true;

  lockBodyScroll();
};

const closeQuestionDrawer = () => {
  isQuestionDrawerOpen.value = false;

  unlockBodyScroll();
};

const selectQuestionFromDrawer = (questionId: string) => {
  selectQuestion(questionId);

  closeQuestionDrawer();

  scrollToTop();
};

const submitExamFromDrawer = () => {
  closeQuestionDrawer();

  submitExam(false);
};

const confirmNewExamFromDrawer = () => {
  closeQuestionDrawer();

  confirmStartNewExam();
};

/**

 * =========================================================

 * RESTORE

 * =========================================================

 *

 * QUAN TRỌNG:

 *

 * Chỉ restore khi navigation type = reload

 * và sessionStorage của tab này vẫn còn.

 *

 * Vì:

 *

 * Reload:

 * sessionStorage còn

 * navigation.type = reload

 *

 * Đóng tab rồi mở lại:

 * sessionStorage không còn

 *

 * Back rồi quay lại:

 * onBeforeRouteLeave đã xóa bài.

 */

const restoreExam = () => {
  try {
    const navigationEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;

    const navigationType = navigationEntry?.type;

    const hasActiveSession =
      sessionStorage.getItem(EXAM_SESSION_KEY) === "active";

    /**

     * Chỉ reload mới được restore.

     */

    const canRestore = navigationType === "reload" && hasActiveSession;

    if (!canRestore) {
      localStorage.removeItem(EXAM_STORAGE_KEY);

      removeSessionMarker();

      exam.value = null;

      answers.value = {};

      currentQuestionId.value = null;

      remainingSeconds.value = EXAM_DURATION_SECONDS;

      return;
    }

    const savedState = localStorage.getItem(EXAM_STORAGE_KEY);

    if (!savedState) {
      removeSessionMarker();

      return;
    }

    const state = JSON.parse(savedState) as ExamStateInterface;

    exam.value = state.exam;

    answers.value = state.answers ?? {};

    currentQuestionId.value =
      state.currentQuestionId ?? state.exam.questions[0]?.id ?? null;

    /**

     * Submitted exam.

     */

    if (state.exam.submittedAt) {
      remainingSeconds.value = 0;

      stopTimer();

      return;
    }

    /**

     * Recalculate timer from absolute expiry time.

     *

     * User reload có mất vài giây cũng không

     * làm timer reset về 60 phút.

     */

    remainingSeconds.value = Math.max(
      0,

      Math.ceil((state.exam.expiresAt - Date.now()) / 1000),
    );

    if (remainingSeconds.value <= 0) {
      submitExam(true);

      return;
    }

    startTimer();
  } catch (error) {
    console.error("Không thể khôi phục bài thi:", error);

    destroyExam();
  }
};

/**

 * =========================================================

 * ROUTE LEAVE

 * =========================================================

 *

 * Vue Router Back:

 * /exam -> /home

 *

 * phải destroy ngay.

 */

onBeforeRouteLeave(() => {
  destroyExam();

  return true;
});

/**

 * =========================================================

 * TAB / PAGE LIFECYCLE

 * =========================================================

 *

 * KHÔNG xóa localStorage trong beforeunload.

 *

 * Vì beforeunload chạy CẢ khi F5.

 *

 * Nếu xóa ở đây thì reload không thể restore.

 *

 * Việc phân biệt close/reload được thực hiện

 * ở restoreExam bằng:

 *

 * sessionStorage + PerformanceNavigationTiming.

 */

/**

 * Khi tab bị đóng:

 *

 * sessionStorage sẽ tự biến mất.

 *

 * localStorage có thể còn,

 * nhưng lần mở mới restoreExam()

 * sẽ phát hiện không có session marker

 * và xóa bài cũ.

 */

/**

 * =========================================================

 * RESIZE

 * =========================================================

 */

const handleResize = () => {
  if (window.innerWidth >= 1024 && isQuestionDrawerOpen.value) {
    closeQuestionDrawer();
  }
};

/**

 * =========================================================

 * ESC

 * =========================================================

 */

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isQuestionDrawerOpen.value) {
    closeQuestionDrawer();
  }
};

/**

 * =========================================================

 * DESKTOP QUESTION PANEL

 * =========================================================

 *

 * Inline component để toàn bộ vẫn nằm trong một file.

 */

const QuestionPanel = defineComponent({
  name: "QuestionPanel",

  setup() {
    return () =>
      h("div", {}, [
        h("div", {}, [
          h(
            "h2",

            {
              class: "font-semibold text-slate-800",
            },

            "Danh sách câu hỏi",
          ),

          h(
            "p",

            {
              class: "mt-1 text-xs text-slate-500",
            },

            `${answeredCount.value}/${totalQuestionCount.value} câu đã làm`,
          ),
        ]),

        isSubmitted.value
          ? h(
              "div",

              {
                class:
                  "mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4",
              },

              [
                h(
                  "p",

                  {
                    class: "text-sm font-semibold text-slate-800",
                  },

                  "Kết quả bài thi",
                ),

                h(
                  "p",

                  {
                    class: "mt-2 text-3xl font-bold text-blue-700",
                  },

                  `${correctAnswerCount.value}/${totalQuestionCount.value}`,
                ),

                h(
                  "p",

                  {
                    class: "mt-1 text-xs text-slate-500",
                  },

                  "câu trả lời đúng",
                ),
              ],
            )
          : null,

        h(
          "div",

          {
            class: "mt-4 grid grid-cols-5 gap-2",
          },

          examQuestions.value.map((question, index) =>
            h(
              "button",

              {
                type: "button",

                class: [
                  "flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition",

                  getQuestionButtonClass(question),
                ],

                title: getQuestionButtonTitle(question, index),

                onClick: () => selectQuestion(question.id),
              },

              getQuestionDisplayLabel(question, index),
            ),
          ),
        ),

        !isSubmitted.value && exam.value
          ? h(
              "button",

              {
                type: "button",

                class:
                  "mt-6 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700",

                onClick: () => submitExam(false),
              },

              "Nộp bài",
            )
          : null,

        isSubmitted.value
          ? h(
              "button",

              {
                type: "button",

                class:
                  "mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700",

                onClick: confirmStartNewExam,
              },

              "Làm đề mới",
            )
          : null,
      ]);
  },
});

/**

 * =========================================================

 * MOUNT

 * =========================================================

 */

onMounted(() => {
  restoreExam();

  window.addEventListener("resize", handleResize, {
    passive: true,
  });

  window.addEventListener("keydown", handleKeydown);
});

/**

 * =========================================================

 * UNMOUNT

 * =========================================================

 */

onBeforeUnmount(() => {
  stopTimer();

  closeQuestionDrawer();

  window.removeEventListener("resize", handleResize);

  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style>
/**
 * ==========================================================
 * LOCK BODY WHEN DRAWER OPEN
 * ==========================================================
 */

html.exam-drawer-open,
body.exam-drawer-open {
  overflow: hidden;
  overscroll-behavior: none;
}

/**
 * ==========================================================
 * IOS / SAFARI DRAWER
 * ==========================================================
 */

.exam-mobile-drawer {
  /**
   * Safari cũ fallback.
   */
  height: 100vh;

  /**
   * Safari mới:
   * chiều cao thực sau khi tính address bar.
   */
  height: 100dvh;

  /**
   * iPhone notch / Dynamic Island.
   */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);

  /**
   * Hardware acceleration.
   */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);

  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  overscroll-behavior: contain;
}

/**
 * ==========================================================
 * DRAWER SCROLL
 * ==========================================================
 */

.exam-drawer-scroll {
  min-height: 0;
  overflow-x: hidden;

  /**
   * Momentum scrolling Safari iOS.
   */
  -webkit-overflow-scrolling: touch;

  overscroll-behavior-y: contain;

  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

/**
 * ==========================================================
 * OVERLAY
 * ==========================================================
 */

.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 180ms ease;
}

.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

/**
 * ==========================================================
 * RIGHT DRAWER
 * ==========================================================
 */

.drawer-right-enter-active,
.drawer-right-leave-active {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.drawer-right-enter-from,
.drawer-right-leave-to {
  -webkit-transform: translate3d(100%, 0, 0);
  transform: translate3d(100%, 0, 0);
}

.drawer-right-enter-to,
.drawer-right-leave-from {
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

/**
 * ==========================================================
 * REDUCED MOTION
 * ==========================================================
 */

@media (prefers-reduced-motion: reduce) {
  .drawer-overlay-enter-active,
  .drawer-overlay-leave-active,
  .drawer-right-enter-active,
  .drawer-right-leave-active {
    transition-duration: 1ms !important;
  }
}
</style>
