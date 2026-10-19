import { getChildNodes, getRootNodes } from '@/services/treeExperimentsService'
import { executeDelay } from '@/utils/utils'
import { ref, type Ref } from 'vue'
import type { TreeNode } from 'primevue/treenode'

const ROOT_LOAD_DELAY = 800
const NODE_LOAD_DELAY = 600

export function useTreeExperiments() {
  const treeNodes: Ref<TreeNode[]> = ref([])
  const expandedKeys: Ref<Record<string, boolean>> = ref({})
  const isLoading: Ref<boolean> = ref(false)

  function isBranch(node: TreeNode): boolean {
    return node.leaf === false
  }

  async function loadTree() {
    isLoading.value = true
    expandedKeys.value = {}

    await executeDelay(ROOT_LOAD_DELAY)

    treeNodes.value = getRootNodes()

    isLoading.value = false
  }

  async function loadChildren(node: TreeNode) {
    if (!isBranch(node) || node.children?.length) {
      return
    }

    node.loading = true

    await executeDelay(NODE_LOAD_DELAY)

    node.children = getChildNodes(node)
    node.loading = false
  }

  function markExpanded(nodes: TreeNode[]) {
    const keys: Record<string, boolean> = {}

    nodes.forEach((node) => {
      if (isBranch(node)) {
        keys[node.key] = true
      }
    })

    expandedKeys.value = { ...expandedKeys.value, ...keys }
  }

  async function expandLevel(nodes: TreeNode[]): Promise<TreeNode[]> {
    markExpanded(nodes)

    const next: TreeNode[] = []

    await Promise.all(
      nodes.map(async (node) => {
        if (!isBranch(node)) {
          return
        }

        await loadChildren(node)

        if (node.children?.length) {
          next.push(...node.children)
        }
      }),
    )

    return next
  }

  async function onNodeExpand(node: TreeNode) {
    await loadChildren(node)
  }

  async function expandAll() {
    let level = treeNodes.value

    while (level.length) {
      level = await expandLevel(level)
    }
  }

  async function expandBranch(node: TreeNode) {
    expandedKeys.value = { ...expandedKeys.value, [node.key]: true }

    await loadChildren(node)

    let level = node.children ?? []

    while (level.length) {
      level = await expandLevel(level)
    }
  }

  function collapseAll() {
    expandedKeys.value = {}
  }

  return {
    treeNodes,
    expandedKeys,
    isLoading,
    loadTree,
    onNodeExpand,
    expandAll,
    expandBranch,
    collapseAll,
    isBranch,
  }
}
