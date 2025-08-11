<script setup lang="ts">
import { useContextMenu } from '@/components/CustomContextMenu/customContMenuViewModel'
import type { MenuItem } from 'primevue/menuitem'
import { ref } from 'vue'

interface TestTableData {
  fio: string
  lastName: string
  weight: number
}

const usersData = ref<TestTableData[]>([
  { fio: 'Иванов Иван Иванович', lastName: 'Иванов', weight: 72 },
  { fio: 'Петров Петр Петрович', lastName: 'Петров', weight: 85 },
  { fio: 'Сидоров Сидор Сидорович', lastName: 'Сидоров', weight: 68 },
  { fio: 'Смирнов Иван Петрович', lastName: 'Смирнов', weight: 90 },
  { fio: 'Кузнецов Алексей Викторович', lastName: 'Кузнецов', weight: 77 },
  { fio: 'Попов Дмитрий Александрович', lastName: 'Попов', weight: 82 },
  { fio: 'Соколов Михаил Игоревич', lastName: 'Соколов', weight: 65 },
  { fio: 'Лебедев Николай Сергеевич', lastName: 'Лебедев', weight: 88 },
  { fio: 'Морозов Владимир Павлович', lastName: 'Морозов', weight: 74 },
  { fio: 'Егоров Игорь Николаевич', lastName: 'Егоров', weight: 79 },
  { fio: 'Андреев Олег Дмитриевич', lastName: 'Андреев', weight: 83 },
  { fio: 'Николаев Сергей Евгеньевич', lastName: 'Николаев', weight: 69 },
  { fio: 'Фёдоров Валерий Михайлович', lastName: 'Фёдоров', weight: 95 },
  { fio: 'Михайлов Александр Викторович', lastName: 'Михайлов', weight: 71 },
  { fio: 'Павлов Егор Романович', lastName: 'Павлов', weight: 86 },
  { fio: 'Захаров Платон Ильич', lastName: 'Захаров', weight: 78 },
  { fio: 'Борисов Роман Константинович', lastName: 'Борисов', weight: 67 },
  { fio: 'Васильев Владислав Юрьевич', lastName: 'Васильев', weight: 80 },
  { fio: 'Семенов Тимур Андреевич', lastName: 'Семенов', weight: 73 },
  { fio: 'Дмитриев Денис Вадимович', lastName: 'Дмитриев', weight: 92 },
])

// --- функция, формирующая пункты меню по строке ---
function itemsForRow(row: TestTableData | null): MenuItem[] {
  if (!row) return []
  return [
    { label: `Открыть ${row.lastName}`, command: () => console.log('open', row) },
    { label: 'Редактировать', command: () => console.log('edit', row) },
    { separator: true },
    { label: 'Удалить', command: () => console.log('delete', row) },
  ]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bind(p?: any) {
  return {
    contextmenu: (e: MouseEvent) => {
      e.preventDefault()
      showMenu(e, p)
    },
  }
}

const { cmRef, menuModel, showMenu } = useContextMenu(itemsForRow)
</script>

<template>
  <main style="margin: 10px">
    <div style="display: flex; flex-direction: column">
      <ContextMenu :model="menuModel" ref="cmRef" appendTo="body" />
      <h2 @contextmenu.prevent="(e) => showMenu(e, { type: 'h2' })">
        Блок для контекстного меню без таблицы (ПКМ)
      </h2>

      <div v-on="bind({ type: 'div', id: 1 })">Тестовый див (ПКМ)</div>
    </div>
    <div style="display: flex; flex-direction: column; width: 100%; margin: 0, 10px">
      <h2>Блок для интеграции контекстного меню в таблицу</h2>

      <ContextMenu :model="menuModel" ref="cmRef" appendTo="body" />

      <Card style="margin: 10px">
        <template #header>
          <h2 style="text-align: center">Таблица с данными</h2>
        </template>
        <template #content>
          <DataTable :value="usersData" striped-rows show-gridlines style="width: 100%">
            <Column header="Фио пользователя">
              <template #body="slotprops">
                <div @contextmenu.prevent="(e) => showMenu(e, slotprops.data)">
                  {{ slotprops.data.fio }}
                </div>
              </template>
            </Column>
            <Column header="Фамилия">
              <template #body="slotprops">
                <div>{{ slotprops.data.lastName }}</div>
              </template>
            </Column>
            <Column header="Вес">
              <template #body="slotprops">
                <div>{{ slotprops.data.weight }}</div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </main>
</template>
