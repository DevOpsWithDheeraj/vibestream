let player;
const playlist = [
  { title: "Coldplay - Paradise", id: "1G4isv_Fylg" },
  { title: "Imagine Dragons - Believer", id: "7wtfhZwyrcc" },
  { title: "Ed Sheeran - Shape of You", id: "JGwWNGJdvx8" },
  { title: "Shawn Mendes - Treat You Better", id: "lY2yjAdbvdQ" },
  { title: "Adele - Rolling in the Deep", id: "rYEDA3JcQqw" }
];
let current = 0;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '315',
    width: '560',
    videoId: playlist[0].id,
    playerVars: { autoplay: 0, controls: 1 },
    events: { 'onStateChange': onPlayerStateChange }
  });
}

function onPlayerStateChange(event) {
  // Auto next song when current ends
  if (event.data === YT.PlayerState.ENDED) {
    nextSong();
  }
}

function playSong(index) {
  current = index;
  player.loadVideoById(playlist[index].id);
  highlightCurrent();
}

function playFirstSong() {
  player.playVideo();
}

function nextSong() {
  current = (current + 1) % playlist.length;
  playSong(current);
}

function highlightCurrent() {
  document.querySelectorAll("#playlist-list li").forEach((li, i) => {
    li.style.background = i === current ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
  });
}

const listContainer = document.getElementById("playlist-list");
playlist.forEach((song, index) => {
  const li = document.createElement("li");
  li.textContent = song.title;
  li.onclick = () => playSong(index);
  listContainer.appendChild(li);
});
highlightCurrent();
