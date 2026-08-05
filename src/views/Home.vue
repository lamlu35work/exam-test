<template>
  <main
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4"
  >
    <section
      class="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12"
    >
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
        Exam System
      </p>

      <h1 class="mt-4 text-4xl font-bold text-white sm:text-5xl">
        Choose your mode
      </h1>

      <p class="mx-auto mt-4 max-w-lg text-slate-300">
        Practice questions by topic or start a complete examination.
      </p>

      <div class="mt-10 grid gap-5 sm:grid-cols-2">
        <RouterLink
          :to="{ name: 'practice-v1' }"
          class="rounded-2xl bg-blue-600 px-6 py-5 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-500"
        >
          Kiến thức chung
        </RouterLink>

        <RouterLink
          :to="{ name: 'practice-v2' }"
          class="rounded-2xl bg-blue-600 px-6 py-5 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-1 hover:bg-blue-500"
        >
          Chuyên ngành
        </RouterLink>

        <RouterLink
          :to="{ name: 'exam' }"
          class="rounded-2xl bg-emerald-600 px-6 py-5 text-lg font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-1 hover:bg-emerald-500"
        >
          Test Kiến thức chung
        </RouterLink>

        <RouterLink
          :to="{ name: 'exam' }"
          class="rounded-2xl bg-emerald-600 px-6 py-5 text-lg font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-1 hover:bg-emerald-500"
        >
          Test chuyên ngành
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
