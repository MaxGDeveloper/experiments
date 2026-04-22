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

export function usegetSeconddata() {
  interface MySecondData {
    work: string
    salary: number
    position: string
  }

  // Это имитация данных
  const workerInfo: Ref<MySecondData[]> = ref([])

  function loadSecondData() {
    const jobTemplates = [
      {
        position: 'Frontend Developer',
        work: 'Разработка пользовательских интерфейсов на Vue.js',
        minSalary: 80000,
        maxSalary: 180000,
      },
      {
        position: 'Backend Developer',
        work: 'Создание и поддержка серверной части приложения',
        minSalary: 90000,
        maxSalary: 190000,
      },
      {
        position: 'UI/UX Designer',
        work: 'Проектирование интерфейсов и пользовательского опыта',
        minSalary: 70000,
        maxSalary: 150000,
      },
      {
        position: 'Project Manager',
        work: 'Управление проектами и координация команды',
        minSalary: 85000,
        maxSalary: 170000,
      },
      {
        position: 'DevOps Engineer',
        work: 'Настройка инфраструктуры и процессов развертывания',
        minSalary: 100000,
        maxSalary: 200000,
      },
      {
        position: 'QA Engineer',
        work: 'Тестирование программного обеспечения',
        minSalary: 60000,
        maxSalary: 130000,
      },
      {
        position: 'Data Scientist',
        work: 'Анализ данных и построение ML моделей',
        minSalary: 110000,
        maxSalary: 220000,
      },
      {
        position: 'Team Lead',
        work: 'Руководство командой разработки',
        minSalary: 120000,
        maxSalary: 250000,
      },
    ]

    for (let index = 1; index < 15; index++) {
      const template = jobTemplates[Math.floor(Math.random() * jobTemplates.length)]
      const salary = Math.floor(
        Math.random() * (template.maxSalary - template.minSalary) + template.minSalary,
      )

      workerInfo.value.push({
        work: template.work,
        position: template.position,
        salary: salary,
      })
    }
  }

  return { workerInfo, loadSecondData }
}
