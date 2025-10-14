document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------
    // DECLARACIÓN DE VARIABLES (Común)
    // ------------------------------------
    // Variables para GSAP (Día/Noche)
    const themeContainer = document.querySelector('.theme-container');
    const body = document.body;
    let isNight = false;

    const dayBox = document.querySelector('.day-box');
    const nightBox = document.querySelector('.night-box');
    const sun = dayBox?.querySelector('.sol');
    const angemon = dayBox?.querySelector('.angemon');
    const moon = nightBox?.querySelector('.moon');
    const devimon = nightBox?.querySelector('.devimon');
    
    // Variables para la API y Eventos
    const loader = document.getElementById("loader");
    const gallery = document.getElementById("gallery");
    const reloadBtn = document.getElementById("reload-btn");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input"); 
    const gallerySection = document.getElementById('gallery-section'); 

    const API_URL = "https://digi-api.com/api/v1/digimon";


    // ------------------------------------
    // 1. LÓGICA DÍA/NOCHE (GSAP)
    // ------------------------------------
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
            // DÍA A NOCHE: INTERCAMBIO TOTAL
            tl.to(dayBox, {opacity: 0, pointerEvents: 'none', duration: duration / 2, ease: 'power2.in'}, 0)
              .to(nightBox, {opacity: 1, pointerEvents: 'auto', duration: duration / 2, ease: 'power2.out'}, 0);

            // Sol -> Luna
            tl.to(sun, {x: `+=${distance}`, opacity: 0, rotation: 180, duration: duration, ease: 'power1.inOut'}, 0)
              .fromTo(moon, {x: `+=${distance}`, opacity: 0, rotation: -180}, {x: '0%', opacity: 1, rotation: 0, duration: duration, ease: 'power1.inOut'}, 0);

            // Angemon -> Devimon
            tl.to(angemon, {x: `-=${distance}`, opacity: 0, scale: 0.9, duration: duration, ease: 'power1.inOut'}, 0)
              .fromTo(devimon, {x: `+=${distance}`, opacity: 0, scale: 0.9}, {x: '0%', opacity: 1, scale: 1, duration: duration, ease: 'power1.inOut'}, 0);
              
        } else {
            // NOCHE A DÍA: INTERCAMBIO TOTAL (Inverso)
            tl.to(nightBox, {opacity: 0, pointerEvents: 'none', duration: duration / 2, ease: 'power2.in'}, 0)
              .to(dayBox, {opacity: 1, pointerEvents: 'auto', duration: duration / 2, ease: 'power2.out'}, 0);

            // Luna -> Sol
            tl.to(moon, {x: `-=${distance}`, opacity: 0, rotation: 180, duration: duration, ease: 'power1.inOut'}, 0)
              .fromTo(sun, {x: `-=${distance}`, opacity: 0, rotation: -180}, {x: '0%', opacity: 1, rotation: 0, duration: duration, ease: 'power1.inOut'}, 0);

            // Devimon -> Angemon
            tl.to(devimon, {x: `+=${distance}`, opacity: 0, scale: 0.9, duration: duration, ease: 'power1.inOut'}, 0)
              .fromTo(angemon, {x: `+=${distance}`, opacity: 0, scale: 0.9}, {x: '0%', opacity: 1, scale: 1, duration: duration, ease: 'power1.inOut'}, 0);
        }
    }

    // ------------------------------------
    // 2. LÓGICA DE LA API Y RENDERIZADO
    // ------------------------------------
    
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

        // Evento click → Ir a la página de detalle
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", () => {
                const id = card.getAttribute("data-id");
                // window.location.href = `detail.html?id=${id}`; // Línea comentada para evitar error de navegación en entornos que no soportan múltiples páginas
                console.log(`Navegando al detalle del Digimon ID: ${id}`);
            });
        });
        
        // Llamar al setup del parallax SÓLO después de renderizar las tarjetas
        setupParallaxEffect(); 
    }

    // ------------------------------------
    // 3. LÓGICA DEL PARALLAX
    // ------------------------------------

    function setupParallaxEffect() {
        // Importante: Selecciona las tarjetas AQUÍ, después de que se han creado.
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

                    // Distancia del ratón al centro de la tarjeta, ajustada por la posición del contenedor
                    const distanceX = x - (cardCenterX - rect.left);
                    const distanceY = y - (cardCenterY - rect.top);

                    // Normalización de la distancia.
                    const moveX = distanceX / 40; 
                    const moveY = distanceY / 40; 
                    
                    // Usamos GSAP para animar el desplazamiento de forma suave
                    gsap.to(card, {
                        x: moveX,
                        y: moveY,
                        duration: 0.5, 
                        ease: "power2.out",
                        overwrite: "auto" 
                    });
                });
            });

            // Al salir del área de la galería, las tarjetas vuelven a su posición original
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


    // ------------------------------------
    // 4. MANEJADORES DE EVENTOS Y CARGA INICIAL
    // ------------------------------------
    
    // Carga inicial de Digimons
    loadDigimons(5); 

    // Recarga (Botón 'Cargar Digimon aleatorios')
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
