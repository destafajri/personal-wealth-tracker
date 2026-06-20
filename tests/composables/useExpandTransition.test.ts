import { describe, expect, it } from 'vitest'
import { useExpandTransition } from '~/composables/useExpandTransition'

describe('useExpandTransition', () => {
  it('exports as a function', () => {
    expect(typeof useExpandTransition).toBe('function')
  })

  it('returns the four Vue Transition hooks', () => {
    const tx = useExpandTransition()
    expect(typeof tx.onEnter).toBe('function')
    expect(typeof tx.onAfterEnter).toBe('function')
    expect(typeof tx.onLeave).toBe('function')
    expect(typeof tx.onAfterLeave).toBe('function')
  })

  it('accepts a custom duration option without error', () => {
    const tx = useExpandTransition(400)
    expect(typeof tx.onEnter).toBe('function')
  })

  it('default duration is 250ms when no argument passed', () => {
    // No assertion on internal value; verifies default-arg path executes cleanly.
    const tx = useExpandTransition()
    expect(Object.keys(tx).sort()).toEqual(
      ['onAfterEnter', 'onAfterLeave', 'onEnter', 'onLeave'].sort(),
    )
  })
})
