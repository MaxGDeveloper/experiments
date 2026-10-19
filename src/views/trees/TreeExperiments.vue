<script setup lang="ts">
/**
 * @file Страница-эксперимент: иерархическое дерево с ленивой загрузкой.
 *
 * Дерево информационное: выбора узлов нет.
 *
 * Файл разделён на две части, чтобы не смешивать разное:
 * 1. ПЛАНИРОВЩИК ПОСТЕПЕННОЙ ОТРИСОВКИ — «механика» порций и кадров.
 *    Вынесен в хук `useProgressiveRender`; здесь только подключение.
 * 2. ОСНОВНАЯ ЛОГИКА ДЕРЕВА — состояние, загрузка данных, раскрытие/сворачивание.
 *    Всё, что касается «смысла», живёт здесь; «как рисовать порциями» — выше.
 */
import { useProgressiveRender } from '@/hooks/useProgressiveRender'
import { useTreeExperiments } from '@/hooks/useTreeExperiments'
import { ROOT_ID, type TreeExperimentNodeData } from '@/services/treeExperimentsService'
import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue'
import type { TreeNode } from 'primevue/treenode'

const { getBranchById } = useTreeExperiments()

/* ============================================================================
 * ПЛАНИРОВЩИК ПОСТЕПЕННОЙ ОТРИСОВКИ
 * Механика: размер порции, ожидание кадра, отмена. Используется в основной
 * логике ниже (start / batches / frame / isActive / finish / cancel).
 * ==========================================================================*/

/** Сколько ветвей раскрывается/сворачивается за один кадр. */
const RENDER_CHUNK_SIZE = 25

/** Пауза между порциями отрисовки (сверх кадра анимации), мс. */
const RENDER_FRAME_DELAY = 16

const {
  /** Идёт постепенное раскрытие или сворачивание. */
  isProcessing,
  /** Ждёт следующий кадр отрисовки браузера. */
  frame,
  /** Режет массив на порции. */
  batches,
  /** Начинает новую операцию, отменяя предыдущую. */
  start,
  /** Актуальна ли операция (не отменена). */
  isActive,
  /** Завершает операцию. */
  finish,
  /** Отменяет текущую операцию. */
  cancel: cancelProcessing,
} = useProgressiveRender({ chunkSize: RENDER_CHUNK_SIZE, frameDelay: RENDER_FRAME_DELAY })

/* ============================================================================
 * ОСНОВНАЯ ЛОГИКА ДЕРЕВА
 * ==========================================================================*/

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

/** Сколько ветвей сейчас раскрыто (индикатор прогресса). */
const expandedBranchCount: ComputedRef<number> = computed(() => Object.keys(expandedKeys.value).length)

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

/** Загружает корень дерева, отменяя незавершённые операции и сбрасывая раскрытие. */
async function loadTree() {
  cancelProcessing()
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

/* Раскрытие и сворачивание */

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
 * Собирает ключи ветвей по уровням, сверху вниз.
 *
 * Нужно для постепенного сворачивания: идём от самых глубоких ветвей к корню,
 * чтобы каждая порция снимала небольшой кусок дерева.
 *
 * @param nodes - корневые узлы
 */
function collectBranchKeysByLevel(nodes: TreeNode[]): string[][] {
  const levels: string[][] = []
  let current = nodes

  while (current.length) {
    const keys: string[] = []
    const next: TreeNode[] = []

    for (const node of current) {
      if (!isBranch(node)) {
        continue
      }

      keys.push(node.key)

      if (node.children?.length) {
        next.push(...node.children)
      }
    }

    if (keys.length) {
      levels.push(keys)
    }

    current = next
  }

  return levels
}

/**
 * Ленивая загрузка по клику на тогглер (событие `node-expand`).
 *
 * @param node - раскрываемый узел
 */
async function onNodeExpand(node: TreeNode) {
  await loadChildren(node)
}

/**
 * Обрабатывает один уровень: сначала параллельно догружает детей всех ветвей,
 * затем раскрывает их порциями по кадрам.
 *
 * Порядок важен: PrimeVue рисует детей только когда есть и `children`,
 * и флаг раскрытия. Порционное раскрытие не даёт отрисовать уровень одним тактом.
 *
 * @param nodes - узлы текущего уровня
 * @param id - номер операции (для отмены)
 * @returns узлы следующего уровня
 */
async function expandLevel(nodes: TreeNode[], id: number): Promise<TreeNode[]> {
  await Promise.all(
    nodes.map(async (node) => {
      if (isBranch(node)) {
        await loadChildren(node)
      }
    }),
  )

  if (!isActive(id)) {
    return []
  }

  const next: TreeNode[] = []

  nodes.forEach((node) => {
    if (isBranch(node) && node.children?.length) {
      next.push(...node.children)
    }
  })

  for (const batch of batches(nodes.filter(isBranch))) {
    if (!isActive(id)) {
      return []
    }

    markExpanded(batch)
    await frame()
  }

  return next
}

/**
 * Постепенно раскрывает конкретную ветвь вместе со всеми вложенными ветвями.
 *
 * @param node - корневой узел ветви
 */
async function expandBranch(node: TreeNode) {
  const id = start()

  try {
    expandedKeys.value = { ...expandedKeys.value, [node.key]: true }

    await loadChildren(node)

    let level = node.children ?? []

    while (level.length && isActive(id)) {
      level = await expandLevel(level, id)
    }
  } finally {
    finish(id)
  }
}

/** Постепенно раскрывает всё дерево, уровень за уровнем. Можно отменить. */
async function expandAll() {
  const id = start()

  try {
    let level = treeNodes.value

    while (level.length && isActive(id)) {
      level = await expandLevel(level, id)
    }
  } finally {
    finish(id)
  }
}

/** Постепенно сворачивает всё дерево — от самых глубоких ветвей к корню. Можно отменить. */
async function collapseAll() {
  const id = start()

  try {
    const levels = collectBranchKeysByLevel(treeNodes.value)

    for (let index = levels.length - 1; index >= 0; index--) {
      for (const batch of batches(levels[index])) {
        if (!isActive(id)) {
          return
        }

        const next = { ...expandedKeys.value }

        batch.forEach((key) => delete next[key])
        expandedKeys.value = next

        await frame()
      }
    }
  } finally {
    finish(id)
  }
}

/* Жизненный цикл */

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
      <Button
        @click="expandAll"
        icon="pi pi-plus"
        label="Развернуть все"
        :disabled="isLoading || isProcessing"
      />
      <Button @click="collapseAll" icon="pi pi-minus" label="Свернуть все" :disabled="isLoading" />
      <Button
        v-if="isProcessing"
        @click="cancelProcessing"
        icon="pi pi-stop-circle"
        label="Стоп"
        severity="danger"
      />
      <Button
        @click="loadTree"
        icon="pi pi-refresh"
        label="Обновить"
        :loading="isLoading"
        :disabled="isProcessing"
      />
    </section>

    <section v-if="isProcessing" class="progress">
      <i class="pi pi-spin pi-spinner" />
      <span>Постепенная отрисовка… ветвей раскрыто: {{ expandedBranchCount }}</span>
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
  flex-wrap: wrap;
  gap: 10px;
}

.progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--p-text-muted-color, #6b7280);
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
