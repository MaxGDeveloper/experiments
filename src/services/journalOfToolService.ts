export interface ToolInfo {
  name: string
  shifr: string
  code: number
  quantity: number
}

/**
 * Возвращает массив из ровно 100 строк, описывающих состав детали (позиции спецификации).
 */
export function getPartComposition(): string[] {
  const baseComponents = [
    'Корпус',
    'Вал_ведущий',
    'Подшипник_шариковый',
    'Втулка_бронзовая',
    'Кольцо_стопорное',
    'Шестерня_цилиндрическая',
    'Пружина_сжатия',
    'Болт_крепежный_M8',
    'Гайка_самоконтрящаяся',
    'Шайба_пружинная',
    'Штифт_цилиндрический',
    'Заглушка_резьбовая',
    'Крышка_подшипника',
    'Фланец_приводной',
    'Патрубок_входной',
    'Уплотнитель_резиновый',
    'Прокладка_паронитовая',
    'Винт_установочный',
    'Стойка_опорная',
    'Ось_шарнира',
  ]

  // Array.from({ length: 100 }) гарантирует ровно 100 элементов без риска опечаток или off-by-one
  return Array.from({ length: 100 }, (_, i) => {
    const component = baseComponents[i % baseComponents.length]
    const position = (i + 1).toString().padStart(2, '0')
    return `${component}_поз.${position}`
  })
}

/**
 * Генерирует массив табличных данных инструмента.
 * @returns Массив из 0..50 случайных объектов ToolInfo
 */
export function generateToolTableData(): ToolInfo[] {
  // Math.random() ∈ [0, 1) → * 51 → [0, 50.999) → floor → 0..50
  const count = Math.floor(Math.random() * 51)

  // Базовые пулы данных для генерации (можно вынести в конфиг)
  const toolNames = [
    'Фреза торцевая',
    'Сверло Ø6.0',
    'Резец проходной',
    'Метчик М8х1.25',
    'Плашка М10',
    'Развертка Н7',
    'Зенкер Ø12',
    'Долбяк модульный',
    'Протяжка шпоночная',
    'Фреза концевая',
    'Метчик машинный',
    'Сверло центровочное',
  ]

  const shifrPrefixes = ['ФТ', 'СВ', 'РП', 'МТ', 'ПЛ', 'РЗ', 'ЗН', 'ДМ', 'ПШ', 'ФК']

  return Array.from({ length: count }, () => {
    const name = toolNames[Math.floor(Math.random() * toolNames.length)]
    const prefix = shifrPrefixes[Math.floor(Math.random() * shifrPrefixes.length)]

    // Шифр вида: PREFIX-XXX (например, ФТ-482)
    const shifr = `${prefix}-${Math.floor(Math.random() * 900) + 100}`

    // Код инструмента: 5-значное число
    const code = Math.floor(Math.random() * 90000) + 10000

    // Количество на складе: 1..15 шт.
    const quantity = Math.floor(Math.random() * 15) + 1

    return { name, shifr, code, quantity }
  })
}
