import { ref, watch, type Ref } from 'vue'

// Count-up animation: smoothly animates a number from 0 (or previous value) to target.
// Uses requestAnimationFrame with ease-out cubic easing over `duration` ms.
// Triggers on mount and whenever `target` changes.

export function useCountUp(target: Ref<number>, duration = 1200): Ref<number> {
  const displayed = ref(0)
  let animFrame = 0

  function animateTo(to: number) {
    cancelAnimationFrame(animFrame)
    const from = displayed.value
    if (from === to) return

    const start = performance.now()

    function step(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3)
      displayed.value = Math.round(from + (to - from) * ease)
      if (t < 1) {
        animFrame = requestAnimationFrame(step)
      }
    }

    animFrame = requestAnimationFrame(step)
  }

  watch(target, (next) => animateTo(next), { immediate: true })

  return displayed
}
