<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center"
        @keydown.esc="handleCancel"
      >
        <!-- Overlay -->
        <button
          type="button"
          aria-label="Đóng thông báo"
          class="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"
          @click="handleOverlayClick"
        />

        <!-- Modal -->
        <Transition name="modal-panel">
          <div
            v-if="modelValue"
            ref="modalRef"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            class="confirm-modal-panel relative z-10 w-full rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
          >
            <!-- Mobile handle -->
            <div class="flex justify-center pb-1 pt-3 sm:hidden">
              <div class="h-1.5 w-10 rounded-full bg-slate-200" />
            </div>

            <div class="p-5 sm:p-6">
              <!-- Icon -->
              <div
                class="flex h-12 w-12 items-center justify-center rounded-2xl"
                :class="iconContainerClass"
              >
                <!-- Warning -->
                <svg
                  v-if="variant === 'warning'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                  />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>

                <!-- Danger -->
                <svg
                  v-else-if="variant === 'danger'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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

                <!-- Success -->
                <svg
                  v-else-if="variant === 'success'"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>

                <!-- Info -->
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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

              <!-- Content -->
              <h2 :id="titleId" class="mt-4 text-lg font-bold text-slate-900">
                {{ title }}
              </h2>

              <p
                v-if="message"
                class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600"
              >
                {{ message }}
              </p>

              <!-- Actions -->
              <div
                class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
              >
                <button
                  v-if="showCancel"
                  type="button"
                  class="min-h-[48px] rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition active:bg-slate-100 sm:min-h-[44px] sm:hover:bg-slate-50"
                  @click="handleCancel"
                >
                  {{ cancelText }}
                </button>

                <button
                  ref="confirmButtonRef"
                  type="button"
                  class="min-h-[48px] rounded-xl px-5 text-sm font-semibold text-white transition sm:min-h-[44px]"
                  :class="confirmButtonClass"
                  @click="handleConfirm"
                >
                  {{ confirmText }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";

type ModalVariant = "info" | "warning" | "danger" | "success";

interface Props {
  modelValue: boolean;

  title?: string;

  message?: string;

  variant?: ModalVariant;

  confirmText?: string;

  cancelText?: string;

  showCancel?: boolean;

  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Thông báo",

  message: "",

  variant: "info",

  confirmText: "Đồng ý",

  cancelText: "Hủy",

  showCancel: true,

  closeOnOverlay: false,
});

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;

  (event: "confirm"): void;

  (event: "cancel"): void;
}>();

const confirmButtonRef = ref<HTMLButtonElement | null>(null);

const titleId = `confirm-modal-title-${Math.random().toString(36).slice(2, 8)}`;

/**
 * =========================================================
 * STYLE
 * =========================================================
 */

const iconContainerClass = computed(() => {
  switch (props.variant) {
    case "warning":
      return "bg-amber-50 text-amber-600";

    case "danger":
      return "bg-red-50 text-red-600";

    case "success":
      return "bg-emerald-50 text-emerald-600";

    default:
      return "bg-blue-50 text-blue-600";
  }
});

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case "danger":
      return "bg-red-600 active:bg-red-700 sm:hover:bg-red-700";

    case "warning":
      return "bg-amber-500 active:bg-amber-600 sm:hover:bg-amber-600";

    case "success":
      return "bg-emerald-600 active:bg-emerald-700 sm:hover:bg-emerald-700";

    default:
      return "bg-blue-600 active:bg-blue-700 sm:hover:bg-blue-700";
  }
});

/**
 * =========================================================
 * BODY LOCK
 * =========================================================
 */

const lockBody = () => {
  document.documentElement.classList.add("confirm-modal-open");

  document.body.classList.add("confirm-modal-open");
};

const unlockBody = () => {
  document.documentElement.classList.remove("confirm-modal-open");

  document.body.classList.remove("confirm-modal-open");
};

/**
 * =========================================================
 * ACTIONS
 * =========================================================
 */

const close = () => {
  emit("update:modelValue", false);
};

const handleConfirm = () => {
  emit("confirm");

  close();
};

const handleCancel = () => {
  emit("cancel");

  close();
};

const handleOverlayClick = () => {
  if (!props.closeOnOverlay) {
    return;
  }

  handleCancel();
};

/**
 * =========================================================
 * ESC
 * =========================================================
 */

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.modelValue) {
    handleCancel();
  }
};

/**
 * =========================================================
 * WATCH
 * =========================================================
 */

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      lockBody();

      document.addEventListener("keydown", handleKeydown);

      await nextTick();

      confirmButtonRef.value?.focus();

      return;
    }

    unlockBody();

    document.removeEventListener("keydown", handleKeydown);
  },
  {
    immediate: true,
  },
);

onBeforeUnmount(() => {
  unlockBody();

  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style>
html.confirm-modal-open,
body.confirm-modal-open {
  overflow: hidden;
  overscroll-behavior: none;
}

/**
 * Safari / iOS.
 */
.confirm-modal-panel {
  max-height: calc(
    100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)
  );

  padding-bottom: env(safe-area-inset-bottom);

  -webkit-transform: translateZ(0);
  transform: translateZ(0);

  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/**
 * Overlay.
 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 180ms ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/**
 * Modal panel.
 */
.modal-panel-enter-active,
.modal-panel-leave-active {
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 180ms ease;
}

.modal-panel-enter-from,
.modal-panel-leave-to {
  opacity: 0;
  transform: translate3d(0, 24px, 0);
}

@media (min-width: 640px) {
  .modal-panel-enter-from,
  .modal-panel-leave-to {
    transform: translate3d(0, 8px, 0) scale(0.98);
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter-active,
  .modal-fade-leave-active,
  .modal-panel-enter-active,
  .modal-panel-leave-active {
    transition-duration: 1ms !important;
  }
}
</style>
