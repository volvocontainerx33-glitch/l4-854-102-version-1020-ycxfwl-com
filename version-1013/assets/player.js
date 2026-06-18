(function () {
  window.setupPlayer = function (videoId, coverId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);

    if (!video || !cover || !source) {
      return;
    }

    var started = false;
    var hlsInstance = null;

    var start = function () {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: false });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      cover.classList.add('is-hidden');
      video.controls = true;
      video.play().catch(function () {});
    };

    cover.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
