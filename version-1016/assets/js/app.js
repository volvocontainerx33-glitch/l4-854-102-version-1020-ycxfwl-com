document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroSlider();
    initImageFallbacks();
    initInlineFilters();
    initPlayers();
});

function initMobileMenu() {
    const button = document.querySelector("[data-mobile-menu-button]");
    const menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", function () {
        menu.classList.toggle("open");
    });
}

function initHeroSlider() {
    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const thumbs = Array.from(document.querySelectorAll("[data-hero-thumb]"));

    if (slides.length === 0) {
        return;
    }

    let current = 0;
    let timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
        thumbs.forEach(function (thumb, thumbIndex) {
            thumb.classList.toggle("active", thumbIndex === current);
        });
    }

    function start() {
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function restart() {
        if (timer) {
            window.clearInterval(timer);
        }
        start();
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            show(Number(dot.dataset.heroDot || 0));
            restart();
        });
    });

    thumbs.forEach(function (thumb) {
        thumb.addEventListener("click", function () {
            show(Number(thumb.dataset.heroThumb || 0));
            restart();
        });
    });

    show(0);
    start();
}

function initImageFallbacks() {
    const images = document.querySelectorAll("[data-fallback-image]");

    images.forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("is-missing");
            image.removeAttribute("src");
        }, { once: true });
    });
}

function initInlineFilters() {
    const input = document.querySelector("[data-filter-input]");
    const list = document.querySelector("[data-filter-list]");
    const clear = document.querySelector("[data-filter-clear]");
    const empty = document.querySelector("[data-filter-empty]");

    if (!input || !list) {
        return;
    }

    const cards = Array.from(list.querySelectorAll(".js-filter-card"));

    function applyFilter() {
        const query = input.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach(function (card) {
            const haystack = [
                card.dataset.title,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.region,
                card.dataset.type
            ].join(" ").toLowerCase();
            const matched = !query || haystack.includes(query);
            card.hidden = !matched;
            if (matched) {
                visibleCount += 1;
            }
        });

        if (empty) {
            empty.hidden = visibleCount !== 0;
        }
    }

    input.addEventListener("input", applyFilter);

    if (clear) {
        clear.addEventListener("click", function () {
            input.value = "";
            applyFilter();
            input.focus();
        });
    }
}

function initPlayers() {
    const shells = document.querySelectorAll(".video-shell[data-video-url]");

    shells.forEach(function (shell) {
        const video = shell.querySelector("[data-movie-player]");
        const button = shell.querySelector("[data-player-button]");
        const status = shell.parentElement.querySelector("[data-player-status]");
        const source = shell.dataset.videoUrl;
        let initialized = false;

        if (!video || !button || !source) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function loadAndPlay() {
            if (initialized) {
                video.play().catch(function () {
                    setStatus("浏览器阻止了自动播放，请再次点击播放器播放。");
                });
                return;
            }

            initialized = true;
            button.classList.add("hidden");
            setStatus("正在加载播放源...");

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("播放源加载完成，正在播放。");
                    video.play().catch(function () {
                        setStatus("播放源已就绪，请点击播放器继续播放。");
                    });
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("播放初始化失败，请刷新页面后重试。");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    setStatus("播放源加载完成，正在播放。");
                    video.play().catch(function () {
                        setStatus("播放源已就绪，请点击播放器继续播放。");
                    });
                }, { once: true });
            } else {
                video.src = source;
                setStatus("当前浏览器可能不支持 HLS，已尝试直接加载播放源。");
                video.play().catch(function () {
                    setStatus("请更换支持 HLS 的浏览器，或确认网络可访问播放源。");
                });
            }
        }

        button.addEventListener("click", loadAndPlay);
        video.addEventListener("play", function () {
            button.classList.add("hidden");
        });
    });
}
