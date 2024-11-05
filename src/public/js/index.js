document.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".feature-section");
  sections.forEach((section, index) => {
    const sectionPosition = section.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;
    if (sectionPosition < screenPosition) {
      setTimeout(() => {
        section.classList.add("visible");
      }, index * 150);
    }
  });
});
