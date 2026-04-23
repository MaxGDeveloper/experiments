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
  const structureOfDetail: Ref<string[][]> = ref([[], []])
  const detailsMap = reactive(new Map<string, ToolInfo[]>())
  const loadingState = reactive(new Map<string, LoadingState>())

  async function getDetailDissamble(isLoadDissamble: Ref<boolean>) {
    await executeDelay(5000)
    structureOfDetail.value[0] = getPartComposition()
    isLoadDissamble.value = false
  }

  async function getDetailTools() {
    const selectedDetails = structureOfDetail.value[1]

    const pending = selectedDetails.filter((detail) => {
      const status = loadingState.get(detail)
      return status != 'loading' && status != 'loaded'
    })

    if (!pending) {
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

  return { structureOfDetail, detailsMap, loadingState, getDetailDissamble, getDetailTools }
}
