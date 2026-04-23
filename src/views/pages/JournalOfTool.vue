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
    <!-- Шапка -->
    <section class="header-section">
      <h2>Журнал оснащенности изделия</h2>
      <div class="msg">
        <Message size="small" icon="pi pi-info-circle">Изделие: Деталь №1</Message>
        <Message size="small" icon="pi pi-info-circle">Дата: {{ dateOfActuality }}</Message>
      </div>
    </section>

    <!-- Двухколоночный макет -->
    <div class="two-columns">
      <!-- Левая колонка (sticky) -->
      <aside class="sidebar">
        <Card class="sidebar-card">
          <template #header>
            <h3>Выберите деталь из состава</h3>
          </template>
          <template #content>
            <div class="picklist-container">
              <Button
                severity="contrast"
                icon="pi pi-search"
                label="Найти оснастку"
                @click="getDetailTools"
                class="search-button"
              />

              <Message v-if="isLoadDissamble" severity="secondary" class="loading-message">
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
                class="custom-picklist"
              >
                <template #option="{ option }">
                  <p>{{ option }}</p>
                </template>
              </PickList>
            </div>
          </template>
        </Card>
      </aside>

      <!-- Правая колонка (список карточек) -->
      <main class="main-content">
        <Card v-for="(item, index) in visibleCards" :key="index" class="detail-card">
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
      </main>
    </div>
  </div>
</template>

<style lang="css" scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 10px;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.msg {
  display: flex;
  gap: 0.5rem;
}

.two-columns {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.sidebar {
  position: sticky;
  top: 1rem;
}

.sidebar-card {
  padding: 0.5rem;
}

.picklist-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-button {
  width: 100%;
}

.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-picklist :deep(.p-picklist-list) {
  min-height: 300px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-card {
  padding: 1rem;
  min-width: 0; /* предотвращает переполнение */
  max-width: 100%;
}

/* Адаптив для мобильных устройств */
@media (max-width: 768px) {
  .two-columns {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .sidebar {
    position: static;
  }
}
</style>
