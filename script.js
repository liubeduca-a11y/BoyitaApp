// Mostrar fecha de hoy
document.getElementById('fecha-actual').innerText = new Date().toLocaleDateString();

function mostrarOpcionesPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    document.getElementById('opcionPipi').style.display = tipo === 'pipi' ? 'block' : 'none';
    document.getElementById('opcionPopo').style.display = tipo === 'popo' ? 'block' : 'none';
}

function salvarEnMemoria(nuevo) {
    let historial = JSON.parse(localStorage.getItem('datosBebe')) || [];
    historial.push(nuevo);
    localStorage.setItem('datosBebe', JSON.stringify(historial));
    actualizarVista();
}

function guardarAlimento() {
    const oz = document.getElementById('onzas').value;
    if(!oz) return alert("Ingresa las onzas");
    salvarEnMemoria({ fecha: new Date().toLocaleString(), tipo: "Leche", detalle: oz + " oz" });
    document.getElementById('onzas').value = "";
}

function guardarPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    let detalle = "";
    if(tipo === 'pipi') {
        detalle = "Pipi - Nivel: " + document.getElementById('nivelPipi').value;
    } else {
        detalle = "Popo - Textura: " + document.getElementById('texturaPopo').value;
    }
    salvarEnMemoria({ fecha: new Date().toLocaleString(), tipo: "Pañal", detalle: detalle });
}

function guardarSueno() {
    const ini = document.getElementById('suenoInicio').value;
    const fin = document.getElementById('suenoFin').value;
    const est = document.getElementById('estadoDespertar').value;
    if(!ini || !fin) return alert("Faltan horas");
    salvarEnMemoria({ fecha: new Date().toLocaleString(), tipo: "Sueño", detalle: `De ${ini} a ${fin} (${est})` });
}

function guardarDigestion(tipo) {
    salvarEnMemoria({ fecha: new Date().toLocaleString(), tipo: "Digestión", detalle: tipo });
}

function actualizarVista() {
    const div = document.getElementById('listaRegistros');
    const datos = JSON.parse(localStorage.getItem('datosBebe')) || [];
    div.innerHTML = datos.reverse().map(r => `
        <div class="registro-item">
            <strong>${r.fecha}</strong><br>
            ${r.tipo}: ${r.detalle}
        </div>
    `).join('');
}

// Función para descargar en Excel (CSV)
function descargarDatos() {
    const datos = JSON.parse(localStorage.getItem('datosBebe')) || [];
    let csvContent = "data:text/csv;charset=utf-8,Fecha,Tipo,Detalle\n";
    datos.forEach(r => {
        csvContent += `${r.fecha},${r.tipo},${r.detalle}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_bebe.csv");
    document.body.appendChild(link);
    link.click();
}

actualizarVista();
