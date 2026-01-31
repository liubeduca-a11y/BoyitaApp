// 1. INICIO
document.getElementById('fecha-actual').innerText = new Date().toLocaleDateString();
let durmiendo = localStorage.getItem('horaInicio') !== null;

// 2. GUARDADO GENÉRICO
function guardarDato(obj) {
    obj.id = Date.now();
    obj.fecha = new Date().toLocaleString();
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    datos.push(obj);
    localStorage.setItem('bebeData', JSON.stringify(datos));
    actualizarVista();
}

// 3. LECHE Y PAÑALES
function setOz(n) { document.getElementById('onzas').value = n; }

function guardarAlimento() {
    const oz = document.getElementById('onzas').value;
    const nota = document.getElementById('notaLeche').value;
    if(!oz) return alert("Escribe las onzas");
    guardarDato({ tipo: "Leche", detalle: `${oz} oz ${nota ? '('+nota+')' : ''}` });
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

    if (tipo === 'pipi') {
        // Obtenemos el valor del slider de pipi (1, 2 o 3)
        const nivel = document.getElementById('nivelPipi').value;
        const etiquetas = ["Poco", "Medio", "Lleno"];
        det = "Pipi: " + etiquetas[nivel - 1]; // nivel-1 porque los arrays empiezan en 0
    } else {
        // Obtenemos el valor del slider de popo (1 al 4)
        const textura = document.getElementById('texturaPopo').value;
        const etiquetas = ["Líquida", "Pastosa", "Dura", "Con Sangre"];
        det = "Popo: " + etiquetas[textura - 1];
    }

    if (nota) det += ` - Nota: ${nota}`;

    guardarDato({ tipo: "Pañal", detalle: det });
    
    // Limpiar la nota después de guardar
    document.getElementById('notaPañal').value = "";
}

// 4. SUEÑO
function toggleSueno() {
    if(!durmiendo) {
        // INICIO DEL SUEÑO
        localStorage.setItem('horaInicio', new Date().toISOString());
        durmiendo = true;
    } else {
        // FIN DEL SUEÑO (DESPERTAR)
        const inicio = new Date(localStorage.getItem('horaInicio'));
        const fin = new Date();
        const duracionMinutos = Math.round((fin - inicio) / 1000 / 60);
        
        // --- AQUÍ ESTÁ LA CORRECCIÓN ---
        const estado = document.getElementById('estadoDespertar').value;
        const notaAdicional = document.getElementById('notaSueno').value; // Capturamos la nota
        
        let detalleFinal = `Durmió ${duracionMinutos} min (${estado})`;
        if(notaAdicional) {
            detalleFinal += ` - Nota: ${notaAdicional}`; // La concatenamos al detalle
        }
        // -------------------------------

        guardarDato({ 
            tipo: "Sueño", 
            detalle: detalleFinal 
        });

        localStorage.removeItem('horaInicio');
        durmiendo = false;
        
        // Limpiamos el campo de notas para la próxima vez
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

// 5. HISTORIAL
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

// INICIO AL CARGAR
actualizarVista();
actualizarBotonesSueno();
// Función para eliminar un registro
function borrarRegistro(id) {
    if(confirm("¿Seguro que quieres borrar este registro?")) {
        let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
        datos = datos.filter(d => d.id !== id);
        localStorage.setItem('bebeData', JSON.stringify(datos));
        actualizarVista();
    }
}

// Función para mostrar el cuadrito de edición
function habilitarEdicion(id) {
    document.getElementById(`content-${id}`).style.display = 'none';
    document.getElementById(`form-${id}`).style.display = 'block';
}

// Función para guardar el cambio editado
function guardarEdicion(id) {
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    const nuevoDetalle = document.getElementById(`input-${id}`).value;
    
    datos = datos.map(d => {
        if (d.id === id) {
            return { ...d, detalle: nuevoDetalle };
        }
        return d;
    });
    
    localStorage.setItem('bebeData', JSON.stringify(datos));
    actualizarVista();
}
// Función para cambiar entre Registro y Dashboards
function cambiarPestaña(pestaña) {
    const reg = document.getElementById('pestaña-registro');
    const dash = document.getElementById('pestaña-dashboards');
    const btnReg = document.getElementById('tab-registro');
    const btnDash = document.getElementById('tab-dashboards');

    if (pestaña === 'registro') {
        reg.style.display = 'block';
        dash.style.display = 'none';
        btnReg.classList.add('active-tab');
        btnDash.classList.remove('active-tab');
    } else {
        reg.style.display = 'none';
        dash.style.display = 'block';
        btnReg.classList.remove('active-tab');
        btnDash.classList.add('active-tab');
        actualizarDashboardLeche(); // Se actualiza al entrar
    }
}

// La lógica del Biberón (Asegúrate de que tus registros de leche guarden el número al inicio)
function actualizarDashboardLeche() {
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    const hoy = new Date().toLocaleDateString();
    
    // Filtrar leche de hoy
    const tomasHoy = datos.filter(d => d.tipo === "Leche" && d.fecha.includes(hoy));
    
    let totalOz = 0;
    tomasHoy.forEach(t => {
        // Extraemos el número del detalle (ej: "2 oz" -> 2)
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
