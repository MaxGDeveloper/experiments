/**
 * @file Composable-обёртка над «API» дерева.
 *
 * Намеренно отдаёт только один метод — «получить ветвь по id». Вся логика
 * раскрытия (раскрыть узел, раскрыть всё, раскрыть поддерево) живёт во вью,
 * потому что это поведение интерфейса, а не обязанность источника данных.
 */
import { getNodesById } from '@/services/treeExperimentsService'
import { executeDelay } from '@/utils/utils'
import type { TreeNode } from 'primevue/treenode'

/** Искусственная задержка ответа, чтобы ленивую загрузку было видно глазами. */
const NODE_LOAD_DELAY = 600

/**
 * Предоставляет доступ к узлам дерева иерархии.
 *
 * @returns объект с единственным методом {@link getBranchById}
 */
export function useTreeExperiments() {
  /**
   * Загружает непосредственных детей ветви.
   *
   * @param id - идентификатор ветви (или `ROOT_ID` для корневого уровня)
   * @returns промис с массивом узлов ветви
   */
  async function getBranchById(id: string): Promise<TreeNode[]> {
    await executeDelay(NODE_LOAD_DELAY)

    return getNodesById(id)
  }

  return { getBranchById }
}
