document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("[data-search-form]");
    const input = document.querySelector("[data-search-input]");
    const categoryFilter = document.querySelector("[data-category-filter]");
    const typeFilter = document.querySelector("[data-type-filter]");
    const status = document.querySelector("[data-search-status]");
    const results = document.querySelector("[data-search-results]");
    const movies = window.MOVIE_DATA || [];

    if (!form || !input || !status || !results) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function normalize(value) {
        return String(value || "").toLowerCase();
    }

    function movieMatches(movie, query, category, type) {
        const haystack = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.oneLine,
            movie.categoryName,
            (movie.tags || []).join(" ")
        ].map(normalize).join(" ");

        if (query && !haystack.includes(query)) {
            return false;
        }

        if (category && movie.categorySlug !== category) {
            return false;
        }

        if (type && movie.type !== type) {
            return false;
        }

        return true;
    }

    function createCard(movie) {
        const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return `<span>${escapeHtml(tag)}</span>`;
        }).join("");

        return `
                <a class="movie-card" href="${escapeAttribute(movie.url)}">
                    <div class="poster-frame">
                        <img class="poster-image" src="${escapeAttribute(movie.cover)}" alt="${escapeAttribute(movie.title)}" loading="lazy" data-fallback-image>
                        <span class="year-badge">${escapeHtml(movie.year)}</span>
                        <span class="play-mark">▶</span>
                    </div>
                    <div class="movie-card-body">
                        <h3>${escapeHtml(movie.title)}</h3>
                        <p class="movie-meta">${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</p>
                        <p class="movie-summary">${escapeHtml(movie.oneLine)}</p>
                        <div class="tag-row">${tags}</div>
                    </div>
                </a>`;
    }

    function render() {
        const query = normalize(input.value.trim());
        const category = categoryFilter ? categoryFilter.value : "";
        const type = typeFilter ? typeFilter.value : "";
        const matched = movies.filter(function (movie) {
            return movieMatches(movie, query, category, type);
        }).slice(0, 120);

        if (!query && !category && !type) {
            status.textContent = `当前展示最新 ${Math.min(48, movies.length)} 部影片，可输入关键词继续筛选。`;
            results.innerHTML = movies.slice(0, 48).map(createCard).join("");
        } else {
            status.textContent = `找到 ${matched.length} 条结果，最多展示前 120 条。`;
            results.innerHTML = matched.map(createCard).join("");
        }

        const images = results.querySelectorAll("[data-fallback-image]");
        images.forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
                image.removeAttribute("src");
            }, { once: true });
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const query = input.value.trim();
        const nextUrl = query ? `${window.location.pathname}?q=${encodeURIComponent(query)}` : window.location.pathname;
        window.history.replaceState(null, "", nextUrl);
        render();
    });

    input.addEventListener("input", render);

    if (categoryFilter) {
        categoryFilter.addEventListener("change", render);
    }

    if (typeFilter) {
        typeFilter.addEventListener("change", render);
    }

    render();
});

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}
