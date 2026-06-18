(function () {
  function initPlayer(card) {
    var video = card.querySelector('video[data-video]');
    var button = card.querySelector('[data-play-button]');
    var hls = null;

    if (!video || !button) {
      return;
    }

    function attachSource() {
      var source = video.getAttribute('data-video');
      if (!source || video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function playVideo() {
      attachSource();
      card.classList.add('is-playing');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      card.classList.add('is-playing');
    });
    video.addEventListener('error', function () {
      if (hls && hls.destroy) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
