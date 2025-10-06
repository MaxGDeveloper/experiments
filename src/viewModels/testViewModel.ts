import { type Ref, ref } from 'vue'

interface MyData {
  id: number
  fio: string
  age: number
  weight: number
  dateBirth?: Date
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useGetData() {
  // Это имитация данных
  const personInfo: Ref<MyData[]> = ref([])

  // Это данные для таблицы
  const currentData: Ref<MyData[]> = ref([])

  const idFind: Ref<string> = ref('')
  const isDataLoading: Ref<boolean> = ref(false)

  const isFirstLoaded = ref(false)

  function loadData() {
    for (let index = 1; index < 5000; index++) {
      personInfo.value.push({
        id: index,
        fio: `Иванов Иван Иванович ${index}`,
        age: Math.floor(Math.random() * 100),
        weight: Math.floor(Math.random() * 150),
        dateBirth: new Date(
          1950 + Math.floor(Math.random() * 70),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28),
        ),
      })
    }
  }

  async function loadTable() {
    isDataLoading.value = true
    if (idFind.value == null) {
      isDataLoading.value = false
      return
    }

    isFirstLoaded.value = true

    await delay(2000)
    currentData.value = personInfo.value.filter((item) => item.fio.includes(idFind.value))

    isDataLoading.value = false
  }

  return {
    loadData,
    loadTable,
    currentData,
    idFind,
    isDataLoading,
    isFirstLoaded,
  }
}
