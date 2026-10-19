const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const reviews = document.querySelector(".reviews-grid");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileLayout = window.matchMedia("(max-width: 767px)");

// Keep the transparent initial state, including on pages restored from history.
const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("pageshow", updateHeader);
updateHeader();

// Native anchors preserve deep links, keyboard navigation, and browser history.
// CSS supplies smooth scrolling and an offset for the fixed desktop header.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const destination = document.querySelector(link.getAttribute("href"));
    if (destination?.hasAttribute("tabindex")) destination.focus({ preventScroll: true });
  });
});

if (hero) {
  const resizeGlow = () => hero.style.setProperty("--hero-scale", hero.clientWidth / 1440);
  resizeGlow();
  if ("ResizeObserver" in window) new ResizeObserver(resizeGlow).observe(hero);
  else window.addEventListener("resize", resizeGlow);

  let heroVisible = true;
  const updateAnimation = () => hero.classList.toggle("is-paused", document.hidden || !heroVisible);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      updateAnimation();
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", updateAnimation);
  updateAnimation();
}

if (reviews) {
  const updateReviewFocus = () => {
    reviews.tabIndex = mobileLayout.matches ? 0 : -1;
    reviews.setAttribute("aria-label", mobileLayout.matches
      ? "Отзывы гостей. Листайте по горизонтали или используйте стрелки"
      : "Отзывы гостей");
  };
  updateReviewFocus();
  mobileLayout.addEventListener("change", updateReviewFocus);
  reviews.addEventListener("keydown", (event) => {
    if (!mobileLayout.matches || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const card = reviews.querySelector(".review");
    const step = card.getBoundingClientRect().width + 12;
    const max = reviews.scrollWidth - reviews.clientWidth;
    let left = reviews.scrollLeft;
    if (event.key === "ArrowRight") left += step;
    if (event.key === "ArrowLeft") left -= step;
    if (event.key === "Home") left = 0;
    if (event.key === "End") left = max;
    reviews.scrollTo({ left: Math.max(0, Math.min(max, left)), behavior: reducedMotion.matches ? "instant" : "smooth" });
  });
}
