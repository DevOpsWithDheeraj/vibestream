const CONFIG = {
  PLAYLIST_ID: "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj", // Default English hits playlist
  AUTOPLAY: true
};

let player;
let playlistItems = [];

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "360",
    width: "640",
    playerVars: {
      listType: "playlist",
      list: CONFIG.PLAYLIST_ID,
      autoplay: CONFIG.AUTOPLAY ? 1 : 0,
      modestbranding: 1,
      rel: 0,
      controls: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady() {
  fetchPlaylist();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) updateTrackTitle();
}

// Fetch Playlist Info
async function fetchPlaylist() {
  const feed = `https://www.youtube.com/feeds/videos.xml?playlist_id=${CONFIG.PLAYLIST_ID}`;
  try {
    const res = await fetch(feed);
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "application/xml");
    const entries = Array.from(xml.querySelectorAll("entry"));
    playlistItems = entries.map((e) => ({
      title: e.querySelector("title")?.textContent,
      videoId: e.querySelector("yt\\:videoId")?.textContent,
      thumb: `https://img.youtube.com/vi/${e.querySelector("yt\\:videoId")?.textContent}/hqdefault.jpg`,
    }));
    renderPlaylist();
  } catch (err) {
    console.warn("Failed to fetch playlist:", err);
  }
}

// Render Playlist Thumbnails
function renderPlaylist() {
  const container = document.getElementById("playlistContainer");
  container.innerHTML = "";
  playlistItems.forEach((song) => {
    const div = document.createElement("div");
    div.className =
      "group relative rounded-xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition";
    div.innerHTML = `
      <img src="${song.thumb}" class="w-full h-40 object-cover group-hover:opacity-70 transition"/>
      <div class="absolute inset-0 flex items-center justify-center text-center opacity-0 group-hover:opacity-100 transition">
        <p class="text-sm font-semibold text-white bg-black/70 px-2 py-1 rounded">${song.title}</p>
      </div>
    `;
    div.addEventListener("click", () => player.loadVideoById(song.videoId));
    container.appendChild(div);
  });
}

// Update Title
function updateTrackTitle() {
  const data = player.getVideoData();
  document.getElementById("trackTitle").innerText = data.title;
  document.getElementById("trackMeta").innerText = "Streaming from YouTube 🎵";
}

// Buttons
document.getElementById("playPauseBtn").onclick = () => {
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
};
document.getElementById("nextBtn").onclick = () => player.nextVideo();
document.getElementById("prevBtn").onclick = () => player.previousVideo();
