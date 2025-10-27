<script setup lang="ts">
import { useGetData, usegetSeconddata } from '@/viewModels/testViewModel'
import { onMounted } from 'vue'
import { PrimeIcons } from '@primevue/core/api'
import router from '@/router'
import CustomInput from '@/components/CustomInput.vue'

const { loadData, currentData, idFind, isDataLoading, isFirstLoaded, loadTable } = useGetData()
const { loadSecondData, workerInfo } = usegetSeconddata()

function toHome() {
  router.push({ name: 'home' })
}

onMounted(() => {
  loadData()
  loadSecondData()
})
</script>

<template>
  <div class="root">
    <section>
      <h2 style="text-align: center">Тестирую ненормальные обстоятельства</h2>
    </section>
    <section class="filter">
      <div style="display: flex; align-items: center; flex: 0.9; gap: 20px">
        <CustomInput
          style="display: flex; flex: 1"
          v-model="idFind"
          placeholder="Введите нужный ID"
          type="text"
          @enter="loadTable"
        />

        <Button @click="loadTable" icon="pi pi-search" icon-pos="left" label="Поиск" />
        <Button @click="toHome" icon="pi pi-arrow-left" icon-pos="left" label="Назад" />
      </div>
    </section>
    <section v-show="!isFirstLoaded">
      <h3 style="text-align: center">Пожалуйста, загрузите данные</h3>
    </section>
    <section v-show="isFirstLoaded">
      <DataTable
        :value="currentData"
        :loading="isDataLoading"
        loading-icon="pi pi-spinner"
        paginator
        paginator-position="top"
        :rows="100"
        :rowsPerPageOptions="[100, 250, 500, 1000]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="{first} по {last} из {totalRecords}"
        scrollable
        scroll-height="680px"
        striped-rows
        show-gridlines
        removableSort
        style="width: 100%; margin-bottom: 20px"
      >
        <Column sortable header="ID" field="id">
          <template #sorticon="{ sortOrder }">
            <i v-if="sortOrder === 0" :class="PrimeIcons.SORT" />
            <i v-else-if="sortOrder === 1" :class="PrimeIcons.SORT_UP" />
            <i v-else-if="sortOrder === -1" :class="PrimeIcons.SORT_DOWN" />
          </template>
        </Column>
        <Column sortable header="Фио пользователя" field="fio" />
        <Column sortable header="Вес" field="weight" />
        <Column sortable header="Возраст" field="age" />
        <Column sortable header="Дата рождения">
          <template #body="slotprops">
            <div>
              {{
                slotprops.data.dateBirth
                  ? new Date(slotprops.data.dateBirth).toLocaleDateString()
                  : 'Неизвестно'
              }}
            </div>
          </template>
        </Column>
        <Column header="Информация по работе">
          <template #body>
            <DataTable :value="workerInfo">
              <Column sortable header="Работа" field="work" />
              <Column sortable header="Зарплата" field="salary" />
              <Column sortable header="Должность" field="position" />
            </DataTable>
          </template>
        </Column>
      </DataTable>
    </section>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 10px;
}

.filter {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.slide-enter-active {
  animation: slideIn 0.3s ease-out forwards;
}

.slide-leave-active {
  animation: slideOut 0.3s ease-in forwards;
}

@keyframes slideIn {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
