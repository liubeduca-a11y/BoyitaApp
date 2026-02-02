// 1. VARIABLES GLOBALES E INICIO
document.getElementById('fecha-actual').innerText = new Date().toLocaleDateString();
let durmiendo = localStorage.getItem('horaInicio') !== null;
let tomandoLeche = localStorage.getItem('inicioLeche') !== null;

// 2. GUARDADO GENÉRICO
function guardarDato(obj) {
    obj.id = Date.now();
    obj.fecha = new Date().toLocaleString();
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    datos.push(obj);
    localStorage.setItem('bebeData', JSON.stringify(datos));
    
    actualizarVista(); 
let rangoActual = 24;

function filtrarPorRango() {
    rangoActual = 'rango';
    actualizarDashboardLeche();
}

function actualizarDashboardLeche() {
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    const ahora = new Date();
    const fInicio = document.getElementById('fecha-inicio').value;
    const fFin = document.getElementById('fecha-fin').value;

    let tomasFiltradas = datos.filter(d => {
        if (d.tipo !== "Leche") return false;
        
        // Convertimos la fecha del registro (que es string) a objeto Date
        const fechaToma = new Date(d.fecha.split(',')[0].split('/').reverse().join('-'));
        
        if (rangoActual === 24) {
            const unDiaAtras = new Date(ahora.getTime() - (24 * 60 * 60 * 1000));
            return new Date(d.fecha) >= unDiaAtras;
        } else if (rangoActual === 'semana') {
            const sieteDiasAtras = new Date(ahora.getTime() - (7 * 24 * 60 * 60 * 1000));
            return new Date(d.fecha) >= sieteDiasAtras;
        } else if (rangoActual === 'rango' && fInicio && fFin) {
            const inicio = new Date(fInicio);
            const fin = new Date(fFin);
            fin.setHours(23, 59, 59); // Incluir todo el día final
            return fechaToma >= inicio && fechaToma <= fin;
        }
        return false;
    });

    let totalOz = 0;
    tomasFiltradas.forEach(t => {
        // Extraemos solo el número del detalle (ej: "3.5 oz" -> 3.5)
        const num = parseFloat(t.detalle.split(' ')[0]);
        if (!isNaN(num)) totalOz += num;
    });

    // --- ACTUALIZACIÓN VISUAL ---
    const txt = document.getElementById('total-onzas-texto');
    const filler = document.getElementById('bottle-filler');
    const rangoTxt = document.getElementById('rango-texto');

    if (txt) txt.innerText = totalOz.toFixed(1) + " oz";
    
    if (filler) {
        // Meta dinámica: 30oz por día seleccionado
        let meta = 30;
        if (rangoActual === 'semana') meta = 210;
        if (rangoActual === 'rango' && fInicio && fFin) {
            const dias = Math.ceil((new Date(fFin) - new Date(fInicio)) / (1000 * 60 * 60 * 24)) + 1;
            meta = dias * 30;
        }
        
        const porcentaje = Math.min((totalOz / meta) * 100, 100);
        filler.style.height = porcentaje + "%";
        // Si hay leche, que se vea blanca y sólida
        filler.style.backgroundColor = totalOz > 0 ? "#ffffff" : "transparent";
    }

    if (rangoTxt) {
        if (rangoActual === 'rango') rangoTxt.innerText = `Periodo: ${fInicio} al ${fFin}`;
        else rangoTxt.innerText = rangoActual === 24 ? "Últimas 24 horas" : "Última semana";
    }
}
    
}

// 3. LECHE (BIBERÓN)
function toggleLeche() {
    const btn = document.getElementById('btn-leche');
    const detalleDiv = document.getElementById('detalle-toma');
    const inputFinal = document.getElementById('oz-final');
    const inputNota = document.getElementById('notaLeche');

    if (!tomandoLeche) {
        const ozIniciales = prompt("¿Con cuántas onzas inicia el biberón?", "4");
        if (ozIniciales === null || ozIniciales === "") return;

        localStorage.setItem('inicioLeche', new Date().toISOString());
        localStorage.setItem('ozIniciales', ozIniciales);
        tomandoLeche = true;
        actualizarBotonesLeche();
    } else {
        const inicio = new Date(localStorage.getItem('inicioLeche'));
        const ozIniciales = parseFloat(localStorage.getItem('ozIniciales'));
        const ozRestantes = parseFloat(inputFinal.value);
        const fin = new Date();

        if (isNaN(ozRestantes)) {
            alert("Por favor escribe cuántas onzas quedaron.");
            return;
        }

        const duracionMinutos = Math.round((fin - inicio) / 1000 / 60);
        const ozConsumidas = (ozIniciales - ozRestantes).toFixed(1);
        const nota = inputNota.value.trim();

        if (ozConsumidas < 0) {
            alert("¡Error! Las onzas restantes no pueden ser mayores a las iniciales.");
            return;
        }

        let detalleFinal = `${ozConsumidas} oz (Dura: ${duracionMinutos} min)`;
        if (nota) detalleFinal += ` - Nota: ${nota}`;

        guardarDato({ tipo: "Leche", detalle: detalleFinal });

        localStorage.removeItem('inicioLeche');
        localStorage.removeItem('ozIniciales');
        tomandoLeche = false;
        
        detalleDiv.style.display = "none";
        inputFinal.value = "";
        inputNota.value = "";
        actualizarBotonesLeche();
    }
}

function actualizarBotonesLeche() {
    const btn = document.getElementById('btn-leche');
    const detalle = document.getElementById('detalle-toma');
    if(tomandoLeche) {
        btn.innerText = "Finalizar Toma 🏁";
        btn.style.backgroundColor = "#10b981";
        detalle.style.display = "block";
    } else {
        btn.innerText = "Iniciar Toma 🍼";
        btn.style.backgroundColor = "#6366f1";
        detalle.style.display = "none";
    }
}

// 4. PAÑALES
function cambiarVistaPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    document.getElementById('opcionPipi').style.display = tipo === 'pipi' ? 'block' : 'none';
    document.getElementById('opcionPopo').style.display = tipo === 'popo' ? 'block' : 'none';
}

function guardarPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    const nota = document.getElementById('notaPañal').value;
    let det = "";

    if (tipo === 'pipi') {
        const nivel = document.getElementById('nivelPipi').value;
        const etiquetas = ["Poco", "Medio", "Lleno"];
        det = "Pipi: " + etiquetas[nivel - 1];
    } else {
        const textura = document.getElementById('texturaPopo').value;
        const etiquetas = ["Líquida", "Pastosa", "Dura", "Con Sangre"];
        det = "Popo: " + etiquetas[textura - 1];
    }

    if (nota) det += ` - Nota: ${nota}`;
    guardarDato({ tipo: "Pañal", detalle: det });
    document.getElementById('notaPañal').value = "";
}

// 5. SUEÑO
function toggleSueno() {
    const btn = document.getElementById('btn-sueno');
    const detalleDiv = document.getElementById('detalle-despertar');
    const inputNota = document.getElementById('notaSueno');
    const selectEstado = document.getElementById('estadoDespertar');

    if (!durmiendo) {
        localStorage.setItem('horaInicio', new Date().toISOString());
        durmiendo = true;
    } else {
        const horaInicioStr = localStorage.getItem('horaInicio');
        if (horaInicioStr) {
            const inicio = new Date(horaInicioStr);
            const fin = new Date();
            const duracion = Math.round((fin - inicio) / 1000 / 60);
            const estado = selectEstado.value;
            const nota = inputNota.value.trim();
            
            let det = `Durmió ${duracion} min (${estado})`;
            if (nota !== "") det += ` - Nota: ${nota}`;

            guardarDato({ tipo: "Sueño", detalle: det });
        }
        localStorage.removeItem('horaInicio');
        durmiendo = false;
        inputNota.value = ""; 
    }
    actualizarBotonesSueno();
}

function actualizarBotonesSueno() {
    const btn = document.getElementById('btn-sueno');
    const detalle = document.getElementById('detalle-despertar');
    if(durmiendo) {
        btn.innerText = "¡Despertó! ☀️";
        btn.style.backgroundColor = "#f59e0b";
        detalle.style.display = "block";
    } else {
        btn.innerText = "Empezó a dormir 🌙";
        btn.style.backgroundColor = "#4a5568";
        detalle.style.display = "none";
    }
}

// 6. HISTORIAL Y EDICIÓN
function actualizarVista() {
    const lista = document.getElementById('listaRegistros');
    if (!lista) return;
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    
    lista.innerHTML = datos.slice().reverse().map(d => `
        <div class="registro-item">
            <div id="content-${d.id}">
                <small>${d.fecha}</small><br>
                <strong>${d.tipo}:</strong> <span>${d.detalle}</span>
                <div style="margin-top: 8px;">
                    <button onclick="habilitarEdicion(${d.id})" style="color: #6366f1; border: none; background: none; font-size: 13px; cursor: pointer; padding: 0; margin-right: 15px;">✏️ Editar</button>
                    <button onclick="borrarRegistro(${d.id})" style="color: #f56565; border: none; background: none; font-size: 13px; cursor: pointer; padding: 0;">🗑️ Borrar</button>
                </div>
            </div>
            <div id="form-${d.id}" style="display:none;">
                <input type="text" id="input-${d.id}" value="${d.detalle}" style="width: 70%;">
                <button onclick="guardarEdicion(${d.id})">✅</button>
                <button onclick="actualizarVista()">❌</button>
            </div>
        </div>
    `).join('');
}

function borrarRegistro(id) {
    if(confirm("¿Seguro que quieres borrar este registro?")) {
        let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
        datos = datos.filter(d => d.id !== id);
        localStorage.setItem('bebeData', JSON.stringify(datos));
        actualizarVista();
        actualizarDashboardLeche();
    }
}

function habilitarEdicion(id) {
    document.getElementById(`content-${id}`).style.display = 'none';
    document.getElementById(`form-${id}`).style.display = 'block';
}

function guardarEdicion(id) {
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    const nuevoDetalle = document.getElementById(`input-${id}`).value;
    datos = datos.map(d => (d.id === id ? { ...d, detalle: nuevoDetalle } : d));
    localStorage.setItem('bebeData', JSON.stringify(datos));
    actualizarVista();
    actualizarDashboardLeche();
}

// 7. DASHBOARDS Y NAVEGACIÓN
function cambiarPestaña(pestaña) {
    const reg = document.getElementById('pestaña-registro');
    const dash = document.getElementById('pestaña-dashboards');
    const hist = document.getElementById('pestaña-historial');
    const btnReg = document.getElementById('tab-registro');
    const btnDash = document.getElementById('tab-dashboards');
    const btnHist = document.getElementById('tab-historial');

    if (!reg || !dash || !hist) return;

    reg.style.display = 'none';
    dash.style.display = 'none';
    hist.style.display = 'none';
    btnReg.classList.remove('active-tab');
    btnDash.classList.remove('active-tab');
    btnHist.classList.remove('active-tab');

    if (pestaña === 'registro') {
        reg.style.display = 'block';
        btnReg.classList.add('active-tab');
    } else if (pestaña === 'dashboards') {
        dash.style.display = 'block';
        btnDash.classList.add('active-tab');
        actualizarDashboardLeche();
    } else if (pestaña === 'historial') {
        hist.style.display = 'block';
        btnHist.classList.add('active-tab');
        actualizarVista();
    }
}

function actualizarDashboardLeche() {
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    const hoy = new Date().toLocaleDateString();
    const tomasHoy = datos.filter(d => d.tipo === "Leche" && d.fecha.includes(hoy));
    
    let totalOz = 0;
    tomasHoy.forEach(t => {
        const num = parseFloat(t.detalle);
        if (!isNaN(num)) totalOz += num;
    });

    const txt = document.getElementById('total-onzas-texto');
    const filler = document.getElementById('bottle-filler');
    if(txt) txt.innerText = totalOz + " oz";
    if(filler) {
        const porcentaje = Math.min((totalOz / 30) * 100, 100);
        filler.style.height = porcentaje + "%";
    }
}

// 8. MENÚ Y TEMAS (FUERA DE OTRAS FUNCIONES)
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    sidebar.style.width = (sidebar.style.width === "250px") ? "0px" : "250px";
}

function cambiarTema(tema) {
    const root = document.documentElement;
    const paletas = {
        'original': { bg: '#f0f2f5', primary: '#6366f1', accent: '#4a5568' },
        'rosa': { bg: '#fff5f7', primary: '#ed64a6', accent: '#702459' },
        'bosque': { bg: '#f0fff4', primary: '#48bb78', accent: '#22543d' },
        'noche': { bg: '#1a202c', primary: '#a0aec0', accent: '#f7fafc' }
    };
    const colores = paletas[tema];
    root.style.setProperty('--bg-color', colores.bg);
    root.style.setProperty('--primary-color', colores.primary);
    root.style.setProperty('--accent-color', colores.accent);
    localStorage.setItem('temaPreferido', tema);
    toggleMenu();
}

function descargarCSV() {
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    let csv = "Fecha,Tipo,Detalle\n" + datos.map(d => `"${d.fecha}","${d.tipo}","${d.detalle}"`).join("\n");
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "boyita_tracker.csv"; a.click();
}

function resetearApp() {
    if(confirm("¿Borrar todo?")) { localStorage.clear(); location.reload(); }
}

// 9. INICIALIZACIÓN FINAL
window.onload = () => {
    actualizarVista();
    actualizarBotonesSueno();
    actualizarBotonesLeche();
    actualizarDashboardLeche();
    const guardado = localStorage.getItem('temaPreferido');
    if (guardado) cambiarTema(guardado);
};
let rangoActual = 24; // Por defecto 24 horas

function filtrarDash(rango) {
    rangoActual = rango;
    document.getElementById('rango-texto').innerText = 
        rango === 24 ? "Últimas 24 horas" : `Último ${rango === 'semana' ? 'semana' : 'mes'}`;
    actualizarDashboardLeche();
}

function filtrarPorFecha(fechaSeleccionada) {
    rangoActual = 'fecha';
    document.getElementById('rango-texto').innerText = "Día: " + fechaSeleccionada;
    actualizarDashboardLeche(fechaSeleccionada);
}

function actualizarDashboardLeche(fechaEspecifica = null) {
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    const ahora = new Date();
    
    let tomasFiltradas = datos.filter(d => {
        if (d.tipo !== "Leche") return false;
        const fechaToma = new Date(d.fecha.split(',')[0].split('/').reverse().join('-')); // Ajuste de formato fecha
        
        if (rangoActual === 24) {
            const diffHoras = (ahora - new Date(d.fecha)) / (1000 * 60 * 60);
            return diffHoras <= 24;
        } else if (rangoActual === 'semana') {
            const diffDias = (ahora - new Date(d.fecha)) / (1000 * 60 * 60 * 24);
            return diffDias <= 7;
        } else if (rangoActual === 'mes') {
            const diffDias = (ahora - new Date(d.fecha)) / (1000 * 60 * 60 * 24);
            return diffDias <= 30;
        } else if (rangoActual === 'fecha') {
            return d.fecha.includes(fechaEspecifica.split('-').reverse().join('/'));
        }
        return false;
    });

    let totalOz = 0;
    tomasFiltradas.forEach(t => {
        const num = parseFloat(t.detalle);
        if (!isNaN(num)) totalOz += num;
    });

    // Actualizar visuales
    document.getElementById('total-onzas-texto').innerText = totalOz.toFixed(1) + " oz";
    const filler = document.getElementById('bottle-filler');
    if (filler) {
        // La meta cambia según el rango (30oz por día)
        let meta = 30;
        if (rangoActual === 'semana') meta = 210;
        if (rangoActual === 'mes') meta = 900;
        
        const porcentaje = Math.min((totalOz / meta) * 100, 100);
        filler.style.height = porcentaje + "%";
        // Si es leche, que sea blanca; si está vacío, que no se vea
        filler.style.background = totalOz > 0 ? "#f9f9f9" : "transparent";
    }
}
