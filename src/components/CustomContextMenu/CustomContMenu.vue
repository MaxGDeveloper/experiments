<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { toRefs } from 'vue'
import ContextMenu from 'primevue/contextmenu'
import type { MenuItem } from 'primevue/menuitem'
import { useContextMenu } from './customContMenuViewModel'

interface Props {
  // можно передать либо массив пунктов, либо функцию(payload)=>items
  items?: MenuItem[] | ((payload: any) => MenuItem[])
}

const props = defineProps<Props>()
const { items } = toRefs(props)

// инициализируем composable с переданными items
const { cmRef, menuModel, showMenu, binder } = useContextMenu(items?.value)

// expose (если кто-то хочет управлять извне)
defineExpose({ cmRef, showMenu })

/*
  bind — функция, которую получит слот:
  <ContextMenuWrapper :items="...">
    <template #default="{ bind }">
      <div v-on="bind(row)">...</div>
    </template>
  </ContextMenuWrapper>
*/
const bind = (p?: any) => {
  return binder(p)
}
</script>

<template>
  <!-- Один экземпляр ContextMenu; appendTo="body" часто полезно, чтобы меню не обрезалось -->
  <ContextMenu ref="cmRef" :model="menuModel" appendTo="body" />
  <!-- Контейнер-обёртка для слота: прокидывает биндер через scoped slot -->
  <div>
    <slot :bind="bind"></slot>
  </div>
</template>
