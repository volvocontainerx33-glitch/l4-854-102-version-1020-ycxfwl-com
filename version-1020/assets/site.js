(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initImageFallbacks() {
    qsa('img[data-fallback]').forEach(function (img) {
      if (img.dataset.bound) {
        return;
      }

      img.dataset.bound = '1';
      img.addEventListener('error', function () {
        var frame = img.closest('.poster-frame, .hero-poster');
        if (frame) {
          frame.classList.add('is-missing');
        }
        img.setAttribute('data-missing', 'true');
        img.removeAttribute('src');
      });
    });
  }

  function initMobileNavigation() {
    var button = qs('[data-nav-toggle]');
    var nav = qs('[data-site-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (left, right) {
      return String(right).localeCompare(String(left), 'zh-Hans-CN');
    });
  }

  function renderMovieCard(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-frame" href="' + escapeHTML(movie.url) + '" data-title="' + escapeHTML(movie.title) + '">',
      '    <img src="' + escapeHTML(movie.poster) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy" data-fallback="poster">',
      '    <span class="poster-badge">' + escapeHTML(movie.year) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line">' + escapeHTML(movie.region) + ' · ' + escapeHTML(movie.type) + '</div>',
      '    <h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>',
      '    <p>' + escapeHTML(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var root = qs('#searchPage');
    if (!root || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var input = qs('#searchInput');
    var regionFilter = qs('#regionFilter');
    var typeFilter = qs('#typeFilter');
    var yearFilter = qs('#yearFilter');
    var summary = qs('#searchSummary');
    var results = qs('#searchResults');
    var movies = window.MOVIE_INDEX;

    input.value = params.get('q') || '';

    uniqueSorted(movies.map(function (movie) {
      return movie.region;
    })).forEach(function (region) {
      regionFilter.insertAdjacentHTML('beforeend', '<option value="' + escapeHTML(region) + '">' + escapeHTML(region) + '</option>');
    });

    uniqueSorted(movies.map(function (movie) {
      return movie.type;
    })).forEach(function (type) {
      typeFilter.insertAdjacentHTML('beforeend', '<option value="' + escapeHTML(type) + '">' + escapeHTML(type) + '</option>');
    });

    uniqueSorted(movies.map(function (movie) {
      return movie.year;
    })).forEach(function (year) {
      yearFilter.insertAdjacentHTML('beforeend', '<option value="' + escapeHTML(year) + '">' + escapeHTML(year) + '</option>');
    });

    function applyFilters() {
      var keyword = input.value.trim().toLowerCase();
      var region = regionFilter.value;
      var type = typeFilter.value;
      var year = yearFilter.value;

      var filtered = movies.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();

        return (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!region || movie.region === region) &&
          (!type || movie.type === type) &&
          (!year || movie.year === year);
      });

      var display = filtered.slice(0, 120);
      var suffix = filtered.length > display.length ? '，当前显示前 ' + display.length + ' 部' : '';
      summary.textContent = '共找到 ' + filtered.length + ' 部相关影片' + suffix;
      results.innerHTML = display.map(renderMovieCard).join('') || '<p class="empty-state">未找到相关内容，请尝试其他关键词。</p>';
      initImageFallbacks();
    }

    [input, regionFilter, typeFilter, yearFilter].forEach(function (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initImageFallbacks();
    initMobileNavigation();
    initHeroSlider();
    initSearchPage();
  });
})();
