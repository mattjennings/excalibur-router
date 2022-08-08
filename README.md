# Excalibur Router

A scene router for [Excalibur](https://excaliburjs.com).

## Features

- Transitions
- Dynamic scene loading
- Loading scenes

## Usage

```
npm install excalibur-router
```

```ts
// router.ts
import { Router } from 'excalibur-router'

class Level1 extends ex.Scene {}
class Level2 extends ex.Scene {}

const router = new Router({
  routes: {
    level1: Level1,
    level2: Level2,
  },
})
```

```ts
// game.ts
import * as ex from 'excalibur'
import { router } from './router'

const engine = new ex.Engine({
  width: 800,
  height: 600,
})

router.start(engine).then(() => {
  router.goto('level1')
})
```

## Loaders

Router repurposes Loaders to act as scenes. Resources can be queued with `router.addResource(resources)` and they will be loaded automatically during the next scene navigation.

When loading, the router temporarily navigates to the loading scene and continues to the target once loading has completed. There is a default loading scene, but you can provide your own:

```js
class LoadingScene extends ex.Scene {
  // if true, navigation will not resume until this scene emits a 'complete' event
  // it is false by default
  defer = false

  onLoadStart() {}

  onLoad(progress: number) {}

  onLoadComplete() {
    // if this.defer is true:
    this.emit('complete', undefined)
  }
}

const router = new Router({
  routes: {...},
  loader: LoadingScene,
})
```

You can have multiple loaders as well:

```js
const router = new Router({
  routes: {...},
  loader: {
    boot: BootLoadingScene,
    // default will be used if no loader is provided in router.goto()
    default: LoadingScene
  },
})

router.goto('level1', {
  loader: 'boot'
})
```

## Lazy Loading

Scene routes may be defined using dynamic imports which will cause them to be loaded lazily. If these scenes contain any `router.addResource()` calls (or import files that do), they will be loaded as well.

_Note: you must be using a bundler that supports dynamic imports, such as Vite or Webpack_

```js
const router = new Router({
  routes: {
    level1: () => import('./level1'), // contains a default export of Scene
  },
})
```

## Transitions

Transitions are actors with lifecycle hooks for the transitioning of scenes. They typically will play the outro, be carried into the next scene, play their intro, and then be killed.

```js
import { Transition, TransitionArgs } from 'excalibur-router'

export class FadeTransition extends Transition {
  el: ScreenElement

  constructor(args: TransitionArgs = {}) {
    super({
      duration: 300,
      z: Infinity,
      ...args,
    })
  }

  onInitialize(engine: Engine): void {
    this.el = new ScreenElement({
      x: 0,
      y: 0,
      z: this.z,
      width: engine.canvasWidth,
      height: engine.canvasHeight,
      color: Color.Black,
    })

    this.el.graphics.opacity = this.isOutro ? 0 : 1
    this.addChild(this.el)
  }

  onIntroStart() {
    this.el.graphics.opacity = 1
  }

  onOutroStart() {
    this.el.graphics.opacity = 0
  }

  onIntro(progress: number) {
    this.el.graphics.opacity = 1 - progress
  }

  onOutro(progress: number) {
    this.el.graphics.opacity = progress
  }
}
```

They can be used in `router.goto`

```js
router.goto('level1', {
  transition: new FadeTransition(),
})
```

There are some default transition effects provided:

- FadeTransition
- CrossFadeTransition

### Transitions with Loading Scenes

Depending on the transition effect, you may want the transition to carry into a loading scene. Transitions can take `persistOnLoading` argument to do this, causing the effect to stay in its completed "outro" state for the entirety of the loading scene.

**Note** This does not apply for the initial loading scene

```js
router.goto('level1', {
  transition: new FadeTransition({
    persistOnLoading: true,
  }),
})
```

You can also provide a number value instead, which will persist the transition for that amount of time in ms before "introing" into the loading scene. This is useful for something like a Fade effect, where you might want to stay faded unless the loading is taking a long time.

```js
router.goto('level1', {
  transition: new FadeTransition({
    // if loading takes longer than 200ms, fade back in to show loading scene
    persistOnLoading: 200,
  }),
})
```

### Blocking Input during Transition

You likely will want to block user input during a transition, as the Scene remains running as usual while the transition is happening. You can check if the transition is in progress by checking `router.isTransitioning` or `scene.isTransitioning`.

```js
onPreUpdate(engine) {
  if (this.scene.isTransitioning) {
    return
  }

  // ...
}
```

## Events

Router emits the following events:

| Event Name        | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `navigationstart` | navigation has started (before outro transition & loading scene)               |
| `navigation`      | the scene has been navigated to (after loading scene, before intro transition) |
| `navigationend`   | navigation has completed (after loading scene & intro transition)              |

They each contain target scene and goto() arguments.

## Examples

See the [examples](./examples) for detailed usage.
