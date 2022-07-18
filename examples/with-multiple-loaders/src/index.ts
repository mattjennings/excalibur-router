import * as ex from 'excalibur'
import { FadeTransition } from 'excalibur-router'
import { router } from './router'

const engine = new ex.Engine({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreen,
})

router.start(engine).then(() => {
  router.goto('level1', { loader: 'boot', transition: new FadeTransition() })
})
