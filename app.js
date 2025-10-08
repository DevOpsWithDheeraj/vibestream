// Playlist (no images)
const playlist = [
  { title: "Sky High", artist: "Electro Beats", videoId: "M7lc1UVf-VE" },
  { title: "Lost in Sound", artist: "DJ Nova", videoId: "dQw4w9WgXcQ" },
  { title: "City Nights", artist: "Lofi Dreams", videoId: "3JZ_D3ELwOQ" },
  { title: "Pulse", artist: "Synth Vision", videoId: "aqz-KE-bpKQ" }
];

const playlistContainer = document.getElementById("playlistContainer");
let currentTrackIndex = 0;
let player;

// YouTube Player API
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: playlist[currentTrackIndex].videoId,
    playerVars: { autoplay: 0, controls: 1, modestbranding: 1 }
  });
}

// Play track
function playVideoByIndex(index) {
  if (player && playlist[index]) {
    currentTrackIndex = index;
    player.loadVideoById(playlist[index].videoId);
    updateTrackInfo(index);
    highlightActiveTrack();
  }
}

// Update text info
function updateTrackInfo(index) {
  const track = playlist[index];
  document.getElementById("trackTitle").innerText = track.title;
  document.getElementById("trackMeta").innerText = track.artist;
}

// Highlight active
function highlightActiveTrack() {
  document.querySelectorAll(".playlist-item").forEach((item, i) => {
    item.classList.toggle("bg-pink-500/60", i === currentTrackIndex);
    item.classList.toggle("scale-[1.02]", i === currentTrackIndex);
  });
}

// Inject playlist items
playlist.forEach((track, index) => {
  const item = document.createElement("div");
  item.className = "playlist-item p-3 rounded-xl hover:bg-pink-500/40 cursor-pointer transition duration-200";
  item.innerHTML = `
    <h3 class="font-semibold text-white text-lg">${track.title}</h3>
    <p class="text-slate-300 text-sm">${track.artist}</p>
  `;
  item.addEventListener("click", () => playVideoByIndex(index));
  playlistContainer.appendChild(item);
});

// Load first song
updateTrackInfo(currentTrackIndex);
highlightActiveTrack();

// Controls
document.getElementById("prevBtn").addEventListener("click", () => {
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  playVideoByIndex(currentTrackIndex);
});

document.getElementById("nextBtn").addEventListener("click", () => {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  playVideoByIndex(currentTrackIndex);
});

document.getElementById("playPauseBtn").addEventListener("click", () => {
  const state = player.getPlayerState();
  if (state === 1) player.pauseVideo();
  else player.playVideo();
});

