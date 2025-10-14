// ==========================================================
// 1. CÓDIGO DE ANIMACIÓN DÍA/NOCHE (GSAP) - ¡DIRECCIÓN CORREGIDA!
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------
    // LÓGICA DE DÍA/NOCHE
    // ------------------------------------
    const themeContainer = document.querySelector('.theme-container');
    const body = document.body;
    let isNight = false;

    const dayBox = document.querySelector('.day-box');
    const nightBox = document.querySelector('.night-box');
    const sun = dayBox?.querySelector('.sol');
    const angemon = dayBox?.querySelector('.angemon');
    const moon = nightBox?.querySelector('.moon');
    const devimon = nightBox?.querySelector('.devimon');
    
    // Solo si los elementos GSAP existen, añadimos el listener
    if (themeContainer && dayBox && nightBox) {
        themeContainer.addEventListener('click', () => {
            isNight = !isNight;
            body.classList.toggle('dark-theme', isNight);
            animateTheme(isNight);
        });
    } else {
        console.warn("Elementos del tema Día/Noche no encontrados. La animación no se activará.");
    }

    function animateTheme(toNight) {
        const duration = 0.8; 
        const tl = gsap.timeline();

        // ----------------------------------------------------
        // NOTA: Usamos el objeto de GSAP "position" para 
        // hacer que los elementos se muevan a la ubicación 
        // absoluta del otro elemento dentro del contenedor (.group).
        // ----------------------------------------------------

        if (toNight) {
            // --- DÍA A NOCHE: INTERCAMBIO TOTAL ---
            
            // 1. Visibilidad de las cajas (fondo)
            tl.to(dayBox, {opacity: 0, pointerEvents: 'none', duration: duration / 2, ease: 'power2.in'}, 0)
              .to(nightBox, {opacity: 1, pointerEvents: 'auto', duration: duration / 2, ease: 'power2.out'}, 0);

            // 2. Intercambio Sol -> Luna: El sol se mueve a la posición de la luna, y la luna a la del sol
            tl.to(sun, {x: '+=65%', opacity: 0, rotation: 180, duration: duration, ease: 'power1.inOut'}, 0) // Sol se mueve A LA DERECHA (posición de la luna)
              .fromTo(moon, {x: '-=65%', opacity: 0, rotation: -180}, {x: '0%', opacity: 1, rotation: 0, duration: duration, ease: 'power1.inOut'}, 0); // Luna aparece DESDE LA IZQUIERDA (posición del sol)

            // 3. Intercambio Angemon -> Devimon:
            // Angemon se mueve a la posición de Devimon
            tl.to(angemon, {x: '-=65%', opacity: 0, scale: 0.9, duration: duration, ease: 'power1.inOut'}, 0) // Angemon se mueve A LA IZQUIERDA (posición de Devimon)
            // Devimon aparece desde la posición de Angemon
              .fromTo(devimon, {x: '+=65%', opacity: 0, scale: 0.9}, {x: '0%', opacity: 1, scale: 1, duration: duration, ease: 'power1.inOut'}, 0); // Devimon aparece DESDE LA DERECHA (posición de Angemon)
              
        } else {
            // --- NOCHE A DÍA: INTERCAMBIO TOTAL (Inverso) ---

            // 1. Visibilidad de las cajas (fondo)
            tl.to(nightBox, {opacity: 0, pointerEvents: 'none', duration: duration / 2, ease: 'power2.in'}, 0)
              .to(dayBox, {opacity: 1, pointerEvents: 'auto', duration: duration / 2, ease: 'power2.out'}, 0);

            // 2. Intercambio Luna -> Sol: La luna se mueve a la posición del sol, y el sol a la de la luna
            tl.to(moon, {x: '-=65%', opacity: 0, rotation: 180, duration: duration, ease: 'power1.inOut'}, 0) // Luna se mueve A LA IZQUIERDA (posición del sol)
              .fromTo(sun, {x: '+=65%', opacity: 0, rotation: -180}, {x: '0%', opacity: 1, rotation: 0, duration: duration, ease: 'power1.inOut'}, 0); // Sol aparece DESDE LA DERECHA (posición de la luna)

            // 3. Intercambio Devimon -> Angemon:
            // Devimon se mueve a la posición de Angemon
            tl.to(devimon, {x: '+=65%', opacity: 0, scale: 0.9, duration: duration, ease: 'power1.inOut'}, 0) // Devimon se mueve A LA DERECHA (posición de Angemon)
            // Angemon aparece desde la posición de Devimon
              .fromTo(angemon, {x: '-=65%', opacity: 0, scale: 0.9}, {x: '0%', opacity: 1, scale: 1, duration: duration, ease: 'power1.inOut'}, 0); // Angemon aparece DESDE LA IZQUIERDA (posición de Devimon)
        }
    }

    // ------------------------------------
    // LÓGICA DE LA API Y RENDERIZADO (Se mantiene igual)
    // ------------------------------------
    
    // Variables de la API que causaban el error 'null'
    const loader = document.getElementById("loader");
    const gallery = document.getElementById("gallery");
    const reloadBtn = document.getElementById("reload-btn");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input"); 

    const API_URL = "https://digi-api.com/api/v1/digimon";

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // --- Cargar Digimons aleatorios (Función que ya tenías) ---
    async function loadDigimons(limit = 10) {
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


    // --- Buscar Digimon por nombre (Función que ya tenías) ---
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


    // --- Renderizar las tarjetas (Función que ya tenías) ---
    function renderDigimons(digimons) {
        if (!gallery) return;

        gallery.innerHTML = digimons.map((d, index) => {
            const image = d.images?.[0]?.href || "https://via.placeholder.com/150?text=No+Image";
            const level = d.levels?.[0]?.level || "Desconocido";

            // Aplica las clases de inclinación cíclicamente
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

        // Evento click → Ir a la página de detalle
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", () => {
                const id = card.getAttribute("data-id");
                window.location.href = `detail.html?id=${id}`;
            });
        });
    }

    // --- MANEJADORES DE EVENTOS Y CARGA INICIAL ---
    
    // Carga inicial
    loadDigimons(5);

    // Recarga (Botón 'Volver a generar?')
    if (reloadBtn) {
        reloadBtn.addEventListener("click", () => loadDigimons(5));
    }
    
    // Búsqueda (Formulario)
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