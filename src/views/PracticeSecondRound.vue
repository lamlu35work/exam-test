<template>
  <div class="min-h-screen bg-slate-100">
    <!-- Mobile header -->
    <header
      class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden"
    >
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
        @click="openTopicSidebar"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>

        Chủ đề
      </button>

      <div class="min-w-0 px-3 text-center">
        <p class="truncate text-sm font-semibold text-slate-800">Luyện tập</p>

        <p v-if="currentQuestion" class="text-xs text-slate-500">
          Câu {{ currentQuestionIndex + 1 }}/{{ questions.length }}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
        @click="openQuestionSidebar"
      >
        Câu hỏi

        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M8 6h12M8 12h12M8 18h12" />
          <path d="M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      </button>
    </header>

    <div class="p-3 sm:p-4 lg:p-6">
      <div
        class="mx-auto grid max-w-[1800px] grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)_320px] lg:gap-6 xl:grid-cols-[460px_minmax(0,1fr)_350px]"
      >
        <!-- Danh sách chủ đề desktop -->
        <aside class="hidden min-w-0 lg:block">
          <TopicList
            v-if="topics.length"
            :topics="topics"
            :selected-topic-id="selectedTopicId"
            @select-topic="handleSelectTopic"
          />

          <div
            v-else
            class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm"
          >
            Không có chủ đề nào.
          </div>
        </aside>

        <!-- Nội dung câu hỏi -->
        <main
          class="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:min-h-[600px] lg:rounded-2xl lg:p-6"
        >
          <template v-if="currentQuestion">
            <!-- Thông tin câu hỏi -->
            <div
              class="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 lg:mb-6"
            >
              <span class="text-sm font-medium text-slate-500">
                Câu {{ currentQuestionIndex + 1 }}/{{ questions.length }}
              </span>

              <span
                class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                Chủ đề {{ currentQuestion.topicId }}
              </span>
            </div>

            <QuestionRenderer
              :key="currentQuestion.id"
              :question="currentQuestion"
              :initial-answer="currentUserAnswer"
              @answer="handleAnswer"
            />

            <!-- Điều hướng câu hỏi -->
            <div
              class="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 lg:mt-8"
            >
              <button
                type="button"
                class="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4"
                :disabled="currentQuestionIndex <= 0"
                @click="selectPreviousQuestion"
              >
                Câu trước
              </button>

              <button
                type="button"
                class="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-4"
                :disabled="currentQuestionIndex >= questions.length - 1"
                @click="selectNextQuestion"
              >
                Câu tiếp theo
              </button>
            </div>
          </template>

          <div
            v-else
            class="flex min-h-[400px] items-center justify-center text-center lg:min-h-[500px]"
          >
            <div>
              <h2 class="text-xl font-semibold text-slate-800">
                Không tìm thấy câu hỏi
              </h2>

              <p class="mt-2 text-sm text-slate-500">
                Chủ đề này hiện chưa có câu hỏi.
              </p>
            </div>
          </div>
        </main>

        <!-- Danh sách câu hỏi desktop -->
        <aside class="hidden min-w-0 lg:block">
          <QuestionList
            :questions="questions"
            :selected-question-id="selectedQuestionId"
            :user-answers="userAnswers"
            @select-question="handleSelectQuestion"
            @reset="resetPractice"
          />
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
        v-if="isMobileSidebarOpen"
        type="button"
        aria-label="Đóng sidebar"
        class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
        @click="closeMobileSidebars"
      />
    </Transition>

    <!-- Topic sidebar mobile -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="isTopicSidebarOpen"
        class="fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-[380px] flex-col bg-slate-100 shadow-2xl lg:hidden"
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-4"
        >
          <div>
            <h2 class="font-semibold text-slate-900">Danh sách chủ đề</h2>

            <p class="mt-0.5 text-xs text-slate-500">
              Chọn chủ đề muốn luyện tập
            </p>
          </div>

          <button
            type="button"
            aria-label="Đóng danh sách chủ đề"
            class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            @click="closeMobileSidebars"
          >
            <svg
              class="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-3">
          <TopicList
            v-if="topics.length"
            :topics="topics"
            :selected-topic-id="selectedTopicId"
            @select-topic="handleMobileSelectTopic"
          />

          <div
            v-else
            class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm"
          >
            Không có chủ đề nào.
          </div>
        </div>
      </aside>
    </Transition>

    <!-- Question sidebar mobile -->
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
        class="fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-[380px] flex-col bg-slate-100 shadow-2xl lg:hidden"
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-4"
        >
          <div>
            <h2 class="font-semibold text-slate-900">Danh sách câu hỏi</h2>

            <p class="mt-0.5 text-xs text-slate-500">
              {{ questions.length }} câu hỏi
            </p>
          </div>

          <button
            type="button"
            aria-label="Đóng danh sách câu hỏi"
            class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            @click="closeMobileSidebars"
          >
            <svg
              class="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-3">
          <QuestionList
            :questions="questions"
            :selected-question-id="selectedQuestionId"
            :user-answers="userAnswers"
            @select-question="handleMobileSelectQuestion"
            @reset="resetPractice"
          />
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { TopicInterface } from "@/pkg/interfaces/topic";
import type { QuestionInterface } from "@/pkg/interfaces/question";
import type { UserAnswer } from "@/pkg/interfaces/userAnswer";

import dataTopics from "@/data/topic.json";
import dataQuestions from "@/data/chuyen_nganh.json";

import TopicList from "@/components/practice/TopicList.vue";
import QuestionRenderer from "@/components/practice/QuestionRenderer.vue";
import QuestionList from "@/components/practice/QuestionList.vue";

const STORAGE_KEY = "practice-user-answers";

const route = useRoute();
const router = useRouter();

const topics = ref<TopicInterface[]>([]);
const selectedTopicId = ref<number | null>(null);
const selectedQuestionId = ref<string | null>(null);

const isTopicSidebarOpen = ref(false);
const isQuestionSidebarOpen = ref(false);

const userAnswers = ref<Record<string, UserAnswer>>({});

const allQuestions = dataQuestions as QuestionInterface[];

const questions = computed<QuestionInterface[]>(() => {
  if (selectedTopicId.value === null) {
    return [];
  }

  return allQuestions.filter(
    (question) => question.topicId === selectedTopicId.value,
  );
});

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

const currentQuestionIndex = computed(() => {
  if (!selectedQuestionId.value) {
    return -1;
  }

  return questions.value.findIndex(
    (question) => question.id === selectedQuestionId.value,
  );
});

const currentUserAnswer = computed<UserAnswer | null>(() => {
  if (!currentQuestion.value) {
    return null;
  }

  return userAnswers.value[currentQuestion.value.id] ?? null;
});

const isMobileSidebarOpen = computed(
  () => isTopicSidebarOpen.value || isQuestionSidebarOpen.value,
);

/**
 * Điều khiển sidebar mobile.
 */
const openTopicSidebar = () => {
  isQuestionSidebarOpen.value = false;
  isTopicSidebarOpen.value = true;
};

const openQuestionSidebar = () => {
  isTopicSidebarOpen.value = false;
  isQuestionSidebarOpen.value = true;
};

const closeMobileSidebars = () => {
  isTopicSidebarOpen.value = false;
  isQuestionSidebarOpen.value = false;
};

/**
 * Đóng sidebar bằng phím Escape.
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeMobileSidebars();
  }
};

/**
 * Khóa cuộn trang phía sau khi sidebar đang mở.
 */
watch(isMobileSidebarOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? "hidden" : "";
});

/**
 * Cập nhật URL.
 */
const updateUrl = async (topicId: number, questionId: string | null) => {
  const query: Record<string, string> = {
    topicId: String(topicId),
  };

  if (questionId) {
    query.questionId = questionId;
  }

  await router.replace({
    query: {
      ...route.query,
      ...query,
    },
  });
};

/**
 * Chọn chủ đề.
 */
const handleSelectTopic = async (topicId: number) => {
  const topicExists = topics.value.some((topic) => topic.id === topicId);

  if (!topicExists) {
    return;
  }

  const topicQuestions = allQuestions.filter(
    (question) => question.topicId === topicId,
  );

  const firstQuestion = topicQuestions[0] ?? null;

  selectedTopicId.value = topicId;
  selectedQuestionId.value = firstQuestion?.id ?? null;

  await updateUrl(topicId, firstQuestion?.id ?? null);
};

/**
 * Chọn topic trên mobile và đóng sidebar.
 */
const handleMobileSelectTopic = async (topicId: number) => {
  await handleSelectTopic(topicId);
  closeMobileSidebars();
};

/**
 * Chọn câu hỏi cụ thể.
 */
const handleSelectQuestion = async (questionId: string) => {
  if (selectedTopicId.value === null) {
    return;
  }

  const questionExists = questions.value.some(
    (question) => question.id === questionId,
  );

  if (!questionExists) {
    return;
  }

  selectedQuestionId.value = questionId;

  await updateUrl(selectedTopicId.value, questionId);
};

/**
 * Chọn câu hỏi trên mobile và đóng sidebar.
 */
const handleMobileSelectQuestion = async (questionId: string) => {
  await handleSelectQuestion(questionId);
  closeMobileSidebars();
};

const handleAnswer = (answer: UserAnswer) => {
  userAnswers.value[answer.questionId] = answer;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(userAnswers.value));
};

const resetPractice = async () => {
  const shouldReset = window.confirm(
    "Bạn có chắc muốn xóa toàn bộ kết quả đã làm không?",
  );

  if (!shouldReset) {
    return;
  }

  userAnswers.value = {};
  localStorage.removeItem(STORAGE_KEY);

  if (selectedTopicId.value === null) {
    return;
  }

  const firstQuestion = questions.value[0] ?? null;

  selectedQuestionId.value = firstQuestion?.id ?? null;

  closeMobileSidebars();

  await updateUrl(selectedTopicId.value, firstQuestion?.id ?? null);
};

const selectPreviousQuestion = async () => {
  const previousQuestion = questions.value[currentQuestionIndex.value - 1];

  if (!previousQuestion) {
    return;
  }

  await handleSelectQuestion(previousQuestion.id);
};

const selectNextQuestion = async () => {
  const nextQuestion = questions.value[currentQuestionIndex.value + 1];

  if (!nextQuestion) {
    return;
  }

  await handleSelectQuestion(nextQuestion.id);
};

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

const initializePractice = async () => {
  topics.value = dataTopics as TopicInterface[];

  restoreUserAnswers();

  if (!topics.value.length) {
    return;
  }

  const topicIdFromUrl = Number(route.query.topicId);

  const questionIdFromUrl =
    typeof route.query.questionId === "string" ? route.query.questionId : null;

  const defaultTopicId = topics.value[0].id;

  const topicExists =
    Number.isInteger(topicIdFromUrl) &&
    topics.value.some((topic) => topic.id === topicIdFromUrl);

  const initialTopicId = topicExists ? topicIdFromUrl : defaultTopicId;

  const topicQuestions = allQuestions.filter(
    (question) => question.topicId === initialTopicId,
  );

  const questionExists =
    questionIdFromUrl !== null &&
    topicQuestions.some((question) => question.id === questionIdFromUrl);

  const initialQuestionId = questionExists
    ? questionIdFromUrl
    : (topicQuestions[0]?.id ?? null);

  selectedTopicId.value = initialTopicId;
  selectedQuestionId.value = initialQuestionId;

  await updateUrl(initialTopicId, initialQuestionId);
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  initializePractice();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>
