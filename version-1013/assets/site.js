(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.getElementById('mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slider = document.getElementById('hero-slider');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;

    var show = function (target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });

      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    };

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 6200);
  }

  var lists = Array.prototype.slice.call(document.querySelectorAll('.js-movie-list'));

  if (lists.length) {
    var search = document.querySelector('.js-search');
    var type = document.querySelector('.js-filter-type');
    var year = document.querySelector('.js-filter-year');
    var empty = document.querySelector('.js-empty-state');
    var cards = [];

    lists.forEach(function (list) {
      cards = cards.concat(Array.prototype.slice.call(list.querySelectorAll('.movie-card')));
    });

    var filter = function () {
      var query = search ? search.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var shown = matchesQuery && matchesType && matchesYear;

        card.classList.toggle('is-hidden', !shown);

        if (shown) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [search, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });
  }
})();
