<script setup lang="ts">
import router from '@/router'
import { PrimeIcons } from '@primevue/core/api'

function goToExperimentalPage1() {
  router.push({ name: 'ExperimentalTable1' })
}

function goToExperimentalPage2() {
  router.push({ name: 'ExperimentalTable2' })
}
function goToExperimentalPage3() {
  router.push({ name: 'ExperimentalAnim1' })
}
function goToExperimentalPage4() {
  router.push({ name: 'ExperimentalAnim2' })
}
</script>

<template>
  <div class="root">
    <section>
      <h2 style="text-align: center">Страница хаб для выхода в блоки экспериментов</h2>
    </section>

    <section style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 16px">
      <Card>
        <template #header>
          <h2>Тут все мои экспериментальные страницы</h2>
        </template>
        <template #content>
          <div style="display: flex; flex-direction: column; gap: 8px">
            <Button
              label="Табличные данные #1"
              :icon="PrimeIcons.TABLE"
              @click="goToExperimentalPage1"
            />
            <Button
              label="Табличные данные #2"
              :icon="PrimeIcons.TABLE"
              @click="goToExperimentalPage2"
            />
          </div>
        </template>
      </Card>
      <Card>
        <template #header>
          <h2>Анимации</h2>
        </template>
        <template #content>
          <div style="display: flex; flex-direction: column; gap: 8px">
            <Button label="Анимации #1" :icon="PrimeIcons.ANDROID" @click="goToExperimentalPage3" />
            <Button
              label="Анимации #2 (пакет)"
              :icon="PrimeIcons.ANDROID"
              @click="goToExperimentalPage4"
            />
          </div>
        </template>
      </Card>
    </section>
  </div>
</template>

<style lang="css" scoped>
:deep(.p-card) {
  padding: 15px;
}

.root {
  display: flex;
  flex-direction: column;
  margin: 10px;
}
</style>
