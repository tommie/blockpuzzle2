import type { Application, Ticker } from 'pixi.js'
import { useSettingsStore } from './stores/settings'
import { toValue, type MaybeRef } from 'vue'

export function easeIn(v: number) {
  if (v < 0) return 0
  if (v > 1) return 1

  return Math.pow(v, 3)
}

export function easeOut(v: number) {
  if (v < 0) return 0
  if (v > 1) return 1

  return 1 - Math.pow(1 - v, 3)
}

export function interp(v: number, start: number, end: number) {
  return start + (end - start) * v
}

export function animate(ticker: Ticker, fn: (elapsed: number, ticker: Ticker) => boolean) {
  return new Promise<void>((resolve, reject) => {
    const start = ticker.lastTime

    function wrapper() {
      try {
        if (fn(ticker.lastTime - start, ticker)) {
          ticker.remove(wrapper)
          resolve()
        }
      } catch (error) {
        ticker.remove(wrapper)
        reject(error)
      }
    }

    ticker.add(wrapper)
  })
}

export function useAnimations(app: MaybeRef<Application | null>) {
  const settings = useSettingsStore()

  return {
    async animate(fn: (elapsed: number, ticker: Ticker) => boolean) {
      if (!settings.animationsEnabled) return

      const theApp = toValue(app)

      if (!theApp) return

      return await animate(theApp.ticker, fn)
    },
  }
}
