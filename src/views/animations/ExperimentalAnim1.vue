<script setup lang="ts">
import { type Ref, ref } from 'vue'

const isVisibleCont: Ref<boolean> = ref(true)
</script>

<template>
  <div style="margin: 10px">
    <section>
      <h2 style="text-align: center; margin: 5px">Эксперименты с анимациями</h2>
    </section>

    <section style="display: flex; justify-content: center">
      <Button label="Показать/скрыть 2 контейнер" @click="isVisibleCont = !isVisibleCont" />
    </section>

    <section style="display: flex; justify-content: space-around; gap: 16px">
      <div class="container">
        <p v-if="!isVisibleCont" class="text">Контейнер №2 скрыт</p>
      </div>
      <div class="container">
        <p v-if="isVisibleCont" class="text">Контейнер №2 показан</p>
        <Button severity="help" label="Скрыть контейнер" @click="isVisibleCont = !isVisibleCont" />
      </div>
    </section>
  </div>
</template>

<style lang="css" scoped>
.container {
  padding: 10px;
  height: 500px;
  width: 400px;
  background-color: aquamarine;
  border-radius: 12px;
}

.text {
  text-align: center;
}
</style>
