<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Item {
  id: number
  name: string
}

// Реактивные данные
const title = ref('Мое Vue 3 приложение')
const count = ref(0)
const items = ref<Item[]>([])

// Методы
const increment = () => {
  count.value++
}

// Хуки жизненного цикла
onMounted(() => {
  // Имитация загрузки данных
  setTimeout(() => {
    items.value = [
      { id: 1, name: 'Элемент 1' },
      { id: 2, name: 'Элемент 2' },
      { id: 3, name: 'Элемент 3' },
    ]
  }, 1000)
})
</script>

<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <p>Счетчик: {{ count }}</p>
    <button @click="increment">Увеличить</button>
    <Button asChild v-slot="slotProps">
      <RouterLink :to="{ name: 'home' }" :class="slotProps.class" style="text-decoration: none"
        >Переход</RouterLink
      >
    </Button>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

button {
  background: #42b883;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
}

button:hover {
  background: #359469;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 3px;
}
</style>
