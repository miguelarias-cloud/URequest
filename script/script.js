const ACCOUNT_STORAGE_KEY = "urequest.accounts.v1";
const AD_STORAGE_KEY = "urequest.ads.v1";
const SESSION_STORAGE_KEY = "urequest.session.v1";
const PASSWORD_HASH_ITERATIONS = 150000;
const INSTITUTIONAL_EMAIL = /^[a-z0-9._%+-]+@autonoma\.edu\.co$/i;

function readStoredJson(storage, key, fallback) {
    const rawValue = storage.getItem(key);
    return rawValue === null ? fallback : JSON.parse(rawValue);
}

function encodeBase64(bytes) {
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

function decodeBase64(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function hashPassword(password, salt) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error("Este navegador no permite proteger contraseñas en esta página. Ábrela desde localhost o HTTPS.");
    }

    const passwordKey = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const derivedBits = await window.crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: PASSWORD_HASH_ITERATIONS,
            hash: "SHA-256"
        },
        passwordKey,
        256
    );
    return encodeBase64(new Uint8Array(derivedBits));
}

function showMessage(element, message, isError) {
    if (!element) {
        return;
    }
    element.textContent = message;
    element.classList.toggle("mensaje-error", Boolean(isError));
    element.classList.toggle("mensaje-exito", Boolean(message) && !isError);
}

function initAuthenticationPage() {
    const loginForm = document.getElementById("form_login");
    const registerForm = document.getElementById("form_registro");
    const message = document.getElementById("mensaje_auth");
    const title = document.getElementById("titulo_auth");

    const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) {
        try {
            const existingUser = JSON.parse(storedSession);
            if (existingUser && INSTITUTIONAL_EMAIL.test(existingUser.email || "")) {
                window.location.replace("index.html");
                return;
            }
        } catch (error) {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            showMessage(message, "La sesión anterior no era válida. Inicia sesión de nuevo.", true);
        }
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }

    function showForm(mode) {
        const registering = mode === "register";
        loginForm.hidden = registering;
        registerForm.hidden = !registering;
        title.textContent = registering ? "Crea tu cuenta URequest" : "Bienvenido a URequest";
        showMessage(message, "", false);
    }

    document.getElementById("mostrar_registro").addEventListener("click", () => showForm("register"));
    document.getElementById("mostrar_login").addEventListener("click", () => showForm("login"));

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const email = String(formData.get("correo") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "");

        try {
            if (!INSTITUTIONAL_EMAIL.test(email)) {
                throw new Error("Usa tu correo institucional terminado en @autonoma.edu.co.");
            }

            const accounts = readStoredJson(localStorage, ACCOUNT_STORAGE_KEY, {});
            const account = accounts[email];
            if (!account) {
                throw new Error("No hay una cuenta local con ese correo. Crea una cuenta primero.");
            }

            const enteredHash = await hashPassword(password, decodeBase64(account.salt));
            if (enteredHash !== account.passwordHash) {
                throw new Error("El correo o la contraseña no coinciden.");
            }

            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
                email: account.email,
                name: account.name
            }));
            window.location.replace("index.html");
        } catch (error) {
            showMessage(message, error.message || "No se pudo iniciar sesión.", true);
        }
    });

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(registerForm);
        const name = String(formData.get("nombre") || "").trim();
        const email = String(formData.get("correo") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "");

        try {
            if (!name) {
                throw new Error("Escribe tu nombre.");
            }
            if (!INSTITUTIONAL_EMAIL.test(email)) {
                throw new Error("Usa un correo terminado exactamente en @autonoma.edu.co.");
            }
            if (password.length < 8) {
                throw new Error("La contraseña debe tener al menos 8 caracteres.");
            }

            const accounts = readStoredJson(localStorage, ACCOUNT_STORAGE_KEY, {});
            if (accounts[email]) {
                throw new Error("Ya existe una cuenta local con ese correo.");
            }

            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            accounts[email] = {
                email,
                name,
                salt: encodeBase64(salt),
                passwordHash: await hashPassword(password, salt)
            };
            localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ email, name }));
            window.location.replace("index.html");
        } catch (error) {
            showMessage(message, error.message || "No se pudo crear la cuenta.", true);
        }
    });
}

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function formatType(type) {
    const labels = {
        PRODUCTO: "Producto",
        SERVICIO: "Servicio",
        TRANSPORTE: "Transporte"
    };
    return labels[type] || "Anuncio";
}

function createLeafletRouteMap(container, points, options) {
    if (!window.L) {
        const fallback = document.createElement("div");
        fallback.className = "anuncio-mapa-fallback";
        fallback.textContent = "El mapa no está disponible sin conexión. La ruta sigue guardada en este navegador.";
        container.appendChild(fallback);
        return null;
    }

    const map = window.L.map(container, {
        scrollWheelZoom: Boolean(options && options.interactive),
        zoomControl: Boolean(options && options.interactive),
        attributionControl: true
    });

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    if (options && options.interactive) {
        map.setView([4.5709, -74.2973], 6);
    } else {
        const line = window.L.polyline(points, {
            color: "#075928",
            weight: 5
        }).addTo(map);
        points.forEach((point, index) => {
            window.L.circleMarker(point, {
                radius: index === 0 || index === points.length - 1 ? 6 : 4,
                color: "#ffffff",
                weight: 2,
                fillColor: "#075928",
                fillOpacity: 1
            }).addTo(map);
        });
        map.fitBounds(line.getBounds(), { padding: [14, 14], maxZoom: 15 });
    }
    return map;
}

function initApplicationPage() {
    let user;
    try {
        user = readStoredJson(sessionStorage, SESSION_STORAGE_KEY, null);
    } catch (error) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        window.location.replace("auth.html");
        return;
    }
    if (!user || !user.email) {
        window.location.replace("auth.html");
        return;
    }

    const page = document.body.dataset.page;
    const isOwnAdsPage = page === "mis-anuncios";
    const feed = document.getElementById("anuncios_feed");
    const status = document.getElementById("estado_listado");
    const dialog = document.getElementById("ventana");
    const detailDialog = document.getElementById("dialogo_detalle");
    const detailType = document.getElementById("detalle_tipo");
    const detailTitle = document.getElementById("detalle_titulo");
    const detailDescription = document.getElementById("detalle_descripcion");
    const detailAuthor = document.getElementById("detalle_autor");
    const detailDate = document.getElementById("detalle_fecha");
    const detailContact = document.getElementById("detalle_contacto");
    const detailRouteSection = document.getElementById("detalle_campo_ruta");
    const detailMapContainer = document.getElementById("mapa_detalle");
    const form = document.getElementById("form_anuncio");
    const routeSection = document.getElementById("campo_ruta");
    const routeStatus = document.getElementById("estado_ruta");
    const description = document.getElementById("desc");
    const counter = document.getElementById("contador");
    const message = document.getElementById("mensaje_formulario");
    const contactInput = document.getElementById("contacto_anuncio");
    const routePoints = [];
    let routeMap = null;
    let routeLayer = null;
    let detailMap = null;
    let activeFilterType = "TODOS";
    let activeSearchText = "";
    const searchDialog = document.getElementById("dialogo_busqueda");
    const searchForm = document.getElementById("form_busqueda");
    const searchInput = document.getElementById("buscar_anuncios");
    const filterTypeSelect = document.getElementById("filtro_tipo");
    const searchButtonText = document.getElementById("texto_busqueda");

    function getAds() {
        const ads = readStoredJson(localStorage, AD_STORAGE_KEY, []);
        if (!Array.isArray(ads)) {
            throw new Error("El almacenamiento local de anuncios no tiene un formato válido.");
        }
        const validTypes = ["PRODUCTO", "SERVICIO", "TRANSPORTE"];
        const validAds = ads.every((ad) => {
            if (!ad || typeof ad !== "object"
                    || typeof ad.id !== "string"
                    || typeof ad.titulo !== "string"
                    || !ad.titulo.trim()
                    || typeof ad.descripcion !== "string"
                    || typeof ad.contacto !== "string"
                    || typeof ad.autorCorreo !== "string"
                    || typeof ad.fechaPublicacion !== "string"
                    || !Number.isFinite(Date.parse(ad.fechaPublicacion))
                    || !validTypes.includes(ad.tipo)
                    || !Array.isArray(ad.ruta)) {
                return false;
            }
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ad.contacto);
            const phoneDigits = ad.contacto.replace(/\D/g, "").length;
            if (!isEmail && (phoneDigits < 7 || phoneDigits > 15)) {
                return false;
            }
            if (ad.tipo === "TRANSPORTE" && ad.ruta.length < 2) {
                return false;
            }
            if (ad.tipo !== "TRANSPORTE" && ad.ruta.length > 0) {
                return false;
            }
            return ad.ruta.every((point) => Array.isArray(point)
                && point.length === 2
                && Number.isFinite(point[0])
                && Number.isFinite(point[1])
                && point[0] >= -90
                && point[0] <= 90
                && point[1] >= -180
                && point[1] <= 180);
        });
        if (!validAds) {
            throw new Error("Hay anuncios guardados con datos incompletos o inválidos. No se pudieron mostrar.");
        }
        return ads;
    }

    function updateSearchSummary() {
        const typeLabels = {
            TODOS: "Todos los tipos",
            PRODUCTO: "Producto",
            SERVICIO: "Servicio",
            TRANSPORTE: "Transporte"
        };
        const parts = [];
        if (activeSearchText) {
            parts.push(`Buscar: ${activeSearchText}`);
        }
        if (activeFilterType !== "TODOS") {
            parts.push(typeLabels[activeFilterType]);
        }
        searchButtonText.textContent = parts.length
            ? parts.join(" · ")
            : "Buscar anuncios por título o descripción";
    }

    function openSearchDialog() {
        searchInput.value = activeSearchText;
        filterTypeSelect.value = activeFilterType;
        searchDialog.showModal();
        searchInput.focus();
    }

    function drawSelectedRoute() {
        if (!routeMap || !routeLayer) {
            return;
        }
        routeLayer.clearLayers();
        if (routePoints.length) {
            window.L.polyline(routePoints, {
                color: "#075928",
                weight: 5
            }).addTo(routeLayer);
            routePoints.forEach((point, index) => {
                window.L.circleMarker(point, {
                    radius: index === 0 || index === routePoints.length - 1 ? 7 : 5,
                    color: "#ffffff",
                    weight: 2,
                    fillColor: index === 0 ? "#0a7d3b" : "#075928",
                    fillOpacity: 1
                }).addTo(routeLayer);
            });
        }
        routeStatus.textContent = routePoints.length < 2
            ? `Puntos marcados: ${routePoints.length}. Añade al menos dos.`
            : `Ruta lista: ${routePoints.length} puntos marcados.`;
    }

    function initializeRouteMap() {
        if (routeMap) {
            window.setTimeout(() => routeMap.invalidateSize(), 100);
            return;
        }
        if (!window.L) {
            routeStatus.textContent = "No se pudo cargar el mapa. Revisa tu conexión a internet e inténtalo de nuevo.";
            return;
        }
        routeMap = createLeafletRouteMap(document.getElementById("mapa_ruta"), [], { interactive: true });
        routeLayer = window.L.layerGroup().addTo(routeMap);
        routeMap.on("click", (event) => {
            routePoints.push([
                Number(event.latlng.lat.toFixed(6)),
                Number(event.latlng.lng.toFixed(6))
            ]);
            drawSelectedRoute();
        });
        routeMap.whenReady(() => window.setTimeout(() => routeMap.invalidateSize(), 100));
        drawSelectedRoute();
    }

    function resetRoute() {
        routePoints.length = 0;
        drawSelectedRoute();
    }

    function updateTypeFields() {
        const selectedType = form.elements.tipo.value;
        const isTransport = selectedType === "TRANSPORTE";
        routeSection.hidden = !isTransport;
        if (isTransport) {
            initializeRouteMap();
        }
    }

    function openAdDetails(ad) {
        detailType.textContent = formatType(ad.tipo);
        detailTitle.textContent = ad.titulo;
        detailDescription.textContent = ad.descripcion;
        detailAuthor.textContent = `Publicado por ${ad.autorNombre || ad.autorCorreo || "Usuario"}`;

        const publishedAt = new Date(ad.fechaPublicacion);
        detailDate.textContent = Number.isNaN(publishedAt.getTime())
            ? ""
            : `Publicado el ${publishedAt.toLocaleDateString("es-CO")}`;
        detailContact.textContent = `Contacto: ${ad.contacto}`;
        detailRouteSection.hidden = ad.tipo !== "TRANSPORTE";
        detailMapContainer.replaceChildren();

        detailDialog.showModal();
        if (ad.tipo === "TRANSPORTE") {
            detailMap = createLeafletRouteMap(detailMapContainer, ad.ruta, { interactive: false });
            if (detailMap) {
                window.setTimeout(() => detailMap.invalidateSize(), 100);
            }
        }
    }

    function createAdCard(ad) {
        const card = document.createElement("article");
        card.className = "anuncio-card";
        card.tabIndex = 0;
        card.setAttribute("aria-label", `Ver detalle de ${ad.titulo}`);
        card.addEventListener("click", (event) => {
            if (event.target instanceof Element && event.target.closest("a, button")) {
                return;
            }
            openAdDetails(ad);
        });
        card.addEventListener("keydown", (event) => {
            if (event.target !== card || (event.key !== "Enter" && event.key !== " ")) {
                return;
            }
            event.preventDefault();
            openAdDetails(ad);
        });

        const content = document.createElement("div");
        content.className = "anuncio-card-contenido";

        const badge = document.createElement("span");
        badge.className = "anuncio-tipo";
        badge.textContent = formatType(ad.tipo);

        const title = document.createElement("h2");
        title.textContent = ad.titulo;

        const text = document.createElement("p");
        text.className = "anuncio-descripcion";
        text.textContent = ad.descripcion;

        const metadata = document.createElement("div");
        metadata.className = "anuncio-metadata";

        const author = document.createElement("span");
        author.textContent = `Publicado por ${ad.autorNombre || ad.autorCorreo || "Usuario"}`;

        const date = document.createElement("span");
        const publishedAt = new Date(ad.fechaPublicacion);
        date.textContent = Number.isNaN(publishedAt.getTime())
            ? ""
            : `Publicado el ${publishedAt.toLocaleDateString("es-CO")}`;

        metadata.append(author, date);
        content.append(badge, title, text, metadata);

        const contact = document.createElement("p");
        contact.className = "anuncio-contacto";
        contact.textContent = `Contacto: ${ad.contacto}`;
        content.appendChild(contact);
        card.appendChild(content);

        if (ad.tipo === "TRANSPORTE" && Array.isArray(ad.ruta) && ad.ruta.length >= 2) {
            const mapContainer = document.createElement("div");
            mapContainer.className = "anuncio-mapa";
            card.appendChild(mapContainer);
            const map = createLeafletRouteMap(mapContainer, ad.ruta, { interactive: false });
            if (map) {
                window.setTimeout(() => map.invalidateSize(), 0);
            }
        }
        return card;
    }

    function renderAds() {
        feed.replaceChildren();
        let ads;
        try {
            ads = getAds();
        } catch (error) {
            showMessage(status, error.message || "No se pudieron leer los anuncios.", true);
            return;
        }

        const searchTerm = normalizeText(activeSearchText);
        const visibleAds = ads.filter((ad) => {
            if (isOwnAdsPage && ad.autorCorreo !== user.email) {
                return false;
            }
            if (activeFilterType !== "TODOS" && ad.tipo !== activeFilterType) {
                return false;
            }
            const searchContent = normalizeText(`${ad.titulo} ${ad.descripcion}`);
            return !searchTerm || searchContent.includes(searchTerm);
        });

        showMessage(status, `${visibleAds.length} anuncio${visibleAds.length === 1 ? "" : "s"}`, false);
        if (!visibleAds.length) {
            const empty = document.createElement("p");
            empty.className = "vacio-anuncios";
            empty.textContent = isOwnAdsPage
                ? "Todavía no has publicado anuncios. Usa «Crear anuncio» para compartir el primero."
                : "No hay anuncios que coincidan. Puedes crear uno o probar otro filtro.";
            feed.appendChild(empty);
            return;
        }

        visibleAds.forEach((ad) => feed.appendChild(createAdCard(ad)));
    }

    function openAdDialog() {
        form.reset();
        contactInput.value = user.email;
        counter.textContent = "0/500";
        showMessage(message, "", false);
        resetRoute();
        updateTypeFields();
        dialog.showModal();
    }

    const menu = document.getElementById("menu_desplegable");
    const shade = document.getElementById("capa_superior");
    const openMenuButton = document.getElementById("boton_menu_desplegable");
    const closeMenuButton = document.getElementById("btn_cierre_menu_desplegable");
    const closeMenu = () => {
        if (menu) {
            menu.style.right = "-500px";
        }
        if (shade) {
            shade.style.backgroundColor = "rgba(136, 139, 141,0)";
            shade.classList.remove("activa");
        }
    };

    if (openMenuButton && menu) {
        openMenuButton.addEventListener("click", () => {
            menu.style.right = "0px";
            if (shade) {
                shade.style.backgroundColor = "rgba(136, 139, 141,0.4)";
                shade.classList.add("activa");
            }
        });
    }
    if (closeMenuButton) {
        closeMenuButton.addEventListener("click", closeMenu);
    }
    if (shade) {
        shade.addEventListener("click", closeMenu);
    }

    document.getElementById("btn_cerrar_sesion").addEventListener("click", () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        window.location.replace("auth.html");
    });
    document.getElementById("btn_crear_anuncio").addEventListener("click", openAdDialog);
    document.getElementById("cerrar").addEventListener("click", () => dialog.close());
    document.getElementById("cerrar_detalle").addEventListener("click", () => detailDialog.close());
    detailDialog.addEventListener("close", () => {
        if (detailMap) {
            detailMap.remove();
            detailMap = null;
        }
        detailMapContainer.replaceChildren();
    });
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });

    form.elements.tipo.forEach((radio) => {
        radio.addEventListener("change", updateTypeFields);
    });
    description.addEventListener("input", () => {
        counter.textContent = `${description.value.length}/500`;
    });
    document.getElementById("deshacer_ruta").addEventListener("click", () => {
        routePoints.pop();
        drawSelectedRoute();
    });
    document.getElementById("limpiar_ruta").addEventListener("click", resetRoute);
    document.getElementById("abrir_busqueda").addEventListener("click", openSearchDialog);
    document.getElementById("cancelar_busqueda").addEventListener("click", () => searchDialog.close());
    document.getElementById("limpiar_busqueda").addEventListener("click", () => {
        searchInput.value = "";
        filterTypeSelect.value = "TODOS";
    });
    searchDialog.addEventListener("click", (event) => {
        if (event.target === searchDialog) {
            searchDialog.close();
        }
    });
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        activeSearchText = searchInput.value.trim();
        activeFilterType = filterTypeSelect.value;
        updateSearchSummary();
        renderAds();
        searchDialog.close();
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const title = String(formData.get("titulo") || "").trim();
        const type = String(formData.get("tipo") || "");
        const contactValue = String(formData.get("contacto") || "").trim();
        const contactEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue);
        const contactPhone = contactValue.replace(/\D/g, "");

        if (!contactEmail && (contactPhone.length < 7 || contactPhone.length > 15)) {
            showMessage(message, "Ingresa un correo válido o un teléfono de 7 a 15 dígitos.", true);
            return;
        }
        if (type === "TRANSPORTE" && routePoints.length < 2) {
            showMessage(message, "Marca al menos dos puntos en el mapa para guardar la ruta.", true);
            routeStatus.textContent = "Falta marcar al menos dos puntos.";
            return;
        }

        const newAd = {
            id: window.crypto && window.crypto.randomUUID
                ? window.crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            titulo: title,
            tipo: type,
            descripcion: String(formData.get("descripcion") || "").trim(),
            contacto: contactValue,
            ruta: type === "TRANSPORTE" ? routePoints.slice() : [],
            autorCorreo: user.email,
            autorNombre: user.name,
            fechaPublicacion: new Date().toISOString()
        };

        try {
            const ads = getAds();
            ads.unshift(newAd);
            localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(ads));
        } catch (error) {
            showMessage(message, error.message || "No se pudo guardar el anuncio en este navegador.", true);
            return;
        }

        renderAds();
        dialog.close();
        form.reset();
        counter.textContent = "0/500";
        resetRoute();
        updateTypeFields();
    });

    updateSearchSummary();
    renderAds();
}

if (document.body.dataset.page === "auth") {
    initAuthenticationPage();
} else {
    initApplicationPage();
}
