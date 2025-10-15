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

if (backBtn) {
    backBtn.addEventListener("click", () => { window.history.back(); });
}

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
// 🎵 REPRODUCTOR DE MÚSICA + MENÚ
// ============================
const musicBar = document.getElementById("music-bar");
const playPauseIcon = document.getElementById("play-pause-icon");
const detailContainerEl = document.querySelector(".detail-container");

// Crear menú dinámico
const menuBtn = document.createElement("div");
menuBtn.classList.add("music-menu-btn");
menuBtn.innerHTML = "☰";
musicBar.appendChild(menuBtn);

// const menuList = document.createElement("div");
// menuList.classList.add("music-menu-list");
// musicBar.appendChild(menuList);

// Cierre automático del menú al hacer clic fuera
menuBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Evita que el clic se propague
    menuList.classList.toggle("show");
});

document.addEventListener("click", (e) => {
    if (!menuList.contains(e.target) && !menuBtn.contains(e.target)) {
        menuList.classList.remove("show");
    }
});

const songsList = [
    {title: "Brave Heart", artist: "Ayumi Miyazaki", file: "assets/audio/Brave Heart - Ayumi Miyazaki.mp3"},
    {title: "Butterfly", artist: "Kōji Wada", file: "assets/audio/Butterfly - Kōji Wada.mp3"},
    {title: "¿Perdón?", artist: "¿?", file: "assets/audio/Qué es esto.mp3"},
];

let currentIndex = 0;
let isPlaying = false;
const audio = new Audio();
audio.loop = false;

// Llenar menú
songsList.forEach((song, index) => {
    const songDiv = document.createElement("div");
    songDiv.textContent = `${song.title} - ${song.artist}`;
    songDiv.addEventListener("click", () => {
        currentIndex = index;
        playSong();
        menuList.classList.remove("show");
    });
    menuList.appendChild(songDiv);
});

function playSong() {
    const song = songsList[currentIndex];
    audio.src = song.file;
    audio.play();
    playPauseIcon.src = "assets/img/pause.svg";
    isPlaying = true;

    handleErrorImages();
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
        handleErrorImages();
        handleKirbyEffect();
    } else {
        audio.play();
        playPauseIcon.src = "assets/img/pause.svg";
        isPlaying = true;
        handleErrorImages();
        handleKirbyEffect();
    }
}

musicBar.addEventListener("click", (e) => {
    if (e.target === menuBtn || menuBtn.contains(e.target)) return;
    togglePlayPause();
});

audio.addEventListener("ended", () => {
    currentIndex = (currentIndex + 1) % songsList.length;
    playSong();
});

// ============================
// 🔥 IMÁGENES DE ERROR
// ============================
let error1El = null;

function handleErrorImages() {
    const song = songsList[currentIndex];

    let errorLeftEl = null;
    let errorRightEl = null;

    function handleErrorImages() {
    const song = songsList[currentIndex];

    if (song.title === "¿Perdón?" && isPlaying) {
        // Imagen a la izquierda del reproductor
        if (!errorLeftEl) {
            errorLeftEl = document.createElement("img");
            errorLeftEl.src = "assets/img/error1.gif";
            errorLeftEl.style.position = "fixed";
            errorLeftEl.style.bottom = "90px";
            errorLeftEl.style.left = (musicBar.offsetLeft - 90) + "px";
            errorLeftEl.style.width = "80px";
            errorLeftEl.style.zIndex = "999";
            document.body.appendChild(errorLeftEl);
        }

        // Imagen a la derecha del reproductor
        if (!errorRightEl) {
            errorRightEl = document.createElement("img");
            errorRightEl.src = "assets/img/error1.gif";
            errorRightEl.style.position = "fixed";
            errorRightEl.style.bottom = "90px";
            errorRightEl.style.left = (musicBar.offsetLeft + musicBar.offsetWidth + 10) + "px";
            errorRightEl.style.width = "80px";
            errorRightEl.style.zIndex = "999";
            document.body.appendChild(errorRightEl);
        }

        document.body.style.backgroundImage = "url('assets/img/error3.jpg')";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
    } else {
        if (errorLeftEl) { errorLeftEl.remove(); errorLeftEl = null; }
        if (errorRightEl) { errorRightEl.remove(); errorRightEl = null; }
        document.body.style.backgroundImage = "none";
    }
}

}

// ============================
// 🌟 EFECTO KIRBY
// ============================
function handleKirbyEffect() {
    const song = songsList[currentIndex];
    if (song.title === "Kirby" && isPlaying) {
        if (detailContainerEl) detailContainerEl.style.backgroundColor = "rgba(255,255,255,0.3)";
    } else {
        if (detailContainerEl) detailContainerEl.style.backgroundColor = "";
    }
}

// ============================
// 🔽 AJUSTAR BARRA SOBRE EL FOOTER
// ============================
function adjustMusicBarPosition() {
    const footerRect = document.querySelector("footer").getBoundingClientRect();
    const backBtnRect = backBtn.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    musicBar.style.bottom = (windowHeight - backBtnRect.bottom + 20) + "px";
}

window.addEventListener("scroll", adjustMusicBarPosition);
window.addEventListener("resize", adjustMusicBarPosition);
adjustMusicBarPosition();

// 🎵 Menú hamburguesa funcional
const hamburgerBtn = document.getElementById("hamburger-btn");
const songList = document.getElementById("song-list");
const footer = document.querySelector("footer");

// Mostrar/ocultar lista al hacer clic
hamburgerBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  songList.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!songList.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    songList.classList.remove("show");
  }
});

// Reproducir canción al hacer clic
songList.querySelectorAll("li").forEach((item) => {
  item.addEventListener("click", () => {
    const index = parseInt(item.getAttribute("data-index"));
    currentIndex = index;
    playSong();
    songList.classList.remove("show");
  });
});

// Ajustar posición para no tapar el botón volver ni el footer
function adjustMusicBarPosition() {
  const backRect = backBtn.getBoundingClientRect();
  const footerRect = footer.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  const overlapBack = backRect.top < windowHeight && backRect.bottom > windowHeight - 80;
  const overlapFooter = footerRect.top < windowHeight && footerRect.bottom > windowHeight - 80;

  if (overlapBack || overlapFooter) {
    musicBar.style.position = "absolute";
    musicBar.style.bottom = "100px";
  } else {
    musicBar.style.position = "fixed";
    musicBar.style.bottom = "20px";
  }
}

window.addEventListener("scroll", adjustMusicBarPosition);
window.addEventListener("resize", adjustMusicBarPosition);
adjustMusicBarPosition();
