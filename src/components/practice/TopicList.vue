<template>
  <div
    class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <!-- Header -->
    <div class="border-b border-slate-200 bg-slate-900 px-5 py-4">
      <div class="flex items-center justify-between">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300"
          >
            Luyện tập
          </p>

          <h2 class="mt-1 text-lg font-bold text-white">Danh sách chủ đề</h2>
        </div>

        <div
          class="flex h-9 min-w-9 items-center justify-center rounded-full bg-white/10 px-3 text-sm font-semibold text-white"
        >
          {{ topics.length }}
        </div>
      </div>
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
              selectedTopicId === topic.id ? 'text-blue-700' : 'text-slate-700'
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
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TopicInterface } from "@/pkg/interfaces/topic";

defineProps<{
  topics: TopicInterface[];
  selectedTopicId: number | null;
}>();

const emit = defineEmits<{
  selectTopic: [topicId: number];
}>();

const selectTopic = (topicId: number) => {
  emit("selectTopic", topicId);
};
</script>
