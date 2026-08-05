<template>
  <div class="min-h-screen bg-slate-100 p-6">
    <div
      class="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_300px] gap-6"
    >
      <!-- Nội dung bài thi -->
      <main
        class="min-h-[650px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <template v-if="currentQuestion">
          <!-- Header -->
          <div
            class="mb-6 flex items-center justify-between border-b border-slate-200 pb-4"
          >
            <div>
              <p class="text-sm font-medium text-slate-500">
                Câu {{ currentQuestionIndex + 1 }}/{{ examQuestions.length }}
              </p>

              <p class="mt-1 text-xs text-slate-400">
                Chủ đề {{ currentQuestion.topicId }}
              </p>
            </div>

            <!-- Đồng hồ -->
            <div
              v-if="!isSubmitted"
              class="rounded-xl px-4 py-2 text-lg font-bold tabular-nums"
              :class="
                remainingSeconds <= 300
                  ? 'bg-red-50 text-red-600'
                  : 'bg-blue-50 text-blue-700'
              "
            >
              {{ formattedTime }}
            </div>

            <!-- Trạng thái đã nộp -->
            <div
              v-else
              class="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
            >
              Đã nộp bài
            </div>
          </div>

          <!-- Component câu hỏi -->
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

          <!-- Điều hướng -->
          <div class="mt-8 flex justify-between border-t pt-5">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentQuestionIndex <= 0"
              @click="selectPreviousQuestion"
            >
              Câu trước
            </button>

            <button
              type="button"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentQuestionIndex >= examQuestions.length - 1"
              @click="selectNextQuestion"
            >
              Câu tiếp theo
            </button>
          </div>
        </template>

        <!-- Chưa bắt đầu -->
        <div v-else class="flex min-h-[500px] items-center justify-center">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-slate-800">Bài thi thử</h1>

            <p class="mt-2 text-sm text-slate-500">
              60 câu hỏi trong thời gian 60 phút
            </p>

            <button
              type="button"
              class="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              @click="startNewExam"
            >
              Bắt đầu thi
            </button>
          </div>
        </div>
      </main>

      <!-- Danh sách câu hỏi -->
      <aside>
        <div
          class="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <h2 class="font-semibold text-slate-800">Danh sách câu hỏi</h2>

            <p class="mt-1 text-xs text-slate-500">
              {{ answeredCount }}/{{ examQuestions.length }} câu đã làm
            </p>
          </div>

          <!-- Kết quả sau khi nộp -->
          <div
            v-if="isSubmitted"
            class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <p class="text-sm font-semibold text-slate-800">Kết quả bài thi</p>

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

          <!-- Grid câu hỏi -->
          <div v-if="examQuestions.length" class="mt-4 grid grid-cols-5 gap-2">
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

          <!-- Tạo đề mới -->
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
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import dataTopics from "@/data/topic.json";
import dataQuestions from "@/data/luatGDDT.json";

import { QuestionType } from "@/pkg/enums/questionType";
import { generateExamQuestions } from "@/service/examGenerator";

import type { QuestionInterface } from "@/pkg/interfaces/question";
import type { TopicInterface } from "@/pkg/interfaces/topic";
import type { ExamInterface, ExamStateInterface } from "@/pkg/interfaces/exam";
import type { UserAnswer } from "@/pkg/interfaces/userAnswer";

import QuestionRenderer from "@/components/practice/QuestionRenderer.vue";

const EXAM_STORAGE_KEY = "current-exam";
const EXAM_DURATION_SECONDS = 60 * 60;

const allQuestions = dataQuestions as QuestionInterface[];

const exam = ref<ExamInterface | null>(null);

const answers = ref<Record<string, UserAnswer>>({});

const currentQuestionId = ref<string | null>(null);

const remainingSeconds = ref(EXAM_DURATION_SECONDS);

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
 * Câu trả lời hiện tại.
 */
const currentUserAnswer = computed<UserAnswer | null>(() => {
  if (!currentQuestion.value) {
    return null;
  }

  return answers.value[currentQuestion.value.id] ?? null;
});

/**
 * Chuẩn hóa câu điền từ.
 */
const normalizeAnswer = (value: string): string => {
  return value.trim().toLocaleLowerCase("vi-VN").replace(/\s+/g, " ");
};

/**
 * Kiểm tra câu hỏi đã được trả lời đầy đủ chưa.
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
  }
};

/**
 * Chấm đúng/sai một câu hỏi.
 *
 * Câu true/false chỉ đúng khi tất cả mệnh đề đều đúng.
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
  }
};

/**
 * Tổng số câu đã làm.
 */
const answeredCount = computed(() => {
  return examQuestions.value.filter((question) => isQuestionAnswered(question))
    .length;
});

/**
 * Tổng số câu đúng.
 */
const correctAnswerCount = computed(() => {
  if (!isSubmitted.value) {
    return 0;
  }

  return examQuestions.value.filter((question) => isQuestionCorrect(question))
    .length;
});

/**
 * Tổng số câu sai.
 * Không tính câu chưa trả lời.
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
 * Tổng số câu chưa làm.
 */
const unansweredCount = computed(() => {
  return examQuestions.value.filter((question) => !isQuestionAnswered(question))
    .length;
});

/**
 * Định dạng đồng hồ.
 */
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60);

  const seconds = remainingSeconds.value % 60;

  return `${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
});

/**
 * Tạo ID bài thi.
 */
const createExamId = (): string => {
  return `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

/**
 * Lưu bài thi vào localStorage.
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
 * Dừng bộ đếm giờ.
 */
const stopTimer = () => {
  if (timerId === null) {
    return;
  }

  window.clearInterval(timerId);
  timerId = null;
};

/**
 * Khởi động bộ đếm giờ.
 */
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
 * Bắt đầu đề thi mới.
 */
const startNewExam = () => {
  const topics = dataTopics as TopicInterface[];

  const topicIds = topics.map((topic) => topic.id);

  try {
    stopTimer();

    localStorage.removeItem(EXAM_STORAGE_KEY);

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

    persistExam();
    startTimer();
  } catch (error) {
    console.error(error);

    window.alert(
      error instanceof Error ? error.message : "Không thể tạo đề thi.",
    );
  }
};

/**
 * Xác nhận làm đề mới.
 */
const confirmStartNewExam = () => {
  const shouldStart = window.confirm(
    "Bạn có chắc muốn tạo một đề thi mới không?",
  );

  if (!shouldStart) {
    return;
  }

  startNewExam();
};

/**
 * Nhận câu trả lời từ component con.
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
 * Chọn câu hỏi.
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
 * Câu trước.
 */
const selectPreviousQuestion = () => {
  const previousQuestion = examQuestions.value[currentQuestionIndex.value - 1];

  if (previousQuestion) {
    selectQuestion(previousQuestion.id);
  }
};

/**
 * Câu tiếp theo.
 */
const selectNextQuestion = () => {
  const nextQuestion = examQuestions.value[currentQuestionIndex.value + 1];

  if (nextQuestion) {
    selectQuestion(nextQuestion.id);
  }
};

/**
 * Class của số câu trong danh sách.
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
 * Tooltip của số câu.
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

  stopTimer();
  persistExam();

  if (isAutoSubmit) {
    window.alert("Đã hết thời gian. Bài thi được tự động nộp.");
  }
};

/**
 * Khôi phục bài thi.
 */
const restoreExam = () => {
  try {
    const savedState = localStorage.getItem(EXAM_STORAGE_KEY);

    if (!savedState) {
      return;
    }

    const state = JSON.parse(savedState) as ExamStateInterface;

    exam.value = state.exam;

    answers.value = state.answers ?? {};

    currentQuestionId.value =
      state.currentQuestionId ?? state.exam.questions[0]?.id ?? null;

    /**
     * Nếu đã nộp thì chỉ khôi phục kết quả,
     * không chạy lại đồng hồ.
     */
    if (state.exam.submittedAt) {
      remainingSeconds.value = 0;
      stopTimer();
      return;
    }

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

    exam.value = null;
    answers.value = {};
    currentQuestionId.value = null;

    localStorage.removeItem(EXAM_STORAGE_KEY);
  }
};

onMounted(restoreExam);

onBeforeUnmount(stopTimer);
</script>
