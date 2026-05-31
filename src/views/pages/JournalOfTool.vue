<script setup lang="ts">
import { useJournalOfTool, type DetailFullInfo } from '@/hooks/useJournalOfTool'
import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue'

const isLoadDissamble: Ref<boolean> = ref(true)
const dateOfActuality = new Date().toLocaleDateString()
const isFilterVisible: Ref<boolean> = ref(true)

const { sourceItems, selectedItems, detailsMap, loadingState, getDetailDissamble, getDetailTools } =
  useJournalOfTool()

const visibleCards: ComputedRef<DetailFullInfo[]> = computed(() => {
  return selectedItems.value
    .filter((designation) => loadingState.get(designation) === 'loaded')
    .map((designation) => {
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
    <div class="two-columns" :class="{ 'filter-collapsed': !isFilterVisible }">
      <!-- Левая колонка (sticky) -->
      <aside class="sidebar">
        <Card class="sidebar-card">
          <template #header>
            <div class="card-header">
              <h3 v-show="isFilterVisible">Выберите деталь из состава</h3>
              <Button
                :icon="isFilterVisible ? 'pi pi-angle-left' : 'pi pi-angle-right'"
                severity="contrast"
                variant="text"
                rounded
                type="button"
                @click="isFilterVisible = !isFilterVisible"
              />
            </div>
          </template>
          <template #content>
            <transition name="filter-panel">
              <div v-show="isFilterVisible" class="listbox-container">
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

                <ListBox
                  v-else
                  v-model="selectedItems"
                  :options="sourceItems"
                  multiple
                  checkbox
                  class="custom-listbox"
                  listStyle="min-height: 300px"
                >
                  <template #option="{ option }">
                    <p>{{ option }}</p>
                  </template>
                </ListBox>
              </div>
            </transition>
          </template>
        </Card>
      </aside>

      <!-- Правая колонка (список карточек) -->
      <main class="main-content">
        <transition-group name="card-fade" tag="div" class="cards-container">
          <Card v-for="item in visibleCards" :key="item.designation" class="detail-card">
            <template #header>
              <h3>{{ item.designation }}</h3>
            </template>
            <template #content>
              <p v-if="item.loadingState == 'idle'">Данные еще не загружались</p>
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
        </transition-group>
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

.listbox-container {
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

.custom-listbox :deep(.p-listbox-list) {
  min-height: 300px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.detail-card {
  padding: 1rem;
  min-width: 0; /* предотвращает переполнение */
  max-width: 100%;
}

/* Анимация для карточек */
.card-fade-move,
.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.4s ease;
}

.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
}

/* Плавное перемещение соседних карточек при добавлении/удалении */
.card-fade-move {
  transition: transform 0.4s ease;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.filter-panel-enter-active,
.filter-panel-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.filter-panel-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}

.filter-panel-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.two-columns.filter-collapsed {
  grid-template-columns: auto 1fr;
}

.two-columns.filter-collapsed .sidebar :deep(.p-card-content) {
  display: none;
}
</style>
