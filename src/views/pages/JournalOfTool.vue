<script setup lang="ts">
import { useJournalOfTool, type DetailFullInfo } from '@/hooks/useJournalOfTool'
import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue'

const isLoadDissamble: Ref<boolean> = ref(true)
const dateOfActuality = new Date().toLocaleDateString()

const { structureOfDetail, detailsMap, loadingState, getDetailDissamble, getDetailTools } =
  useJournalOfTool()

const visibleCards: ComputedRef<DetailFullInfo[]> = computed(() => {
  return structureOfDetail.value[1].map((designation) => {
    const detailFull: DetailFullInfo = {
      designation: designation,
      toolsList: detailsMap.get(designation) || [],
      loadingState: loadingState.get(designation) || 'idle',
    }

    return detailFull
  })
})

onMounted(async () => {
  await getDetailDissamble(isLoadDissamble)
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
              <Button
                severity="contrast"
                icon="pi pi-search"
                label="Найти оснастку"
                @click="getDetailTools"
              />
            </div>
            <Message
              v-if="isLoadDissamble"
              severity="secondary"
              style="display: flex; flex-direction: column; align-items: center"
            >
              <div>
                <ProgressSpinner />
                <h3>Загрузка данных</h3>
              </div>
            </Message>
            <PickList
              v-else
              v-model="structureOfDetail"
              :show-source-controls="false"
              :show-target-controls="false"
            >
              <template #option="{ option }">
                <p>{{ option }}</p>
              </template>
            </PickList>
            <h3>Исходный состав: {{ structureOfDetail[0].length }}</h3>
            <h3>выбранный состав: {{ structureOfDetail[1].length }}</h3>
          </div>
        </template>
      </Card>
    </section>
    <section>
      <Card
        v-for="(item, index) in visibleCards"
        :key="index"
        style="padding: 1rem; min-width: 70%; max-width: 100%"
      >
        <template #header>
          <h3>{{ item.designation }}</h3>
        </template>
        <template #content>
          <Message v-if="item.loadingState == 'idle'">Данные еще не загружались</Message>
          <Skeleton v-else-if="item.loadingState == 'loading'" height="100px" />
          <DataTable
            v-else-if="item.toolsList.length > 0 && item.loadingState == 'loaded'"
            :value="item.toolsList"
          >
            <Column field="name" header="Наименование оснастки" />
            <Column field="shifr" header="Шифр оснастки" />
            <Column field="code" header="Тип оснастки" />
            <Column field="quantity" header="Кол-во" />
          </DataTable>
          <Message v-else severity="info" icon="pi pi-info-circle">Нет данных</Message>
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
  margin: 10px;
}

section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.msg {
  display: flex;
  gap: 0.5rem;
}
</style>
