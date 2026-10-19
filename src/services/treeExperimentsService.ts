/**
 * @file Демонстрационный источник данных для лениво загружаемого дерева иерархии.
 *
 * Модуль эмулирует сервер: по идентификатору ветви возвращает только её
 * непосредственных детей. Всё дерево строится детерминированно из `id`, поэтому
 * сервис не хранит состояние — один и тот же `id` всегда даёт один и тот же ответ.
 *
 * Иерархия: `root` → Группа (уровень 0) → Узел (1) → Блок (2) → Деталь (3).
 */
import type { TreeNode } from 'primevue/treenode'

/**
 * Данные узла, которые «приезжают» вместе с ветвью (аналог ответа API).
 */
export interface TreeExperimentNodeData {
  /** Уровень узла: 0 — группа, 1 — узел, 2 — блок, 3 — деталь. */
  level: number
  /** Числовой путь от корня, например `[3, 2, 1]`. */
  path: number[]
  /**
   * Есть ли ниже этого узла ещё одна ветвь (а не только листья).
   * Нужен интерфейсу, чтобы решить, показывать ли кнопку «развернуть всё».
   */
  hasNestedBranches: boolean
}

/** Идентификатор корня, с которого начинается загрузка дерева. */
export const ROOT_ID = 'root'

/** Сколько групп отдаётся в корне дерева. */
export const ROOT_COUNT = 20

/** Максимальная глубина вложенности: уровень 3 — это уже листья-детали. */
export const MAX_DEPTH = 3

/** Группа, у которой дети — только листья (демонстрация «одноуровневой» ветви). */
export const SINGLE_LEVEL_ROOT = 11

/** Количество детей у «одноуровневой» группы `SINGLE_LEVEL_ROOT`. */
export const SINGLE_LEVEL_CHILD_COUNT = 5

/**
 * FNV-1a — быстрый детерминированный хеш строки.
 *
 * @param value - строка, которую нужно захэшировать
 * @param salt - дополнительная «соль», чтобы получать разные значения от одной строки
 * @returns беззнаковое 32-битное число
 */
function hashKey(value: string, salt: string): number {
  const input = `${value}:${salt}`
  let hash = 2166136261

  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

/**
 * Псевдослучайное, но стабильное число в диапазоне `[0, 1)`.
 *
 * @param value - ключ, от которого считается значение
 * @param salt - «соль», чтобы получить разные числа от одного и того же ключа
 */
function pseudoRandom(value: string, salt: string): number {
  return (hashKey(value, salt) % 1000) / 1000
}

/**
 * Собирает `id` узла из числового пути.
 *
 * @param path - путь от корня, например `[3, 2]`
 * @returns идентификатор вида `node-3-2`
 */
function buildKey(path: number[]): string {
  return `node-${path.join('-')}`
}

/**
 * Разбирает `id` узла обратно в числовой путь.
 *
 * @param id - идентификатор узла или {@link ROOT_ID}
 * @returns путь от корня; для корня — пустой массив
 */
function parsePath(id: string): number[] {
  if (id === ROOT_ID) {
    return []
  }

  return id.replace(/^node-/, '').split('-').map(Number)
}

/**
 * Формирует человекочитаемую подпись узла.
 *
 * @param level - уровень узла
 * @param path - числовой путь узла
 */
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

/**
 * Формирует css-класс иконки для узла (PrimeIcons).
 *
 * @param level - уровень узла
 */
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

/**
 * Определяет, является ли узел листом (без детей).
 *
 * Правила намеренно детерминированы, чтобы данные были воспроизводимы:
 * - уровень {@link MAX_DEPTH} и глубже — всегда лист;
 * - корневые группы, кратные 5 (5, 10, 15, 20), — листья;
 * - дети «одноуровневой» группы {@link SINGLE_LEVEL_ROOT} — листья;
 * - остальные узлы становятся листьями «случайно» (~35 %).
 *
 * @param id - идентификатор узла
 */
function isLeafId(id: string): boolean {
  if (id === ROOT_ID) {
    return false
  }

  const path = parsePath(id)
  const level = path.length - 1

  if (level >= MAX_DEPTH) {
    return true
  }

  if (level === 0) {
    return path[0] % 5 === 0
  }

  if (level === 1 && path[0] === SINGLE_LEVEL_ROOT) {
    return true
  }

  return pseudoRandom(id, 'leaf') < 0.35
}

/**
 * Возвращает количество детей у ветви.
 *
 * @param id - идентификатор ветви
 * @returns 2–4 ребёнка, либо фиксированное число для демо-группы {@link SINGLE_LEVEL_ROOT}
 */
function childCount(id: string): number {
  if (id === buildKey([SINGLE_LEVEL_ROOT])) {
    return SINGLE_LEVEL_CHILD_COUNT
  }

  return 2 + Math.floor(pseudoRandom(id, 'count') * 3)
}

/**
 * Проверяет, есть ли у ветви хотя бы один ребёнок-ветвь (а не лист).
 *
 * Используется, чтобы показать кнопку «развернуть всё» только там, где
 * вложенность действительно глубже одного уровня.
 *
 * @param id - идентификатор ветви
 */
function hasBranchChild(id: string): boolean {
  if (isLeafId(id)) {
    return false
  }

  const path = parsePath(id)

  if (path.length >= MAX_DEPTH) {
    return false
  }

  for (let index = 1; index <= childCount(id); index++) {
    if (!isLeafId(buildKey([...path, index]))) {
      return true
    }
  }

  return false
}

/**
 * Создаёт узел дерева по его числовому пути.
 *
 * Узел-ветвь получает `leaf: false` — это обязательное условие, чтобы PrimeVue
 * нарисовал тогглер ленивой загрузки ещё до подгрузки детей.
 *
 * @param path - числовой путь узла от корня
 */
function createNode(path: number[]): TreeNode {
  const key = buildKey(path)
  const level = path.length - 1

  return {
    key,
    label: buildLabel(level, path),
    icon: buildIcon(level),
    leaf: isLeafId(key),
    data: {
      level,
      path,
      hasNestedBranches: hasBranchChild(key),
    } satisfies TreeExperimentNodeData,
  }
}

/**
 * Возвращает непосредственных детей ветви.
 *
 * @param id - идентификатор ветви или {@link ROOT_ID} для корневого уровня
 * @returns массив узлов; для листа — пустой массив
 */
export function getNodesById(id: string): TreeNode[] {
  if (id === ROOT_ID) {
    return Array.from({ length: ROOT_COUNT }, (_, index) => createNode([index + 1]))
  }

  if (isLeafId(id)) {
    return []
  }

  const path = parsePath(id)

  return Array.from({ length: childCount(id) }, (_, index) => createNode([...path, index + 1]))
}
