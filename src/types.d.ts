import type { Transition } from './transitions/Transition.js'

declare global {
  namespace ex {}
}

declare module 'excalibur' {
  export interface Scene {
    isTransitioning?: boolean
    transition?: Transition

    onIntroStart?(): void
    onIntro?(progress: number): void
    onIntroComplete?(): void

    onOutroStart?(): void
    onOutro?(progress: number): void
    onOutroComplete?(): void

    onLoadStart?(): void
    onLoad?(progress: number): void
    onLoadComplete?(): void
  }
}
