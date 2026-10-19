import type { TreeNode } from 'primevue/treenode'

export interface TreeExperimentNodeData {
  level: number
  path: number[]
}

export const MAX_DEPTH = 3

function hashKey(value: string, salt: string): number {
  const input = `${value}:${salt}`
  let hash = 2166136261

  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function pseudoRandom(value: string, salt: string): number {
  return (hashKey(value, salt) % 1000) / 1000
}

function buildLabel(level: number, path: number[]): string {
  switch (level) {
    case 0:
      return `Группа ${path[0]}`
    case 1:
      return `Узел ${path.join('.')}`
    case 2:
      return `Блок ${path.join('.')}`
    default:
      return `Деталь ${path.join('.')}`
  }
}

function buildIcon(level: number): string {
  switch (level) {
    case 0:
      return 'pi pi-sitemap'
    case 1:
      return 'pi pi-box'
    case 2:
      return 'pi pi-cog'
    default:
      return 'pi pi-circle-fill'
  }
}

function createNode(path: number[], level: number): TreeNode {
  const key = `node-${path.join('-')}`
  const isLeaf = level >= MAX_DEPTH || (level >= 1 && pseudoRandom(key, 'leaf') < 0.35)

  return {
    key,
    label: buildLabel(level, path),
    icon: buildIcon(level),
    leaf: isLeaf,
    data: { level, path } satisfies TreeExperimentNodeData,
  }
}

export function getRootNodes(): TreeNode[] {
  return Array.from({ length: 20 }, (_, index) => createNode([index + 1], 0))
}

export function getChildNodes(parent: TreeNode): TreeNode[] {
  const data = parent.data as TreeExperimentNodeData | undefined
  const level = data?.level ?? 0
  const path = data?.path ?? []

  if (level >= MAX_DEPTH) {
    return []
  }

  const count = 2 + Math.floor(pseudoRandom(parent.key, 'count') * 3)

  return Array.from({ length: count }, (_, index) => createNode([...path, index + 1], level + 1))
}
