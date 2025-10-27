<script setup lang="ts">
import router from '@/router'
import { PrimeIcons } from '@primevue/core/api'

function goToExperimentalPage1() {
  router.push({ name: 'ExperimentalTable1' })
}

function goToExperimentalPage2() {
  router.push({ name: 'ExperimentalTable2' })
}
</script>

<template>
  <div class="root">
    <section>
      <h2 style="text-align: center">Страница хаб для выхода в блоки экспериментов</h2>
    </section>

    <section style="display: flex; flex-wrap: wrap">
      <Card style="padding: 15px">
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
    </section>
  </div>
</template>

<style lang="css" scoped>
.root {
  display: flex;
  flex-direction: column;
  margin: 10px;
}
</style>
