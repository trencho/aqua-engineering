import { ref } from 'vue'

/**
 * The hero's playing/paused state and which tagline is showing, held outside
 * the component.
 *
 * This has to live in its own module to work. Everything at the top level of a
 * `<script setup>` block runs once per component instance, so a ref declared
 * there is per-instance no matter where in the block it sits — which is not
 * what is wanted here. Declared out here it is created once for the module and
 * shared by every mount.
 *
 * Why it matters: HeroSection unmounts when the router leaves the home page.
 * Without this, pausing the video, reading the privacy notice and coming back
 * would start it up again, having ignored the viewer's decision. Storage would
 * also do it, at the cost of a claim in the privacy notice; this costs nothing.
 */
const motion = ref<boolean | null>(null)
const index = ref(0)

export function useHeroMotion() {
  return { motion, index }
}
