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
    let det = (tipo === 'pipi') ? "Pipi" : "Popo";
    if(nota) det += ` - Nota: ${nota}`;
    guardarDato({ tipo: "Pañal", detalle: det });
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
        <div class="registro-item">
            <small>${d.fecha}</small><br>
            <strong>${d.tipo}:</strong> ${d.detalle}
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
