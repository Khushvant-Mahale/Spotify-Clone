let currentSongIndex = -1;
let currentSongs = [];

async function getSongs(folder = "songs", img) {
  let a = await fetch(`http://127.0.0.1:5500/${folder}`);
  let response = await a.text();
  // console.log(response);

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  let songs = [];

  for (let i = 0; i < as.length; i++) {
    let href = as[i].href;
    if (href.endsWith(".mp3")) {
      songs.push(href);
    }
  }

  let ul = document.querySelector(".library-items");
  ul.innerHTML = ""; // Clear existing

  songs.forEach((songUrl, index) => {
    let songName = decodeURIComponent(
      songUrl.split("/").pop().replace(".mp3", "")
    );

    let li = document.createElement("li");
    li.className = "library-item";
    li.setAttribute("data-src", songUrl); // 🧠 store source on the item
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
  currentSongIndex = -1; // Reset index
}

function playSongAt(index) {
  const src = currentSongs[index];
  if (!src) return;

  currentSongIndex = index;

  const li = [...document.querySelectorAll(".library-item")].find(
    (el) => el.getAttribute("data-src") === src
  );

  const title = li?.querySelector(".title")?.textContent || "Unknown";
  const cover = li?.querySelector("img")?.src || "default-cover.jpg";

  const audio = document.querySelector("audio");
  audio.src = src;
  audio.play();

  document.querySelector(".play").textContent = "⏸️";

  const coverImg = document.querySelector(".cover-art img");
  const titleEl = document.querySelector(".track-title a");
  const artistEl = document.querySelector(".track-artists");

  if (coverImg) coverImg.src = cover;
  if (titleEl) titleEl.textContent = title;
  if (artistEl) artistEl.textContent = "Unknown Artist";

  document.querySelector(".current-time").textContent = "0:00";
  document.querySelector(".total-time").textContent = "0:00";
}

document.addEventListener("DOMContentLoaded", () => {
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      let folder = item.currentTarget.dataset.folder;

      // 💡 Grab the <img> inside the clicked card
      let imgEl = item.currentTarget.querySelector("img");
      let imgSrc = imgEl ? imgEl.src : "";

      // 🧠 Pass both folder and image to getSongs
      getSongs(`libraries/${folder}`, imgSrc);
    });
  });
  document.querySelector(".prev").addEventListener("click", () => {
    if (currentSongIndex > 0) {
      playSongAt(currentSongIndex - 1);
    }
  });

  document.querySelector(".next").addEventListener("click", () => {
    if (currentSongIndex < currentSongs.length - 1) {
      playSongAt(currentSongIndex + 1);
    }
  });
});

async function main() {}

main();

document.addEventListener("click", function (e) {
  const li = e.target.closest(".library-item");
  if (li) {
    let src = li.getAttribute("data-src");
    let title = li.querySelector(".title")?.textContent || "Unknown";
    let cover = li.querySelector("img")?.src || "default-cover.jpg";

    let audio = document.querySelector("audio");
    if (!audio) {
      audio = document.createElement("audio");
      document.body.appendChild(audio);
    }

    // Update audio
    audio.src = src;
    audio.play();

    // Update play button state
    const playBtn = document.querySelector(".play");
    playBtn.textContent = "⏸️";

    // 🎧 Update track info section
    const coverImg = document.querySelector(".cover-art img");
    const titleEl = document.querySelector(".track-title a");
    const artistEl = document.querySelector(".track-artists");

    if (coverImg) coverImg.src = cover;
    if (titleEl) titleEl.textContent = title;
    if (artistEl) artistEl.textContent = "Unknown Artist"; // Or leave empty
    currentSongIndex = currentSongs.indexOf(src);

    // Reset seekbar display
    document.querySelector(".current-time").textContent = "0:00";
    document.querySelector(".total-time").textContent = "0:00";
  }
});
