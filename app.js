const CONFIG = {
  PLAYLIST_ID: "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj",
  AUTOPLAY: true
};

let player;
let playlistItems = [];

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    width: "100%",
    height: "100%",
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

async function fetchPlaylist() {
  const feed = `https://api.allorigins.win/raw?url=${encodeURIComponent(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${CONFIG.PLAYLIST_ID}`
  )}`;

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
    // Fallback hardcoded playlist
    playlistItems = [
      { title: "Song 1", videoId: "VIDEO_ID_1", thumb: "https://img.youtube.com/vi/VIDEO_ID_1/hqdefault.jpg" },
      { title: "Song 2", videoId: "VIDEO_ID_2", thumb: "https://img.youtube.com/vi/VIDEO_ID_2/hqdefault.jpg" },
    ];
    renderPlaylist();
  }
}

function renderPlaylist() {
  const container = document.getElementById("playlistContainer");
  container.innerHTML = "";
  playlistItems.forEach((song) => {
    const div = document.createElement("div");
    div.className =
      "group relative rounded-lg overflow-hidden shadow cursor-pointer flex items-center gap-3 transition hover:bg-white/10 p-2";
    div.innerHTML = `
      <img src="${song.thumb}" class="w-20 h-14 object-cover rounded-md flex-shrink-0"/>
      <p class="text-sm font-semibold text-white line-clamp-2">${song.title}</p>
    `;
    div.addEventListener("click", () => player.loadVideoById(song.videoId));
    container.appendChild(div);
  });
}

function updateTrackTitle() {
  const data = player.getVideoData();
  document.getElementById("trackTitle").innerText = data.title;
  document.getElementById("trackMeta").innerText = "Streaming from YouTube 🎵";
}

document.getElementById("playPauseBtn").onclick = () => {
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
};
document.getElementById("nextBtn").onclick = () => player.nextVideo();
document.getElementById("prevBtn").onclick = () => player.previousVideo();
