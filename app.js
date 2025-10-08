const CONFIG = {
  PLAYLIST_ID: "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj", // Your playlist
  AUTOPLAY: true
};

let player;
let playlistItems = [];

// Initialize YouTube Player
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

// Player ready
function onPlayerReady() {
  fetchPlaylist();
}

// Update title when video changes
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) updateTrackTitle();
}

// Fetch playlist via proxy and parse XML
async function fetchPlaylist() {
  const feed = `https://api.allorigins.win/raw?url=${encodeURIComponent(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${CONFIG.PLAYLIST_ID}`
  )}`;

  try {
    const res = await fetch(feed);
    let text = await res.text();
    text = text.trim(); // Remove any extra whitespace
    const xml = new DOMParser().parseFromString(text, "application/xml");
    const entries = Array.from(xml.querySelectorAll("entry"));
    console.log("Entries fetched:", entries.length);

    playlistItems = entries.map((e) => {
      const videoId = e.querySelector("yt\\:videoId")?.textContent;
      return {
        title: e.querySelector("title")?.textContent,
        videoId,
        thumb: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
    });

    console.log("Playlist Items:", playlistItems);

    // If no entries found, use fallback
    if (playlistItems.length === 0) throw new Error("No playlist items found");

    renderPlaylist();
  } catch (err) {
    console.warn("Failed to fetch playlist, using fallback:", err);
    playlistItems = [
      { title: "Ed Sheeran – Shape of You", videoId: "JGwWNGJdvx8", thumb: "https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg" },
      { title: "Dua Lipa – Levitating", videoId: "TUVcZfQe-Kw", thumb: "https://img.youtube.com/vi/TUVcZfQe-Kw/hqdefault.jpg" },
    ];
    renderPlaylist();
  }
}

// Render playlist thumbnails
function renderPlaylist() {
  const container = document.getElementById("playlistContainer");
  container.innerHTML = "";
  playlistItems.forEach((song, index) => {
    const div = document.createElement("div");
    div.className =
      "group relative rounded-lg overflow-hidden shadow cursor-pointer flex items-center gap-3 transition hover:bg-white/10 p-2";
    div.innerHTML = `
      <img src="${song.thumb}" class="w-20 h-14 object-cover rounded-md flex-shrink-0"/>
      <p class="text-sm font-semibold text-white line-clamp-2">${song.title}</p>
    `;
    div.addEventListener("click", () => {
      player.loadVideoById(song.videoId);
      highlightActiveSong(index);
    });
    container.appendChild(div);
  });

  highlightActiveSong(0); // Highlight first song initially
}

// Highlight currently playing song
function highlightActiveSong(activeIndex) {
  const items = document.querySelectorAll("#playlistContainer > div");
  items.forEach((item, i) => {
    if (i === activeIndex) item.classList.add("bg-white/20");
    else item.classList.remove("bg-white/20");
  });
}

// Update title and meta
function updateTrackTitle() {
  const data = player.getVideoData();
  document.getElementById("trackTitle").innerText = data.title;
  document.getElementById("trackMeta").innerText = "Streaming from YouTube 🎵";

  // Highlight currently playing song in playlist
  const index = playlistItems.findIndex((item) => item.videoId === data.video_id);
  if (index >= 0) highlightActiveSong(index);
}

// Player controls
document.getElementById("playPauseBtn").onclick = () => {
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
};
document.getElementById("nextBtn").onclick = () => player.nextVideo();
document.getElementById("prevBtn").onclick = () => player.previousVideo();

