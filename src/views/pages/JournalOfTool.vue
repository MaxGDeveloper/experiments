<script setup lang="ts">
import { onMounted } from 'vue'

const dateOfActuality = new Date().toLocaleDateString()

onMounted(() => {
  console.log('Привет')
  console.log('Сегодня:', dateOfActuality)
})
</script>

<template>
  <div class="page">
    <section>
      <h2>Журнал оснащенности изделия</h2>
      <div class="msg">
        <Message size="small" icon="pi pi-info-circle">Изделие: Деталь №1</Message>
        <Message size="small" icon="pi pi-info-circle">Дата: {{ dateOfActuality }}</Message>
      </div>
    </section>
    <section>
      <Card style="padding: 1rem; min-width: 70%; max-width: 100%">
        <template #header>
          <h3>Выберите деталь из состава</h3>
        </template>
        <template #content>
          <div style="display: flex; flex-direction: column; gap: 0.5rem">
            <div style="display: flex; justify-content: space-between">
              <Button severity="contrast" icon="pi pi-search" label="Найти оснастку" />
            </div>
            <PickList>
              <template #option="{ option }">
                {{ option.name }}
              </template>
            </PickList>
          </div>
        </template>
      </Card>
    </section>
  </div>
</template>

<style lang="css" scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.msg {
  display: flex;
  gap: 0.5rem;
}
</style>
