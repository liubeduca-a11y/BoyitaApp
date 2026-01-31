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
        localStorage.setItem('horaInicio', new Date().toISOString());
        durmiendo = true;
    } else {
        const inicio = new Date(localStorage.getItem('horaInicio'));
        const duracion = Math.round((new Date() - inicio) / 1000 / 60);
        const estado = document.getElementById('estadoDespertar').value;
        guardarDato({ tipo: "Sueño", detalle: `Durmió ${duracion} min (${estado})` });
        localStorage.removeItem('horaInicio');
        durmiendo = false;
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
