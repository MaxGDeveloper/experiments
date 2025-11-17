<script setup lang="ts">
import 'animate.css'
import { ref, type Ref } from 'vue'

const isOpenCont: Ref<boolean> = ref(false)
</script>

<template>
  <div style="margin: 10px">
    <section>
      <h1 style="text-align: center">Эксперименты с анимациями через пакет (animate.css)</h1>
    </section>

    <section>
      <Button @click="isOpenCont = !isOpenCont" label="Скрыть/Показать контейнер" />

      <div style="display: flex; justify-content: flex-start">
        <Transition
          enter-active-class="animate__animated aanimate__slideOutDown"
          leave-active-class="animate__animated animate__fadeOut"
        >
          <Card v-if="isOpenCont" style="margin-top: 10px">
            <template #content>
              <p>Текст</p>
              <p>Текст</p>
              <p>Текст</p>
              <p>Текст</p>
              <p>Текст</p>
              <p>Текст</p>
              <p>Текст</p>
              <p>Текст</p>
              <p>Текст</p>
              <p>Текст</p>
              <p>Текст</p>
            </template>
          </Card>
        </Transition>
      </div>
    </section>
  </div>
</template>
