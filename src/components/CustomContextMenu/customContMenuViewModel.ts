/* eslint-disable @typescript-eslint/no-explicit-any */
// useContextMenu.ts
import type { MenuItem } from 'primevue/menuitem'
import { ref, computed } from 'vue'

export function useContextMenu(initialItems?: MenuItem[] | ((payload: any) => MenuItem[])) {
  // ссылка на компонент PrimeVue ContextMenu
  const cmRef = ref<any>(null)

  // payload/current row data (можно хранить любой объект)
  const payload = ref<any>(null)

  // модель пунктов меню — поддерживаем либо статическую модель, либо функцию(payload)->items
  const itemsSource = initialItems

  const menuModel = computed<MenuItem[]>(() => {
    if (typeof itemsSource === 'function') {
      return (itemsSource as (p: any) => MenuItem[])(payload.value)
    }
    return (itemsSource as MenuItem[]) ?? []
  })

  // Показываем контекстное меню: event — MouseEvent, p — произвольные данные строки
  function showMenu(event: MouseEvent, p?: any) {
    event.preventDefault()
    payload.value = p
    // убедимся, что меню существует и у него есть show()
    if (cmRef.value && typeof cmRef.value.show === 'function') {
      cmRef.value.show(event)
    } else {
      // fallback: можно эмитить ошибку или лог
      console.warn('ContextMenu ref is not ready')
    }
  }

  // Удобный биндер: возвращает объект с onContextMenu, можно применить на любом элементе
  function binder(p?: any) {
    return {
      // ВАЖНО: ключ — 'contextmenu', и мы вызываем preventDefault() внутри
      contextmenu: (e: MouseEvent) => {
        e.preventDefault()
        showMenu(e, p)
      },
    }
  }

  return {
    cmRef,
    menuModel,
    payload,
    showMenu,
    binder,
  }
}
