# Ленивое дерево иерархии на PrimeVue 4 — полный разбор и инструкция

> Документ объясняет, как устроено дерево с ленивой загрузкой в этом проекте,
> почему «данные загружаются, а ветви не раскрываются» и как пошагово собрать
> такое же поведение на работе.
>
> Стек: Vue 3.5 (`<script setup lang="ts">`), PrimeVue 4.5.5, Vite 7, TypeScript 5.8.

---

## 1. Итог: что и где лежит

| Файл | Роль |
|---|---|
| [`src/services/treeExperimentsService.ts`](../src/services/treeExperimentsService.ts) | «Сервер»: по `id` ветви отдаёт её непосредственных детей. Дерево строится детерминированно из `id`. |
| [`src/hooks/useTreeExperiments.ts`](../src/hooks/useTreeExperiments.ts) | Обёртка-API. Ровно один метод `getBranchById(id)`. |
| [`src/hooks/useProgressiveRender.ts`](../src/hooks/useProgressiveRender.ts) | Планировщик постепенной отрисовки: порции, кадры, отмена. Общий хук, к дереву не привязан. |
| [`src/views/trees/TreeExperiments.vue`](../src/views/trees/TreeExperiments.vue) | Страница. **Вся** логика раскрытия живёт здесь. В файле два блока: «планировщик отрисовки» (подключение) и «основная логика дерева». |
| [`src/router/index.ts`](../src/router/index.ts) | Маршрут `/ExperimentalTree` (name `ExperimentalTree`). |
| [`src/views/HomeView.vue`](../src/views/HomeView.vue) | Кнопка-ссылка «Дерево иерархии» на главной. |

Иерархия: `root` → **Группа** (уровень 0) → **Узел** (1) → **Блок** (2) → **Деталь** (3).

Демо-особенности данных (нужны, чтобы визуально проверять поведение):

- Корень отдаёт 20 групп.
- Группы 5, 10, 15, 20 — **листья** (без вложенности).
- Группа 11 — **ветвь ровно с одним уровнем**: 5 детей, и все они листья.
- Остальные группы — обычные ветви с вложенностью 2–3 уровня.

---

## 2. База: как PrimeVue вообще рисует дерево

Без понимания этих четырёх мест невозможно объяснить, почему ничего не раскрывается.
Ниже — реальный код из `node_modules/primevue/tree/`.

### 2.1 Три вычисляемых свойства узла (`TreeNode.vue`)

```js
computed: {
  hasChildren() {
    return this.node.children && this.node.children.length > 0
  },
  expanded() {
    return this.expandedKeys && this.expandedKeys[this.node.key] === true
  },
  leaf() {
    return this.node.leaf === false ? false : !(this.node.children && this.node.children.length)
  },
}
```

Что это значит на практике:

- `hasChildren` — **истина только если у узла уже есть непустой массив `children`**.
- `expanded` — истина, только если ключ узла есть в объекте `expandedKeys` со значением `true`.
- `leaf` — узел считается листом, **если он не помечен `leaf: false` и у него нет детей**.
  То есть, пока детей нет, узел по умолчанию лист.

### 2.2 Дети рендерятся только при двух условиях сразу

```html
<ul v-if="hasChildren && expanded" class="p-tree-node-children" role="group">
  <TreeNode v-for="(childNode, index) of node.children" :key="childNode.key" ... />
</ul>
```

**Нужны одновременно и `children`, и флаг раскрытия.** Нет детей — нечего рисовать.
Нет флага — не рисовать, даже если дети есть.

### 2.3 Тогглер (стрелочка) рисуется всегда, но прячется у листьев

```html
<button type="button" :class="cx('nodeToggleButton')" @click="toggle" :data-p-leaf="leaf">
  <template v-if="node.loading && loadingMode === 'icon'">
    <SpinnerIcon spin :class="cx('nodeToggleIcon')" />
  </template>
  ...
</button>
```

```css
/* из @primeuix/styles/tree */
.p-tree-node-leaf > .p-tree-node-content .p-tree-node-toggle-button {
  visibility: hidden;
}
```

Плюс: при `loading-mode="icon"` и `node.loading === true` PrimeVue показывает спиннер
именно в слоте тогглера. Это и есть «ленивая загрузка с индикатором».

### 2.4 Внутреннее состояние раскрытия живёт в `Tree.vue`, а не у вас

```js
data() {
  return {
    d_expandedKeys: this.expandedKeys || {},   // ← внутренняя копия/ссылка
    ...
  }
},
watch: {
  expandedKeys(newValue) {
    this.d_expandedKeys = newValue             // ← синхронизация при новом объекте
  },
},
methods: {
  onNodeToggle(node) {
    const key = node.key
    if (this.d_expandedKeys[key]) {
      delete this.d_expandedKeys[key]
      this.$emit('node-collapse', node)
    } else {
      this.d_expandedKeys[key] = true
      this.$emit('node-expand', node)          // ← сюда приходит @node-expand
    }
    this.d_expandedKeys = { ...this.d_expandedKeys }   // ← ВАЖНО: переприсваивание
    this.$emit('update:expandedKeys', this.d_expandedKeys)
  },
}
```

Дочерним `TreeNode` передаётся именно `d_expandedKeys`, а не ваш проп напрямую:

```html
<TreeNode :expandedKeys="d_expandedKeys" @node-toggle="onNodeToggle" ... />
```

**Отсюда растут почти все грабли.** Разберём их отдельно.

---

## 3. Почему не получалось: пять причин

### Причина 1. Узел без `leaf: false` считается листом → нет стрелочки

Смотрим ещё раз на `leaf`:

```js
leaf() {
  return this.node.leaf === false ? false : !(this.node.children && this.node.children.length)
}
```

В ленивом режиме вы **ещё не загрузили** детей, значит `node.children` пуст.
Если при этом `node.leaf` не равен явно `false`, узел считается листом:

- стрелочка скрыта (`visibility: hidden`),
- кликнуть некуда,
- раскрыть невозможно.

**Решение:** в источнике данных каждый узел-ветвь обязан иметь `leaf: false`,
а настоящие листья — `leaf: true`.

```ts
// services/treeExperimentsService.ts
function createNode(path: number[]): TreeNode {
  const key = buildKey(path)
  const level = path.length - 1

  return {
    key,
    label: buildLabel(level, path),
    icon: buildIcon(level),
    leaf: isLeafId(key), // ← ветвь → false, лист → true
    data: { level, path, hasNestedBranches: hasBranchChild(key) },
  }
}
```

> Симптом, если забыть: «узлы без стрелочек, как обычный список».

### Причина 2. `expandedKeys` меняли по месту вместо переприсваивания

Допустим, вы делаете так:

```ts
// ❌ НЕПРАВИЛЬНО
expandedKeys.value[node.key] = true
```

Почему это работает через раз:

1. `Tree` инициализирует `d_expandedKeys: this.expandedKeys || {}` — **той же ссылкой**.
2. Пока ссылка та же, мутация объекта «случайно» видна и вам, и PrimeVue.
3. Но после **первого же клика пользователя** `onNodeToggle` делает
   `this.d_expandedKeys = { ...this.d_expandedKeys }` — создаёт **новую копию**.
   С этого момента ваша мутация по месту уходит «в никуда»: `Tree` смотрит на свою копию.
4. Плюс `watch: expandedKeys` не срабатывает, потому что ссылка на проп не менялась
   (наблюдение в PrimeVue не глубокое).

Итог: «иногда раскрывается, иногда нет», «программное раскрытие не работает,
а клик мышью — работает».

**Решение:** всегда формировать **новый объект**.

```ts
expandedKeys.value = { ...expandedKeys.value, [node.key]: true }
```

В проекте это собрано в одном месте:

```ts
function markExpanded(nodes: TreeNode[]) {
  const keys: Record<string, boolean> = {}
  nodes.forEach((node) => {
    if (isBranch(node)) {
      keys[node.key] = true
    }
  })
  expandedKeys.value = { ...expandedKeys.value, ...keys } // новый объект → watcher сработает
}
```

> Симптом, если забыть: «дети в памяти загружены, в отладчике есть, но визуально ветвь не раскрылась».

### Причина 3. Одного «раскрыть» мало — нужны и дети, и флаг

Повторим условие рендера: `hasChildren && expanded`.
Значит для **программного** раскрытия надо выполнить оба действия:

1. подставить `node.children = [...]` (загрузить),
2. выставить `expandedKeys[node.key] = true` (и переприсвоить объект).

При клике мышью PrimeVue сам переключает флаг и лишь потом шлёт `@node-expand`,
поэтому в обработчике клика достаточно догрузить детей:

```ts
async function onNodeExpand(node: TreeNode) {
  await loadChildren(node) // флаг уже выставлен самим Tree
}
```

А вот для «Развернуть всё» флаг надо ставить руками. Поскольку детей нельзя
загрузить раньше, чем ты знаешь их родителя, обход идёт **по уровням (BFS)**:

```ts
async function expandLevel(nodes: TreeNode[]): Promise<TreeNode[]> {
  markExpanded(nodes) // 1) флаги

  const next: TreeNode[] = []
  await Promise.all(
    nodes.map(async (node) => {
      if (!isBranch(node)) return
      await loadChildren(node) // 2) дети
      if (node.children?.length) next.push(...node.children)
    }),
  )
  return next // следующий уровень
}

async function expandAll() {
  let level = treeNodes.value
  while (level.length) {
    level = await expandLevel(level)
  }
}
```

```ts
async function loadChildren(node: TreeNode) {
  if (!isBranch(node) || node.children?.length) return // грузим ровно один раз

  node.loading = true                                   // → спиннер в тогглере
  node.children = await getBranchById(node.key)
  node.loading = false
}
```

Про реактивность: `treeNodes` объявлен как `ref([])`, поэтому массив **глубоко
реактивен**, и присваивание `node.children = ...` корректно триггерит перерисовку.

> Симптом, если забыть один из шагов: «флаг стоит, но пусто» или «данные есть, но свёрнуто».

### Причина 4. Свой слот `#default` перекрывает вывод подписи

```html
<span :class="cx('nodeLabel')">
  <component v-if="templates[node.type] || templates['default']" :is="templates['default']" :node="node" ... />
  <template v-else>{{ label(node) }}</template>   <!-- ← авто-вывод подписи только тут -->
</span>
```

Как только вы добавляете `<template #default="{ node }">`, PrimeVue **не рисует
подпись сам** — вы обязаны вывести её вручную:

```html
<template #default="{ node }">
  <span class="node-label">{{ node.label }}</span>
  <Button v-if="canExpandBranch(node)" ... @click.stop="expandBranch(node)" />
</template>
```

Ещё нюанс: на кнопке стоит `@click.stop` — так клик по ней не проваливается
в узел дерева. Дерево здесь чисто информационное: выбора узлов нет
(никаких `selection-mode` / `selectionKeys`).

> Симптом, если забыть: «подписи узлов пропали».

### Причина 5. Инфраструктура: Vite (HMR) не подхватил правку

Наблюдалось в этом проекте (Windows): после точечного `edit` файла сервиса
dev-сервер продолжал отдавать **старую** версию модуля. `webfetch` на
`http://localhost:5173/src/services/treeExperimentsService.ts` показывал старый код,
хотя на диске файл был новый. Watcher Vite пропустил изменение.

Обход, который помог: **перезаписать файл целиком** (или перезапустить dev-сервер).
Проверка «что реально отдаёт сервер»:

```
Открыть в браузере: http://localhost:<port>/src/services/treeExperimentsService.ts
и посмотреть, есть ли там твоя свежая строка.
```

> Симптом: «правлю код, перезагружаю — ничего не меняется».

---

## 4. Пошаговая инструкция: собрать такое же дерево с нуля

### Шаг 0. Предпосылки

- PrimeVue 4.x, дерево `Tree` автоимпортируется через `unplugin-vue-components`
  (`@primevue/auto-import-resolver`) — вручную импортировать `Tree`/`Button` не нужно.
- Директивы **не** автоимпортируются. Поэтому `v-tooltip` не используется —
  подсказка сделана нативным атрибутом `title`.

### Шаг 1. Модель узла и источник данных

Узел — это обычный объект `TreeNode`. Для ленивой загрузки критично:

- `key` — уникальный **строковый** id узла (он же id ветви для API);
- `leaf: false` — у ветвей (иначе нет стрелочки);
- `data` — произвольные данные узла (уровень, путь, флаги для UI).

В проекте источник — «stateless API по id»: `getNodesById(id)` возвращает только
детей указанной ветви, а лист/количество детей определяются детерминированно из id.

```ts
export interface TreeExperimentNodeData {
  level: number                 // 0 — группа, 1 — узел, 2 — блок, 3 — деталь
  path: number[]                // [3, 2, 1]
  hasNestedBranches: boolean    // есть ли ниже ещё одна ветвь
}

export function getNodesById(id: string): TreeNode[] {
  if (id === ROOT_ID) {
    return Array.from({ length: ROOT_COUNT }, (_, i) => createNode([i + 1]))
  }
  if (isLeafId(id)) return []
  const path = parsePath(id)
  return Array.from({ length: childCount(id) }, (_, i) => createNode([...path, i + 1]))
}
```

`hasNestedBranches` кладётся в данные узла, чтобы UI мог решить про кнопку,
**не дожидаясь** раскрытия (в реальном API это часто отдельное поле или
заранее известная глубина).

### Шаг 2. Хук: только «получить ветвь по id»

```ts
export function useTreeExperiments() {
  async function getBranchById(id: string): Promise<TreeNode[]> {
    await executeDelay(NODE_LOAD_DELAY) // эмуляция сети → видно спиннер
    return getNodesById(id)
  }
  return { getBranchById }
}
```

Никаких «раскрыть» в хуке нет: раскрытие — это UI-поведение, а не задача данных.

### Шаг 3. Состояние во вью

```ts
const treeNodes: Ref<TreeNode[]> = ref([])
const expandedKeys: Ref<Record<string, boolean>> = ref({})
const isLoading: Ref<boolean> = ref(false)
```

> Дерево информационное: `selection-mode` и `selectionKeys` не используются.
> Достаточно `treeNodes` (данные) и `expandedKeys` (раскрытие).

### Шаг 4. Загрузка корня по `onMounted`

```ts
async function loadTree() {
  isLoading.value = true
  expandedKeys.value = {}
  treeNodes.value = await getBranchById(ROOT_ID)
  isLoading.value = false
}

onMounted(() => { loadTree() })
```

### Шаг 5. Подключение Tree (атрибуты, которые важны)

```html
<Tree
  v-model:expandedKeys="expandedKeys"
  :value="treeNodes"
  loading-mode="icon"
  :filter="true"
  filter-mode="lenient"
  @node-expand="onNodeExpand"
>
  <template #default="{ node }"> ... </template>
</Tree>
```

- `loading-mode="icon"` — спиннер в тогглере (а не оверлей-mask).
- `@node-expand` — момент ленивой догрузки.
- `v-model:expandedKeys` — двусторонняя связь; см. Причину 2 (всегда новый объект).

### Шаг 6. Логика раскрытия (все четыре сценария)

Базовая идея:

```ts
function isBranch(node: TreeNode) { return node.leaf === false }

async function onNodeExpand(node: TreeNode) { await loadChildren(node) }

async function expandAll() {                 // развернуть всё
  let level = treeNodes.value
  while (level.length) level = await expandLevel(level)
}

async function expandBranch(node: TreeNode) { // развернуть одну ветвь целиком
  expandedKeys.value = { ...expandedKeys.value, [node.key]: true }
  await loadChildren(node)
  let level = node.children ?? []
  while (level.length) level = await expandLevel(level)
}

function collapseAll() { expandedKeys.value = {} }
```

> Это учебный «скелет». В рабочей версии раскрытие и сворачивание идут
> **порциями по кадрам** (чтобы большие деревья не вешали страницу) — см.
> [раздел 6](#6-большие-деревья-почему-развернуть-всё-вешает-страницу-и-как-это-исправить).

### Шаг 7. Кнопка «развернуть вложенные ветви» — только там, где нужно

Требование с работы:

1. кнопка есть **только у корневых** ветвей **и только если** вложенность
   глубже одного уровня (у корня есть хотя бы один ребёнок-ветвь, а не лист);
2. у вложенных узлов кнопки нет вообще.

```ts
function canExpandBranch(node: TreeNode): boolean {
  const data = node.data as TreeExperimentNodeData | undefined
  return data?.level === 0 && data.hasNestedBranches === true
}
```

Проверка на живых данных (Группа 11 — ветвь с одним уровнем):

| Что | Результат |
|---|---|
| Корней всего | 20 |
| С кнопкой | 15 |
| Без кнопки | 5, 10, 15, 20 (листья) + 11 (одноуровневая ветвь) |
| У Группы 11 | тогглер есть, кнопки нет, 5 детей-листьев |
| Кнопок у вложенных узлов | 0 |
| «Развернуть всё» | ~294 узла, ~90 ветвей, 0 свёрнутых, 0 спиннеров |

---

## 5. Шпаргалка «симптом → причина»

| Симптом | Причина | Что делать |
|---|---|---|
| Узлы без стрелочек | у ветвей нет `leaf: false` | проставить `leaf` в данных |
| Стрелочка есть, но раскрытие пустое | дети не загружены (`children` пуст) | догрузить в `@node-expand` |
| Данные загружены, но ветвь не раскрылась | `expandedKeys` мутировали по месту | переприсвоить новым объектом |
| Работает кликом, но не программно | то же (Причина 2) | то же |
| Программное раскрытие «через раз» | `Tree` держит свою копию `d_expandedKeys` | новый объект + порядок «сначала дети, потом/вместе флаг» |
| Подписи узлов пропали | добавлен слот `#default` | вывести `node.label` вручную |
| Кнопка висит на вложенном узле | нет проверки `level === 0` | ограничить условием |
| Правка кода не применяется | Vite/HMR пропустил файл | перезаписать файл / перезапустить dev |

---

## 6. Большие деревья: почему «развернуть всё» вешает страницу и как это исправить

### В чём проблема

PrimeVue рендерит DOM на **каждый раскрытый** узел: элементы `li`/`div`/`span`,
плюс компонент `TreeNode` на каждый узел и наш `Button` на каждую корневую ветвь.
Итого на N узлов — примерно N компонентов `TreeNode` и 4–6 DOM-элементов на узел.
Для 10 000 узлов это ~40–60 тыс. DOM-элементов и ~10 тыс. компонентов Vue.

Когда `expandedKeys` меняется «разом» (все ключи в одном такте), Vue создаёт
все эти компоненты в одном синхронном такте — страница замирает на секунды.
Сворачивание (`expandedKeys.value = {}`) — это размонтирование всех компонентов
одним тактом, тоже тяжёлый такт.

У `Tree` в PrimeVue 4 **нет виртуализации** (ни `virtualScrollerOptions`,
ни `VirtualScroller`); есть только `scrollHeight` — он ограничивает высоту и
включает скролл, но число DOM-узлов не сокращает, поэтому проблему не решает.

### Что даёт постепенная отрисовка (progressive rendering)

Приём тот же, что при отрисовке большого количества карточек: разбиваем работу
на порции и между порциями отдаём браузеру кадр на отрисовку.

Чтобы не смешивать это с логикой дерева, «механика» вынесена в отдельный хук
[`src/hooks/useProgressiveRender.ts`](../src/hooks/useProgressiveRender.ts):

```ts
// src/hooks/useProgressiveRender.ts — вся «механика» порций и отмены
export function useProgressiveRender({ chunkSize = 25, frameDelay = 16 } = {}) {
  const isProcessing = ref(false)
  let runId = 0

  function frame(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => (frameDelay > 0 ? setTimeout(resolve, frameDelay) : resolve()))
    })
  }

  function batches<T>(items: T[]): T[][] {          // режем на порции
    const result: T[][] = []
    for (let i = 0; i < items.length; i += chunkSize) result.push(items.slice(i, i + chunkSize))
    return result
  }

  function start() { runId += 1; isProcessing.value = true; return runId }
  function isActive(id: number) { return id === runId }
  function finish(id: number) { if (isActive(id)) isProcessing.value = false }
  function cancel() { runId += 1; isProcessing.value = false }

  return { isProcessing, frame, batches, start, isActive, finish, cancel }
}
```

Раскрытие уровня: сначала **параллельно** догружаем детей всех ветвей уровня
(сетевые запросы можно параллелить), затем раскрываем их **порциями по кадрам**
(тяжёлая часть — именно отрисовка):

```ts
async function expandLevel(nodes: TreeNode[], id: number): Promise<TreeNode[]> {
  await Promise.all(nodes.map((node) => (isBranch(node) ? loadChildren(node) : undefined)))
  if (!isActive(id)) return []

  const next: TreeNode[] = []
  nodes.forEach((node) => {
    if (isBranch(node) && node.children?.length) next.push(...node.children)
  })

  for (const batch of batches(nodes.filter(isBranch))) {
    if (!isActive(id)) return []
    markExpanded(batch)   // переприсваиваем expandedKeys новым объектом
    await frame()         // браузер успевает нарисовать порцию
  }

  return next
}
```

Сворачивание — от самых глубоких ветвей к корню, тоже порциями
(каждая порция снимает небольшой кусок дерева):

```ts
async function collapseAll() {
  const id = start()
  try {
    const levels = collectBranchKeysByLevel(treeNodes.value)
    for (let index = levels.length - 1; index >= 0; index--) {
      for (const batch of batches(levels[index])) {
        if (!isActive(id)) return
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
```

### Отмена операции

`runId` — номер текущей операции. Запуск новой операции увеличивает `runId`
и тем самым отменяет предыдущую; циклы проверяют `isActive(id)` и выходят.
Отдельная кнопка «Стоп» вызывает `cancelProcessing()`. Это же позволяет
нажать «Свернуть всё» прямо во время раскрытия — раскрытие отменится.

Индикатор прогресса — просто число раскрытых ветвей:
`computed(() => Object.keys(expandedKeys.value).length)`.

### Ограничения и когда нужна виртуализация

- Постепенность убирает **фриз одним тактом**, но не уменьшает **итоговое**
  число DOM-узлов: когда всё развёрнуто, скролл по десяткам тысяч узлов всё
  равно может подтормаживать.
- Ориентир: до ~1–5 тыс. узлов постепенной отрисовки достаточно. Для десятков
  тысяч нужна **виртуализация** (рендерить только видимые строки) — плоский
  список видимых узлов + виртуальный скролл; `Tree` из PrimeVue для этого не
  подходит и отрисовку дерева пришлось бы писать вручную.
- Если сеть медленная, добавь ограничение параллельных запросов (например,
  грузить уровень порциями) — сейчас уровень грузится целиком параллельно.

### Что видно на эксперименте

| Действие | Результат |
|---|---|
| «Развернуть все» | 20 → 68 → 146 → 232 → 294 узла (ступенями, ~2,2 с) |
| «Свернуть все» | 294 → 146 → 20 (ступенями) |
| Во время обработки | индикатор «Постепенная отрисовка… ветвей раскрыто: N» |
| «Стоп» | процесс замирает (68 → 68 → 68), индикатор исчезает |

---

## 7. Принятые архитектурные решения (и почему так)

1. **API без состояния, по id.** `getNodesById(id)` не хранит дерево — любой
   узел можно запросить в любой момент. Это упрощает ленивую загрузку и
   «развернуть ветвь», не требуя держать карту дерева.
2. **`key` = id ветви.** Один идентификатор и для дерева, и для запроса.
3. **Раскрытие — во вью, а не в хуке.** Хук = доступ к данным; раскрытие = UI.
   По требованию заказчика.
4. **Корень грузится тем же методом** (`getBranchById(ROOT_ID)`), а не отдельным.
5. **Обход по уровням (BFS).** Раскрывать можно только то, что уже загружено;
   поэтому «развернуть всё» идёт уровень за уровнем, ожидая загрузку детей.
6. **Флаг `hasNestedBranches` в данных узла.** Позволяет показать кнопку
   сразу, не дожидаясь раскрытия ветви.
7. **Нативный `title` вместо `v-tooltip`.** Директивы не автоимпортируются.
8. **Постепенная отрисовка с отменой.** Тяжёлые операции (раскрыть/свернуть всё)
   идут порциями по кадрам и могут быть отменены — см. раздел 6.

---

## 8. Чек-лист приёмки

- [ ] Корень грузится по `onMounted`, во время загрузки — `ProgressSpinner`.
- [ ] У ветвей видны стрелочки; у листьев — нет.
- [ ] Клик по стрелочке показывает спиннер (`p-icon-spin`), затем детей.
- [ ] Повторный клик не перезагружает детей (грузим ровно один раз).
- [ ] «Развернуть всё» раскрывает всё дерево, спиннеров не остаётся.
- [ ] Раскрытие/сворачивание идут ступенями (порциями по кадрам), страница не фризит.
- [ ] Во время обработки виден индикатор прогресса и кнопка «Стоп».
- [ ] «Стоп» останавливает процесс и убирает индикатор.
- [ ] «Свернуть всё» сбрасывает `expandedKeys`.
- [ ] Кнопка «развернуть вложенные» есть только у корней с вложенностью > 1 уровня.
- [ ] У одноуровневой ветви (Группа 11) кнопки нет.
- [ ] У вложенных узлов кнопки нет вообще.
- [ ] Дерево информационное: узлы не выделяются (нет `selection-mode`).
- [ ] Клик по кнопке не проваливается в узел и не сворачивает дерево.
- [ ] `npm run build` (vue-tsc + vite) проходит без ошибок.

---

## Приложение A. Точные строки исходников PrimeVue (для сверки версии)

Проверялось на `primevue@4.5.5`:

- `node_modules/primevue/tree/TreeNode.vue`
  - строки ~700–708: `hasChildren`, `expanded`, `leaf`;
  - строка ~70: `<ul v-if="hasChildren && expanded" ...>`;
  - строка ~34–45: кнопка-тогглер и спиннер (`node.loading && loadingMode === 'icon'`);
  - строки ~64–67: слот `default` вместо авто-вывода подписи.
- `node_modules/primevue/tree/Tree.vue`
  - строки ~77–97: `d_expandedKeys` и `watch: expandedKeys`;
  - строки ~148–161: `onNodeToggle` (мутация, `node-expand`, переприсваивание, `update:expandedKeys`).
- `node_modules/@primeuix/styles/dist/tree/index.mjs`
  - правило `.p-tree-node-leaf ... .p-tree-node-toggle-button { visibility: hidden; }`.

> Если версия PrimeVue другая — перепроверьте эти места, поведение могло измениться.
