import { H as Hls } from "./hls.esm.js";

const prepareStream = (video, source) => {
  if (!source) {
    return;
  }
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    return;
  }
  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 60
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video.hlsInstance = hls;
    return;
  }
  video.src = source;
};

const startPlayer = async (frame) => {
  const video = frame.querySelector("video");
  const cover = frame.querySelector(".player-cover");
  if (!video) {
    return;
  }
  if (!video.dataset.ready) {
    prepareStream(video, video.getAttribute("data-stream"));
    video.dataset.ready = "true";
  }
  cover && cover.classList.add("is-hidden");
  try {
    await video.play();
  } catch (error) {
    cover && cover.classList.remove("is-hidden");
  }
};

const setupPlayers = () => {
  const players = document.querySelectorAll("[data-player]");
  players.forEach((frame) => {
    const cover = frame.querySelector(".player-cover");
    const video = frame.querySelector("video");
    cover && cover.addEventListener("click", () => startPlayer(frame));
    video && video.addEventListener("play", () => {
      cover && cover.classList.add("is-hidden");
    });
  });
};

setupPlayers();
