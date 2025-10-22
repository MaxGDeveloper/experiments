<script setup lang="ts">
import { computed, type ComputedRef, onMounted, onUnmounted, type Ref, ref } from 'vue'

const time: Ref<number> = ref(15)
let timeInterval: NodeJS.Timeout | null

function startTimer() {
  timeInterval = setInterval(() => {
    if (time.value != 0) {
      time.value--
    } else {
      console.log('Время вышло')
      stopTimer()
      setInterval(() => {
        window.location.reload()
      }, 3000)
    }
  }, 1000)
}

async function stopTimer() {
  clearTimeout(timeInterval as NodeJS.Timeout)
}

async function clearTime() {
  clearTimeout(timeInterval as NodeJS.Timeout)
  time.value = 120
}

const formattedTime: ComputedRef<string> = computed(() => {
  const minutes = Math.floor(time.value / 60)
  const seconds = time.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
  clearTime()
})
</script>

<template>
  <div>
    <h2 style="text-align: center">Оставшееся время: {{ formattedTime }}</h2>
    <div style="display: flex; gap: 8px">
      <Button label="Запустить время" @click="startTimer()" />
      <Button label="Остановить время" @click="stopTimer()" />
      <Button label="Сбросить время" @click="clearTime()" />
    </div>
  </div>
</template>
