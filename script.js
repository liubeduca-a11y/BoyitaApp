// 1. VARIABLES GLOBALES E INICIO
document.getElementById('fecha-actual').innerText = new Date().toLocaleDateString();
let durmiendo = localStorage.getItem('horaInicio') !== null;
let tomandoLeche = localStorage.getItem('inicioLeche') !== null;
let rangoActual = 24; 

// 2. GUARDADO GENÉRICO
function guardarDato(obj) {
    obj.id = Date.now();
    obj.fechaISO = new Date().toISOString(); 
    obj.fechaTexto = new Date().toLocaleString();
    
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    datos.push(obj);
    localStorage.setItem('bebeData', JSON.stringify(datos));
    
    actualizarVista(); 
    actualizarDashboardLeche();
}

// 3. LECHE (BIBERÓN)
function toggleLeche() {
    const inputFinal = document.getElementById('oz-final');
    const inputNota = document.getElementById('notaLeche');

    if (!tomandoLeche) {
        const ozIniciales = prompt("¿Con cuántas onzas inicia el biberón?", "4");
        if (!ozIniciales) return;
        localStorage.setItem('inicioLeche', new Date().toISOString());
        localStorage.setItem('ozIniciales', ozIniciales);
        tomandoLeche = true;
    } else {
        const inicio = new Date(localStorage.getItem('inicioLeche'));
        const ozIniciales = parseFloat(localStorage.getItem('ozIniciales'));
        const ozRestantes = parseFloat(inputFinal.value);

        if (isNaN(ozRestantes)) { alert("Escribe cuántas onzas quedaron."); return; }

        const duracionMinutos = Math.round((new Date() - inicio) / 1000 / 60);
        const ozConsumidas = (ozIniciales - ozRestantes).toFixed(1);

        let detalleFinal = `${ozConsumidas} oz (${duracionMinutos} min)`;
        if (inputNota.value) detalleFinal += ` - ${inputNota.value.trim()}`;

        guardarDato({ tipo: "Leche", detalle: detalleFinal, valorOz: parseFloat(ozConsumidas) });
        
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
        btn.style.backgroundColor = "var(--primary-color)";
        detalle.style.display = "none";
    }
}

// 4. PAÑALES Y SUEÑO
function cambiarVistaPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    document.getElementById('opcionPipi').style.display = tipo === 'pipi' ? 'block' : 'none';
    document.getElementById('opcionPopo').style.display = tipo === 'popo' ? 'block' : 'none';
}

function guardarPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    const nota = document.getElementById('notaPañal').value;
    let det = (tipo === 'pipi') ? 
        "Pipi: " + ["Poco", "Medio", "Lleno"][document.getElementById('nivelPipi').value - 1] : 
        "Popo: " + ["Líquida", "Pastosa", "Dura", "Sangre"][document.getElementById('texturaPopo').value - 1];
    
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
    if (btn) {
        btn.innerText = durmiendo ? "¡Despertó! ☀️" : "Empezó a dormir 🌙";
        btn.style.backgroundColor = durmiendo ? "#f59e0b" : "#4a5568";
    }
    if (det) det.style.display = durmiendo ? "block" : "none";
}

// 5. DASHBOARD (Llamado desde tu código anterior)
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
        const fechaToma = d.fechaISO ? new Date(d.fechaISO) : new Date(d.fecha);
        
        if (rangoActual === 24) return (ahora - fechaToma) <= (24 * 60 * 60 * 1000);
        if (rangoActual === 'semana') return (ahora - fechaToma) <= (7 * 24 * 60 * 60 * 1000);
        if (rangoActual === 'mes') return (ahora - fechaToma) <= (30 * 24 * 60 * 60 * 1000);
        if (rangoActual === 'rango' && fInicio && fFin) {
            const inicio = new Date(fInicio + "T00:00:00");
            const fin = new Date(fFin + "T23:59:59");
            return fechaToma >= inicio && fechaToma <= fin;
        }
        return false;
    });

    let totalOz = tomasFiltradas.reduce((acc, t) => acc + (t.valorOz || parseFloat(t.detalle) || 0), 0);

    document.getElementById('total-onzas-texto').innerText = totalOz.toFixed(1) + " oz";
    
    const filler = document.getElementById('bottle-filler');
    let meta = 30;
    if (rangoActual === 'semana') meta = 210;
    if (rangoActual === 'mes') meta = 900;
    if (rangoActual === 'rango' && fInicio && fFin) {
        const dias = Math.ceil((new Date(fFin) - new Date(fInicio)) / 86400000) + 1;
        meta = dias * 30;
    }

    if (filler) {
        const porcentaje = Math.min((totalOz / meta) * 100, 100);
        filler.style.height = porcentaje + "%";
    }
}

// 6. NAVEGACIÓN Y VISTAS
function cambiarPestaña(pestaña) {
    const tabs = ['pestaña-registro', 'pestaña-dashboards', 'pestaña-historial'];
    const btns = ['tab-registro', 'tab-dashboards', 'tab-historial'];
    
    tabs.forEach(t => {
        const el = document.getElementById(t);
        if(el) el.style.display = t === 'pestaña-' + pestaña ? 'block' : 'none';
    });
    
    btns.forEach(b => {
        const el = document.getElementById(b);
        if(el) el.classList.toggle('active-tab', b === 'tab-' + pestaña);
    });

    if (pestaña === 'dashboards') actualizarDashboardLeche();
    if (pestaña === 'historial') actualizarVista();
}

function actualizarVista() {
    const lista = document.getElementById('listaRegistros');
    if (!lista) return;
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    
    lista.innerHTML = datos.slice().reverse().map(d => `
        <div class="registro-item" style="cursor: pointer; border-left: 5px solid var(--primary-color); margin-bottom: 10px; padding: 10px; background: white; border-radius: 8px;" onclick="editarRegistro(${d.id})">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <small style="color: #666;">${d.fechaTexto || d.fecha}</small><br>
                    <strong>${d.tipo}:</strong> ${d.detalle}
                </div>
                <button onclick="event.stopPropagation(); borrarRegistro(${d.id})" style="color:red; background:none; border:none; font-size: 20px; cursor:pointer;">🗑️</button>
            </div>
            <div style="font-size: 10px; color: var(--primary-color); margin-top: 5px; font-weight: bold;">📝 Toca para editar</div>
        </div>
    `).join('');
}

function borrarRegistro(id) {
    if(confirm("¿Estás seguro de que quieres eliminar este registro?")) {
        let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
        datos = datos.filter(d => d.id !== id);
        localStorage.setItem('bebeData', JSON.stringify(datos));
        
        actualizarVista();
        actualizarDashboardLeche(); // Muy importante para que el biberón baje si borras una toma
    }
}
// 7. MENÚ, TEMAS Y UTILIDADES
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

function descargarCSV() {
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    let csv = "Fecha,Tipo,Detalle\n" + datos.map(d => `"${d.fechaTexto}","${d.tipo}","${d.detalle}"`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'boyita_tracker.csv'; a.click();
}

function resetearApp() {
    if (confirm("¿Borrar TODO?")) { localStorage.clear(); location.reload(); }
}

window.onload = () => {
    actualizarBotonesSueno();
    actualizarBotonesLeche();
    if (localStorage.getItem('temaPreferido')) cambiarTema(localStorage.getItem('temaPreferido'));
};

function editarRegistro(id) {
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    const indice = datos.findIndex(d => d.id === id);
    if (indice === -1) return;

    const registro = datos[indice];
    
    // Abrimos ventana para editar el texto
    const nuevoDetalle = prompt(`Modificar registro de ${registro.tipo}:`, registro.detalle);
    
    // Si el usuario no canceló y escribió algo
    if (nuevoDetalle !== null && nuevoDetalle.trim() !== "") {
        datos[indice].detalle = nuevoDetalle;
        
        // Si es leche, intentamos detectar si cambió el número de onzas para el biberón
        if (registro.tipo === "Leche") {
            const numeroDetectado = nuevoDetalle.match(/(\d+(\.\d+)?)/);
            if (numeroDetectado) {
                datos[indice].valorOz = parseFloat(numeroDetectado[0]);
            }
        }

        localStorage.setItem('bebeData', JSON.stringify(datos));
        actualizarVista();
        actualizarDashboardLeche(); // Esto actualiza el dibujo del biberón
    }
}
