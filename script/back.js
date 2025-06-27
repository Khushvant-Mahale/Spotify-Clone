// back.js

let currentSongIndex = -1;
let currentSongs = [];
let currentFolder = null; // ⬅️ track currently active folder
let currentPlaylistPath = "";
let repeatMode = "none"; // "none", "all", "one"
let shuffleMode = false;
let songHistory = []; // stack for prev

// document.querySelector(".player").style.display = "none";
const audio =
  document.querySelector("audio") ||
  document.body.appendChild(document.createElement("audio"));

function shuffleBtn() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="#535353" role="img">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M2 6C2 5.44772 2.44772 5 3 5H6.9166C7.93041 5 8.87563 5.51203 9.42944 6.3612L15.7458 16.0463C15.9304 16.3293 16.2455 16.5 16.5834 16.5H21C21.3844 16.5 21.7348 16.7203 21.9013 17.0668C22.0678 17.4133 22.021 17.8245 21.7809 18.1247L19.7809 20.6247C19.4359 21.056 18.8066 21.1259 18.3753 20.7809C17.944 20.4359 17.8741 19.8066 18.2191 19.3753L18.9194 18.5H16.5834C15.5696 18.5 14.6244 17.988 14.0706 17.1388L7.75421 7.45373C7.56961 7.17068 7.25454 7 6.9166 7H3C2.44772 7 2 6.55228 2 6Z" />
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M2 18C2 18.5523 2.44772 19 3 19H6.92963C7.93269 19 8.86939 18.4987 9.42578 17.6641L10.8321 15.5547C11.1384 15.0952 11.0142 14.4743 10.5547 14.1679C10.0952 13.8616 9.4743 13.9858 9.16795 14.4453L7.76168 16.5547C7.57622 16.8329 7.26399 17 6.92963 17H3C2.44772 17 2 17.4477 2 18ZM13.4855 9.85749C13.9591 10.1416 14.5733 9.98808 14.8575 9.5145L15.7749 7.98551C15.9556 7.6843 16.2811 7.5 16.6324 7.5H21C21.3844 7.5 21.7348 7.27965 21.9013 6.93319C22.0678 6.58672 22.021 6.17548 21.7809 5.87531L19.7809 3.37531C19.4359 2.94404 18.8066 2.87412 18.3753 3.21913C17.944 3.56414 17.8741 4.19343 18.2191 4.62469L18.9194 5.5H16.6324C15.5786 5.5 14.6021 6.0529 14.0599 6.95651L13.1425 8.4855C12.8584 8.95908 13.0119 9.57334 13.4855 9.85749Z" />
                        </svg>`;
}

const volumeBtn = document.querySelector(".volume-btn");
const volumeSlider = document.querySelector(".volume-slider");

// Initial volume
audio.volume = 1;
updateSliderFill(volumeSlider);

volumeSlider.addEventListener("input", () => {
  const value = volumeSlider.value;
  audio.volume = value;
  updateVolumeIcon(value);
  updateSliderFill(volumeSlider);
});

function updateSliderFill(slider) {
  const val = slider.value;
  const percentage = val * 100;
  slider.style.background = `linear-gradient(to right, #1db954 ${percentage}%, #ccc ${percentage}%)`;
}

let previousVolume = audio.volume; // to remember before muting

volumeBtn.addEventListener("click", () => {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    audio.volume = previousVolume || 0.5; // default if no previous
  } else {
    previousVolume = audio.volume;
    audio.muted = true;
    audio.volume = 0;
  }
  volumeSlider.value = audio.volume; // sync slider
  updateVolumeIcon(audio.volume);
  updateSliderFill(volumeSlider);
});

function updateVolumeIcon(vol) {
  if (audio.muted || vol === 0) {
    volumeBtn.textContent = "🔇";
  } else if (vol < 0.4) {
    volumeBtn.textContent = "🔈";
  } else if (vol < 0.7) {
    volumeBtn.textContent = "🔉";
  } else {
    volumeBtn.textContent = "🔊";
  }
}

audio.addEventListener("ended", () => {
  // 🔂 Highest priority — repeat current song
  if (repeatMode === "one") {
    shuffleMode = false;
    document.querySelector(".shuffle").setAttribute("data-enabled", "false");
    document.querySelector(".shuffle").innerHTML = shuffleBtn();
    document.querySelector(".shuffle").title = "Shuffle Disabled in Repeat One";

    document.querySelector(".play").innerHTML = stopIconSVG();
    playIconSVG;
    audio.currentTime = 0;
    audio.play();

    return;
  }

  // 🔀 Shuffle ONLY if repeatMode !== 'one'
  if (shuffleMode && repeatMode !== "one") {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * currentSongs.length);
    } while (nextIndex === currentSongIndex && currentSongs.length > 1);

    playSongAt(nextIndex);
    return;
  }

  // 🔁 Repeat All
  if (repeatMode === "all") {
    if (currentSongIndex < currentSongs.length - 1) {
      playSongAt(currentSongIndex + 1);
    } else {
      playSongAt(0); // loop back
    }
    return;
  }

  // ➖ No repeat, no shuffle — normal next
  if (currentSongIndex < currentSongs.length - 1) {
    playSongAt(currentSongIndex + 1);
  }
  // else: do nothing, ends playback
});

// 🧠 Load all categories & playlists dynamically
async function loadAllPlaylists() {
  document.getElementById("middle-clr").innerHTML = "";

  const wrapper = document.querySelector("#middle-sec");

  try {
    const categoriesRes = await fetch("libraries/");
    const categoriesText = await categoriesRes.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(categoriesText, "text/html");

    const folderLinks = [...doc.querySelectorAll("a.icon-directory")];
    const folders = folderLinks
      .map((a) => {
        const href = a.getAttribute("href");
        const match = href.match(/\/libraries\/(.*?)(\/)?$/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    console.log("📁 Category folders:", folders);

    for (let folder of folders) {
      const categoryPath = `libraries/${folder}`;
      const infoPath = `${categoryPath}/info.json`;
      console.log("🧐 Fetching category info:", infoPath);

      const res = await fetch(infoPath);
      if (!res.ok) {
        const html = await res.text();
        console.warn("❌ Failed to load:", infoPath, "\n", html);
        continue;
      }

      const info = await res.json();

      // 🧱 Safe DOM build (no innerHTML)
      const section = document.createElement("div");
      section.className = "spotify-playlist";

      const h2 = document.createElement("h2");
      h2.textContent = info.title;

      const wrapperDiv = document.createElement("div");
      wrapperDiv.className = "cards-wrapper";

      const cardsContainer = document.createElement("div");
      cardsContainer.className = "cards";

      wrapperDiv.appendChild(cardsContainer);
      section.appendChild(h2);
      section.appendChild(wrapperDiv);

      const catRes = await fetch(categoryPath);
      const catText = await catRes.text();
      const catDoc = parser.parseFromString(catText, "text/html");

      const subfolders = [...catDoc.querySelectorAll("a.icon-directory")]
        .map((a) => {
          const href = a.getAttribute("href");
          const match = href.match(
            new RegExp(`/libraries/${folder}/(.*?)(/)?$`)
          );
          return match ? match[1] : null;
        })
        .filter(Boolean);

      console.log(`📦 ${info.title} playlists:`, subfolders);

      if (subfolders.length === 0) {
        console.warn(`⚠️ No playlists found in category '${info.title}'`);
      }

      for (let sub of subfolders) {
        const playlistPath = `libraries/${folder}/${sub}`;
        const metaPath = `${playlistPath}/info.json`;
        console.log("🎵 Fetching playlist info:", metaPath);

        try {
          const meta = await fetch(metaPath).then((res) => res.json());

          const card = document.createElement("div");
          card.className = "card";
          card.dataset.folder = `${folder}/${sub}`;

          const thumb = document.createElement("div");
          thumb.className = "thumbnail";

          const img = document.createElement("img");
          img.src = meta.img;
          img.alt = meta.title;

          const btn = document.createElement("button");
          btn.className = "play-button-cards";
          btn.setAttribute("aria-label", `Play ${meta.title}`);
          btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M7.05 3.606L20.54 11.394a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606Z"/></svg>`;

          thumb.appendChild(img);
          thumb.appendChild(btn);

          const infoDiv = document.createElement("div");
          infoDiv.className = "info";
          infoDiv.innerHTML = `<h3 class="title">${meta.title}</h3><p class="discription">${meta.description}</p>`;

          card.appendChild(thumb);
          card.appendChild(infoDiv);

          cardsContainer.appendChild(card);
        } catch (err) {
          console.error("❌ Error fetching playlist info:", metaPath, err);
        }
      }

      wrapper.appendChild(section);
    }
  } catch (err) {
    console.error("💥 loadAllPlaylists failed:", err);
  }

  document.dispatchEvent(new Event("DOMContentLoaded"));
  setupCardShadows();
}

// 🧠 Fetch songs inside playlist
async function getSongs(folder = "songs", img) {
  try {
    const a = await fetch(`${folder}`);
    const response = await a.text();
    const div = document.createElement("div");
    div.innerHTML = response;

    const songs = [...div.getElementsByTagName("a")]
      .map((a) => a.href)
      .filter((href) => href.endsWith(".mp3"));

    console.log(`🎧 Loaded ${songs.length} songs from`, folder);

    let ul = document.querySelector(".library-items");
    ul.innerHTML = "";

    songs.forEach((songUrl) => {
      let songName = decodeURIComponent(
        songUrl.split("/").pop().replace(".mp3", "")
      );
      let li = document.createElement("li");
      li.className = "library-item";
      li.setAttribute("data-src", songUrl);
      li.innerHTML = `
        <div style="position: relative; display: flex;">
          <img src="${img}" alt="${songName}" />
          <button class="play-button">
            <span aria-hidden="true" class="icon-wrapper">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="play-icon">
                <path d="M7.05 3.606L20.54 11.394a0.7 0.7 0 0 1 0 1.212L7.05 20.394A0.7 0.7 0 0 1 6 19.788V4.212a0.7 0.7 0 0 1 1.05-0.606" />
              </svg>
            </span>
          </button>
        </div>
        <div class="item-info">
          <p class="title">${songName}</p>
          <p class="subtitle">MP3 File</p>
        </div>
      `;
      ul.appendChild(li);
    });

    currentSongs = songs;
    currentSongIndex = -1;
  } catch (err) {
    console.error("❌ getSongs failed:", folder, err);
  }
}

function playSongAt(index) {
  const src = currentSongs[index];
  if (!src) return;

  if (index !== currentSongIndex && currentSongIndex !== -1) {
    songHistory.push(currentSongIndex); // track previous songs
  }

  currentSongIndex = index;

  const li = [...document.querySelectorAll(".library-item")].find(
    (el) => el.getAttribute("data-src") === src
  );

  const title = li?.querySelector(".title")?.textContent || "Unknown";
  const cover = li?.querySelector("img")?.src || "default-cover.jpg";

  const audio = document.querySelector("audio");
  audio.src = src;
  audio.play();

  // ✅🔥 Fix: Update song icons
  // 🔁 Reset library-item icons
  document.querySelectorAll(".library-item .play-button").forEach((wrapper) => {
    wrapper.innerHTML = playIconSVG();
  });

  // 🔥 Find and update the icon of currently playing song
  document.querySelectorAll(".library-item").forEach((li) => {
    const itemSrc = li.getAttribute("data-src");
    const wrapper = li.querySelector(".play-button");
    if (!wrapper) return;

    if (itemSrc === src) {
      wrapper.innerHTML = stopIconSVG(); // current song 🔁
    } else {
      wrapper.innerHTML = playIconSVG(); // others back to ▶️
    }
  });

  currentFolder = folderFromCurrentSong();

  currentPlaylistPath = `libraries/${currentFolder}/`;

  const card = document.querySelector(`.card[data-folder="${currentFolder}"]`);
  const btn = card?.querySelector(".play-button-cards");
  if (btn) btn.innerHTML = stopIconSVG();

  document.querySelector(".play").innerHTML = stopIconSVG();
  document.querySelector(".cover-art img").src = cover;
  document.querySelector(".track-title a").textContent = title;
  document.querySelector(".track-artists").textContent = "Unknown Artist";
  document.querySelector(".current-time").textContent = "0:00";
  document.querySelector(".total-time").textContent = "0:00";
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", async (item) => {
      const folder = item.currentTarget.dataset.folder;
      const imgSrc = item.currentTarget.querySelector("img")?.src || "";
      console.log("🎯 Card clicked. Folder:", folder);
      await getSongs(`libraries/${folder}`, imgSrc);
    });
  });
});

document.querySelector(".prev").addEventListener("click", () => {
  if (shuffleMode && songHistory.length > 0) {
    const prevIndex = songHistory.pop();
    playSongAt(prevIndex);
  } else if (currentSongIndex > 0) {
    playSongAt(currentSongIndex - 1);
  }
});

document.querySelector(".next").addEventListener("click", () => {
  if (shuffleMode) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * currentSongs.length);
    } while (nextIndex === currentSongIndex && currentSongs.length > 1);
    playSongAt(nextIndex);
  } else if (currentSongIndex < currentSongs.length - 1) {
    playSongAt(currentSongIndex + 1);
  }
});

document.addEventListener("click", function (e) {
  const li = e.target.closest(".library-item");
  if (!li) return;

  const src = li.getAttribute("data-src");
  const title = li.querySelector(".title")?.textContent || "Unknown";
  const cover = li.querySelector("img")?.src || "default-cover.jpg";

  let audio = document.querySelector("audio");
  if (!audio) {
    audio = document.createElement("audio");
    document.body.appendChild(audio);
  }

  const fullSrc = new URL(src, window.location.href).href;
  const isSameSong = audio.src === fullSrc;

  currentSongIndex = currentSongs.indexOf(src);

  // 🔁 Reset ALL play icons in song list
  document.querySelectorAll(".library-item .play-button").forEach((btn) => {
    btn.innerHTML = playIconSVG();
  });

  // 🧼 Reset all card play icons too
  toggleCardIcons();

  // 🎯 Set the related card play button to stop icon
  const activeCardBtn = document.querySelector(
    `.card[data-folder="${folderFromCurrentSong()}"] .play-button-cards`
  );
  if (activeCardBtn) {
    activeCardBtn.innerHTML = stopIconSVG();
  }

  // 🎧 Toggle behavior
  if (isSameSong) {
    if (audio.paused) {
      audio.play();
      li.querySelector(".play-button").innerHTML = stopIconSVG(); // show pause icon
      document.querySelector(".play").innerHTML = stopIconSVG();
    } else {
      audio.pause();
      li.querySelector(".play-button").innerHTML = playIconSVG(); // show play icon
      document.querySelector(".play").innerHTML = playIconSVG();
      toggleCardIcons(btn);
    }
    return;
  }

  // 🆕 Play new song
  audio.src = src;
  audio.play();

  // ⏸️ Show correct icon for current song
  li.querySelector(".play-button").innerHTML = stopIconSVG();

  // 💡 Update player UI
  document.querySelector(".play").innerHTML = stopIconSVG();
  document.querySelector(".cover-art img").src = cover;
  document.querySelector(".track-title a").textContent = title;
  document.querySelector(".track-artists").textContent = "Unknown Artist";
  document.querySelector(".current-time").textContent = "0:00";
  document.querySelector(".total-time").textContent = "0:00";
});

function toggleLibraryBtn() {}

function folderFromCurrentSong() {
  const src = currentSongs[currentSongIndex];
  if (!src) return null;

  const match = src.match(/libraries\/([^/]+\/[^/]+)\//);
  return match ? match[1] : null;
}

function setupCardShadows() {
  document.querySelectorAll(".cards-wrapper").forEach((wrapper) => {
    const cards = wrapper.querySelector(".cards");
    if (!cards) return; // 🛡️

    function updateShadows() {
      const scrollLeft = cards.scrollLeft;
      const maxScroll = cards.scrollWidth - cards.clientWidth;

      wrapper.classList.toggle("show-left", scrollLeft > 5);
      wrapper.classList.toggle("show-right", scrollLeft < maxScroll - 5);
    }

    cards.addEventListener("scroll", updateShadows);
    window.addEventListener("resize", updateShadows);
    updateShadows(); // Init
  });
}

function toggleCardIcons(exceptBtn = null) {
  document.querySelectorAll(".play-button-cards").forEach((btn) => {
    if (btn !== exceptBtn) {
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" class="icon-play">
          <path d="M7.05 3.606L20.54 11.394a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606Z" />
        </svg>
      `;
    }
  });
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".play-button-cards");
  if (!btn) return;

  const card = btn.closest(".card");
  const folder = card?.dataset.folder;
  const imgSrc = card?.querySelector("img")?.src || "";

  if (!folder) return;

  // ✅ First time fix: set folder early
  if (!currentFolder) currentFolder = folder;

  // ✅ If this playlist is already active
  if (`libraries/${folder}/` === currentPlaylistPath) {
    const audio = document.querySelector("audio");

    if (!audio.src || audio.src === window.location.href) {
      // No valid song loaded, allow fallback
    } else {
      if (audio.paused) {
        audio.play();
        btn.innerHTML = stopIconSVG();
        document.querySelector(".play").innerHTML = stopIconSVG();
        // 🔥 Find and update the icon of currently playing song
        const src = audio.src;
        document.querySelectorAll(".library-item").forEach((li) => {
          const itemSrc = li.getAttribute("data-src");
          const wrapper = li.querySelector(".play-button");
          if (!wrapper) return;

          if (itemSrc === src) {
            wrapper.innerHTML = stopIconSVG(); // current song 🔁
          } else {
            wrapper.innerHTML = playIconSVG(); // others back to ▶️
          }
        });
      } else {
        audio.pause();
        btn.innerHTML = playIconSVG();
        document.querySelector(".play").innerHTML = playIconSVG();

        // 🔥 PUT THIS HERE 👇
        document
          .querySelectorAll(".library-item .play-icon")
          .forEach((icon) => {
            icon.outerHTML = playIconSVG();
          });
      }

      return;
    }
  }

  // 🧼 Reset all other buttons to play
  toggleCardIcons(btn);

  // 🔄 Change current to stop icon
  btn.innerHTML = `
<svg viewBox="0 0 24 24">
  <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7z" />
</svg>
`;

  await getSongs(`libraries/${folder}`, imgSrc);
  playSongAt(0);
  currentFolder = folder;
});

function stopIconSVG() {
  return `
  <svg viewBox="0 0 24 24">
    <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7z" />
  </svg>`;
}

function playIconSVG() {
  return `
  <svg viewBox="0 0 24 24">
    <path d="M7.05 3.606L20.54 11.394a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606Z"/>
  </svg>`;
}

document.querySelector(".play").addEventListener("click", () => {
  const audio = document.querySelector("audio");

  if (audio.paused) {
    audio.play();
    document.querySelector(".play").innerHTML = stopIconSVG();

    // 🔥 Find and update the icon of currently playing song
    const src = audio.src;
    document.querySelectorAll(".library-item").forEach((li) => {
      const itemSrc = li.getAttribute("data-src");
      const wrapper = li.querySelector(".play-button");
      if (!wrapper) return;

      if (itemSrc === src) {
        wrapper.innerHTML = stopIconSVG(); // current song 🔁
      } else {
        wrapper.innerHTML = playIconSVG(); // others back to ▶️
      }
    });
  } else {
    audio.pause();
    if (repeatMode === "none") {
      document.querySelector(".play").innerHTML = playIconSVG();
      // 🔁 Reset card icons
      toggleCardIcons();

      // 🔁 Reset library-item icons
      document
        .querySelectorAll(".library-item .play-button")
        .forEach((wrapper) => {
          wrapper.innerHTML = playIconSVG();
        });
    }
  }
});

document.querySelector(".shuffle").addEventListener("click", () => {
  shuffleMode = !shuffleMode;

  const btn = document.querySelector(".shuffle");
  btn.setAttribute("data-enabled", shuffleMode.toString());

  btn.innerHTML = shuffleMode ? shuffleBtn() : shuffleBtn();
  btn.title = shuffleMode ? "Shuffle: ON" : "Shuffle: OFF";
  console.log(btn.title);

  if (btn.title === "Shuffle: ON")
    btn.querySelector("svg").style.fill = "#1db954";
});

// BOOT IT 🚀
loadAllPlaylists();
