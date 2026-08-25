<template>
  <div class="min-h-screen bg-slate-100">
    <!-- =====================================================
         MOBILE HEADER
    ====================================================== -->
    <header
      class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden"
    >
      <div
        class="mx-auto flex h-14 max-w-[1800px] items-center justify-between gap-2 px-3"
      >
        <!-- Topic button -->
        <button
          type="button"
          class="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition active:scale-[0.98] active:bg-slate-100"
          @click="openTopicDrawer"
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
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>

          <span>Chủ đề</span>
        </button>

        <!-- Current question -->
        <div class="min-w-0 flex-1 px-1 text-center">
          <template v-if="currentQuestion">
            <p class="truncate text-sm font-semibold text-slate-800">
              Câu {{ currentQuestionIndex + 1 }}/{{ questions.length }}
            </p>

            <p class="truncate text-[11px] leading-4 text-slate-500">
              {{ currentQuestionTypeLabel }}
            </p>
          </template>

          <template v-else>
            <p class="truncate text-sm font-semibold text-slate-800">
              Luyện tập
            </p>
          </template>
        </div>

        <!-- Question list button -->
        <button
          type="button"
          class="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition active:scale-[0.98] active:bg-slate-100"
          @click="openQuestionDrawer"
        >
          <span>Câu hỏi</span>

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
        </button>
      </div>
    </header>

    <!-- =====================================================
         MAIN PAGE
    ====================================================== -->
    <div class="px-3 py-3 sm:px-4 sm:py-4 lg:p-6">
      <div
        class="mx-auto grid max-w-[1800px] grid-cols-1 gap-4 lg:grid-cols-[460px_minmax(0,1fr)_350px] lg:gap-6"
      >
        <!-- =================================================
             DESKTOP TOPIC LIST
        ================================================== -->
        <aside class="hidden min-w-0 lg:block">
          <TopicList
            :topics="filteredTopics"
            :selected-topic-id="selectedTopicId"
            :selected-question-type="selectedQuestionType"
            @select-question-type="handleSelectQuestionType"
            @select-topic="handleSelectTopic"
            @clear-question-type="handleClearQuestionType"
          />
        </aside>

        <!-- =================================================
             QUESTION CONTENT
        ================================================== -->
        <main
          class="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:min-h-[600px] lg:p-6"
        >
          <template v-if="currentQuestion">
            <!-- Question info -->
            <div
              class="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 lg:mb-6"
            >
              <div class="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                <!-- Desktop -->
                <span
                  class="hidden text-sm font-medium text-slate-500 lg:inline"
                >
                  Câu {{ currentQuestionIndex + 1 }}/{{ questions.length }}
                </span>

                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold sm:px-3"
                  :class="questionTypeBadgeClass"
                >
                  {{ currentQuestionTypeLabel }}
                </span>
              </div>

              <span
                class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 sm:px-3"
              >
                Chủ đề {{ currentQuestion.topicId }}
              </span>
            </div>

            <!-- Question renderer -->
            <QuestionRenderer
              :key="currentQuestion.id"
              :question="currentQuestion"
              :initial-answer="currentUserAnswer"
              @answer="handleAnswer"
            />

            <!-- Navigation -->
            <div
              class="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 sm:mt-8"
            >
              <button
                type="button"
                class="min-h-[44px] flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4"
                :disabled="currentQuestionIndex <= 0"
                @click="selectPreviousQuestion"
              >
                Câu trước
              </button>

              <button
                type="button"
                class="min-h-[44px] flex-1 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4"
                :disabled="
                  currentQuestionIndex < 0 ||
                  currentQuestionIndex >= questions.length - 1
                "
                @click="selectNextQuestion"
              >
                Câu tiếp theo
              </button>
            </div>
          </template>

          <!-- =================================================
               EMPTY STATE
          ================================================== -->
          <div
            v-else
            class="flex min-h-[calc(100dvh-110px)] items-center justify-center px-4 py-12 text-center lg:min-h-[500px]"
          >
            <div class="max-w-md">
              <!-- No question type -->
              <template v-if="selectedQuestionType === null">
                <div
                  class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 lg:hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                </div>

                <h2
                  class="mt-4 text-lg font-semibold text-slate-800 sm:text-xl lg:mt-0"
                >
                  Chọn loại câu hỏi
                </h2>

                <p class="mt-2 text-sm leading-6 text-slate-500">
                  Chọn Trắc nghiệm, Trả lời ngắn hoặc Tình huống để bắt đầu.
                </p>

                <button
                  type="button"
                  class="mt-5 min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] active:bg-blue-700 lg:hidden"
                  @click="openTopicDrawer"
                >
                  Chọn loại câu hỏi
                </button>
              </template>

              <!-- Selected type but no topic -->
              <template v-else-if="selectedTopicId === null">
                <div
                  class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 lg:hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path
                      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                    />
                  </svg>
                </div>

                <h2
                  class="mt-4 text-lg font-semibold text-slate-800 sm:text-xl lg:mt-0"
                >
                  Chọn chủ đề
                </h2>

                <p class="mt-2 text-sm leading-6 text-slate-500">
                  Chọn một chủ đề để bắt đầu luyện tập.
                </p>

                <button
                  type="button"
                  class="mt-5 min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] active:bg-blue-700 lg:hidden"
                  @click="openTopicDrawer"
                >
                  Mở danh sách chủ đề
                </button>
              </template>

              <!-- No questions -->
              <template v-else>
                <h2 class="text-lg font-semibold text-slate-800 sm:text-xl">
                  Không tìm thấy câu hỏi
                </h2>

                <p class="mt-2 text-sm leading-6 text-slate-500">
                  Chủ đề này hiện chưa có câu hỏi thuộc loại đã chọn.
                </p>

                <button
                  type="button"
                  class="mt-5 min-h-[44px] rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition active:bg-slate-100 lg:hidden"
                  @click="openTopicDrawer"
                >
                  Chọn chủ đề khác
                </button>
              </template>
            </div>
          </div>
        </main>

        <!-- =================================================
             DESKTOP QUESTION LIST
        ================================================== -->
        <aside class="hidden min-w-0 lg:block">
          <QuestionList
            :questions="questions"
            :selected-question-id="selectedQuestionId"
            :user-answers="userAnswers"
            @select-question="handleSelectQuestion"
            @reset="requestResetPractice"
          />
        </aside>
      </div>
    </div>

    <!-- =====================================================
         MOBILE OVERLAY
    ====================================================== -->
    <Transition name="drawer-overlay">
      <button
        v-if="isTopicDrawerOpen || isQuestionDrawerOpen"
        type="button"
        aria-label="Đóng menu"
        class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
        @click="closeDrawers"
      />
    </Transition>

    <!-- =====================================================
         MOBILE TOPIC DRAWER
         LEFT -> RIGHT
    ====================================================== -->
    <Transition name="drawer-left">
      <aside
        v-if="isTopicDrawerOpen"
        class="mobile-drawer fixed inset-y-0 left-0 z-50 flex w-[min(90vw,420px)] flex-col bg-white shadow-2xl lg:hidden"
      >
        <!-- Header -->
        <div
          class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3"
        >
          <div class="min-w-0 pr-3">
            <h2 class="truncate font-semibold text-slate-900">
              Chủ đề luyện tập
            </h2>

            <p class="mt-0.5 truncate text-xs text-slate-500">
              Chọn loại câu hỏi và chủ đề
            </p>
          </div>

          <button
            type="button"
            aria-label="Đóng danh sách chủ đề"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition active:bg-slate-100"
            @click="closeTopicDrawer"
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
          class="drawer-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          <TopicList
            :topics="filteredTopics"
            :selected-topic-id="selectedTopicId"
            :selected-question-type="selectedQuestionType"
            @select-question-type="handleMobileSelectQuestionType"
            @select-topic="handleMobileSelectTopic"
            @clear-question-type="handleMobileClearQuestionType"
          />
        </div>
      </aside>
    </Transition>

    <!-- =====================================================
         MOBILE QUESTION DRAWER
         RIGHT -> LEFT
    ====================================================== -->
    <Transition name="drawer-right">
      <aside
        v-if="isQuestionDrawerOpen"
        class="mobile-drawer fixed inset-y-0 right-0 z-50 flex w-[min(90vw,390px)] flex-col bg-white shadow-2xl lg:hidden"
      >
        <!-- Header -->
        <div
          class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3"
        >
          <div class="min-w-0 pr-3">
            <h2 class="truncate font-semibold text-slate-900">
              Danh sách câu hỏi
            </h2>

            <p class="mt-0.5 truncate text-xs text-slate-500">
              <template v-if="questions.length">
                {{ questions.length }} câu
              </template>

              <template v-else> Chưa có câu hỏi </template>
            </p>
          </div>

          <button
            type="button"
            aria-label="Đóng danh sách câu hỏi"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition active:bg-slate-100"
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

        <!-- Scroll -->
        <div
          class="drawer-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          <QuestionList
            :questions="questions"
            :selected-question-id="selectedQuestionId"
            :user-answers="userAnswers"
            @select-question="handleMobileSelectQuestion"
            @reset="requestResetPractice"
          />
        </div>
      </aside>
    </Transition>

    <!-- =====================================================
         CONFIRM RESET MODAL
    ====================================================== -->
    <ConfirmModal
      v-model="isResetConfirmOpen"
      title="Xóa kết quả luyện tập?"
      message="Toàn bộ đáp án và kết quả bạn đã làm sẽ bị xóa. Thao tác này không thể hoàn tác."
      variant="danger"
      confirm-text="Xóa kết quả"
      cancel-text="Hủy"
      :show-cancel="true"
      :close-on-overlay="false"
      @confirm="confirmResetPractice"
      @cancel="cancelResetPractice"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { useRoute, useRouter } from "vue-router";

import { QuestionType } from "@/pkg/enums/questionType";

import type { TopicInterface } from "@/pkg/interfaces/topic";

import type { QuestionInterface } from "@/pkg/interfaces/question";

import type { UserAnswer } from "@/pkg/interfaces/userAnswer";

import dataTopics from "@/data/topic.json";
import dataQuestions from "@/data/chuyen_nganh.json";

import TopicList from "@/components/practice/TopicList.vue";
import QuestionRenderer from "@/components/practice/QuestionRenderer.vue";
import QuestionList from "@/components/practice/QuestionList.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";

/**
 * =========================
 * TYPES
 * =========================
 */

type PracticeQuestionType =
  | typeof QuestionType.MULTIPLE_CHOICE
  | typeof QuestionType.FILL_IN_BLANK
  | typeof QuestionType.SITUATION;

/**
 * =========================
 * CONSTANTS
 * =========================
 */

const STORAGE_KEY = "practice-user-answers";

const route = useRoute();

const router = useRouter();

/**
 * =========================
 * STATE
 * =========================
 */

const topics = ref<TopicInterface[]>([]);

const selectedQuestionType = ref<PracticeQuestionType | null>(null);

const selectedTopicId = ref<number | null>(null);

const selectedQuestionId = ref<string | null>(null);

/**
 * Answer lưu theo questionId.
 */
const userAnswers = ref<Record<string, UserAnswer>>({});

/**
 * =========================
 * MOBILE DRAWER
 * =========================
 */

const isTopicDrawerOpen = ref(false);

const isQuestionDrawerOpen = ref(false);

/**
 * =========================
 * CONFIRM MODAL
 * =========================
 */

const isResetConfirmOpen = ref(false);

/**
 * Ép kiểu JSON một lần.
 */
const allQuestions = dataQuestions as QuestionInterface[];

/**
 * =========================
 * TYPE GUARD
 * =========================
 */

const isPracticeQuestionType = (
  value: unknown,
): value is PracticeQuestionType => {
  return (
    value === QuestionType.MULTIPLE_CHOICE ||
    value === QuestionType.FILL_IN_BLANK ||
    value === QuestionType.SITUATION
  );
};

/**
 * =========================
 * FILTERED TOPICS
 * =========================
 *
 * Chỉ hiện topic có dữ liệu
 * thuộc question type hiện tại.
 */

const filteredTopics = computed<TopicInterface[]>(() => {
  if (selectedQuestionType.value === null) {
    return [];
  }

  const availableTopicIds = new Set<number>(
    allQuestions
      .filter((question) => question.type === selectedQuestionType.value)
      .map((question) => question.topicId),
  );

  return topics.value.filter((topic) => availableTopicIds.has(topic.id));
});

/**
 * =========================
 * QUESTIONS
 * =========================
 *
 * Lọc theo:
 *
 * type + topicId
 */

const questions = computed<QuestionInterface[]>(() => {
  if (selectedQuestionType.value === null || selectedTopicId.value === null) {
    return [];
  }

  return allQuestions.filter(
    (question) =>
      question.type === selectedQuestionType.value &&
      question.topicId === selectedTopicId.value,
  );
});

/**
 * =========================
 * CURRENT QUESTION
 * =========================
 */

const currentQuestion = computed<QuestionInterface | null>(() => {
  if (!selectedQuestionId.value) {
    return null;
  }

  return (
    questions.value.find(
      (question) => question.id === selectedQuestionId.value,
    ) ?? null
  );
});

/**
 * =========================
 * CURRENT INDEX
 * =========================
 */

const currentQuestionIndex = computed(() => {
  if (!selectedQuestionId.value) {
    return -1;
  }

  return questions.value.findIndex(
    (question) => question.id === selectedQuestionId.value,
  );
});

/**
 * =========================
 * CURRENT ANSWER
 * =========================
 */

const currentUserAnswer = computed<UserAnswer | null>(() => {
  if (!currentQuestion.value) {
    return null;
  }

  return userAnswers.value[currentQuestion.value.id] ?? null;
});

/**
 * =========================
 * TYPE LABEL
 * =========================
 */

const getQuestionTypeLabel = (type: PracticeQuestionType | null): string => {
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return "Trắc nghiệm";

    case QuestionType.FILL_IN_BLANK:
      return "Trả lời ngắn";

    case QuestionType.SITUATION:
      return "Tình huống";

    default:
      return "";
  }
};

const currentQuestionTypeLabel = computed(() =>
  getQuestionTypeLabel(selectedQuestionType.value),
);

/**
 * =========================
 * TYPE BADGE
 * =========================
 */

const questionTypeBadgeClass = computed(() => {
  switch (selectedQuestionType.value) {
    case QuestionType.MULTIPLE_CHOICE:
      return "bg-blue-50 text-blue-700";

    case QuestionType.FILL_IN_BLANK:
      return "bg-violet-50 text-violet-700";

    case QuestionType.SITUATION:
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
});

/**
 * =========================
 * UPDATE URL
 * =========================
 *
 * /practice
 * ?type=MULTIPLE_CHOICE
 * &topicId=1
 * &questionId=abc
 */

const updateUrl = async (
  type: PracticeQuestionType | null,
  topicId: number | null,
  questionId: string | null,
) => {
  const query = {
    ...route.query,
  };

  /**
   * Type
   */
  if (type !== null) {
    query.type = type;
  } else {
    delete query.type;
  }

  /**
   * Topic
   */
  if (topicId !== null) {
    query.topicId = String(topicId);
  } else {
    delete query.topicId;
  }

  /**
   * Question
   */
  if (questionId) {
    query.questionId = questionId;
  } else {
    delete query.questionId;
  }

  await router.replace({
    query,
  });
};

/**
 * =========================
 * SELECT QUESTION TYPE
 * =========================
 */

const handleSelectQuestionType = async (type: PracticeQuestionType) => {
  if (!isPracticeQuestionType(type)) {
    return;
  }

  /**
   * Nếu type hiện tại đã đúng
   * thì không reset topic/question.
   */
  if (selectedQuestionType.value === type) {
    return;
  }

  selectedQuestionType.value = type;

  /**
   * Chỉ reset khi user
   * thực sự đổi loại câu hỏi.
   */
  selectedTopicId.value = null;

  selectedQuestionId.value = null;

  await updateUrl(type, null, null);
};

/**
 * =========================
 * CLEAR QUESTION TYPE
 * =========================
 */

const handleClearQuestionType = async () => {
  selectedQuestionType.value = null;

  selectedTopicId.value = null;

  selectedQuestionId.value = null;

  await updateUrl(null, null, null);
};

/**
 * =========================
 * SELECT TOPIC
 * =========================
 */

const handleSelectTopic = async (topicId: number) => {
  if (selectedQuestionType.value === null) {
    return;
  }

  /**
   * Topic phải tồn tại
   * trong type hiện tại.
   */
  const topicExists = filteredTopics.value.some(
    (topic) => topic.id === topicId,
  );

  if (!topicExists) {
    return;
  }

  /**
   * Click lại topic đang chọn
   * thì giữ nguyên question.
   */
  if (selectedTopicId.value === topicId && selectedQuestionId.value !== null) {
    return;
  }

  const topicQuestions = allQuestions.filter(
    (question) =>
      question.type === selectedQuestionType.value &&
      question.topicId === topicId,
  );

  const firstQuestion = topicQuestions[0] ?? null;

  selectedTopicId.value = topicId;

  selectedQuestionId.value = firstQuestion?.id ?? null;

  await updateUrl(
    selectedQuestionType.value,
    topicId,
    firstQuestion?.id ?? null,
  );
};

/**
 * =========================
 * SELECT QUESTION
 * =========================
 */

const handleSelectQuestion = async (questionId: string) => {
  if (selectedQuestionType.value === null || selectedTopicId.value === null) {
    return;
  }

  const questionExists = questions.value.some(
    (question) => question.id === questionId,
  );

  if (!questionExists) {
    return;
  }

  /**
   * Không update URL thừa.
   */
  if (selectedQuestionId.value === questionId) {
    return;
  }

  selectedQuestionId.value = questionId;

  await updateUrl(
    selectedQuestionType.value,
    selectedTopicId.value,
    questionId,
  );
};

/**
 * =========================
 * ANSWER
 * =========================
 */

const handleAnswer = (answer: UserAnswer) => {
  userAnswers.value = {
    ...userAnswers.value,

    [answer.questionId]: answer,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(userAnswers.value));
};

/**
 * =========================================================
 * RESET PRACTICE MODAL
 * =========================================================
 */

/**
 * Chỉ mở modal.
 *
 * Không xóa dữ liệu tại đây.
 */
const requestResetPractice = () => {
  /**
   * Đóng drawer trước.
   *
   * Tránh drawer overlay và
   * modal overlay chồng lên nhau
   * trên Safari/iPhone.
   */
  closeDrawers();

  isResetConfirmOpen.value = true;
};

/**
 * User xác nhận reset.
 */
const confirmResetPractice = async () => {
  /**
   * Modal cũng tự đóng thông qua
   * v-model, nhưng set false ở đây
   * giúp state luôn rõ ràng.
   */
  isResetConfirmOpen.value = false;

  /**
   * Xóa toàn bộ câu trả lời.
   */
  userAnswers.value = {};

  localStorage.removeItem(STORAGE_KEY);

  /**
   * Nếu chưa chọn loại câu hỏi
   * hoặc topic thì không cần
   * xử lý thêm.
   */
  if (selectedQuestionType.value === null || selectedTopicId.value === null) {
    return;
  }

  /**
   * Quay về câu đầu tiên
   * của topic hiện tại.
   */
  const firstQuestion = questions.value[0] ?? null;

  selectedQuestionId.value = firstQuestion?.id ?? null;

  await updateUrl(
    selectedQuestionType.value,
    selectedTopicId.value,
    firstQuestion?.id ?? null,
  );

  /**
   * Safari mobile:
   * đưa viewport về đầu.
   */
  if (window.innerWidth < 1024) {
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    });
  }
};

/**
 * User hủy reset.
 */
const cancelResetPractice = () => {
  isResetConfirmOpen.value = false;
};

/**
 * =========================
 * PREVIOUS QUESTION
 * =========================
 */

const selectPreviousQuestion = async () => {
  const index = currentQuestionIndex.value;

  if (index <= 0) {
    return;
  }

  const previousQuestion = questions.value[index - 1];

  if (!previousQuestion) {
    return;
  }

  await handleSelectQuestion(previousQuestion.id);

  /**
   * Mobile Safari:
   * không dùng smooth.
   */
  if (window.innerWidth < 1024) {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }
};

/**
 * =========================
 * NEXT QUESTION
 * =========================
 */

const selectNextQuestion = async () => {
  const index = currentQuestionIndex.value;

  if (index < 0 || index >= questions.value.length - 1) {
    return;
  }

  const nextQuestion = questions.value[index + 1];

  if (!nextQuestion) {
    return;
  }

  await handleSelectQuestion(nextQuestion.id);

  /**
   * Safari mobile:
   * tránh smooth scroll.
   */
  if (window.innerWidth < 1024) {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }
};

/**
 * =========================
 * MOBILE DRAWER
 * =========================
 */

/**
 * Safari iOS đôi khi vẫn
 * scroll body dù overlay phủ.
 */
const lockBodyScroll = () => {
  document.documentElement.classList.add("practice-drawer-open");

  document.body.classList.add("practice-drawer-open");
};

const unlockBodyScroll = () => {
  document.documentElement.classList.remove("practice-drawer-open");

  document.body.classList.remove("practice-drawer-open");
};

/**
 * Topic drawer
 */
const openTopicDrawer = () => {
  isQuestionDrawerOpen.value = false;

  isTopicDrawerOpen.value = true;

  lockBodyScroll();
};

const closeTopicDrawer = () => {
  isTopicDrawerOpen.value = false;

  if (!isQuestionDrawerOpen.value) {
    unlockBodyScroll();
  }
};

/**
 * Question drawer
 */
const openQuestionDrawer = () => {
  isTopicDrawerOpen.value = false;

  isQuestionDrawerOpen.value = true;

  lockBodyScroll();
};

const closeQuestionDrawer = () => {
  isQuestionDrawerOpen.value = false;

  if (!isTopicDrawerOpen.value) {
    unlockBodyScroll();
  }
};

/**
 * Close all.
 */
const closeDrawers = () => {
  isTopicDrawerOpen.value = false;

  isQuestionDrawerOpen.value = false;

  unlockBodyScroll();
};

/**
 * =========================
 * MOBILE SELECT HANDLERS
 * =========================
 */

/**
 * Khi chọn question type:
 *
 * giữ drawer mở vì user còn
 * phải chọn topic.
 */
const handleMobileSelectQuestionType = async (type: PracticeQuestionType) => {
  await handleSelectQuestionType(type);
};

/**
 * Chọn topic xong:
 *
 * đóng drawer.
 */
const handleMobileSelectTopic = async (topicId: number) => {
  await handleSelectTopic(topicId);

  closeTopicDrawer();
};

/**
 * Clear type:
 *
 * giữ sidebar mở.
 */
const handleMobileClearQuestionType = async () => {
  await handleClearQuestionType();
};

/**
 * Chọn câu:
 *
 * đóng question drawer.
 */
const handleMobileSelectQuestion = async (questionId: string) => {
  await handleSelectQuestion(questionId);

  closeQuestionDrawer();

  /**
   * Safari-safe:
   * không dùng smooth.
   */
  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  });
};

/**
 * =========================
 * ESCAPE
 * =========================
 */

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key !== "Escape") {
    return;
  }

  /**
   * ConfirmModal tự xử lý ESC.
   *
   * Không đóng drawer/modal
   * hai lần.
   */
  if (isResetConfirmOpen.value) {
    return;
  }

  closeDrawers();
};

/**
 * =========================
 * RESIZE
 * =========================
 *
 * Nếu user mở drawer mobile
 * rồi resize lên desktop:
 *
 * đóng drawer + unlock body.
 */

const handleWindowResize = () => {
  if (window.innerWidth >= 1024) {
    closeDrawers();
  }
};

/**
 * =========================
 * RESTORE USER ANSWERS
 * =========================
 */

const restoreUserAnswers = () => {
  try {
    const savedAnswers = localStorage.getItem(STORAGE_KEY);

    if (!savedAnswers) {
      return;
    }

    userAnswers.value = JSON.parse(savedAnswers) as Record<string, UserAnswer>;
  } catch (error) {
    console.error("Không thể khôi phục câu trả lời:", error);

    localStorage.removeItem(STORAGE_KEY);
  }
};

/**
 * =========================
 * INITIALIZE PRACTICE
 * =========================
 *
 * Restore theo:
 *
 * type
 * -> topicId
 * -> questionId
 */

const initializePractice = async () => {
  topics.value = dataTopics as TopicInterface[];

  restoreUserAnswers();

  if (!topics.value.length) {
    return;
  }

  /**
   * =========================
   * 1. RESTORE TYPE
   * =========================
   */

  const typeFromUrl =
    typeof route.query.type === "string" ? route.query.type : null;

  if (!isPracticeQuestionType(typeFromUrl)) {
    selectedQuestionType.value = null;

    selectedTopicId.value = null;

    selectedQuestionId.value = null;

    await updateUrl(null, null, null);

    return;
  }

  selectedQuestionType.value = typeFromUrl;

  /**
   * =========================
   * 2. RESTORE TOPIC
   * =========================
   */

  const topicIdFromUrl = Number(route.query.topicId);

  const availableTopics = filteredTopics.value;

  /**
   * Không có topic nào
   * thuộc type này.
   */
  if (availableTopics.length === 0) {
    selectedTopicId.value = null;

    selectedQuestionId.value = null;

    await updateUrl(selectedQuestionType.value, null, null);

    return;
  }

  const topicExists =
    Number.isInteger(topicIdFromUrl) &&
    availableTopics.some((topic) => topic.id === topicIdFromUrl);

  /**
   * Có type nhưng chưa có topic.
   */
  if (!topicExists) {
    selectedTopicId.value = null;

    selectedQuestionId.value = null;

    await updateUrl(selectedQuestionType.value, null, null);

    return;
  }

  selectedTopicId.value = topicIdFromUrl;

  /**
   * =========================
   * 3. QUESTIONS CỦA
   * TYPE + TOPIC
   * =========================
   */

  const topicQuestions = allQuestions.filter(
    (question) =>
      question.type === selectedQuestionType.value &&
      question.topicId === topicIdFromUrl,
  );

  if (topicQuestions.length === 0) {
    selectedQuestionId.value = null;

    await updateUrl(selectedQuestionType.value, topicIdFromUrl, null);

    return;
  }

  /**
   * =========================
   * 4. RESTORE QUESTION
   * =========================
   */

  const questionIdFromUrl =
    typeof route.query.questionId === "string" ? route.query.questionId : null;

  const questionExists =
    questionIdFromUrl !== null &&
    topicQuestions.some((question) => question.id === questionIdFromUrl);

  const initialQuestionId = questionExists
    ? questionIdFromUrl
    : topicQuestions[0].id;

  selectedQuestionId.value = initialQuestionId;

  await updateUrl(
    selectedQuestionType.value,
    topicIdFromUrl,
    initialQuestionId,
  );
};

/**
 * =========================
 * MOUNT
 * =========================
 */

onMounted(() => {
  window.addEventListener("keydown", handleEscapeKey);

  window.addEventListener("resize", handleWindowResize, {
    passive: true,
  });
});

onMounted(initializePractice);

/**
 * =========================
 * UNMOUNT
 * =========================
 */

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscapeKey);

  window.removeEventListener("resize", handleWindowResize);

  unlockBodyScroll();

  isResetConfirmOpen.value = false;
});
</script>

<style>
/**
 * ============================================================
 * IOS / SAFARI GLOBAL FIX
 * ============================================================
 */

/**
 * Khi sidebar mobile mở:
 *
 * Không cho body phía sau tiếp tục scroll.
 */
html.practice-drawer-open,
body.practice-drawer-open {
  overflow: hidden;
  overscroll-behavior: none;
}

/**
 * ============================================================
 * MOBILE DRAWER
 * ============================================================
 */

.mobile-drawer {
  /*
   * Fallback Safari cũ
   */
  height: 100vh;

  /*
   * Safari mới / Chrome mới.
   *
   * Khắc phục lỗi 100vh tính luôn
   * thanh address bar Safari.
   */
  height: 100dvh;

  /*
   * Hardware accelerated layer.
   */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);

  /*
   * Tránh repaint không cần thiết.
   */
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  /*
   * iPhone notch / Dynamic Island.
   */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);

  /*
   * Không truyền scroll ra ngoài.
   */
  overscroll-behavior: contain;
}

/**
 * ============================================================
 * DRAWER SCROLL
 * ============================================================
 */

.drawer-scroll {
  /*
   * Safari iOS momentum scrolling.
   */
  -webkit-overflow-scrolling: touch;

  /*
   * Safari/Chrome:
   * giữ scroll bên trong drawer.
   */
  overscroll-behavior-y: contain;

  /*
   * Tránh scroll ngang do children.
   */
  overflow-x: hidden;

  /*
   * Cho Safari biết đây là layer riêng.
   */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);

  /*
   * Quan trọng khi nằm trong flex.
   */
  min-height: 0;
}

/**
 * ============================================================
 * OVERLAY TRANSITION
 * ============================================================
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
 * ============================================================
 * LEFT DRAWER
 * ============================================================
 */

.drawer-left-enter-active,
.drawer-left-leave-active {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);

  will-change: transform;
}

.drawer-left-enter-from,
.drawer-left-leave-to {
  -webkit-transform: translate3d(-100%, 0, 0);

  transform: translate3d(-100%, 0, 0);
}

.drawer-left-enter-to,
.drawer-left-leave-from {
  -webkit-transform: translate3d(0, 0, 0);

  transform: translate3d(0, 0, 0);
}

/**
 * ============================================================
 * RIGHT DRAWER
 * ============================================================
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
 * ============================================================
 * REDUCE MOTION
 * ============================================================
 *
 * Respect accessibility settings của iOS/macOS.
 */

@media (prefers-reduced-motion: reduce) {
  .drawer-left-enter-active,
  .drawer-left-leave-active,
  .drawer-right-enter-active,
  .drawer-right-leave-active,
  .drawer-overlay-enter-active,
  .drawer-overlay-leave-active {
    transition-duration: 1ms !important;
  }
}
</style>
