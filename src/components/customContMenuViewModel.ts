import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { ContextMenuMethods } from 'primevue'
import type { MenuItem } from 'primevue/menuitem'

interface ConfigContextMenu {
  rn?: string | undefined
  date: string
}

interface BasicContextMenu {
  customItems: MenuItem[]
}

type ContextMenuParams = {
  Config: ConfigContextMenu
  Basic: BasicContextMenu
}

type ContextMenyKey = keyof ContextMenuParams

const contextMenuRef: Ref<ContextMenuMethods | null> = ref(null)
const payload: Ref<ContextMenuParams[ContextMenyKey] | null> = ref(null)
const selectedMenu: Ref<ContextMenyKey | ''> = ref('')

export function useContextMenu() {
  const menuModel: ComputedRef<MenuItem[]> = computed<MenuItem[]>(() => {
    switch (selectedMenu.value) {
      case 'Config':
        return configItems(payload.value as ConfigContextMenu)
      default:
        return basicItems(payload.value as BasicContextMenu)
    }
  })

  function showMenu<T extends ContextMenyKey>(
    event: MouseEvent,
    selectedType: T,
    param: ContextMenuParams[T],
  ) {
    event.preventDefault()
    payload.value = param as ContextMenuParams[ContextMenyKey]
    selectedMenu.value = selectedType

    if (contextMenuRef.value && typeof contextMenuRef.value.show === 'function') {
      contextMenuRef.value.show(event)
    }
  }

  return { contextMenuRef, menuModel, showMenu }
}

function configItems(params: ConfigContextMenu) {
  if (!params) return []
  return [{ label: `Настройка 1 для ${params.rn}` }, { label: `Настройка 2 для ${params.date}` }]
}
function basicItems(params: BasicContextMenu) {
  if (!params) return []
  return params.customItems || []
}
