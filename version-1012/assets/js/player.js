function initVideoPlayer(source) {
    var video = document.getElementById("videoPlayer");
    var cover = document.querySelector(".player-cover");
    var button = document.getElementById("videoStart");
    var hlsInstance = null;
    var initialized = false;

    if (!video || !source) {
        return;
    }

    function loadAndPlay() {
        if (!initialized) {
            initialized = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
                hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            loadAndPlay();
        });
    }

    if (cover) {
        cover.addEventListener("click", loadAndPlay);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            loadAndPlay();
        }
    });

    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
