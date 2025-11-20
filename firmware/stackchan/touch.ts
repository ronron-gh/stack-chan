import config from 'mc/config'
import Time from 'time'
import Timer from 'timer'

export default class Touch {
  // biome-ignore lint/suspicious/noExplicitAny: touch driver of device don't have type
  #touch: any
  onTouchBegan: (x: number, y: number, ticks: number) => void
  onTouchMoved: (x: number, y: number, ticks: number) => void
  onTouchEnded: (x: number, y: number, ticks: number) => void

  // biome-ignore lint/suspicious/noExplicitAny: touch driver of device don't have type
  constructor(TouchConstructor: new (param: unknown) => any) {
    let touchCount = config.touchCount ?? 1
    const onSample = () => {
      const touch = this.#touch
      const points = touch.sample()
      if (!points) return

      let mask = (1 << touchCount) - 1
      for (let i = 0, length = points.length; i < length; i++) {
        const point = points[i]
        const id = point.id
        const last = touch.points[id]

        mask ^= 1 << id
        // this.rotate?.(point);
        if (last) {
          last.x = point.x
          last.y = point.y
          this.onTouchMoved?.(point.x, point.y, Time.ticks)
        } else {
          touch.points[id] = { x: point.x, y: point.y }
          this.onTouchBegan?.(point.x, point.y, Time.ticks)
        }
      }

      for (let i = 0; mask; i += 1, mask >>= 1) {
        if (mask & 1) {
          const last = touch.points[i]
          if (last) {
            touch.points[i] = undefined
            this.onTouchEnded?.(last.x, last.y, Time.ticks)
          }
        }
      }
    }
    const touch = new TouchConstructor({ onSample })
    this.#touch = touch
    if (touch.sample) {
      // ECMA-419 driver
      touch.points = new Array(touchCount)
      if (!touch.configuration?.interrupt) touch.timer = Timer.repeat(onSample, 16)
    } else {
      // legacy driver
      touch.points = []
      while (touchCount--) touch.points.push({})
      Timer.repeat(() => {
        const points = touch.points
        touch.read(points)
        const point = points[0]
        switch (point.state) {
          case 0:
          case 3:
            if (point.down) {
              point.down = undefined
              this.onTouchEnded?.(point.x, point.y, Time.ticks)
              point.x = undefined
              point.y = undefined
            }
            break
          case 1:
          case 2:
            if (!point.down) {
              point.down = true
              this.onTouchBegan?.(point.x, point.y, Time.ticks)
            } else this.onTouchMoved?.(point.x, point.y, Time.ticks)
            break
        }
      }, 15)
    }
  }
}
