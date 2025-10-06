<script setup lang="ts">
// импорт header/footer — опционально
// import Header from '@/components/Header.vue'
// import Footer from '@/components/Footer.vue'
</script>

<template>
  <div>
    <!-- <Header /> -->
    <!-- router-view через слот -> получаем Component и рендерим внутри transition -->
    <router-view v-slot="{ Component }">
      <!-- mode="out-in" гарантирует, что уходящий элемент закончится до входа нового -->
      <transition name="page" mode="out-in">
        <!-- key обязателен, чтобы transition запускался при смене маршрута -->
        <component :is="Component" :key="$route.fullPath" />
      </transition>
    </router-view>

    <!-- <Footer /> -->
  </div>
</template>

<!-- ВАЖНО: стили перехода НЕ помещаем в <style scoped>. -->
<style>
/* Простой fade + slide down */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 320ms ease,
    transform 320ms ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Небольшой стиль для skip-link (только пример) */
.skip-link {
  position: absolute;
  left: -999px;
  top: auto;
}
.skip-link:focus {
  left: 1rem;
  top: 1rem;
  background: #fff;
  padding: 6px 10px;
  z-index: 9999;
  border: 1px solid #ccc;
}
</style>
