<template>
  <div id="app">
    <!-- router-view как slot: рендерим Component внутри <transition> -->
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <!-- компонент самого view должен иметь один корень (рекомендовано <main>) -->
        <component :is="Component" :key="$route.fullPath" />
      </transition>
    </router-view>
  </div>
</template>

<style></style>
