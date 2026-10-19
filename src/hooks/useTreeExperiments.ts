import { getNodesById } from '@/services/treeExperimentsService'
import { executeDelay } from '@/utils/utils'
import type { TreeNode } from 'primevue/treenode'

const NODE_LOAD_DELAY = 600

export function useTreeExperiments() {
  async function getBranchById(id: string): Promise<TreeNode[]> {
    await executeDelay(NODE_LOAD_DELAY)

    return getNodesById(id)
  }

  return { getBranchById }
}
