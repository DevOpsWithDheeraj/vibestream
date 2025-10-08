const playlist = [
  { title: "Coldplay - Paradise", id: "1G4isv_Fylg" },
  { title: "Adele - Rolling in the Deep", id: "rYEDA3JcQqw" },
  { title: "Imagine Dragons - Believer", id: "7wtfhZwyrcc" },
  { title: "Ed Sheeran - Shape of You", id: "JGwWNGJdvx8" },
  { title: "Shawn Mendes - There's Nothing Holdin' Me Back", id: "dT2owtxkU8k" }
];

const player = document.getElementById("player");
const listContainer = document.getElementById("playlist-list");

// Populate playlist
playlist.forEach((song, index) => {
  const li = document.createElement("li");
  li.textContent = song.title;
  li.onclick = () => playSong(index);
  listContainer.appendChild(li);
});

let current = 0;

function playSong(index) {
  current = index;
  player.src = `https://www.youtube.com/embed/${playlist[index].id}?autoplay=1&enablejsapi=1`;
}

// Auto next song after 4 minutes (example)
setInterval(() => {
  current = (current + 1) % playlist.length;
  playSong(current);
}, 240000); // 4 mins per song
