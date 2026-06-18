(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      mobilePanel.hidden = isOpen;
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-missing");
    });
  });

  var searchInput = document.querySelector("[data-page-search]");
  var searchItems = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));
  var filterCount = document.querySelector("[data-filter-count]");
  var emptyState = document.querySelector("[data-empty-state]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function updateSearch() {
    if (!searchInput || !searchItems.length) {
      return;
    }

    var query = normalize(searchInput.value);
    var visible = 0;

    searchItems.forEach(function (item) {
      var text = normalize(item.getAttribute("data-search-text"));
      var matched = !query || text.indexOf(query) !== -1;
      item.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (filterCount) {
      filterCount.textContent = visible + " 部影片";
    }

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q");
    if (queryValue) {
      searchInput.value = queryValue;
    }
    searchInput.addEventListener("input", updateSearch);
    updateSearch();
  }

  document.querySelectorAll(".movie-video[data-stream]").forEach(function (video) {
    var player = video.closest("[data-player]");
    var cover = player ? player.querySelector(".player-cover") : null;
    var streamUrl = video.getAttribute("data-stream");
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (loaded || !streamUrl) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        loaded = true;
        return;
      }

      video.src = streamUrl;
      loaded = true;
    }

    function startPlayback() {
      loadStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (cover) {
        cover.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
