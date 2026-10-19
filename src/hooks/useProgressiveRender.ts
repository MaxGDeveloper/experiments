/**
 * @file Инфраструктура постепенной (порционной) отрисовки.
 *
 * Задача: тяжёлые операции (раскрыть/свернуть тысячи узлов) выполнять не одним
 * синхронным тактом, а порциями, отдавая браузеру кадр между порциями.
 *
 * Что это даёт:
 * - страница не «фризит» на время массовой операции;
 * - видно прогресс (сколько уже обработано);
 * - операцию можно отменить.
 *
 * Чего это НЕ делает: не уменьшает итоговое число DOM-узлов. Когда всё уже
 * отрисовано, содержимое дерева всё равно живёт в DOM целиком. Для очень
 * больших деревьев нужна виртуализация (рендерить только видимые строки).
 */

import { ref, type Ref } from 'vue'

/** Сколько элементов обрабатывать за один кадр по умолчанию. */
const DEFAULT_CHUNK_SIZE = 25

/** Пауза сверх кадра анимации по умолчанию, мс. */
const DEFAULT_FRAME_DELAY = 16

export interface ProgressiveRenderOptions {
  /** Сколько элементов обрабатывать за один кадр. */
  chunkSize?: number
  /** Пауза сверх кадра, мс. */
  frameDelay?: number
}

export interface ProgressiveRender {
  /** Идёт постепенная операция (для индикатора и блокировки кнопок). */
  isProcessing: Ref<boolean>
  /** Ждёт следующий кадр отрисовки браузера (и паузу сверх него). */
  frame: () => Promise<void>
  /** Режет массив на порции по `chunkSize`. */
  batches: <T>(items: T[]) => T[][]
  /** Начинает новую операцию, отменяя предыдущую; возвращает её номер. */
  start: () => number
  /** Актуальна ли операция с этим номером (не отменена более новой). */
  isActive: (id: number) => boolean
  /** Завершает операцию, если она всё ещё актуальна. */
  finish: (id: number) => void
  /** Отменяет текущую операцию. */
  cancel: () => void
}

/**
 * Планировщик порционной отрисовки.
 *
 * Пример использования в цикле:
 * ```ts
 * const id = render.start()
 * for (const batch of render.batches(nodes)) {
 *   if (!render.isActive(id)) return   // операцию отменили
 *   applyBatch(batch)
 *   await render.frame()
 * }
 * render.finish(id)
 * ```
 *
 * @param options - размер порции и пауза между кадрами
 */
export function useProgressiveRender(options: ProgressiveRenderOptions = {}): ProgressiveRender {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE
  const frameDelay = options.frameDelay ?? DEFAULT_FRAME_DELAY

  const isProcessing: Ref<boolean> = ref(false)

  /**
   * Номер текущей операции. Запуск новой операции увеличивает его и тем самым
   * отменяет предыдущую: её циклы увидят `isActive(id) === false` и выйдут.
   */
  let runId = 0

  function frame(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        if (frameDelay > 0) {
          setTimeout(resolve, frameDelay)
        } else {
          resolve()
        }
      })
    })
  }

  function batches<T>(items: T[]): T[][] {
    const result: T[][] = []

    for (let index = 0; index < items.length; index += chunkSize) {
      result.push(items.slice(index, index + chunkSize))
    }

    return result
  }

  function start(): number {
    runId += 1
    isProcessing.value = true

    return runId
  }

  function isActive(id: number): boolean {
    return id === runId
  }

  function finish(id: number) {
    if (isActive(id)) {
      isProcessing.value = false
    }
  }

  function cancel() {
    runId += 1
    isProcessing.value = false
  }

  return { isProcessing, frame, batches, start, isActive, finish, cancel }
}
