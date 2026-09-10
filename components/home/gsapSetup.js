import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registering plugins at module scope is safe (no DOM access happens until
// an animation actually runs), but we still gate it behind `typeof window`
// so this file stays import-safe during Next.js server rendering.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
