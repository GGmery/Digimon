// ------------------------------------
// 🌞🌙 ANIMACIÓN DÍA / NOCHE (GSAP)
// ------------------------------------
const body = document.body;
const themeContainer = document.querySelector('.theme-container');
let isNight = false;

const dayBox = document.querySelector('.day-box');
const nightBox = document.querySelector('.night-box');
const sun = dayBox?.querySelector('.sol');
const angemon = dayBox?.querySelector('.angemon');
const moon = nightBox?.querySelector('.moon');
const devimon = nightBox?.querySelector('.devimon');

if (themeContainer && dayBox && nightBox) {
    themeContainer.addEventListener('click', () => {
        isNight = !isNight;
        body.classList.toggle('dark-theme', isNight);
        animateTheme(isNight);
    });
}

function animateTheme(toNight) {
    const duration = 0.8; 
    const tl = gsap.timeline();
    const distance = '65%'; 

    if (toNight) {
        tl.to(dayBox, {opacity: 0, pointerEvents: 'none', duration: duration / 2, ease: 'power2.in'}, 0)
          .to(nightBox, {opacity: 1, pointerEvents: 'auto', duration: duration / 2, ease: 'power2.out'}, 0);
        tl.to(sun, {x: `+=${distance}`, opacity: 0, rotation: 180, duration: duration, ease: 'power1.inOut'}, 0)
          .fromTo(moon, {x: `+=${distance}`, opacity: 0, rotation: -180}, {x: '0%', opacity: 1, rotation: 0, duration: duration, ease: 'power1.inOut'}, 0);
        tl.to(angemon, {x: `-=${distance}`, opacity: 0, scale: 0.9, duration: duration, ease: 'power1.inOut'}, 0)
          .fromTo(devimon, {x: `+=${distance}`, opacity: 0, scale: 0.9}, {x: '0%', opacity: 1, scale: 1, duration: duration, ease: 'power1.inOut'}, 0);
    } else {
        tl.to(nightBox, {opacity: 0, pointerEvents: 'none', duration: duration / 2, ease: 'power2.in'}, 0)
          .to(dayBox, {opacity: 1, pointerEvents: 'auto', duration: duration / 2, ease: 'power2.out'}, 0);
        tl.to(moon, {x: `-=${distance}`, opacity: 0, rotation: 180, duration: duration, ease: 'power1.inOut'}, 0)
          .fromTo(sun, {x: `-=${distance}`, opacity: 0, rotation: -180}, {x: '0%', opacity: 1, rotation: 0, duration: duration, ease: 'power1.inOut'}, 0);
        tl.to(devimon, {x: `+=${distance}`, opacity: 0, scale: 0.9, duration: duration, ease: 'power1.inOut'}, 0)
          .fromTo(angemon, {x: `+=${distance}`, opacity: 0, scale: 0.9}, {x: '0%', opacity: 1, scale: 1, duration: duration, ease: 'power1.inOut'}, 0);
    }
}

// ============================
// 🧩 CARGA DE DATOS DEL DIGIMON
// ============================
const loader = document.getElementById("loader");
const container = document.getElementById("detail-container");
const nameEl = document.getElementById("digimon-name");
const imgEl = document.getElementById("digimon-image");
const levelEl = document.getElementById("digimon-level");
const typeEl = document.getElementById("digimon-type");
const fieldEl = document.getElementById("digimon-field");
const attrEl = document.getElementById("digimon-attribute");
const descEl = document.getElementById("digimon-description");
const evolutionContainer = document.getElementById("evolution-container");
const backBtn = document.getElementById("back-btn");

function getDigimonIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadDigimon() {
    const digimonId = getDigimonIdFromUrl();
    
    if (!digimonId) {
        if (nameEl) nameEl.textContent = "Digimon no encontrado (ID faltante)";
        if (container) container.style.display = "flex";
        if (loader) loader.style.display = "none";
        return;
    }

    if (loader) loader.style.display = "block";
    if (container) container.style.display = "none";
    if (evolutionContainer) evolutionContainer.innerHTML = "";

    try {
        const response = await fetch(`https://digi-api.com/api/v1/digimon/${digimonId}`);
        if (!response.ok) throw new Error(`Digimon con ID ${digimonId} no encontrado.`);
        const data = await response.json();

        if (nameEl) nameEl.textContent = data.name || "Sin nombre";
        if (imgEl) {
            imgEl.src = data.images?.[0]?.href || "https://via.placeholder.com/200?text=No+Image";
            imgEl.alt = data.name || "Imagen del Digimon";
        }
        if (levelEl) levelEl.textContent = data.levels?.map(l => l.level).join(", ") || "Desconocido";
        if (typeEl) typeEl.textContent = data.types?.map(t => t.type).join(", ") || "Desconocido";
        if (fieldEl) fieldEl.textContent = data.fields?.map(f => f.field).join(", ") || "Desconocido";
        if (attrEl) attrEl.textContent = data.attributes?.map(a => a.attribute).join(", ") || "Desconocido";
        const descriptionText = data.descriptions?.find(d => d.language === "en_us")?.description || "No hay descripción disponible.";
        if (descEl) descEl.textContent = descriptionText;

        if (evolutionContainer) {
            evolutionContainer.innerHTML = "";
            const evolutions = data.nextEvolutions || [];
            if (evolutions.length > 0) {
                evolutions.forEach(evo => {
                    const evoIdMatch = evo.url ? evo.url.match(/(\d+)$/) : null;
                    const evoId = evoIdMatch ? evoIdMatch[1] : null;

                    const evoCard = document.createElement("div");
                    evoCard.classList.add("evolution-card");
                    evoCard.innerHTML = `
                        <img src="${evo.image || "https://via.placeholder.com/80?text=?"}" alt="${evo.digimon}" />
                        <p>${evo.digimon}</p>
                    `;
                    if (evoId) {
                        evoCard.addEventListener("click", () => {
                            window.location.search = `id=${evoId}`;
                        });
                    }
                    evolutionContainer.appendChild(evoCard);
                });
            } else {
                evolutionContainer.innerHTML = "<p>Este Digimon no tiene evoluciones registradas.</p>";
            }
        }

    } catch (error) {
        console.error("Error al cargar el Digimon:", error);
        if (nameEl) nameEl.textContent = "Error al cargar los datos";
    } finally {
        if (loader) loader.style.display = "none";
        if (container) container.style.display = "flex";
    }
}

backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

loadDigimon();
window.addEventListener('popstate', loadDigimon);
let currentUrlSearch = window.location.search;
setInterval(() => {
    if (window.location.search !== currentUrlSearch) {
        currentUrlSearch = window.location.search;
        loadDigimon();
    }
}, 500);

// ============================
// 🎵 REPRODUCTOR DE MÚSICA
// ============================
const musicBar = document.getElementById("music-bar");
const playPauseIcon = document.getElementById("play-pause-icon");
const detailContainerEl = document.querySelector(".detail-container");
const footer = document.querySelector("footer");

const songsList = [
  { title: "Brave Heart", artist: "Ayumi Miyazaki", file: "assets/audio/Brave Heart - Ayumi Miyazaki.mp3" },
  { title: "Butterfly", artist: "Kōji Wada", file: "assets/audio/Butterfly - Kōji Wada.mp3" },
  { title: "¿Perdón?", artist: "¿?", file: "assets/audio/Qué es esto.mp3"}
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
  currentIndex = (currentIndex + 1) % songsList.length;
  playSong();
});

// ============================
// 🌟 EFECTO KIRBY
// ============================
// Crear contenedores si no existen
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

    // Tamaño aleatorio
    const size = 50 + Math.random() * 50; // 50-100px
    kirby.style.width = size + "px";
    kirby.style.height = size + "px";

    const fromLeft = Math.random() < 0.5; // dirección

    // Posición vertical aleatoria dentro de la pantalla
    const startTop = Math.random() * (window.innerHeight - size);
    kirby.style.top = startTop + "px";

    // Posición horizontal inicial
    kirby.style.left = fromLeft ? -size + "px" : window.innerWidth + "px";

    document.body.appendChild(kirby);

    // Rotación inicial aleatoria
    const rotation = Math.random() * 360;

    // Duración aleatoria
    const duration = 5000 + Math.random() * 5000; // 5-10s
    const startTime = performance.now();

    function animate(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Movimiento horizontal completo
      if (fromLeft) {
        kirby.style.left = -size + (window.innerWidth + size) * progress + "px";
        kirby.style.top = startTop + progress * (window.innerHeight * 0.3) + "px"; // se mueve hacia abajo
      } else {
        kirby.style.left = window.innerWidth - (window.innerWidth + size) * progress + "px";
        kirby.style.top = startTop - progress * (window.innerHeight * 0.3) + "px"; // se mueve hacia arriba
      }

      // Rotación mientras se mueve
      kirby.style.transform = `rotate(${rotation + progress * 360}deg)`;

      if (progress < 1) requestAnimationFrame(animate);
      else kirby.remove();
    }

    requestAnimationFrame(animate);

  }, 400); // cada 400ms aparece un kirby
}

function stopKirbyRain() {
  clearInterval(kirbyInterval);
  document.querySelectorAll(".kirby-rain").forEach(k => k.remove());
}


// Integrarlo con tu reproductor
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


// Mostrar/ocultar Kirby según la canción
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



// ============================
// 🧭 MENÚ HAMBURGUESA
// ============================

// Botón de hamburguesa dentro del musicBar
let hamburgerBtn = document.querySelector("#hamburger-btn");
if (!hamburgerBtn) {
  hamburgerBtn = document.createElement("button");
  hamburgerBtn.id = "hamburger-btn";
  hamburgerBtn.className = "music-menu-btn";
  hamburgerBtn.textContent = "☰";
  musicBar.insertBefore(hamburgerBtn, musicBar.firstChild); // a la izquierda
}

// Lista de canciones (si no existe, la creamos)
let songList = document.querySelector(".music-menu-list");
if (!songList) {
  songList = document.createElement("div");
  songList.className = "music-menu-list";
  musicBar.appendChild(songList); // ⬅️ dentro de musicBar
}

// Vaciar lista y generar items
songList.innerHTML = "";
songsList.forEach((song, index) => {
  const songItem = document.createElement("div");
  songItem.textContent = `${song.title} - ${song.artist}`;
  songItem.setAttribute("data-index", index);
  songList.appendChild(songItem);

  // Click en la canción
  songItem.addEventListener("click", () => {
    currentIndex = index;
    playSong(song.file);
    songList.classList.remove("show");
  });
});

// Mostrar / ocultar menú
hamburgerBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  songList.classList.toggle("show");
});

// Cerrar menú al hacer click fuera
document.addEventListener("click", (e) => {
  if (!songList.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    songList.classList.remove("show");
  }
});