// app.js - minimal, client-side YouTube playlist fetcher & player
// IMPORTANT: replace the string below with your YouTube Data API key
const YT_API_KEY = "YOUR_YOUTUBE_API_KEY_HERE"; // <<-- add your key
const SEARCH_QUERY = "english superhit songs";
const MAX_RESULTS = 15; // number of tracks to fetch
const AUTO_REFRESH_MINUTES = 5; // auto-refresh interval (minutes). Set to 0 to disable.

let player;                 // YouTube IFrame player object
let playlist = [];          // array of fetched videos
let currentVideoId = null;

// --- DOM refs
const tracksEl = document.getElementById("tracks");
const titleEl = document.getElementById("track-title");
const channelEl = document.getElementById("track-channel");
const refreshBtn = document.getElementById("refreshBtn");
const lastUpdateEl = document.getElementById("last-update");

// Load YouTube IFrame API script and create player when ready
(function injectYTApi(){
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
})();

// Called by YouTube API when ready
function onYouTubeIframeAPIReady(){
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: '', // blank initially
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: (ev) => {},
      onStateChange: onPlayerStateChange
    }
  });
}

// Fallback if the API is not loaded by the time JS runs
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// handle play/pause UI state if needed
function onPlayerStateChange(e){
  // can update UI based on YT.PlayerState
}

// Build the YouTube Data API search URL
function buildSearchUrl(){
  const base = "https://www.googleapis.com/youtube/v3/search";
  const params = new URLSearchParams({
    key: YT_API_KEY,
    part: "snippet",
    q: SEARCH_QUERY,
    type: "video",
    maxResults: MAX_RESULTS,
    order: "relevance"
  });
  return `${base}?${params.toString()}`;
}

// Fetch playlist from YouTube and render
async function fetchPlaylist(){
  if(!YT_API_KEY || YT_API_KEY.includes("YOUR_")) {
    alert("Please set your YouTube API key in app.js (replace YOUR_YOUTUBE_API_KEY_HERE).");
    return;
  }

  try {
    refreshBtn.disabled = true;
    refreshBtn.textContent = "Refreshing...";
    const url = buildSearchUrl();
    const res = await fetch(url);
    if(!res.ok) throw new Error(`YouTube API error: ${res.status}`);
    const data = await res.json();
    playlist = (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumb: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
    }));

    renderPlaylist();
    updateLastUpdated();
    // auto-play the first track if none selected
    if(playlist.length && !currentVideoId){
      loadVideo(playlist[0].id);
      highlightTrack(0);
    }
  } catch (err){
    console.error(err);
    alert("Failed to fetch playlist from YouTube. Check console and your API key.");
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = "Refresh playlist";
  }
}

// Render playlist into sidebar
function renderPlaylist(){
  tracksEl.innerHTML = "";
  playlist.forEach((t, idx) => {
    const li = document.createElement("li");
    li.className = "track";
    li.tabIndex = 0;
    li.dataset.index = idx;
    li.innerHTML = `
      <img src="${t.thumb}" alt="thumb" loading="lazy" />
      <div class="tmeta">
        <div class="title">${escapeHtml(t.title)}</div>
        <div class="sub">${escapeHtml(t.channel)}</div>
      </div>
    `;
    li.addEventListener("click", () => {
      loadVideo(t.id);
      highlightTrack(idx);
    });
    li.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); }
    });
    tracksEl.appendChild(li);
  });
}

// Update "last updated" text
function updateLastUpdated(){
  const now = new Date();
  lastUpdateEl.textContent = `Last updated: ${now.toLocaleString()}`;
}

// load and play video by id
function loadVideo(videoId){
  currentVideoId = videoId;
  const track = playlist.find(t => t.id === videoId);
  if(track){
    titleEl.textContent = track.title;
    channelEl.textContent = track.channel;
  } else {
    titleEl.textContent = "Playing song";
    channelEl.textContent = "";
  }
  if(player && typeof player.loadVideoById === "function"){
    player.loadVideoById(videoId);
  } else {
    // If player not yet ready, create an iframe fallback
    const container = document.getElementById("player");
    container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media" frameborder="0" allowfullscreen style="width:100%;height:100%;"></iframe>`;
  }
}

// highlight selected track in playlist
function highlightTrack(index){
  [...tracksEl.children].forEach((li, i) => {
    if(i === index) li.style.outline = "2px solid rgba(255,255,255,0.08)";
    else li.style.outline = "none";
  });
}

// small helper: escape HTML to avoid injection
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;", '"':"&quot;","'":"&#39;"
  }[s]));
}

// refresh button
refreshBtn.addEventListener("click", () => {
  fetchPlaylist();
});

// auto-refresh timer
if (AUTO_REFRESH_MINUTES > 0){
  setInterval(() => {
    fetchPlaylist();
  }, Math.max(60_000, AUTO_REFRESH_MINUTES * 60_000));
}

// initial fetch on load
window.addEventListener("DOMContentLoaded", () => {
  fetchPlaylist();
});
