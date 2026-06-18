const rootPath = document.body.dataset.root || "";

const sanitizeText = (value) => String(value || "").replace(/[&<>'"]/g, (character) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    """: "&quot;"
  };
  return map[character];
});

const setupMenu = () => {
  const button = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-main-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", () => {
    nav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
  });
};

const setupHero = () => {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  if (slides.length < 2) {
    return;
  }
  let activeIndex = 0;
  const activate = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle("is-active", index === activeIndex));
    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
  };
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => activate(index));
  });
  setInterval(() => activate(activeIndex + 1), 5200);
};

const setupLocalFilters = () => {
  const input = document.querySelector("[data-filter-input]");
  const year = document.querySelector("[data-year-filter]");
  const cards = Array.from(document.querySelectorAll(".searchable-card"));
  if (!cards.length || (!input && !year)) {
    return;
  }
  const filterCards = () => {
    const keyword = input ? input.value.trim().toLowerCase() : "";
    const selectedYear = year ? year.value : "";
    cards.forEach((card) => {
      const text = (card.dataset.search || "").toLowerCase();
      const matchKeyword = !keyword || text.includes(keyword);
      const matchYear = !selectedYear || card.dataset.year === selectedYear;
      card.classList.toggle("is-hidden", !(matchKeyword && matchYear));
    });
  };
  input && input.addEventListener("input", filterCards);
  year && year.addEventListener("change", filterCards);
};

const movieCardTemplate = (movie) => {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${sanitizeText(tag)}</span>`).join("");
  return `
      <article class="movie-card searchable-card" data-search="${sanitizeText(movie.search)}" data-year="${sanitizeText(movie.year)}">
        <a class="poster-link" href="${sanitizeText(movie.href)}" aria-label="${sanitizeText(movie.title)}">
          <img src="${sanitizeText(movie.cover)}" alt="${sanitizeText(movie.title)}" loading="lazy">
          <span class="poster-badge">${sanitizeText(movie.year)}</span>
        </a>
        <div class="movie-card-body">
          <div class="movie-meta-line">
            <span>${sanitizeText(movie.region)}</span>
            <span>${sanitizeText(movie.type)}</span>
          </div>
          <h3><a href="${sanitizeText(movie.href)}">${sanitizeText(movie.title)}</a></h3>
          <p>${sanitizeText(movie.oneLine)}</p>
          <div class="tag-list">${tags}</div>
        </div>
      </article>`;
};

const setupSearchPage = () => {
  const results = document.querySelector("[data-search-results]");
  const summary = document.querySelector("[data-search-summary]");
  const form = document.querySelector("[data-search-page-form]");
  const defaultSection = document.querySelector("[data-search-default]");
  if (!results || !summary || typeof MOVIE_SEARCH_DATA === "undefined") {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  if (form) {
    const input = form.querySelector("input[name='q']");
    if (input) {
      input.value = query;
    }
  }
  if (!query) {
    summary.textContent = "";
    return;
  }
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matched = MOVIE_SEARCH_DATA.filter((movie) => {
    const text = String(movie.search || "").toLowerCase();
    return keywords.every((keyword) => text.includes(keyword));
  });
  defaultSection && defaultSection.classList.add("is-hidden");
  summary.textContent = matched.length ? `找到 ${matched.length} 部相关影片` : "没有找到相关影片";
  results.innerHTML = matched.map(movieCardTemplate).join("");
};

const setupHeaderSearch = () => {
  const forms = document.querySelectorAll("[data-site-search]");
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      const input = form.querySelector("input[name='q']");
      const value = input ? input.value.trim() : "";
      if (!value) {
        event.preventDefault();
        return;
      }
      form.action = `${rootPath}search.html`;
    });
  });
};

setupMenu();
setupHero();
setupLocalFilters();
setupSearchPage();
setupHeaderSearch();
