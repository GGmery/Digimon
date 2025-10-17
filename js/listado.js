document.addEventListener('DOMContentLoaded', () => {
  const themeContainer = document.querySelector('.theme-container');
  const body = document.body;
  let isNight = false;

  const dayBox = document.querySelector('.day-box');
  const nightBox = document.querySelector('.night-box');
  const sun = dayBox?.querySelector('.sol');
  const angemon = dayBox?.querySelector('.angemon');
  const moon = nightBox?.querySelector('.moon');
  const devimon = nightBox?.querySelector('.devimon');

  const loader = document.getElementById("loader");
  const gallery = document.getElementById("gallery");
  const reloadBtn = document.getElementById("reload-btn");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const gallerySection = document.getElementById('gallery-section');

  const API_URL = "https://digi-api.com/api/v1/digimon";

  if (themeContainer && dayBox && nightBox) {
    themeContainer.addEventListener('click', () => {
      isNight = !isNight;
      body.classList.toggle('dark-theme', isNight);
      animateTheme(isNight);
    });
  } else {
    console.warn("Elementos del tema Día/Noche no encontrados.");
  }

  function animateTheme(toNight) {
    const duration = 0.8;
    const tl = gsap.timeline();
    const distance = '65%';

    if (toNight) {
      tl.to(dayBox, { opacity: 0, pointerEvents: 'none', duration: duration / 2, ease: 'power2.in' }, 0)
        .to(nightBox, { opacity: 1, pointerEvents: 'auto', duration: duration / 2, ease: 'power2.out' }, 0);

      tl.to(sun, { x: `+=${distance}`, opacity: 0, rotation: 180, duration: duration, ease: 'power1.inOut' }, 0)
        .fromTo(moon, { x: `+=${distance}`, opacity: 0, rotation: -180 }, { x: '0%', opacity: 1, rotation: 0, duration: duration, ease: 'power1.inOut' }, 0);

      tl.to(angemon, { x: `-=${distance}`, opacity: 0, scale: 0.9, duration: duration, ease: 'power1.inOut' }, 0)
        .fromTo(devimon, { x: `+=${distance}`, opacity: 0, scale: 0.9 }, { x: '0%', opacity: 1, scale: 1, duration: duration, ease: 'power1.inOut' }, 0);

    } else {
      tl.to(nightBox, { opacity: 0, pointerEvents: 'none', duration: duration / 2, ease: 'power2.in' }, 0)
        .to(dayBox, { opacity: 1, pointerEvents: 'auto', duration: duration / 2, ease: 'power2.out' }, 0);

      tl.to(moon, { x: `-=${distance}`, opacity: 0, rotation: 180, duration: duration, ease: 'power1.inOut' }, 0)
        .fromTo(sun, { x: `-=${distance}`, opacity: 0, rotation: -180 }, { x: '0%', opacity: 1, rotation: 0, duration: duration, ease: 'power1.inOut' }, 0);

      tl.to(devimon, { x: `+=${distance}`, opacity: 0, scale: 0.9, duration: duration, ease: 'power1.inOut' }, 0)
        .fromTo(angemon, { x: `+=${distance}`, opacity: 0, scale: 0.9 }, { x: '0%', opacity: 1, scale: 1, duration: duration, ease: 'power1.inOut' }, 0);
    }
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async function loadDigimons(limit = 5) {
    if (loader) loader.style.display = "block";
    if (gallery) gallery.innerHTML = "";

    try {
      const response = await fetch(API_URL);
      const firstPage = await response.json();
      const totalPages = firstPage.pageable?.totalPages || 100;

      let digimons = [];
      while (digimons.length < limit) {
        const randomPage = Math.floor(Math.random() * totalPages);
        const res = await fetch(`${API_URL}?page=${randomPage}`);
        const data = await res.json();
        if (Array.isArray(data.content)) digimons.push(...data.content);
      }
      digimons = digimons.slice(0, limit);

      const details = await Promise.all(
        digimons.map(async d => {
          try {
            const detailRes = await fetch(`${API_URL}/${d.id}`);
            const detailData = await detailRes.json();
            return detailData;
          } catch {
            return d;
          }
        })
      );

      renderDigimons(details);
    } catch (err) {
      console.error(err);
      if (gallery) gallery.innerHTML = "<p>Error al cargar los Digimons.</p>";
    } finally {
      if (loader) loader.style.display = "none";
    }
  }

  async function searchDigimonByName(name) {
    if (loader) loader.style.display = "block";
    if (gallery) gallery.innerHTML = "";

    try {
      const res = await fetch(`${API_URL}?name=${encodeURIComponent(name)}`);
      const data = await res.json();

      if (!data.content || data.content.length === 0) {
        if (gallery) gallery.innerHTML = `<p>No se encontró ningún Digimon llamado "${name}".</p>`;
        return;
      }

      const details = await Promise.all(
        data.content.map(async d => {
          try {
            const detailRes = await fetch(`${API_URL}/${d.id}`);
            const detailData = await detailRes.json();
            return detailData;
          } catch {
            return d;
          }
        })
      );

      renderDigimons(details);
    } catch (err) {
      console.error(err);
      if (gallery) gallery.innerHTML = "<p>Error en la búsqueda.</p>";
    } finally {
      if (loader) loader.style.display = "none";
    }
  }

  function renderDigimons(digimons) {
    if (!gallery) return;

    gallery.innerHTML = digimons.map((d, index) => {
      const image = d.images?.[0]?.href || "https://via.placeholder.com/150?text=No+Image";
      const level = d.levels?.[0]?.level || "Desconocido";
      const cardClassIndex = (index % 5) + 1;

      return `
                <div class="card card-${cardClassIndex}" data-id="${d.id}">
                    <img src="${image}" alt="${d.name}">
                    <div class="card-info">
                        <h3>${capitalizeFirstLetter(d.name)}</h3>
                        <p>Nivel: ${level}</p>
                    </div>
                </div>
            `;
    }).join("");

    document.querySelectorAll(".card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        window.location.href = `detalles.html?id=${id}`;
        console.log(`Navegando al detalle del Digimon ID: ${id}`);
      });
    });

    setupParallaxEffect();
  }

  function setupParallaxEffect() {
    const cards = document.querySelectorAll('#gallery .card');

    if (gallerySection) {
      gallerySection.addEventListener('mousemove', (e) => {
        const rect = gallerySection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        cards.forEach(card => {
          if (!card) return;

          const cardRect = card.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const cardCenterY = cardRect.top + cardRect.height / 2;

          const distanceX = x - (cardCenterX - rect.left);
          const distanceY = y - (cardCenterY - rect.top);

          const moveX = distanceX / 40;
          const moveY = distanceY / 40;

          gsap.to(card, {
            x: moveX,
            y: moveY,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
      });

      gallerySection.addEventListener('mouseleave', () => {
        cards.forEach(card => {
          gsap.to(card, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
      });
    }
  }

  loadDigimons(5);

  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => loadDigimons(5));
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = searchInput.value.trim();
      if (name) {
        searchDigimonByName(name);
      }
    });
  }
});

const musicBar = document.getElementById("music-bar");
const playPauseIcon = document.getElementById("play-pause-icon");
const detailContainerEl = document.querySelector(".detail-container");
const footer = document.querySelector("footer");

const songsList = [
  { title: "Brave Heart", artist: "Ayumi Miyazaki", file: "assets/audio/Brave Heart - Ayumi Miyazaki.mp3" },
  { title: "Butterfly", artist: "Kōji Wada", file: "assets/audio/Butterfly - Kōji Wada.mp3" },
  { title: "¿Perdón?", artist: "¿?", file: "assets/audio/Qué es esto.mp3" }
]

let currentIndex = 0;
let isPlaying = false;
const audio = new Audio();
audio.loop = false;

function playSong() {
  const song = songsList[currentIndex];
  audio.src = song.file;
  audio.play();
  playPauseIcon.src = "assets/img/pause.svg";
  isPlaying = true;

  handleKirbyEffect();
  updateSongInfo();
}

function updateSongInfo() {
  const song = songsList[currentIndex];
  const songInfo = document.getElementById("song-info");
  if (songInfo) songInfo.textContent = `${song.title} - ${song.artist}`;
}

function togglePlayPause() {
  if (!audio.src) playSong();
  else if (isPlaying) {
    audio.pause();
    playPauseIcon.src = "assets/img/play.svg";
    isPlaying = false;
    handleKirbyEffect();
  } else {
    audio.play();
    playPauseIcon.src = "assets/img/pause.svg";
    isPlaying = true;
    handleKirbyEffect();
  }
}

musicBar.addEventListener("click", (e) => {
  if (e.target.closest("#hamburger-btn")) return;
  togglePlayPause();
});

audio.addEventListener("ended", () => {
  isPlaying = false;
  togglePlayPauseIcon();
  handleKirbyEffect();
  document.body.classList.remove("error-bg");
});

function togglePlayPauseIcon() {
  playPauseIcon.src = "assets/img/play.svg";
}

let kirbyLeftContainer = document.getElementById("kirby-left-container");
if (!kirbyLeftContainer) {
  kirbyLeftContainer = document.createElement("div");
  kirbyLeftContainer.id = "kirby-left-container";
  document.body.appendChild(kirbyLeftContainer);

  const imgLeft = document.createElement("img");
  imgLeft.src = "assets/img/error1.gif";
  kirbyLeftContainer.appendChild(imgLeft);
}

let kirbyRightContainer = document.getElementById("kirby-right-container");
if (!kirbyRightContainer) {
  kirbyRightContainer = document.createElement("div");
  kirbyRightContainer.id = "kirby-right-container";
  document.body.appendChild(kirbyRightContainer);

  const imgRight = document.createElement("img");
  imgRight.src = "assets/img/error1.gif";
  kirbyRightContainer.appendChild(imgRight);
}

let kirbyInterval;

function startKirbyRain() {
  kirbyInterval = setInterval(() => {
    const kirby = document.createElement("img");
    kirby.src = "assets/img/error4.gif";
    kirby.className = "kirby-rain";

    const size = 50 + Math.random() * 50;
    kirby.style.width = size + "px";
    kirby.style.height = size + "px";

    const fromLeft = Math.random() < 0.5;

    const startTop = Math.random() * (window.innerHeight - size);
    kirby.style.top = startTop + "px";

    kirby.style.left = fromLeft ? -size + "px" : window.innerWidth + "px";

    document.body.appendChild(kirby);

    const rotation = Math.random() * 360;

    const duration = 5000 + Math.random() * 5000; // 5-10s
    const startTime = performance.now();

    function animate(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (fromLeft) {
        kirby.style.left = -size + (window.innerWidth + size) * progress + "px";
        kirby.style.top = startTop + progress * (window.innerHeight * 0.3) + "px"; // se mueve hacia abajo
      } else {
        kirby.style.left = window.innerWidth - (window.innerWidth + size) * progress + "px";
        kirby.style.top = startTop - progress * (window.innerHeight * 0.3) + "px"; // se mueve hacia arriba
      }

      kirby.style.transform = `rotate(${rotation + progress * 360}deg)`;

      if (progress < 1) requestAnimationFrame(animate);
      else kirby.remove();
    }

    requestAnimationFrame(animate);

  }, 400);
}

function stopKirbyRain() {
  clearInterval(kirbyInterval);
  document.querySelectorAll(".kirby-rain").forEach(k => k.remove());
}


function handleKirbyEffect() {
  const song = songsList[currentIndex];
  if (song.title === "¿Perdón?" && isPlaying) {
    document.body.classList.add("error-bg");
    startKirbyRain();
  } else {
    document.body.classList.remove("error-bg");
    stopKirbyRain();
  }
}


function handleKirbyEffect() {
  const song = songsList[currentIndex];
  const leftImg = kirbyLeftContainer.querySelector("img");
  const rightImg = kirbyRightContainer.querySelector("img");

  if (song.title === "¿Perdón?" && isPlaying) {
    leftImg.style.display = "block";
    rightImg.style.display = "block";
    document.body.classList.add("error-bg");
    startKirbyRain();
  } else {
    leftImg.style.display = "none";
    rightImg.style.display = "none";
    document.body.classList.remove("error-bg");
    stopKirbyRain();
  }
}

let hamburgerBtn = document.querySelector("#hamburger-btn");
if (!hamburgerBtn) {
  hamburgerBtn = document.createElement("button");
  hamburgerBtn.id = "hamburger-btn";
  hamburgerBtn.className = "music-menu-btn";
  hamburgerBtn.textContent = "☰";
  musicBar.insertBefore(hamburgerBtn, musicBar.firstChild);
}

let songList = document.querySelector(".music-menu-list");
if (!songList) {
  songList = document.createElement("div");
  songList.className = "music-menu-list";
  musicBar.appendChild(songList);
}

songList.innerHTML = "";
songsList.forEach((song, index) => {
  const songItem = document.createElement("div");
  songItem.textContent = `${song.title} - ${song.artist}`;
  songItem.setAttribute("data-index", index);
  songList.appendChild(songItem);

  songItem.addEventListener("click", () => {
    currentIndex = index;
    playSong(song.file);
    songList.classList.remove("show");
  });
});

hamburgerBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  songList.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!songList.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    songList.classList.remove("show");
  }
});
