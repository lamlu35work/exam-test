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

              <div
                v-else
                class="hidden rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 lg:block"
              >
                Đã nộp bài
              </div>

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

            <button
              v-if="exam && !isSubmitted"
              type="button"
              class="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              @click="requestSubmitExam"
            >
              Nộp bài
            </button>

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

    <!-- Overlay sidebar mobile -->
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

        <div class="flex-1 overflow-y-auto overscroll-contain p-3">
          <div
            class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
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

            <button
              v-if="exam && !isSubmitted"
              type="button"
              class="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              @click="requestSubmitExam"
            >
              Nộp bài
            </button>

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

    <!-- Custom dialog -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="dialog.isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[1px]"
        role="presentation"
        @click.self="handleDialogCancel"
      >
        <div
          class="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exam-dialog-title"
          aria-describedby="exam-dialog-description"
        >
          <div class="p-5 sm:p-6">
            <div class="flex items-start gap-4">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                :class="dialogIconContainerClass"
              >
                <svg
                  v-if="dialog.variant === 'warning'"
                  class="h-6 w-6"
                  :class="dialogIconClass"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>

                <svg
                  v-else-if="dialog.variant === 'error'"
                  class="h-6 w-6"
                  :class="dialogIconClass"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>

                <svg
                  v-else-if="dialog.variant === 'success'"
                  class="h-6 w-6"
                  :class="dialogIconClass"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>

                <svg
                  v-else
                  class="h-6 w-6"
                  :class="dialogIconClass"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>

              <div class="min-w-0 flex-1">
                <h3
                  id="exam-dialog-title"
                  class="text-base font-semibold text-slate-900"
                >
                  {{ dialog.title }}
                </h3>

                <p
                  id="exam-dialog-description"
                  class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600"
                >
                  {{ dialog.message }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end"
          >
            <button
              v-if="dialog.showCancel"
              type="button"
              class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
              @click="handleDialogCancel"
            >
              {{ dialog.cancelText }}
            </button>

            <button
              type="button"
              class="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition sm:w-auto"
              :class="dialogConfirmButtonClass"
              @click="handleDialogConfirm"
            >
              {{ dialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
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

type DialogVariant = "info" | "warning" | "error" | "success";

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: DialogVariant;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

const EXAM_DURATION_SECONDS = 60 * 60;

const allQuestions = dataQuestions as QuestionInterface[];

const exam = ref<ExamInterface | null>(null);
const answers = ref<Record<string, UserAnswer>>({});
const currentQuestionId = ref<string | null>(null);
const remainingSeconds = ref(EXAM_DURATION_SECONDS);

const isQuestionSidebarOpen = ref(false);

const dialog = ref<DialogState>({
  isOpen: false,
  title: "",
  message: "",
  variant: "info",
  confirmText: "Đồng ý",
  cancelText: "Hủy",
  showCancel: false,
  onConfirm: null,
  onCancel: null,
});

let timerId: number | null = null;

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

const normalizeAnswer = (value: string): string => {
  return value.trim().toLocaleLowerCase("vi-VN").replace(/\s+/g, " ");
};

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

const answeredCount = computed(() => {
  return examQuestions.value.filter((question) => isQuestionAnswered(question))
    .length;
});

const correctAnswerCount = computed(() => {
  if (!isSubmitted.value) {
    return 0;
  }

  return examQuestions.value.filter((question) => isQuestionCorrect(question))
    .length;
});

const incorrectAnswerCount = computed(() => {
  if (!isSubmitted.value) {
    return 0;
  }

  return examQuestions.value.filter(
    (question) => isQuestionAnswered(question) && !isQuestionCorrect(question),
  ).length;
});

const unansweredCount = computed(() => {
  return examQuestions.value.filter((question) => !isQuestionAnswered(question))
    .length;
});

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60);
  const seconds = remainingSeconds.value % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
});

const dialogIconContainerClass = computed(() => {
  switch (dialog.value.variant) {
    case "warning":
      return "bg-amber-100";

    case "error":
      return "bg-red-100";

    case "success":
      return "bg-emerald-100";

    default:
      return "bg-blue-100";
  }
});

const dialogIconClass = computed(() => {
  switch (dialog.value.variant) {
    case "warning":
      return "text-amber-600";

    case "error":
      return "text-red-600";

    case "success":
      return "text-emerald-600";

    default:
      return "text-blue-600";
  }
});

const dialogConfirmButtonClass = computed(() => {
  switch (dialog.value.variant) {
    case "warning":
    case "error":
      return "bg-red-600 hover:bg-red-700";

    case "success":
      return "bg-emerald-600 hover:bg-emerald-700";

    default:
      return "bg-blue-600 hover:bg-blue-700";
  }
});

const closeDialog = () => {
  dialog.value.isOpen = false;
  dialog.value.onConfirm = null;
  dialog.value.onCancel = null;
};

const showAlert = ({
  title,
  message,
  variant = "info",
  confirmText = "Đồng ý",
  onConfirm = null,
}: {
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmText?: string;
  onConfirm?: (() => void) | null;
}) => {
  dialog.value = {
    isOpen: true,
    title,
    message,
    variant,
    confirmText,
    cancelText: "Hủy",
    showCancel: false,
    onConfirm,
    onCancel: null,
  };
};

const showConfirm = ({
  title,
  message,
  variant = "warning",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
}: {
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}) => {
  dialog.value = {
    isOpen: true,
    title,
    message,
    variant,
    confirmText,
    cancelText,
    showCancel: true,
    onConfirm,
    onCancel: null,
  };
};

const handleDialogConfirm = () => {
  const callback = dialog.value.onConfirm;

  closeDialog();
  callback?.();
};

const handleDialogCancel = () => {
  const callback = dialog.value.onCancel;

  closeDialog();
  callback?.();
};

const openQuestionSidebar = () => {
  isQuestionSidebarOpen.value = true;
};

const closeQuestionSidebar = () => {
  isQuestionSidebarOpen.value = false;
};

const stopTimer = () => {
  if (timerId === null) {
    return;
  }

  window.clearInterval(timerId);
  timerId = null;
};

const clearCurrentExam = () => {
  stopTimer();
  closeQuestionSidebar();
  closeDialog();

  exam.value = null;
  answers.value = {};
  currentQuestionId.value = null;
  remainingSeconds.value = EXAM_DURATION_SECONDS;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape") {
    return;
  }

  if (dialog.value.isOpen) {
    handleDialogCancel();
    return;
  }

  closeQuestionSidebar();
};

watch(
  [isQuestionSidebarOpen, () => dialog.value.isOpen],
  ([isSidebarOpen, isDialogOpen]) => {
    document.body.style.overflow =
      isSidebarOpen || isDialogOpen ? "hidden" : "";
  },
);

const createExamId = (): string => {
  return `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const completeSubmitExam = (isAutoSubmit: boolean) => {
  if (!exam.value || isSubmitted.value) {
    return;
  }

  exam.value = {
    ...exam.value,
    submittedAt: Date.now(),
  };

  remainingSeconds.value = 0;

  stopTimer();
  closeQuestionSidebar();

  if (isAutoSubmit) {
    showAlert({
      title: "Đã hết thời gian",
      message: "Bài thi đã được tự động nộp.",
      variant: "warning",
      confirmText: "Xem kết quả",
    });
  }
};

const requestSubmitExam = () => {
  if (!exam.value || isSubmitted.value) {
    return;
  }

  closeQuestionSidebar();

  const message =
    unansweredCount.value > 0
      ? `Bạn còn ${unansweredCount.value} câu chưa làm.\n\nBạn có chắc muốn nộp bài không?`
      : "Bạn đã hoàn thành tất cả câu hỏi.\n\nBạn có chắc muốn nộp bài không?";

  showConfirm({
    title: "Xác nhận nộp bài",
    message,
    variant: "warning",
    confirmText: "Nộp bài",
    cancelText: "Tiếp tục làm",
    onConfirm: () => completeSubmitExam(false),
  });
};

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
    completeSubmitExam(true);
  }
};

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

    showAlert({
      title: "Không thể tạo đề thi",
      message:
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi không xác định.",
      variant: "error",
      confirmText: "Đóng",
    });
  }
};

const confirmStartNewExam = () => {
  closeQuestionSidebar();

  showConfirm({
    title: "Tạo đề thi mới",
    message:
      "Kết quả và đáp án của đề hiện tại sẽ bị xóa.\n\nBạn có chắc muốn tiếp tục không?",
    variant: "warning",
    confirmText: "Tạo đề mới",
    cancelText: "Hủy",
    onConfirm: startNewExam,
  });
};

const handleAnswer = (answer: UserAnswer) => {
  if (isSubmitted.value) {
    return;
  }

  answers.value = {
    ...answers.value,
    [answer.questionId]: answer,
  };
};

const selectQuestion = (questionId: string) => {
  const questionExists = examQuestions.value.some(
    (question) => question.id === questionId,
  );

  if (!questionExists) {
    return;
  }

  currentQuestionId.value = questionId;
};

const selectQuestionFromSidebar = (questionId: string) => {
  selectQuestion(questionId);
  closeQuestionSidebar();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const selectPreviousQuestion = () => {
  const previousQuestion = examQuestions.value[currentQuestionIndex.value - 1];

  if (previousQuestion) {
    selectQuestion(previousQuestion.id);
  }
};

const selectNextQuestion = () => {
  const nextQuestion = examQuestions.value[currentQuestionIndex.value + 1];

  if (nextQuestion) {
    selectQuestion(nextQuestion.id);
  }
};

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

  clearCurrentExam();
  document.body.style.overflow = "";
});
</script>
