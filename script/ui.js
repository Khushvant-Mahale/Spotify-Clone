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

    if (audio.currentTime === audio.duration) playBtn.innerHTML = playIconSVG();
  }

  audio.addEventListener("loadedmetadata", () => {
    seekbar.max = 100;
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      audio.pause();
      playBtn.innerHTML = playIconSVG();
    } else {
      audio.play();
      playBtn.innerHTML = stopIconSVG();
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

const hideBtn = document.querySelector(".hide-now-playing-btn");
const sidebar = document.querySelector("#sidebar-right");

hideBtn.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

document
  .querySelector(".collapse-library-btn")
  .addEventListener("click", () => {
    document.getElementById("sidebar-left").classList.toggle("min-left-side");
  });

document.querySelector(".library-btn").addEventListener("click", () => {
  document.getElementById("sidebar-left").classList.toggle("min-left-side");
});

document.querySelector(".fade").addEventListener("click", () => {
  document.getElementById("sidebar-left").classList.toggle("min-left-side");
});

const repeatIcons = {
  none: `
    <svg viewBox="0 0 16 16" aria-hidden="true" role="img" class="icon" fill="#535353">
      <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75z"/>
    </svg>
  `,
  one: `
    <svg viewBox="0 0 16 16" aria-hidden="true" role="img" class="icon">
      <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75z"/>
    </svg>
  `,
  all: `
    <svg viewBox="0 0 16 16" aria-hidden="true" role="img" class="icon">
      <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75zM12.25 2.5a2.25 2.25 0 0 1 2.25 2.25v5A2.25 2.25 0 0 1 12.25 12H9.81l1.018-1.018a.75.75 0 0 0-1.06-1.06L6.939 12.75l2.829 2.828a.75.75 0 1 0 1.06-1.06L9.811 13.5h2.439A3.75 3.75 0 0 0 16 9.75v-5A3.75 3.75 0 0 0 12.25 1h-.75v1.5z"/>
      <path d="m8 1.85.77.694H6.095V1.488q1.046-.077 1.507-.385.474-.308.583-.913h1.32V8H8z"/>
      <path d="M8.77 2.544 8 1.85v.693z"/>
    </svg>
  `,
};

document.querySelector(".repeat").addEventListener("click", () => {
  const repeatBtn = document.querySelector(".repeat");

  if (repeatMode === "none") {
    repeatMode = "all";
    repeatBtn.innerHTML = repeatIcons.all;
    repeatBtn.style.fill = "#1db954";
    repeatBtn.title = "Repeat all once";
  } else if (repeatMode === "all") {
    repeatMode = "one";
    repeatBtn.innerHTML = repeatIcons.one;
    repeatBtn.style.fill = "#1db954";
    repeatBtn.title = "Repeat one Song";
  } else {
    repeatMode = "none";
    repeatBtn.innerHTML = repeatIcons.none;
    repeatBtn.style.fill = "#535353";
    repeatBtn.title = "Repeat None";
  }

  btn.setAttribute("data-mode", repeatMode);
});
