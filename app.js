// app.js
// A small app that embeds a YouTube playlist in an iframe using the IFrame API.
// The playlist used here is a public playlist ID (default). Replace PLAYLIST_ID if you wish.
// NOTE: We purposely use playlist embed so the playlist auto-updates when the playlist on YouTube changes.

const CONFIG = {
  // Default public YouTube playlist ID (english/pop hits). If you want to use another playlist,
  // replace the ID below. (No action required — this default will work immediately.)
  PLAYLIST_ID: "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj", // a public "Top Hits" playlist as default
  AUTOPLAY: true,
  REFRESH_MINUTES: 10
};

let player;
let currentIndex = 0;
let playlistItems = []; // track titles/ids if you want to list them
let refreshTimer = null;
let autoAdvance = CONFIG.AUTOPLAY;

// Helper DOM refs
const trackTitle = document.getElementById('trackTitle');
const trackMeta = document.getElementById('trackMeta');
const nowPlayingList = document.getElementById('nowPlayingList');
const playlistInfo = document.getElementById('playlistInfo');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const autoplayToggle = document.getElementById('autoplayToggle');
const refreshInterval = document.getElementById('refreshInterval');
const refreshLabel = document.getElementById('refreshLabel');
const refreshIntervalLabel = document.getElementById('refreshIntervalLabel');

// Sync UI defaults
autoplayToggle.checked = CONFIG.AUTOPLAY;
refreshInterval.value = CONFIG.REFRESH_MINUTES;
refreshLabel.innerText = `${CONFIG.REFRESH_MINUTES} minutes`;
refreshIntervalLabel.innerText = `${CONFIG.REFRESH_MINUTES}`;

// Load YouTube IFrame API script then create player
function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    onYouTubeIframeAPIReady();
    return;
  }
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
}

function onYouTubeIframeAPIReady() {
  // Create player in the #player div using the playlist.
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    playerVars: {
      listType: 'playlist',
      list: CONFIG.PLAYLIST_ID,
      autoplay: CONFIG.AUTOPLAY ? 1 : 0,
      modestbranding: 1,
      rel: 0,
      controls: 1,
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  playlistInfo.textContent = `Streaming playlist ${CONFIG.PLAYLIST_ID}`;
  if (CONFIG.AUTOPLAY) event.target.playVideo();
  fetchPlaylistInfo(); // populate UI list (best-effort via no-api approach)
  startRefreshTimer();
}

function onPlayerStateChange(e) {
  // If video ended, the playlist will go next automatically when using the playlist param,
  // but we can update UI accordingly
  if (e.data === YT.PlayerState.PLAYING) {
    updateNowPlaying();
    playPauseBtn.textContent = "Pause";
  } else if (e.data === YT.PlayerState.PAUSED) {
    playPauseBtn.textContent = "Play";
  } else if (e.data === YT.PlayerState.ENDED) {
    playPauseBtn.textContent = "Play";
  }
}

function updateNowPlaying() {
  const videoData = player.getVideoData();
  trackTitle.textContent = videoData.title || 'Unknown';
  trackMeta.textContent = `by YouTube`;
  // display a short recent-played list
  const li = document.createElement('div');
  li.className = 'text-slate-300 text-sm';
  li.textContent = videoData.title || 'Unknown';
  nowPlayingList.prepend(li);
  if (nowPlayingList.children.length > 10) nowPlayingList.removeChild(nowPlayingList.lastChild);
}

// Controls
playPauseBtn.addEventListener('click', () => {
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
});

prevBtn.addEventListener('click', () => {
  player.previousVideo();
});

nextBtn.addEventListener('click', () => {
  player.nextVideo();
});

// Autoplay toggle
autoplayToggle.addEventListener('change', (e) => {
  autoAdvance = e.target.checked;
  // Note: changing autoplay mid-play may not change playlist behavior; playlist controls autoplayer locally.
});

// Refresh interval control
refreshInterval.addEventListener('input', (e) => {
  const minutes = e.target.value;
  refreshLabel.innerText = `${minutes} minutes`;
  refreshIntervalLabel.innerText = minutes;
  restartRefreshTimer();
});

// Periodic refresh: reload the playlist iframe to pick up new playlist videos (if any added to playlist)
function startRefreshTimer() {
  const minutes = parseInt(refreshInterval.value || CONFIG.REFRESH_MINUTES, 10);
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    console.debug('Refreshing player iframe to pick up playlist updates...');
    reloadPlayer();
  }, minutes * 60 * 1000);
}

function restartRefreshTimer() {
  if (refreshTimer) clearInterval(refreshTimer);
  startRefreshTimer();
}

function reloadPlayer() {
  // Remove & recreate player to force reload of playlist content — quick and simple.
  try {
    if (player && player.destroy) player.destroy();
  } catch (err) {
    console.warn('Error destroying player', err);
  }
  document.getElementById('player').innerHTML = '';
  loadYouTubeAPI();
}

// Lightweight playlist info fetch (best-effort): try to load playlist items via YouTube's no-CORS RSS feed
async function fetchPlaylistInfo() {
  const playlistId = CONFIG.PLAYLIST_ID;
  // YouTube exposes playlist RSS: https://www.youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID
  // We try to fetch it. If CORS blocks us, that's okay; still the player will stream.
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  try {
    const res = await fetch(feedUrl);
    if (!res.ok) throw new Error('feed fetch failed');
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");
    const entries = Array.from(xml.querySelectorAll("entry")).slice(0, 25);
    playlistItems = entries.map((e) => ({
      title: e.querySelector("title")?.textContent || 'Untitled',
      videoId: e.querySelector("yt\\:videoId")?.textContent || ''
    }));
    renderPlaylistItems();
  } catch (err) {
    console.warn('Could not fetch playlist RSS (CORS or other). Playlist will still stream via embed. Error:', err);
    playlistInfo.textContent = `Streaming playlist ${playlistId} — (playlist details unavailable due to cross-origin restrictions)`;
  }
}

function renderPlaylistItems() {
  if (!playlistItems.length) {
    playlistInfo.textContent = `No playlist items found.`;
    return;
  }
  playlistInfo.innerHTML = `<strong>${playlistItems.length}</strong> items — latest shown below.`;
  nowPlayingList.innerHTML = '';
  playlistItems.forEach((it, idx) => {
    const div = document.createElement('div');
    div.className = 'p-2 rounded hover:bg-slate-700 cursor-pointer';
    div.innerHTML = `<div class="font-medium text-sm">${it.title}</div><div class="text-slate-400 text-xs">video id: ${it.videoId}</div>`;
    div.addEventListener('click', () => {
      // play the clicked video within the playlist context by loading the videoId
      if (player && player.loadVideoById) {
        player.loadVideoById(it.videoId);
      } else {
        // fallback: reload to playlist with start index
        // no-op
      }
    });
    nowPlayingList.appendChild(div);
  });
}

// Kick off
loadYouTubeAPI();
