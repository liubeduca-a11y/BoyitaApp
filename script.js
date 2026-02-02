// 1. INICIO
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
    actualizarDashboardLeche(); // Mantiene el biberón al día al guardar
}

// 3. LECHE Y PAÑALES
function toggleLeche() {
    const btn = document.getElementById('btn-leche');
    const detalleDiv = document.getElementById('detalle-toma');
    const inputFinal = document.getElementById('oz-final');
    const inputNota = document.getElementById('notaLeche');

    if (!tomandoLeche) {
        // --- INICIO DE LA TOMA ---
        const ozIniciales = prompt("¿Con cuántas onzas inicia el biberón?", "4");
        
        if (ozIniciales === null || ozIniciales === "") return; // Cancelado

        localStorage.setItem('inicioLeche', new Date().toISOString());
        localStorage.setItem('ozIniciales', ozIniciales);
        
        tomandoLeche = true;
        btn.innerText = "Finalizar Toma 🏁";
        btn.style.backgroundColor = "#10b981";
        detalleDiv.style.display = "block";
    } else {
        // --- FIN DE LA TOMA ---
        const inicio = new Date(localStorage.getItem('inicioLeche'));
        const ozIniciales = parseFloat(localStorage.getItem('ozIniciales'));
        const ozRestantes = parseFloat(inputFinal.value);
        const fin = new Date();

        if (isNaN(ozRestantes)) {
            alert("Por favor escribe cuántas onzas quedaron.");
            return;
        }

        // Cálculos
        const duracionMinutos = Math.round((fin - inicio) / 1000 / 60);
        const ozConsumidas = (ozIniciales - ozRestantes).toFixed(1);
        const nota = inputNota.value.trim();

        if (ozConsumidas < 0) {
            alert("¡Error! Las onzas restantes no pueden ser mayores a las iniciales.");
            return;
        }

        // Guardar
        let detalleFinal = `${ozConsumidas} oz (Dura: ${duracionMinutos} min)`;
        if (nota) detalleFinal += ` - Nota: ${nota}`;

        guardarDato({ tipo: "Leche", detalle: detalleFinal });

        // Resetear
        localStorage.removeItem('inicioLeche');
        localStorage.removeItem('ozIniciales');
        tomandoLeche = false;
        
        btn.innerText = "Iniciar Toma 🍼";
        btn.style.backgroundColor = "#6366f1";
        detalleDiv.style.display = "none";
        inputFinal.value = "";
        inputNota.value = "";
    }
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

// 4. SUEÑO
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

// 5. HISTORIAL Y EDICIÓN
function actualizarVista() {
    const lista = document.getElementById('listaRegistros');
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    
    lista.innerHTML = datos.slice().reverse().map(d => `
        <div class="registro-item" id="reg-${d.id}">
            <div id="content-${d.id}">
                <small>${d.fecha}</small><br>
                <strong>${d.tipo}:</strong> <span>${d.detalle}</span>
                <div style="margin-top: 8px;">
                    <button onclick="habilitarEdicion(${d.id})" style="color: #6366f1; border: none; background: none; font-size: 13px; cursor: pointer; padding: 0; margin-right: 15px;">✏️ Editar</button>
                    <button onclick="borrarRegistro(${d.id})" style="color: #f56565; border: none; background: none; font-size: 13px; cursor: pointer; padding: 0;">🗑️ Borrar</button>
                </div>
            </div>
            <div id="form-${d.id}" style="display:none;">
                <input type="text" id="input-${d.id}" value="${d.detalle}" style="width: 80%; padding: 5px; border: 1px solid #6366f1; border-radius: 5px;">
                <button onclick="guardarEdicion(${d.id})" style="background: #10b981; color: white; border: none; border-radius: 5px; padding: 5px 10px;">✅</button>
                <button onclick="actualizarVista()" style="background: #ccc; color: white; border: none; border-radius: 5px; padding: 5px 10px;">❌</button>
            </div>
        </div>
    `).join('');
}

// Añade esto donde tienes tus otras llamadas iniciales (como actualizarVista)
function actualizarBotonesLeche() {
    const btn = document.getElementById('btn-leche');
    const detalle = document.getElementById('detalle-toma');
    if(tomandoLeche) {
        btn.innerText = "Finalizar Toma 🏁";
        btn.style.backgroundColor = "#10b981";
        detalle.style.display = "block";
    }
}

// Y llámala al final del archivo
actualizarBotonesLeche();

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
    
    datos = datos.map(d => {
        if (d.id === id) { return { ...d, detalle: nuevoDetalle }; }
        return d;
    });
    
    localStorage.setItem('bebeData', JSON.stringify(datos));
    actualizarVista();
    actualizarDashboardLeche();
}

// 6. DASHBOARDS Y NAVEGACIÓN
function cambiarPestaña(pestaña) {
    console.log("Cambiando a:", pestaña); // Esto nos dirá en la consola si el clic funciona

    const reg = document.getElementById('pestaña-registro');
    const dash = document.getElementById('pestaña-dashboards');
    const hist = document.getElementById('pestaña-historial');

    const btnReg = document.getElementById('tab-registro');
    const btnDash = document.getElementById('tab-dashboards');
    const btnHist = document.getElementById('tab-historial');

    // Verificación de seguridad: Si alguno no existe, no sigas para no romper la app
    if (!reg || !dash || !hist) {
        console.error("Error: No se encontró una de las pestañas en el HTML");
        return;
    }

    // Ocultar todo
    reg.style.display = 'none';
    dash.style.display = 'none';
    hist.style.display = 'none';

    btnReg.classList.remove('active-tab');
    btnDash.classList.remove('active-tab');
    btnHist.classList.remove('active-tab');

    // Mostrar la seleccionada
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
        actualizarVista(); // Esto es lo que "dibuja" la lista
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

// INICIALIZACIÓN
actualizarVista();
actualizarBotonesSueno();
actualizarDashboardLeche();

function guardarDato(obj) {
    obj.id = Date.now();
    obj.fecha = new Date().toLocaleString();
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    datos.push(obj);
    localStorage.setItem('bebeData', JSON.stringify(datos));
    
    // Esto actualiza las pestañas "fantasma" aunque no las estés viendo
    actualizarVista(); 
    actualizarDashboardLeche();
}
