import { getPartComposition, type ToolInfo } from '@/services/journalOfToolService'
import { executeDelay } from '@/utils/utils'
import { reactive, ref, type Ref } from 'vue'

export interface DetailFullInfo {
  designation: string
  toolsList: ToolInfo[]
  loadingState: boolean
}

export function useJournalOfTool() {
  const structureOfdetail: Ref<string[][]> = ref([[], []])
  const detailsMap = reactive(new Map<string, ToolInfo[]>())
  const loadingState = reactive(new Map<string, boolean>())

  async function getDetailDissamble(isLoadDissamble: Ref<boolean>) {
    await executeDelay(5000)
    structureOfdetail.value[0] = getPartComposition()
    isLoadDissamble.value = false
  }

  return { structureOfdetail, detailsMap, loadingState, getDetailDissamble }
}
