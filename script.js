// --- 1. ESTADO INICIAL Y VARIABLES ---
document.getElementById('fecha-actual').innerText = new Date().toLocaleDateString();
let durmiendo = localStorage.getItem('horaInicio') !== null;
let periodoActual = 24; 

// --- 2. NAVEGACIÓN ---
function mostrarSeccion(sec) {
    document.getElementById('seccion-registro').style.display = sec === 'registro' ? 'block' : 'none';
    document.getElementById('seccion-dashboard').style.display = sec === 'dashboard' ? 'block' : 'none';
    if(sec === 'dashboard') cambiarPeriodo(24);
}

// --- 3. FUNCIONES DE GUARDADO ---
function setOz(n) { document.getElementById('onzas').value = n; }

function guardarDato(obj) {
    obj.fecha = new Date().toLocaleString();
    obj.id = Date.now();
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    datos.push(obj);
    localStorage.setItem('bebeData', JSON.stringify(datos));
    actualizarVista();
}

function guardarAlimento() {
    const oz = document.getElementById('onzas').value;
    const nota = document.getElementById('notaLeche').value;
    if(!oz) return alert("Pon las onzas");
    guardarDato({ 
        tipo: "Leche", 
        detalle: `${oz} oz ${nota ? '('+nota+')' : ''}`, 
        valor: parseFloat(oz) 
    });
    document.getElementById('onzas').value = "";
    document.getElementById('notaLeche').value = "";
}

function cambiarVistaPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    document.getElementById('opcionPipi').style.display = tipo === 'pipi' ? 'block' : 'none';
    document.getElementById('opcionPopo').style.display = tipo === 'popo' ? 'block' : 'none';
}

function guardarPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    const nota = document.getElementById('notaPañal').value;
    let det = "";
    if(tipo === 'pipi') {
        const niveles = ["Poco", "Medio", "Lleno"];
        det = "Pipi: " + niveles[document.getElementById('nivelPipi').value - 1];
    } else {
        const texturas = ["Líquida", "Pastosa", "Dura", "Con Sangre"];
        det = "Popo: " + texturas[document.getElementById('texturaPopo').value - 1];
    }
    if(nota) det += ` - Nota: ${nota}`;
    guardarDato({ tipo: "Pañal", detalle: det });
    document.getElementById('notaPañal').value = "";
}

// --- 4. SUEÑO ---
function toggleSueno() {
    if(!durmiendo) {
        localStorage.setItem('horaInicio', new Date().toISOString());
        durmiendo = true;
    } else {
        const inicio = new Date(localStorage.getItem('horaInicio'));
        const fin = new Date();
        const estado = document.getElementById('estadoDespertar').value;
        const nota = document.getElementById('notaSueno').value;
        const duracion = Math.round((fin - inicio) / 1000 / 60);
        let det = `Durmió ${duracion} min (${estado})`;
        if(nota) det += ` - Nota: ${nota}`;
        guardarDato({ tipo: "Sueño", detalle: det });
        localStorage.removeItem('horaInicio');
        durmiendo = false;
        document.getElementById('notaSueno').value = "";
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

// --- 5. HISTORIAL Y EDICIÓN ---
function borrarRegistro(id) {
    if(confirm("¿Borrar este registro?")) {
        let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
        datos = datos.filter(d => d.id !== id);
        localStorage.setItem('bebeData', JSON.stringify(datos));
        actualizarVista();
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
}

function actualizarVista() {
    const lista = document.getElementById('listaRegistros');
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    lista.innerHTML = datos.slice().reverse().map(d => `
        <div class="registro-item" id="reg-${d.id}">
            <div id="content-${d.id}">
                <small>${d.fecha}</small><br>
                <strong>${d.tipo}:</strong> <span>${d.detalle}</span>
                <div class="edit-controls">
                    <button class="btn-edit" onclick="habilitarEdicion(${d.id})">✏️ Editar</button>
                    <button class="btn-delete" onclick="borrarRegistro(${d.id})">🗑️ Borrar</button>
                </div>
            </div>
            <div id="form-${d.id}" style="display:none;">
                <input type="text" id="input-${d.id}" value="${d.detalle}" class="edit-input">
                <button onclick="guardarEdicion(${d.id})">✅</button>
            </div>
        </div>
    `).join('');
}

// --- 6. DASHBOARD ---
function cambiarPeriodo(horas) {
    periodoActual = horas;
    document.querySelectorAll('.period-selector button').forEach(btn => btn.classList.remove('active-period'));
    const btnId = `btn-${horas}h`;
    if(document.getElementById(btnId)) document.getElementById(btnId).classList.add('active-period');
    actualizarCalculosDashboard();
}

function actualizarCalculosDashboard() {
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    const ahora = Date.now();
    const limite = ahora - (periodoActual * 60 * 60 * 1000);
    const filtrados = datos.filter(d => new Date(d.fecha).getTime() > limite);

    let totalOz = 0;
    let minSueno = 0;
    filtrados.forEach(d => {
        if(d.tipo === "Leche") totalOz += d.valor || 0;
        if(d.tipo === "Sueño") {
            const m = d.detalle.match(/(\d+) min/);
            if(m) minSueno += parseInt(m[1]);
        }
    });

    if(document.getElementById('total-onzas-texto')) document.getElementById('total-onzas-texto').innerText = totalOz + " oz";
    if(document.getElementById('stat-panales')) document.getElementById('stat-panales').innerText = filtrados.filter(d => d.tipo === "Pañal").length;
    if(document.getElementById('stat-sueno')) document.getElementById('stat-sueno').innerText = (minSueno/60).toFixed(1) + "h";

    const filler = document.getElementById('bottle-filler');
    if(filler) {
        let meta = (periodoActual / 24) * 32;
        filler.style.height = Math.min((totalOz/meta)*100, 100) + "%";
    }
}

// --- 7. EXPORTAR Y RESET ---
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

// INICIO
actualizarVista();
actualizarBotonesSueno();
