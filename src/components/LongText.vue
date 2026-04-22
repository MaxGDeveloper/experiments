<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { computed, ref, type Ref } from 'vue'

interface LongTextProps {
  widthLimit?: number
  htmlTag?: string
}

const props = defineProps<LongTextProps>()

const rootElement: Ref<HTMLElement | null> = ref<HTMLElement | null>(null)
const parentWidth: Ref<number | null> = ref(null)

useResizeObserver(rootElement, () => {
  const parent = rootElement.value?.parentElement
  if (parent != null) {
    parentWidth.value = parent.clientWidth
  }
})

const componentStyle = computed(() => {
  if (props.widthLimit != null) {
    return { width: `${props.widthLimit}px` }
  }

  if (parentWidth.value !== null) {
    return { width: `${parentWidth.value}px` }
  }
  // fallback до получения ширины или на сервере
  return { width: '100%' }
})
</script>

<template>
  <div ref="rootElement">
    <component :style="componentStyle" :is="props.htmlTag ?? 'p'" class="truncate">
      <slot></slot>
    </component>
  </div>
</template>

<style lang="css" scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
