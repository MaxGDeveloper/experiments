import type { TreeNode } from 'primevue/treenode'

export interface TreeExperimentNodeData {
  level: number
  path: number[]
}

export const ROOT_ID = 'root'
export const ROOT_COUNT = 20
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

function buildKey(path: number[]): string {
  return `node-${path.join('-')}`
}

function parsePath(id: string): number[] {
  if (id === ROOT_ID) {
    return []
  }

  return id.replace(/^node-/, '').split('-').map(Number)
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

function isLeafId(id: string): boolean {
  if (id === ROOT_ID) {
    return false
  }

  const level = parsePath(id).length - 1

  if (level >= MAX_DEPTH) {
    return true
  }

  if (level === 0) {
    return false
  }

  return pseudoRandom(id, 'leaf') < 0.35
}

function createNode(path: number[]): TreeNode {
  const key = buildKey(path)
  const level = path.length - 1

  return {
    key,
    label: buildLabel(level, path),
    icon: buildIcon(level),
    leaf: isLeafId(key),
    data: { level, path } satisfies TreeExperimentNodeData,
  }
}

export function getNodesById(id: string): TreeNode[] {
  if (id === ROOT_ID) {
    return Array.from({ length: ROOT_COUNT }, (_, index) => createNode([index + 1]))
  }

  if (isLeafId(id)) {
    return []
  }

  const path = parsePath(id)
  const count = 2 + Math.floor(pseudoRandom(id, 'count') * 3)

  return Array.from({ length: count }, (_, index) => createNode([...path, index + 1]))
}
