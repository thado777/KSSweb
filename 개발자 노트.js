const navbar = document.querySelector(".navbar");
const NavbarHeight = navbar.getBoundingClientRect().height;

document.addEventListener("scroll", () => {
  if (window.scrollY > NavbarHeight) {
    navbar.classList.add("active");
  } else {
    navbar.classList.remove("active");
  }
});