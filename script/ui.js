const setupResizable = (resizerId, leftPanelId, rightPanelId = null) => {
  const resizer = document.getElementById(resizerId);
  const leftPanel = document.getElementById(leftPanelId);
  const rightPanel = rightPanelId
    ? document.getElementById(rightPanelId)
    : null;

  let isResizing = false;

  resizer.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isResizing = true;
    document.body.style.cursor = "col-resize";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;

    const containerOffsetLeft = document.querySelector(".main").offsetLeft;
    const pointerRelativeX = e.clientX - containerOffsetLeft;

    if (resizerId === "resizer-left") {
      const newLeftWidth = Math.max(200, pointerRelativeX); // min-width 200px
      leftPanel.style.flex = "0 0 " + newLeftWidth + "px";
    }

    if (resizerId === "resizer-right") {
      const containerWidth = document.querySelector(".main").offsetWidth;
      const newRightWidth = Math.max(200, containerWidth - pointerRelativeX);
      rightPanel.style.flex = "0 0 " + newRightWidth + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
    document.body.style.cursor = "default";
  });
};

setupResizable("resizer-left", "sidebar-left");
setupResizable("resizer-right", "sidebar-right", "sidebar-right");

document.querySelectorAll(".cards-wrapper").forEach((wrapper) => {
  const cards = wrapper.querySelector(".cards");

  function updateShadows() {
    const scrollLeft = cards.scrollLeft;
    const maxScroll = cards.scrollWidth - cards.clientWidth;

    wrapper.classList.toggle("show-left", scrollLeft > 5);
    wrapper.classList.toggle("show-right", scrollLeft < maxScroll - 5);
  }

  cards.addEventListener("scroll", updateShadows);
  window.addEventListener("resize", updateShadows);
  updateShadows(); // Init call
});

//seekbar

document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("audio-player");
  const playBtn = document.querySelector(".play");
  const seekbar = document.querySelector(".seekbar");
  const currentTimeEl = document.querySelector(".current-time");
  const totalTimeEl = document.querySelector(".total-time");

  if (!audio || !playBtn || !seekbar || !currentTimeEl || !totalTimeEl) {
    console.warn("Some player elements are missing 🫠");
    return;
  }

  let isPlaying = false;

  function formatTime(sec) {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function updateSeekbarProgress() {
    const progress = (audio.currentTime / audio.duration) * 100;
    seekbar.value = progress;
    seekbar.style.setProperty("--progress", `${progress}%`);
    currentTimeEl.textContent = formatTime(audio.currentTime);

    if (audio.currentTime === audio.duration) playBtn.textContent = "▶️";
  }

  audio.addEventListener("loadedmetadata", () => {
    seekbar.max = 100;
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      audio.pause();
      playBtn.textContent = "▶️";
    } else {
      audio.play();
      playBtn.textContent = "⏸️";
    }
    isPlaying = !isPlaying;
  });

  audio.addEventListener("timeupdate", updateSeekbarProgress);

  seekbar.addEventListener("input", () => {
    const newTime = (seekbar.value / 100) * audio.duration;
    audio.currentTime = newTime;
    updateSeekbarProgress();
  });
  console.log(playBtn); // null? = You goofed the selector or DOM isn’t ready
});
