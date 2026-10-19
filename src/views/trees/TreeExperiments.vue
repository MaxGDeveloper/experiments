<script setup lang="ts">
import { useTreeExperiments } from '@/hooks/useTreeExperiments'
import { ROOT_ID } from '@/services/treeExperimentsService'
import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue'
import type { TreeNode } from 'primevue/treenode'
import type { TreeSelectionKeys } from 'primevue/tree'

const { getBranchById } = useTreeExperiments()

const treeNodes: Ref<TreeNode[]> = ref([])
const expandedKeys: Ref<Record<string, boolean>> = ref({})
const selectedKeys: Ref<TreeSelectionKeys> = ref({})
const isLoading: Ref<boolean> = ref(false)

function isBranch(node: TreeNode): boolean {
  return node.leaf === false
}

async function loadTree() {
  isLoading.value = true
  expandedKeys.value = {}

  treeNodes.value = await getBranchById(ROOT_ID)

  isLoading.value = false
}

async function loadChildren(node: TreeNode) {
  if (!isBranch(node) || node.children?.length) {
    return
  }

  node.loading = true
  node.children = await getBranchById(node.key)
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

const selectedLabel: ComputedRef<string | null> = computed(() => {
  const key = Object.keys(selectedKeys.value).find((item) => selectedKeys.value[item] === true)

  if (!key) {
    return null
  }

  const findLabel = (nodes: TreeNode[]): string | null => {
    for (const node of nodes) {
      if (node.key === key) {
        return node.label ?? null
      }

      if (node.children?.length) {
        const found = findLabel(node.children)

        if (found) {
          return found
        }
      }
    }

    return null
  }

  return findLabel(treeNodes.value)
})

onMounted(() => {
  loadTree()
})
</script>

<template>
  <div class="root">
    <section>
      <h2 style="text-align: center">Эксперименты с деревом иерархии (lazy-loading)</h2>
    </section>

    <section class="toolbar">
      <Button @click="expandAll" icon="pi pi-plus" label="Развернуть все" :disabled="isLoading" />
      <Button @click="collapseAll" icon="pi pi-minus" label="Свернуть все" :disabled="isLoading" />
      <Button @click="loadTree" icon="pi pi-refresh" label="Обновить" :loading="isLoading" />
    </section>

    <section class="tree-wrapper">
      <Card>
        <template #content>
          <div v-if="isLoading" class="loading">
            <ProgressSpinner />
            <h3>Загрузка корня дерева</h3>
          </div>
          <Tree
            v-else
            v-model:expandedKeys="expandedKeys"
            v-model:selectionKeys="selectedKeys"
            :value="treeNodes"
            selection-mode="single"
            loading-mode="icon"
            :filter="true"
            filter-mode="lenient"
            class="tree"
            @node-expand="onNodeExpand"
          >
            <template #default="{ node }">
              <span class="node-label">{{ node.label }}</span>
              <Button
                v-if="isBranch(node)"
                icon="pi pi-angle-double-down"
                severity="secondary"
                variant="text"
                rounded
                size="small"
                class="branch-button"
                title="Развернуть все вложенные ветви"
                @click.stop="expandBranch(node)"
              />
            </template>
          </Tree>
        </template>
      </Card>
    </section>

    <section v-if="selectedLabel">
      <Message severity="info" icon="pi pi-info-circle">Выбран узел: {{ selectedLabel }}</Message>
    </section>
  </div>
</template>

<style lang="css" scoped>
.root {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 10px;
}

.toolbar {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.tree-wrapper {
  display: flex;
  justify-content: center;
}

.tree {
  width: 100%;
  max-width: 720px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.node-label {
  margin-right: 6px;
}

.branch-button {
  width: 1.75rem;
  height: 1.75rem;
  vertical-align: middle;
}
</style>
