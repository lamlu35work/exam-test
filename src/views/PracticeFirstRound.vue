<template>
  <div class="min-h-screen bg-slate-100 p-6">
    <div
      class="mx-auto grid max-w-[1800px] grid-cols-[460px_minmax(0,1fr)_350px] gap-6"
    >
      <!-- Danh sách chủ đề -->
      <aside class="w-1/4 min-w-[460px]">
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
        class="min-h-[600px] flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <template v-if="currentQuestion">
          <!-- Thông tin câu hỏi -->
          <div
            class="mb-6 flex items-center justify-between border-b border-slate-200 pb-4"
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

          <!-- Component hiển thị theo loại câu hỏi -->
          <QuestionRenderer
            v-if="currentQuestion"
            :key="currentQuestion.id"
            :question="currentQuestion"
            :initial-answer="currentUserAnswer"
            @answer="handleAnswer"
          />

          <!-- Điều hướng câu hỏi -->
          <div class="mt-8 flex items-center justify-between border-t pt-5">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentQuestionIndex <= 0"
              @click="selectPreviousQuestion"
            >
              Câu trước
            </button>

            <button
              type="button"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentQuestionIndex >= questions.length - 1"
              @click="selectNextQuestion"
            >
              Câu tiếp theo
            </button>
          </div>
        </template>

        <div
          v-else
          class="flex min-h-[500px] items-center justify-center text-center"
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

      <!-- List câu hỏi -->
      <aside class="min-w-0">
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
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { TopicInterface } from "@/pkg/interfaces/topic";
import type { QuestionInterface } from "@/pkg/interfaces/question";
import type { UserAnswer } from "@/pkg/interfaces/userAnswer";

import dataTopics from "@/data/ktc_topic.json";
import dataQuestions from "@/data/ktc.json";

import TopicList from "@/components/practice/TopicList.vue";
import QuestionRenderer from "@/components/practice/QuestionRenderer.vue";
import QuestionList from "@/components/practice/QuestionList.vue";

const STORAGE_KEY = "practice-user-answers";

const route = useRoute();
const router = useRouter();

const topics = ref<TopicInterface[]>([]);
const selectedTopicId = ref<number | null>(null);
const selectedQuestionId = ref<string | null>(null);

/**
 * Lưu câu trả lời theo questionId.
 */
const userAnswers = ref<Record<string, UserAnswer>>({});

/**
 * Ép kiểu dữ liệu JSON một lần.
 */
const allQuestions = dataQuestions as QuestionInterface[];

/**
 * Danh sách câu hỏi thuộc chủ đề đang chọn.
 */
const questions = computed<QuestionInterface[]>(() => {
  if (selectedTopicId.value === null) {
    return [];
  }

  return allQuestions.filter(
    (question) => question.topicId === selectedTopicId.value,
  );
});

/**
 * Câu hỏi hiện tại.
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
 * Vị trí câu hỏi hiện tại.
 */
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
 * Nhận đáp án từ QuestionRenderer.
 */
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

  await updateUrl(selectedTopicId.value, firstQuestion?.id ?? null);
};

/**
 * Chuyển về câu trước.
 */
const selectPreviousQuestion = async () => {
  const previousQuestion = questions.value[currentQuestionIndex.value - 1];

  if (!previousQuestion) {
    return;
  }

  await handleSelectQuestion(previousQuestion.id);
};

/**
 * Chuyển sang câu tiếp theo.
 */
const selectNextQuestion = async () => {
  const nextQuestion = questions.value[currentQuestionIndex.value + 1];

  if (!nextQuestion) {
    return;
  }

  await handleSelectQuestion(nextQuestion.id);
};

/**
 * Khôi phục câu trả lời đã lưu.
 */
const restoreUserAnswers = () => {
  try {
    const savedAnswers = localStorage.getItem("practice-user-answers");

    if (!savedAnswers) {
      return;
    }

    userAnswers.value = JSON.parse(savedAnswers) as Record<string, UserAnswer>;
  } catch (error) {
    console.error("Không thể khôi phục câu trả lời:", error);
    localStorage.removeItem("practice-user-answers");
  }
};

/**
 * Khởi tạo trang luyện tập từ URL.
 */
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

onMounted(initializePractice);
</script>
