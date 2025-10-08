// Playlist Array
const playlist = [
  { title: "Song 1", artist: "Artist 1", videoId: "VIDEO_ID_1", thumbnail: "assets/thumb1.jpg" },
  { title: "Song 2", artist: "Artist 2", videoId: "VIDEO_ID_2", thumbnail: "assets/thumb2.jpg" },
  { title: "Song 3", artist: "Artist 3", videoId: "VIDEO_ID_3", thumbnail: "assets/thumb3.jpg" },
];

const playlistContainer = document.getElementById("playlistContainer");
let currentTrackIndex = 0;
let player;

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: playlist[currentTrackIndex].videoId,
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

// Highlight active playlist item
function highlightActiveTrack() {
  const items = document.querySelectorAll(".playlist-item");
  items.forEach((item, idx) => {
    item.classList.toggle("active", idx === currentTrackIndex);
  });
}

// Inject playlist items
playlist.forEach((track, index) => {
  const item = document.createElement("div");
  item.className = "playlist-item";
  item.innerHTML = `
    <img src="${track.thumbnail}" alt="${track.title}" />
    <div class="flex flex-col">
      <h3>${track.title}</h3>
      <p>${track.artist}</p>
    </div>
  `;

  item.addEventListener("click", () => playVideoByIndex(index));
  playlistContainer.appendChild(item);
});

// Load first track info
updateTrackInfo(currentTrackIndex);
highlightActiveTrack();

// Control Buttons
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
  if (player.getPlayerState() === 1) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
});

