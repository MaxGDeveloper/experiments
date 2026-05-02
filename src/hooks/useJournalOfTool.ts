import {
  generateToolTableData,
  getPartComposition,
  type ToolInfo,
} from '@/services/journalOfToolService'
import { executeDelay } from '@/utils/utils'
import { reactive, ref, type Ref } from 'vue'

export interface DetailFullInfo {
  designation: string
  toolsList: ToolInfo[]
  loadingState: LoadingState
}

export type LoadingState = 'idle' | 'loading' | 'loaded'

export function useJournalOfTool() {
  const sourceItems: Ref<string[]> = ref([])
  const selectedItems: Ref<string[]> = ref([])
  const detailsMap = reactive(new Map<string, ToolInfo[]>())
  const loadingState = reactive(new Map<string, LoadingState>())

  async function getDetailDissamble(isLoadDissamble: Ref<boolean>) {
    await executeDelay(5000)
    sourceItems.value = getPartComposition()
    isLoadDissamble.value = false
  }

  async function getDetailTools() {
    const pending = selectedItems.value.filter((detail) => {
      const status = loadingState.get(detail)
      return status != 'loading' && status != 'loaded'
    })

    if (!pending.length) {
      return
    }

    while (pending.length) {
      const batch = pending.splice(0, 2)

      const workers = batch.map(async (detail) => {
        loadingState.set(detail, 'loading')
        await executeDelay(2000)
        const toolsData = generateToolTableData()

        detailsMap.set(detail, toolsData)
        loadingState.set(detail, 'loaded')
      })

      await Promise.all(workers)
    }
  }

  return { sourceItems, selectedItems, detailsMap, loadingState, getDetailDissamble, getDetailTools }
}
