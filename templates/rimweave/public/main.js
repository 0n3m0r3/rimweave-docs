export default {
  defaultTheme: "light",
  iconLinks: [{ icon: "github", href: "https://github.com/0n3m0r3/rimweave", title: "Framework source" }],
  start() {
    document.querySelector(".navbar-brand")?.insertAdjacentHTML(
      "beforeend", '<span class="rw-nav-status">Preview</span>');
    document.querySelector("#logo")?.setAttribute("alt", "");

    // DocFX renders and refreshes these controls after the start hook.
    const navbar = document.querySelector("#navbar");
    const labelControls = () => {
      navbar.querySelectorAll(".icons a[title]").forEach(control => {
        control.setAttribute("aria-label", control.title);
      });
      navbar.querySelectorAll(".icons i").forEach(icon => icon.setAttribute("aria-hidden", "true"));
      const theme = navbar.querySelector(".icons [data-bs-toggle='dropdown']");
      if (theme && !theme.hasAttribute("role")) {
        theme.setAttribute("role", "button");
        theme.setAttribute("tabindex", "0");
        theme.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            theme.click();
          }
        });
      }
    };
    if (navbar) {
      new MutationObserver(labelControls).observe(navbar, { childList: true, subtree: true });
      labelControls();
    }
  }
};
