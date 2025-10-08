const playlist = [
  { title: "Song 1", artist: "Artist 1", videoId: "M7lc1UVf-VE", thumbnail: "assets/thumb1.jpg" },
  { title: "Song 2", artist: "Artist 2", videoId: "dQw4w9WgXcQ", thumbnail: "assets/thumb2.jpg" },
  { title: "Song 3", artist: "Artist 3", videoId: "3JZ_D3ELwOQ", thumbnail: "assets/thumb3.jpg" }
];

const playlistContainer = document.getElementById("playlistContainer");
let currentTrackIndex = 0;
let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: playlist[currentTrackIndex].videoId
  });
}

// Play track by index
function playVideoByIndex(index) {
  if (player && playlist[index]) {
    currentTrackIndex = index;
    player.loadVideoById(playlist[index].videoId);
    updateTrackInfo(index);
    highlightActiveTrack();
  }
}

// Update track info
function updateTrackInfo(index) {
  const track = playlist[index];
  document.getElementById("trackTitle").innerText = track.title;
  document.getElementById("trackMeta").innerText = track.artist;
}

// Highlight active track
function highlightActiveTrack() {
  const items = document.querySelectorAll(".playlist-item");
  items.forEach((item, idx) => {
    if (idx === currentTrackIndex) item.classList.add("bg-pink-500/60");
    else item.classList.remove("bg-pink-500/60");
  });
}

// Inject playlist items
playlist.forEach((track, index) => {
  const item = document.createElement("div");
  item.className = "playlist-item flex items-center gap-3 p-3 bg-white/10 rounded-2xl hover:bg-pink-500/40 cursor-pointer transition duration-200";
  item.innerHTML = `
    <img src="${track.thumbnail}" alt="${track.title}" class="w-16 h-16 rounded-xl object-cover shadow-md"/>
    <div class="flex flex-col">
      <h3 class="font-semibold text-white text-lg">${track.title}</h3>
      <p class="text-slate-300 text-sm">${track.artist}</p>
    </div>
  `;
  item.addEventListener("click", () => playVideoByIndex(index));
  playlistContainer.appendChild(item);
});

// Initial load
updateTrackInfo(currentTrackIndex);
highlightActiveTrack();

// Controls
document.getElementById("prevBtn").addEventListener("click", () => {
  let index = currentTrackIndex - 1;
  if (index < 0) index = playlist.length - 1;
  playVideoByIndex(index);
});

document.getElementById("nextBtn").addEventListener("click", () => {
  let index = (currentTrackIndex + 1) % playlist.length;
  playVideoByIndex(index);
});

document.getElementById("playPauseBtn").addEventListener("click", () => {
  if (player.getPlayerState() === 1) player.pauseVideo();
  else player.playVideo();
});
