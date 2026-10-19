<script setup lang="ts">
/**
 * @file Страница-эксперимент: иерархическое дерево с ленивой загрузкой.
 *
 * Здесь собрана вся логика раскрытия: одиночный узел, всё дерево и поддерево
 * конкретной ветви. Хук отдаёт только «получить ветвь по id».
 */
import { useTreeExperiments } from '@/hooks/useTreeExperiments'
import { ROOT_ID, type TreeExperimentNodeData } from '@/services/treeExperimentsService'
import { onMounted, ref, type Ref } from 'vue'
import type { TreeNode } from 'primevue/treenode'

const { getBranchById } = useTreeExperiments()

/* Состояние */

/** Корневые узлы дерева. */
const treeNodes: Ref<TreeNode[]> = ref([])

/**
 * Какие узлы раскрыты.
 *
 * Ключевой момент: объект всегда переприсваивается новым (`{ ...old, [key]: true }`),
 * а не мутируется по месту, иначе PrimeVue не увидит изменение.
 */
const expandedKeys: Ref<Record<string, boolean>> = ref({})

/** Идёт загрузка корня дерева. */
const isLoading: Ref<boolean> = ref(false)

/* Признаки узла */

/**
 * Является ли узел ветвью (может раскрываться).
 *
 * @param node - узел дерева
 */
function isBranch(node: TreeNode): boolean {
  return node.leaf === false
}

/**
 * Нужно ли показывать у узла кнопку «развернуть все вложенные ветви».
 *
 * Кнопка есть только у корневых групп, внутри которых больше одного уровня
 * вложенности. У вложенных узлов кнопки нет никогда.
 *
 * @param node - узел дерева
 */
function canExpandBranch(node: TreeNode): boolean {
  const data = node.data as TreeExperimentNodeData | undefined

  return data?.level === 0 && data.hasNestedBranches === true
}

/* Загрузка данных */

/** Загружает корень дерева и сбрасывает раскрытие. */
async function loadTree() {
  isLoading.value = true
  expandedKeys.value = {}

  treeNodes.value = await getBranchById(ROOT_ID)

  isLoading.value = false
}

/**
 * Догружает детей узла ровно один раз (повторные вызовы ничего не делают).
 *
 * @param node - узел-ветвь
 */
async function loadChildren(node: TreeNode) {
  if (!isBranch(node) || node.children?.length) {
    return
  }

  node.loading = true
  node.children = await getBranchById(node.key)
  node.loading = false
}

/* Раскрытие */

/**
 * Помечает переданные узлы-ветви раскрытыми.
 *
 * Объект ключей переприсваивается целиком — иначе Tree не отреагирует.
 *
 * @param nodes - узлы, которые нужно раскрыть
 */
function markExpanded(nodes: TreeNode[]) {
  const keys: Record<string, boolean> = {}

  nodes.forEach((node) => {
    if (isBranch(node)) {
      keys[node.key] = true
    }
  })

  expandedKeys.value = { ...expandedKeys.value, ...keys }
}

/**
 * Раскрывает один уровень узлов: помечает их раскрытыми, параллельно
 * догружает детей и возвращает следующий уровень для обработки.
 *
 * Порядок важен: PrimeVue рисует детей только когда есть и `children`,
 * и флаг раскрытия.
 *
 * @param nodes - узлы текущего уровня
 * @returns узлы следующего уровня
 */
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

/**
 * Ленивая загрузка по клику на тогглер (событие `node-expand`).
 *
 * @param node - раскрываемый узел
 */
async function onNodeExpand(node: TreeNode) {
  await loadChildren(node)
}

/** Раскрывает всё дерево целиком, уровень за уровнем. */
async function expandAll() {
  let level = treeNodes.value

  while (level.length) {
    level = await expandLevel(level)
  }
}

/**
 * Раскрывает конкретную ветвь вместе со всеми вложенными ветвями.
 *
 * @param node - корневой узел ветви
 */
async function expandBranch(node: TreeNode) {
  expandedKeys.value = { ...expandedKeys.value, [node.key]: true }

  await loadChildren(node)

  let level = node.children ?? []

  while (level.length) {
    level = await expandLevel(level)
  }
}

/** Сворачивает всё дерево. */
function collapseAll() {
  expandedKeys.value = {}
}

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
            :value="treeNodes"
            loading-mode="icon"
            :filter="true"
            filter-mode="lenient"
            class="tree"
            @node-expand="onNodeExpand"
          >
            <template #default="{ node }">
              <span class="node-label">{{ node.label }}</span>
              <Button
                v-if="canExpandBranch(node)"
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
