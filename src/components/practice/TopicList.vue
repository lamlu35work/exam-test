<template>
  <div
    class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <!-- =========================
         HEADER
    ========================== -->
    <div class="border-b border-slate-200 bg-slate-900 px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300"
          >
            Luyện tập
          </p>

          <h2 class="mt-1 truncate text-lg font-bold text-white">
            {{
              selectedQuestionType
                ? getQuestionTypeLabel(selectedQuestionType)
                : "Chọn loại câu hỏi"
            }}
          </h2>
        </div>

        <!-- Số lượng -->
        <div
          class="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-white/10 px-3 text-sm font-semibold text-white"
        >
          {{ selectedQuestionType ? topics.length : questionTypes.length }}
        </div>
      </div>
    </div>

    <!-- =========================
         STEP 1:
         CHỌN LOẠI CÂU HỎI
    ========================== -->
    <div v-if="!selectedQuestionType" class="space-y-2 p-3">
      <button
        v-for="item in questionTypes"
        :key="item.type"
        type="button"
        class="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-white px-4 py-4 text-left transition-all duration-200 hover:border-slate-200 hover:bg-slate-50"
        @click="selectQuestionType(item.type)"
      >
        <!-- Icon / Number -->
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700"
        >
          {{ item.shortLabel }}
        </div>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-800">
            {{ item.label }}
          </p>

          <p class="mt-0.5 text-xs leading-5 text-slate-500">
            {{ item.description }}
          </p>
        </div>

        <!-- Arrow -->
        <svg
          class="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 0 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08 0Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- =========================
         STEP 2:
         CHỌN TOPIC
    ========================== -->
    <div v-else>
      <!-- Back -->
      <div class="border-b border-slate-100 px-3 py-3">
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          @click="goBack"
        >
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M12.79 5.23a.75.75 0 0 1-.02 1.06L9.06 10l3.71 3.71a.75.75 0 1 1-1.06 1.06l-4.24-4.24a.75.75 0 0 1 0-1.06l4.24-4.24a.75.75 0 0 1 1.08 0Z"
              clip-rule="evenodd"
            />
          </svg>

          Chọn loại câu hỏi khác
        </button>
      </div>

      <!-- Topic items -->
      <div class="max-h-[700px] space-y-2 overflow-y-auto p-3">
        <button
          v-for="(topic, index) in topics"
          :key="topic.id"
          type="button"
          class="group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200"
          :class="
            selectedTopicId === topic.id
              ? 'border-blue-300 bg-blue-50 shadow-sm'
              : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
          "
          @click="selectTopic(topic.id)"
        >
          <!-- Number -->
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors"
            :class="
              selectedTopicId === topic.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
            "
          >
            {{ index + 1 }}
          </div>

          <!-- Name -->
          <div class="min-w-0 flex-1">
            <p
              class="line-clamp-2 text-sm font-semibold leading-5"
              :class="
                selectedTopicId === topic.id
                  ? 'text-blue-700'
                  : 'text-slate-700'
              "
            >
              {{ topic.name }}
            </p>
          </div>

          <!-- Arrow -->
          <svg
            class="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5"
            :class="
              selectedTopicId === topic.id ? 'text-blue-600' : 'text-slate-400'
            "
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 0 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08 0Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <!-- Empty -->
        <div v-if="topics.length === 0" class="px-4 py-10 text-center">
          <p class="text-sm font-medium text-slate-600">Chưa có chủ đề</p>

          <p class="mt-1 text-xs text-slate-400">
            Loại câu hỏi này hiện chưa có dữ liệu.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuestionType } from "@/pkg/enums/questionType";
import type { TopicInterface } from "@/pkg/interfaces/topic";

/**
 * =========================
 * TYPE
 * =========================
 */

type PracticeQuestionType =
  | typeof QuestionType.MULTIPLE_CHOICE
  | typeof QuestionType.FILL_IN_BLANK
  | typeof QuestionType.SITUATION;

/**
 * =========================
 * PROPS
 * =========================
 *
 * selectedQuestionType KHÔNG còn
 * được lưu local trong component.
 *
 * Parent là source of truth.
 */

defineProps<{
  topics: TopicInterface[];
  selectedTopicId: number | null;
  selectedQuestionType: PracticeQuestionType | null;
}>();

/**
 * =========================
 * EMITS
 * =========================
 */

const emit = defineEmits<{
  selectTopic: [topicId: number];

  selectQuestionType: [questionType: PracticeQuestionType];

  clearQuestionType: [];
}>();

/**
 * =========================
 * QUESTION TYPES
 * =========================
 */

const questionTypes = [
  {
    type: QuestionType.MULTIPLE_CHOICE,
    label: "Trắc nghiệm",
    shortLabel: "TN",
    description: "Câu hỏi trắc nghiệm với một đáp án đúng.",
  },

  {
    type: QuestionType.FILL_IN_BLANK,
    label: "Trả lời ngắn",
    shortLabel: "TL",
    description: "Câu hỏi yêu cầu nhập đáp án ngắn.",
  },

  {
    type: QuestionType.SITUATION,
    label: "Tình huống",
    shortLabel: "TH",
    description: "Đọc tình huống và trả lời câu hỏi liên quan.",
  },
] as const;

/**
 * =========================
 * SELECT QUESTION TYPE
 * =========================
 *
 * Chỉ emit lên parent.
 *
 * KHÔNG set state local.
 */

const selectQuestionType = (questionType: PracticeQuestionType) => {
  emit("selectQuestionType", questionType);
};

/**
 * =========================
 * SELECT TOPIC
 * =========================
 */

const selectTopic = (topicId: number) => {
  emit("selectTopic", topicId);
};

/**
 * =========================
 * BACK
 * =========================
 *
 * Không tự set:
 *
 * selectedQuestionType = null
 *
 * vì state thuộc về parent.
 */

const goBack = () => {
  emit("clearQuestionType");
};

/**
 * =========================
 * LABEL
 * =========================
 */

const getQuestionTypeLabel = (type: PracticeQuestionType): string => {
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return "Trắc nghiệm";

    case QuestionType.FILL_IN_BLANK:
      return "Trả lời ngắn";

    case QuestionType.SITUATION:
      return "Tình huống";

    default:
      return "Danh sách chủ đề";
  }
};
</script>
