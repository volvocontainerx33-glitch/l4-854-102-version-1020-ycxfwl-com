(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-menu]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var grids = qsa('[data-filter-grid]');
    if (!grids.length) {
      return;
    }
    var input = qs('[data-filter-input]');
    var year = qs('[data-year-filter]');
    var region = qs('[data-region-filter]');
    var clear = qs('[data-clear-filters]');
    var empty = qs('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function apply() {
      var q = normalize(input ? input.value : '');
      var y = normalize(year ? year.value : '');
      var r = normalize(region ? region.value : '');
      var visible = 0;
      grids.forEach(function (grid) {
        qsa('.movie-card', grid).forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year')
          ].join(' '));
          var matchText = !q || text.indexOf(q) !== -1;
          var matchYear = !y || normalize(card.getAttribute('data-year')) === y;
          var matchRegion = !r || normalize(card.getAttribute('data-region')).indexOf(r) !== -1;
          var showCard = matchText && matchYear && matchRegion;
          card.style.display = showCard ? '' : 'none';
          if (showCard) {
            visible += 1;
          }
        });
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (region) {
          region.value = '';
        }
        apply();
      });
    }
    apply();
  }

  function setupHeaderSearch() {
    qsa('.global-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var field = form.querySelector('input[name="q"]');
        if (!field || !field.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var prepared = false;
    var hls = null;

    if (!video || !config.url) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(config.url);
        hls.attachMedia(video);
      } else {
        video.src = config.url;
      }
    }

    function start() {
      prepare();
      if (button) {
        button.classList.add('is-hidden');
      }
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupHeaderSearch();
  });
})();
