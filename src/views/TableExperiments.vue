<script setup lang="ts">
import { useContextMenu } from '@/components/customContMenuViewModel'
import type { MenuItem } from 'primevue/menuitem'
import { ref, type Ref } from 'vue'

interface TestTableData {
  fio: string
  lastName: string
  weight: number
}

const usersData = ref<TestTableData[]>([])

const { contextMenuRef, menuModel, showMenu } = useContextMenu()

const myCustomItems: MenuItem[] = [
  {
    label: 'Перевести',
    icon: 'pi pi-language',
  },
  {
    label: 'Речь',
    icon: 'pi pi-volume-up',
    items: [
      {
        label: 'Начать',
        icon: 'pi pi-caret-right',
      },
      {
        label: 'Остановить',
        icon: 'pi pi-pause',
      },
    ],
  },
  {
    separator: true,
  },
  {
    label: 'Печать',
    icon: 'pi pi-print',
  },
]

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const loading: Ref<boolean> = ref(false)

async function loadTable() {
  loading.value = true

  await delay(2000)

  usersData.value = [
    { fio: 'Иванов Иван Иванович', lastName: 'Иванов', weight: 72.45 },
    { fio: 'Петров Петр Петрович', lastName: 'Петров', weight: 85.564 },
    { fio: 'Сидоров Сидор Сидорович', lastName: 'Сидоров', weight: 68.564 },
    { fio: 'Смирнов Иван Петрович', lastName: 'Смирнов', weight: 90.34 },
    { fio: 'Кузнецов Алексей Викторович', lastName: 'Кузнецов', weight: 77.32 },
    { fio: 'Попов Дмитрий Александрович', lastName: 'Попов', weight: 82.234 },
    { fio: 'Соколов Михаил Игоревич', lastName: 'Соколов', weight: 65.346 },
    { fio: 'Лебедев Николай Сергеевич', lastName: 'Лебедев', weight: 88.896 },
    { fio: 'Морозов Владимир Павлович', lastName: 'Морозов', weight: 74.674 },
    { fio: 'Егоров Игорь Николаевич', lastName: 'Егоров', weight: 79.342 },
    { fio: 'Андреев Олег Дмитриевич', lastName: 'Андреев', weight: 83.126 },
    { fio: 'Николаев Сергей Евгеньевич', lastName: 'Николаев', weight: 69.592 },
    { fio: 'Фёдоров Валерий Михайлович', lastName: 'Фёдоров', weight: 95.325 },
    { fio: 'Михайлов Александр Викторович', lastName: 'Михайлов', weight: 71.675 },
    { fio: 'Павлов Егор Романович', lastName: 'Павлов', weight: 86.464 },
    { fio: 'Захаров Платон Ильич', lastName: 'Захаров', weight: 78.657 },
    { fio: 'Борисов Роман Константинович', lastName: 'Борисов', weight: 67.456 },
    { fio: 'Васильев Владислав Юрьевич', lastName: 'Васильев', weight: 80.562 },
    { fio: 'Семенов Тимур Андреевич', lastName: 'Семенов', weight: 73.895 },
    { fio: 'Дмитриев Денис Вадимович', lastName: 'Дмитриев', weight: 92.678 },
  ]

  loading.value = false
}
</script>

<template>
  <main style="margin: 10px">
    <div>
      <ContextMenu ref="contextMenuRef" :model="menuModel" />
      <h2
        style="text-align: center"
        @contextmenu="showMenu($event, 'Basic', { customItems: myCustomItems })"
      >
        Какой-то заголовок
      </h2>
    </div>
    <div style="display: flex; flex-direction: column; width: 100%; margin: 0, 10px">
      <Card style="margin: 10px">
        <template #header>
          <h2 class="test" style="text-align: center">Таблица с данными</h2>
          <div style="display: flex; flex-direction: row; justify-content: center; gap: 10px">
            <Button
              label="Загрузить данные"
              icon="pi pi-download"
              @click="loadTable()"
              :loading="loading"
            />

            <Button
              label="Очистить данные"
              icon="pi pi-refresh"
              @click="usersData = []"
              :disabled="loading"
            />

            <Button asChild v-slot="slotProps">
              <RouterLink
                :to="{ name: 'Home' }"
                :class="slotProps.class"
                style="text-decoration: none"
                >Переход</RouterLink
              >
            </Button>
          </div>
        </template>
        <template #content>
          <DataTable
            :loading="loading"
            :value="usersData"
            striped-rows
            show-gridlines
            style="width: 100%"
          >
            <Column header="Фио пользователя">
              <template #body="slotprops">
                <div
                  @contextmenu="
                    showMenu($event, 'Config', {
                      rn: slotprops.data.fio,
                      date: slotprops.data.lastName,
                    })
                  "
                >
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

<style lang="css" scoped>
.test {
  color: aquamarine;
}
</style>
