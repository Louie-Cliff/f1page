type BodyScrollLockState = {
  count: number
  scrollY: number
  styles: Partial<Record<'position' | 'top' | 'left' | 'right' | 'width' | 'overflow', string>>
}

const getLockState = () =>
  useState<BodyScrollLockState>('body-scroll-lock', () => ({
    count: 0,
    scrollY: 0,
    styles: {}
  }))

const restoreBodyStyles = (styles: BodyScrollLockState['styles']) => {
  document.body.style.position = styles.position || ''
  document.body.style.top = styles.top || ''
  document.body.style.left = styles.left || ''
  document.body.style.right = styles.right || ''
  document.body.style.width = styles.width || ''
  document.body.style.overflow = styles.overflow || ''
}

export const useBodyScrollLock = () => {
  const state = getLockState()
  let localLockCount = 0

  const lock = () => {
    if (!import.meta.client) {
      return
    }

    localLockCount += 1
    state.value.count += 1

    if (state.value.count > 1) {
      return
    }

    state.value.scrollY = window.scrollY
    state.value.styles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow
    }

    document.body.style.position = 'fixed'
    document.body.style.top = `-${state.value.scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  }

  const unlock = () => {
    if (!import.meta.client || localLockCount === 0 || state.value.count === 0) {
      return
    }

    localLockCount -= 1
    state.value.count -= 1

    if (state.value.count > 0) {
      return
    }

    const scrollY = state.value.scrollY

    restoreBodyStyles(state.value.styles)
    window.scrollTo(0, scrollY)
    state.value.scrollY = 0
    state.value.styles = {}
  }

  return {
    lock,
    unlock
  }
}
