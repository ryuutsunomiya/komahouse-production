export function pageTerms_init() {
  const sections = document.querySelectorAll(".terms_section");
  const navItems = document.querySelectorAll(".terms_nav_list a");

  const setActiveNav = (id: string) => {
    navItems.forEach((item) => {
      const href = item.getAttribute("href");
      console.log(id === href);
      item.classList.toggle("--current", href === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.getAttribute("data-href") || "");
        }
      });
    },
    {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    },
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}
