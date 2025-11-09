<script setup lang="ts">
import { ref } from 'vue'

const isVisibleCont = ref(false)
</script>

<template>
  <div style="margin: 10px">
    <section>
      <h2 style="text-align: center; margin: 5px">Адаптивная анимация (flex-basis)</h2>
    </section>

    <section style="display: flex; justify-content: center; margin-bottom: 12px">
      <!-- Используй свою Button (PrimeVue) или <button> -->
      <Button label="Показать / скрыть контейнер №2" @click="isVisibleCont = !isVisibleCont" />
    </section>

    <section class="main-section">
      <!-- Левый контейнер: flex-basis меняется при появлении правого -->
      <div class="container left" :class="{ narrow: isVisibleCont }">
        <p class="text">Контейнер №1 (левая часть)</p>
      </div>

      <!-- Правый контейнер: обёрнут в <transition> для плавного входа/выхода -->
      <transition name="slide-fade" appear>
        <div v-if="isVisibleCont" class="container right">
          <p class="text">Контейнер №2 (правая часть)</p>
          <Button severity="help" label="Скрыть контейнер" @click="isVisibleCont = false" />
        </div>
      </transition>
    </section>
  </div>
</template>

<style scoped>
/* Общая обёртка */
.main-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  /* Позволяет контейнерам плавно перераспределять место */
  width: 100%;
}

/* Общие стили контейнера */
.container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: var(--p-card-background);
  border-radius: 12px;
  overflow: hidden;
  /* плавный переход для flex-basis и ограничений */
  transition:
    flex-basis 480ms ease,
    max-width 480ms ease,
    transform 320ms ease,
    opacity 320ms ease;
  box-sizing: border-box;
}

/* Левый: по умолчанию занимает всё доступное место */
.left {
  flex: 0 0 100%;
  max-width: 100%;
  min-width: 200px; /* чтобы не совсем сваливался */
}

/* Когда правый контейнер виден — левый сужается */
.left.narrow {
  flex: 0 0 58%;
  max-width: 58%;
}

/* Правый контейнер фиксированного относительного размера */
.right {
  flex: 0 0 40%;
  max-width: 40%;
  min-width: 220px;
}

/* Переход появления/исчезновения правого контейнера */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 360ms ease,
    transform 360ms ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(18px);
}

.slide-fade-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

/* Небольшая стилизация текста */
.text {
  text-align: center;
  margin: 8px 0;
}

/* Адаптив: на узких экранах — стекать вертикально */
@media (max-width: 800px) {
  .main-section {
    flex-direction: column;
  }
  .left,
  .left.narrow,
  .right {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
}
</style>
