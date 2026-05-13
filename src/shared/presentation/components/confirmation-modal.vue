<script setup>
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  messageKey: {
    type: String,
    required: true
  },
  titleKey: {
    type: String,
    default: 'common.confirm'
  },
  confirmLabelKey: {
    type: String,
    default: 'common.accept'
  },
  cancelLabelKey: {
    type: String,
    default: 'common.cancel'
  },
  severity: {
    type: String,
    default: 'danger' // Default to danger for confirmation (often used for deletes)
  }
});

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

function close() {
  emit('update:visible', false);
  emit('cancel');
}

function confirm() {
  emit('update:visible', false);
  emit('confirm');
}
</script>

<template>
  <pv-dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    modal 
    :header="$t(titleKey)" 
    :style="{ width: '400px' }"
    class="confirmation-modal"
    :closable="false"
  >
    <div class="modal-content">
      <i class="pi pi-exclamation-triangle warning-icon"></i>
      <p class="message">{{ $t(messageKey) }}</p>
    </div>
    <template #footer>
      <div class="footer-actions">
        <pv-button :label="$t(cancelLabelKey)" icon="pi pi-times" text @click="close" class="p-button-secondary" />
        <pv-button :label="$t(confirmLabelKey)" icon="pi pi-check" :severity="severity" @click="confirm" autofocus />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.confirmation-modal :deep(.p-dialog-header) {
  background: #fdfdfd;
  border-bottom: 1px solid #f1f1f1;
  padding: 1.25rem;
}

.modal-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 0.5rem;
}

.warning-icon {
  font-size: 2.5rem;
  color: #f59e0b;
}

.message {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.5;
  color: #374151;
  font-weight: 500;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

:deep(.p-button) {
  border-radius: 8px;
  font-weight: 600;
}
</style>
