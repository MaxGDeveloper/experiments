<script setup lang="ts">
import { useGetData } from '@/viewModels/testViewModel'
import { onMounted } from 'vue'

const { loadData, currentData, idFind, isDataLoading, isFirstLoaded, loadTable } = useGetData()

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="root">
    <section>
      <h2 style="text-align: center">Тестирую ненормальные обстоятельства</h2>
    </section>
    <section class="filter">
      <div style="display: flex; align-items: center; flex: 0.7">
        <InputText
          @keyup.enter="loadTable"
          fluid
          v-model="idFind"
          placeholder="Введите нужный ID"
        />
        <Button @click="loadTable" icon="pi pi-search" icon-pos="left" label="Поиск" />
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
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        striped-rows
        show-gridlines
        style="width: 100%"
      >
        <Column header="ID" field="id" />
        <Column header="Фио пользователя" field="fio" />
        <Column header="Фамилия" field="lastName" />
        <Column header="Вес" field="weight" />
        <Column header="Возраст" field="age" />
        <Column header="Дата рождения">
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
      </DataTable>
    </section>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}
</style>
