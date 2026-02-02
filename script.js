// 1. VARIABLES GLOBALES E INICIO
document.getElementById('fecha-actual').innerText = new Date().toLocaleDateString();
let durmiendo = localStorage.getItem('horaInicio') !== null;
let tomandoLeche = localStorage.getItem('inicioLeche') !== null;
let rangoActual = 24; // Por defecto 24 horas

// 2. GUARDADO GENÉRICO
function guardarDato(obj) {
    obj.id = Date.now();
    obj.fecha = new Date().toLocaleString();
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    datos.push(obj);
    localStorage.setItem('bebeData', JSON.stringify(datos));
    
    actualizarVista(); 
    actualizarDashboardLeche();
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
    } else {
        const inicio = new Date(localStorage.getItem('inicioLeche'));
        const ozIniciales = parseFloat(localStorage.getItem('ozIniciales'));
        const ozRestantes = parseFloat(inputFinal.value);
        const fin = new Date();

        if (isNaN(ozRestantes)) { alert("Escribe cuántas onzas quedaron."); return; }

        const duracionMinutos = Math.round((fin - inicio) / 1000 / 60);
        const ozConsumidas = (ozIniciales - ozRestantes).toFixed(1);
        const nota = inputNota.value.trim();

        if (ozConsumidas < 0) { alert("Error: Las onzas restantes son mayores."); return; }

        let detalleFinal = `${ozConsumidas} oz (Dura: ${duracionMinutos} min)`;
        if (nota) detalleFinal += ` - Nota: ${nota}`;

        guardarDato({ tipo: "Leche", detalle: detalleFinal });
        localStorage.removeItem('inicioLeche');
        localStorage.removeItem('ozIniciales');
        tomandoLeche = false;
        inputFinal.value = "";
        inputNota.value = "";
    }
    actualizarBotonesLeche();
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

// 4. PAÑALES Y SUEÑO (FUNCIONES SIMPLIFICADAS)
function cambiarVistaPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    document.getElementById('opcionPipi').style.display = tipo === 'pipi' ? 'block' : 'none';
    document.getElementById('opcionPopo').style.display = tipo === 'popo' ? 'block' : 'none';
}

function guardarPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    const nota = document.getElementById('notaPañal').value;
    let det = (tipo === 'pipi') ? "Pipi: " + ["Poco", "Medio", "Lleno"][document.getElementById('nivelPipi').value - 1] : "Popo: " + ["Líquida", "Pastosa", "Dura", "Sangre"][document.getElementById('texturaPopo').value - 1];
    if (nota) det += ` - Nota: ${nota}`;
    guardarDato({ tipo: "Pañal", detalle: det });
    document.getElementById('notaPañal').value = "";
}

function toggleSueno() {
    if (!durmiendo) {
        localStorage.setItem('horaInicio', new Date().toISOString());
        durmiendo = true;
    } else {
        const inicio = new Date(localStorage.getItem('horaInicio'));
        const duracion = Math.round((new Date() - inicio) / 1000 / 60);
        let det = `Durmió ${duracion} min (${document.getElementById('estadoDespertar').value})`;
        if (document.getElementById('notaSueno').value) det += ` - Nota: ${document.getElementById('notaSueno').value}`;
        guardarDato({ tipo: "Sueño", detalle: det });
        localStorage.removeItem('horaInicio');
        durmiendo = false;
        document.getElementById('notaSueno').value = ""; 
    }
    actualizarBotonesSueno();
}

function actualizarBotonesSueno() {
    const btn = document.getElementById('btn-sueno');
    const det = document.getElementById('detalle-despertar');
    btn.innerText = durmiendo ? "¡Despertó! ☀️" : "Empezó a dormir 🌙";
    btn.style.backgroundColor = durmiendo ? "#f59e0b" : "#4a5568";
    det.style.display = durmiendo ? "block" : "none";
}

// 5. DASHBOARD Y FILTROS (EL CORAZÓN DE LA APP)
function filtrarDash(rango) {
    rangoActual = rango;
    actualizarDashboardLeche();
}

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
        const fechaToma = new Date(d.fecha);
        
        if (rangoActual === 24) {
            return (ahora - fechaToma) / (1000 * 60 * 60) <= 24;
        } else if (rangoActual === 'semana') {
            return (ahora - fechaToma) / (1000 * 60 * 60 * 24) <= 7;
        } else if (rangoActual === 'mes') {
            return (ahora - fechaToma) / (1000 * 60 * 60 * 24) <= 30;
        } else if (rangoActual === 'rango' && fInicio && fFin) {
            const inicio = new Date(fInicio + "T00:00:00");
            const fin = new Date(fFin + "T23:59:59");
            return fechaToma >= inicio && fechaToma <= fin;
        }
        return false;
    });

    let totalOz = 0;
    tomasFiltradas.forEach(t => {
        const num = parseFloat(t.detalle);
        if (!isNaN(num)) totalOz += num;
    });

    // Actualizar Biberón
    document.getElementById('total-onzas-texto').innerText = totalOz.toFixed(1) + " oz";
    const filler = document.getElementById('bottle-filler');
    const rangoTxt = document.getElementById('rango-texto');

    let meta = 30;
    if (rangoActual === 'semana') meta = 210;
    if (rangoActual === 'mes') meta = 900;
    if (rangoActual === 'rango' && fInicio && fFin) {
        const dias = Math.ceil((new Date(fFin) - new Date(fInicio)) / (86400000)) + 1;
        meta = dias * 30;
    }

    if (filler) {
        const porcentaje = Math.min((totalOz / meta) * 100, 100);
        filler.style.height = porcentaje + "%";
        filler.style.background = totalOz > 0 ? "#ffffff" : "transparent";
    }

    if (rangoTxt) {
        if (rangoActual === 'rango' && fInicio) rangoTxt.innerText = `Del ${fInicio} al ${fFin}`;
        else rangoTxt.innerText = (rangoActual === 24) ? "Últimas 24 horas" : (rangoActual === 'semana' ? "Última semana" : "Último mes");
    }
}

// 6. NAVEGACIÓN Y OTROS
function cambiarPestaña(pestaña) {
    const tabs = ['pestaña-registro', 'pestaña-dashboards', 'pestaña-historial'];
    const btns = ['tab-registro', 'tab-dashboards', 'tab-historial'];
    
    tabs.forEach(t => document.getElementById(t).style.display = 'none');
    btns.forEach(b => document.getElementById(b).classList.remove('active-tab'));

    document.getElementById('pestaña-' + pestaña).style.display = 'block';
    document.getElementById('tab-' + pestaña).classList.add('active-tab');

    if (pestaña === 'dashboards') actualizarDashboardLeche();
    if (pestaña === 'historial') actualizarVista();
}

function actualizarVista() {
    const lista = document.getElementById('listaRegistros');
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    lista.innerHTML = datos.slice().reverse().map(d => `
        <div class="registro-item">
            <small>${d.fecha}</small><br>
            <strong>${d.tipo}:</strong> ${d.detalle}
            <button onclick="borrarRegistro(${d.id})" style="float:right; color:red; background:none; border:none;">🗑️</button>
        </div>
    `).join('');
}

function borrarRegistro(id) {
    if(confirm("¿Borrar?")) {
        let datos = JSON.parse(localStorage.getItem('bebeData')).filter(d => d.id !== id);
        localStorage.setItem('bebeData', JSON.stringify(datos));
        actualizarVista();
        actualizarDashboardLeche();
    }
}

function toggleMenu() {
    const s = document.getElementById("sidebar");
    s.style.width = (s.style.width === "250px") ? "0px" : "250px";
}

function cambiarTema(tema) {
    const p = {
        'original': ['#f0f2f5', '#6366f1'], 'rosa': ['#fff5f7', '#ed64a6'],
        'bosque': ['#f0fff4', '#48bb78'], 'noche': ['#1a202c', '#a0aec0']
    };
    document.documentElement.style.setProperty('--bg-color', p[tema][0]);
    document.documentElement.style.setProperty('--primary-color', p[tema][1]);
    localStorage.setItem('temaPreferido', tema);
}

window.onload = () => {
    actualizarBotonesSueno();
    actualizarBotonesLeche();
    if (localStorage.getItem('temaPreferido')) cambiarTema(localStorage.getItem('temaPreferido'));
};
