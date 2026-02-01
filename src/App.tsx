import { useState } from 'react'

type Unit = 'tsp' | 'tbsp' | 'cup' | 'g' | 'oz' | 'pinch' | 'dash'

interface Ingredient {
  id: string
  name: string
  amount: string
  unit: Unit
}

const UNITS: { value: Unit; label: string }[] = [
  { value: 'tsp', label: 'tsp' },
  { value: 'tbsp', label: 'tbsp' },
  { value: 'cup', label: 'cup' },
  { value: 'g', label: 'g' },
  { value: 'oz', label: 'oz' },
  { value: 'pinch', label: 'pinch' },
  { value: 'dash', label: 'dash' },
]

function parseFraction(value: string): number {
  const trimmed = value.trim()

  // Handle mixed numbers like "1 1/2"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10)
    const num = parseInt(mixedMatch[2], 10)
    const denom = parseInt(mixedMatch[3], 10)
    return whole + num / denom
  }

  // Handle simple fractions like "1/2"
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/)
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1], 10)
    const denom = parseInt(fractionMatch[2], 10)
    return num / denom
  }

  // Handle regular numbers
  const num = parseFloat(trimmed)
  return isNaN(num) ? 0 : num
}

function formatAmount(value: number): string {
  if (value === 0) return '0'

  // Common fractions for cooking
  const fractions: [number, string][] = [
    [0.125, '1/8'],
    [0.25, '1/4'],
    [0.333, '1/3'],
    [0.375, '3/8'],
    [0.5, '1/2'],
    [0.625, '5/8'],
    [0.666, '2/3'],
    [0.75, '3/4'],
    [0.875, '7/8'],
  ]

  const whole = Math.floor(value)
  const decimal = value - whole

  // Find closest fraction if decimal is close enough
  for (const [frac, str] of fractions) {
    if (Math.abs(decimal - frac) < 0.05) {
      if (whole === 0) return str
      return `${whole} ${str}`
    }
  }

  // Otherwise return decimal rounded to 2 places
  const rounded = Math.round(value * 100) / 100
  return rounded.toString()
}

function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: crypto.randomUUID(), name: '', amount: '', unit: 'tsp' }
  ])
  const [originalPortions, setOriginalPortions] = useState('1')
  const [desiredPortions, setDesiredPortions] = useState('2')

  const multiplier = parseFraction(desiredPortions) / parseFraction(originalPortions)

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: crypto.randomUUID(), name: '', amount: '', unit: 'tsp' }
    ])
  }

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(i => i.id !== id))
    }
  }

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(ingredients.map(i =>
      i.id === id ? { ...i, [field]: value } : i
    ))
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          Ingredient Upscaler
        </h1>
        <p className="text-stone-600 mb-8">
          Scale your recipe ingredients for any number of portions
        </p>

        {/* Portions */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Recipe makes
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={originalPortions}
                  onChange={(e) => setOriginalPortions(e.target.value)}
                  className="w-20 px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="1"
                />
                <span className="text-stone-600">portions</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                I want to make
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={desiredPortions}
                  onChange={(e) => setDesiredPortions(e.target.value)}
                  className="w-20 px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="2"
                />
                <span className="text-stone-600">portions</span>
              </div>
            </div>
          </div>
          {!isNaN(multiplier) && isFinite(multiplier) && multiplier > 0 && (
            <p className="mt-4 text-sm text-stone-500">
              Multiplying by <span className="font-semibold text-amber-600">{formatAmount(multiplier)}x</span>
            </p>
          )}
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Ingredients</h2>

          <div className="space-y-4">
            {ingredients.map((ingredient) => {
              const originalAmount = parseFraction(ingredient.amount)
              const scaledAmount = originalAmount * multiplier

              return (
                <div key={ingredient.id} className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-[1fr_80px_100px] gap-2">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                      className="px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Ingredient name"
                    />
                    <input
                      type="text"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                      className="px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="1/2"
                    />
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                      className="px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    >
                      {UNITS.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Scaled amount */}
                  <div className="w-32 text-right">
                    {originalAmount > 0 && !isNaN(scaledAmount) && isFinite(scaledAmount) ? (
                      <span className="inline-block bg-amber-100 text-amber-800 px-3 py-2 rounded-md font-medium">
                        {formatAmount(scaledAmount)} {ingredient.unit}
                      </span>
                    ) : (
                      <span className="inline-block text-stone-400 px-3 py-2">—</span>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeIngredient(ingredient.id)}
                    className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    aria-label="Remove ingredient"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>

          <button
            onClick={addIngredient}
            className="mt-4 flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add ingredient
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-stone-400">
          Tip: Use fractions like 1/2 or 1 1/2 for amounts
        </p>
      </div>
    </div>
  )
}

export default App
