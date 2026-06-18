(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
                document.body.classList.toggle("menu-open", panel.classList.contains("open"));
            });
        }

        document.querySelectorAll(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                form.action = "search.html";
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (slides.length) {
            var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
            var current = 0;
            var timer;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            };
            var start = function () {
                timer = setInterval(function () {
                    show(current + 1);
                }, 5200);
            };
            var restart = function () {
                clearInterval(timer);
                start();
            };
            document.querySelectorAll("[data-hero]").forEach(function (button) {
                button.addEventListener("click", function () {
                    var direction = button.getAttribute("data-hero");
                    show(direction === "next" ? current + 1 : current - 1);
                    restart();
                });
            });
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    restart();
                });
            });
            show(0);
            start();
        }

        var filterInput = document.querySelector(".filter-input");
        var filterCards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var emptyState = document.querySelector(".empty-state");
        var yearSelect = document.querySelector(".filter-year");
        var regionSelect = document.querySelector(".filter-region");
        var typeSelect = document.querySelector(".filter-type");

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (filterInput && query) {
            filterInput.value = query;
        }

        function normalize(value) {
            return (value || "").toString().toLowerCase().trim();
        }

        function applyFilters() {
            if (!filterCards.length) {
                return;
            }
            var keyword = normalize(filterInput ? filterInput.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var region = normalize(regionSelect ? regionSelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var visible = 0;
            filterCards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }
                card.classList.toggle("hidden-by-filter", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }

        [filterInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
        applyFilters();
    });
})();
