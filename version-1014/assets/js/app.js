(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showHero(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showHero(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showHero(i);
        startHero();
      });
    });

    showHero(0);
    startHero();
  }

  var filterInput = document.querySelector('[data-card-filter]');
  if (filterInput) {
    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();
      var cards = document.querySelectorAll('[data-movie-card]');
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        card.style.display = haystack.indexOf(keyword) > -1 ? '' : 'none';
      });
    });
  }
})();
