const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const filters = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll(".project-card");
const modal = document.querySelector("[data-modal]");
const modalImage = document.querySelector("[data-modal-image]");
const modalTitle = document.querySelector("[data-modal-title]");
const closeModal = document.querySelector("[data-close-modal]");

function syncHeader() {
  header.classList.toggle("scrolled", window.scrollY > 18);
}

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hidden", !show);
    });
  });
});

cards.forEach((card) => {
  card.addEventListener("click", () => {
    modalImage.src = card.dataset.image;
    modalImage.alt = card.dataset.title;
    modalTitle.textContent = card.dataset.title;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  });
});

function hideModal() {
  modal.hidden = true;
  modalImage.src = "";
  document.body.style.overflow = "";
}

closeModal.addEventListener("click", hideModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) hideModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) hideModal();
});
