import type { Directive, DirectiveBinding } from 'vue'

/**
 * The scroll-triggered entrance animations the original ran on nine elements:
 * `fadeIn` on each section container and the two contact columns, `fadeInDown`
 * on each section heading, all at Elementor's "slow" 2s duration.
 *
 * Elementor shipped this as `elementor-invisible` plus a scroll watcher. The
 * same idea with an IntersectionObserver, which costs no scroll handler and
 * unobserves itself once an element has appeared — these only ever play once.
 *
 * Reduced motion is handled by revealing immediately rather than by letting the
 * killswitch in base.css zero the duration, so the element is never left at
 * opacity 0 if the observer does not fire.
 */

type Reveal = 'fade-in' | 'fade-in-down'

interface RevealOptions {
  /** Which keyframe. Defaults to a plain fade. */
  type?: Reveal
  /** Milliseconds to hold before playing. The original delayed the mobile hero by 1000. */
  delay?: number
}

const REVEALED = 'is-revealed'

/** One observer for every element on the page rather than one each. */
let observer: IntersectionObserver | null = null
const pending = new WeakMap<Element, number>()

function reveal(el: Element, delay: number) {
  if (delay > 0) {
    window.setTimeout(() => el.classList.add(REVEALED), delay)
  } else {
    el.classList.add(REVEALED)
  }
}

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null
  observer ??= new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        reveal(entry.target, pending.get(entry.target) ?? 0)
        obs.unobserve(entry.target)
      }
    },
    // A sliver is enough. Waiting for more means a full-height section never
    // triggers on a short viewport.
    { threshold: 0.08 },
  )
  return observer
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export const vReveal: Directive<HTMLElement, RevealOptions | undefined> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<RevealOptions | undefined>) {
    const { type = 'fade-in', delay = 0 } = binding.value ?? {}

    el.classList.add('reveal', `reveal--${type}`)

    // No observer, or the viewer asked for less motion: show it, skip the play.
    const io = getObserver()
    if (!io || prefersReducedMotion()) {
      el.classList.add(REVEALED)
      return
    }

    pending.set(el, delay)
    io.observe(el)
  },

  unmounted(el: HTMLElement) {
    observer?.unobserve(el)
    pending.delete(el)
  },
}
