(function () {
  var DEFAULT_HLS_SOURCE = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  function setStatus(shell, message) {
    var status = shell.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message || '';
    }
  }

  function attachHls(video, source, shell) {
    if (video.dataset.ready === 'true') {
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = 'true';
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      video.dataset.ready = 'true';
      return Promise.resolve();
    }

    setStatus(shell, '当前浏览器暂不支持 HLS 播放，请更换现代浏览器访问。');
    return Promise.reject(new Error('HLS unsupported'));
  }

  function initPlayer(shell) {
    var video = shell.querySelector('video[data-hls-src]');
    var button = shell.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', function () {
      var source = video.getAttribute('data-hls-src') || DEFAULT_HLS_SOURCE;
      setStatus(shell, '正在加载播放源…');

      attachHls(video, source, shell).then(function () {
        button.classList.add('is-hidden');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            setStatus(shell, '');
          }).catch(function () {
            setStatus(shell, '播放已准备好，请再次点击视频开始播放。');
          });
        } else {
          setStatus(shell, '');
        }
      }).catch(function () {
        button.classList.remove('is-hidden');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(initPlayer);
  });
})();
