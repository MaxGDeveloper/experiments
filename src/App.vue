<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="rootsite">
    <header style="display: flex; justify-content: center; border-bottom: 2px solid darkgray">
      <RouterLink class="mainurl" :to="{ name: 'Home' }">
        <h2>Мой экспериментальный сайт</h2>
      </RouterLink>
    </header>
    <main>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <KeepAlive>
            <component :is="Component" :key="$route.fullPath" />
          </KeepAlive>
        </transition>
      </router-view>
    </main>

    <footer style="display: flex; justify-content: center; border-top: 2px solid darkgray">
      <h2>Это что-то вроде футера</h2>
    </footer>
  </div>
</template>

<style lang="css" scoped>
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

.mainurl {
  text-decoration: none;
  color: var(--color-text);
  transition: 0.3s ease-in;
}

.mainurl:hover {
  transform: scale(1.01);
  color: rgb(62, 142, 153);
  transition: 0.3s ease-out;
}
</style>
