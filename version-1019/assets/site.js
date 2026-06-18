(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    var search = document.querySelector(".top-search");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        if (search) {
          search.classList.toggle("open", open);
        }
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (input && !input.value.trim()) {
          event.preventDefault();
          input.focus();
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var active = slides.findIndex(function (slide) { return slide.classList.contains("active"); });
    if (active < 0) {
      active = 0;
    }

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === active);
      });
    }

    if (slides.length > 1) {
      dots.forEach(function (dot, idx) {
        dot.addEventListener("click", function () {
          showSlide(idx);
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(active - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(active + 1);
        });
      }
      setInterval(function () {
        showSlide(active + 1);
      }, 6200);
    }

    document.querySelectorAll(".filter-scope").forEach(function (scope) {
      var input = scope.querySelector(".page-filter-input");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var activeYear = "";

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var year = card.getAttribute("data-year") || "";
          var show = (!query || text.indexOf(query) !== -1) && (!activeYear || year === activeYear);
          card.classList.toggle("hidden-card", !show);
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeYear = button.getAttribute("data-filter-value") || "";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          applyFilter();
        });
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input && input.hasAttribute("data-query-input")) {
        input.value = query;
        applyFilter();
      }
    });
  });
})();

function bootMoviePlayer(videoId, mediaUrl) {
  var start = function () {
    var video = document.getElementById(videoId);
    if (!video || !mediaUrl) {
      return;
    }
    var frame = video.closest(".player-frame");
    var button = frame ? frame.querySelector(".js-play-btn") : null;
    var initialized = false;
    var hlsInstance = null;

    function attachMedia() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
    }

    function beginPlay() {
      attachMedia();
      if (frame) {
        frame.classList.add("is-playing");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (frame) {
            frame.classList.remove("is-playing");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        beginPlay();
      });
    }

    if (frame) {
      frame.addEventListener("click", function (event) {
        if (event.target === frame) {
          beginPlay();
        }
      });
    }

    video.addEventListener("play", function () {
      if (frame) {
        frame.classList.add("is-playing");
      }
    });

    video.addEventListener("ended", function () {
      if (frame) {
        frame.classList.remove("is-playing");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
}
