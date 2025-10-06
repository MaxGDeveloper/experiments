<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'enter', 'clear'])

const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = newVal
  },
)

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
})

const clear = () => {
  localValue.value = ''
  emit('clear')
}
</script>

<template>
  <IconField>
    <InputText
      v-model.trim="localValue"
      :type="type"
      :placeholder="placeholder"
      v-bind="$attrs"
      @keyup.enter="$emit('enter')"
    />
    <Transition name="slide">
      <InputIcon v-if="localValue.length !== 0" class="pi pi-times input__icon" @click="clear" />
    </Transition>
  </IconField>
</template>

<style scoped>
.slide-enter-active {
  animation: slideIn 0.3s ease-out forwards;
}

.slide-leave-active {
  animation: slideOut 0.3s ease-in forwards;
}

@keyframes slideIn {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.input__icon {
  font-size: 18px;
  transition: 0.3s ease-out;
  cursor: pointer;
}

.input__icon:hover {
  color: var(--p-button-text-primary-color);
  transition: 0.3s ease-out;
}
</style>
