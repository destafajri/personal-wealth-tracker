// Smooth height transition for expand/collapse. Vue's <Transition> component hooks
// that animate from height: 0 to scrollHeight (enter) and scrollHeight to 0 (leave),
// avoiding the CSS `height: auto` transition limitation.
//
// Usage:
//   <Transition
//     :css="false"
//     @enter="tx.onEnter"
//     @after-enter="tx.onAfterEnter"
//     @leave="tx.onLeave"
//     @after-leave="tx.onAfterLeave"
//   >
//     <div v-show="expanded">...</div>
//   </Transition>
//
// We use :css="false" because the destination height is dynamic (scrollHeight), so
// CSS-only transitions cannot handle it. The hooks set inline height + transition
// styles, listen for transitionend, and call Vue's `done` callback to signal completion.

export function useExpandTransition(durationMs = 250) {
  function onEnter(el: Element, done: () => void) {
    const target = el as HTMLElement
    target.style.overflow = 'hidden'
    target.style.height = '0'
    target.style.transition = `height ${durationMs}ms ease-out`
    void target.offsetHeight // force reflow so the browser registers the 0 → scrollHeight change
    target.style.height = `${target.scrollHeight}px`

    const finish = () => {
      target.removeEventListener('transitionend', finish)
      done()
    }
    target.addEventListener('transitionend', finish)
  }

  function onAfterEnter(el: Element) {
    const target = el as HTMLElement
    target.style.height = ''
    target.style.overflow = ''
    target.style.transition = ''
  }

  function onLeave(el: Element, done: () => void) {
    const target = el as HTMLElement
    target.style.overflow = 'hidden'
    target.style.height = `${target.scrollHeight}px`
    target.style.transition = `height ${durationMs}ms ease-out`
    void target.offsetHeight // force reflow so the scrollHeight → 0 change registers
    target.style.height = '0'

    const finish = () => {
      target.removeEventListener('transitionend', finish)
      done()
    }
    target.addEventListener('transitionend', finish)
  }

  function onAfterLeave(el: Element) {
    const target = el as HTMLElement
    target.style.height = ''
    target.style.overflow = ''
    target.style.transition = ''
  }

  return { onEnter, onAfterEnter, onLeave, onAfterLeave }
}
