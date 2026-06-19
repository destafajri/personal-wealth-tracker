import { ref, watch, type Ref } from 'vue'

// Count-up animation: smoothly animates a number from 0 (or previous value) to target.
// Uses requestAnimationFrame with ease-out cubic easing over `duration` ms.
//
// Default behaviour animates from 0 on mount and re-animates on every target change
// (CermatScoreHero use-case: hero number that "ticks up" on page load).
//
// Pass { skipInitial: true } for surfaces where animating from 0 on mount would be
// jarring — e.g. AnimatedTotal inside CollapsiblePanel headers, where the panel is
// already visible and a count-up from 0 would flicker against surrounding static UI.
// With skipInitial, displayed initialises to target.value and only subsequent changes
// animate.

export function useCountUp(
  target: Ref<number>,
  options?: { duration?: number; skipInitial?: boolean },
): Ref<number> {
  const duration = options?.duration ?? 1200
  const skipInitial = options?.skipInitial ?? false

  const displayed = ref(skipInitial ? target.value : 0)
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

  watch(target, (next) => animateTo(next), { immediate: !skipInitial })

  return displayed
}
