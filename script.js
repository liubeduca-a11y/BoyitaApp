// VARIABLES GLOBALES
let tiempoInicioSueno = localStorage.getItem('inicioSuenoTemp');

function sumarOnzas(cant) {
    document.getElementById('onzas').value = cant;
}

function mostrarOpcionesPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    document.getElementById('opcionPipi').style.display = tipo === 'pipi' ? 'block' : 'none';
    document.getElementById('opcionPopo').style.display = tipo === 'popo' ? 'block' : 'none';
}

function controlarSueno() {
    const ahora = new Date().toISOString();
    localStorage.setItem('inicioSuenoTemp', ahora);
    actualizarInterfazSueno();
}

function actualizarInterfazSueno() {
    const temp = localStorage.getItem('inicioSuenoTemp');
    const btn = document.getElementById('btn-sueno-accion');
    if(temp) {
        btn.innerText = "¡Está durmiendo! (Toca al despertar)";
        btn.style.backgroundColor = "#ed8936";
        document.getElementById('detalle-despertar').style.display = "block";
    } else {
        btn.innerText = "Iniciar Sueño 🌙";
        btn.style.backgroundColor = "#4a5568";
        document.getElementById('detalle-despertar').style.display = "none";
    }
}

function finalizarSueno() {
    const inicio = localStorage.getItem('inicioSuenoTemp');
    const fin = new Date().toISOString();
    const estado = document.getElementById('estadoDespertar').value;
    
    salvarEnMemoria({
        fecha: new Date().toLocaleString(),
        tipo: "Sueño",
        detalle: `Durmió de ${new Date(inicio).toLocaleTimeString()} a ${new Date(fin).toLocaleTimeString()} (${estado})`,
        timestamp: new Date().getTime(),
        onzas: 0
    });
    
    localStorage.removeItem('inicioSuenoTemp');
    actualizarInterfazSueno();
}

function salvarEnMemoria(nuevo) {
    let historial = JSON.parse(localStorage.getItem('datosBebe')) || [];
    historial.push(nuevo);
    localStorage.setItem('datosBebe', JSON.stringify(historial));
    actualizarVista();
}

function eliminarRegistro(index) {
    if(confirm("¿Eliminar este registro?")) {
        let historial = JSON.parse(localStorage.getItem('datosBebe')) || [];
        historial.splice(index, 1);
        localStorage.setItem('datosBebe', JSON.stringify(historial));
        actualizarVista();
    }
}

function mostrarSeccion(sec) {
    document.getElementById('seccion-registro').style.display = sec === 'registro' ? 'block' : 'none';
    document.getElementById('seccion-dashboard').style.display = sec === 'dashboard' ? 'block' : 'none';
    if(sec === 'dashboard') cargarDashboard(24);
}

function cargarDashboard(horas) {
    const datos = JSON.parse(localStorage.getItem('datosBebe')) || [];
    const ahora = new Date().getTime();
    const limite = ahora - (horas * 60 * 60 * 1000);
    
    const filtrados = datos.filter(d => new Date(d.fecha).getTime() > limite);
    
    let totalOz = 0;
    filtrados.forEach(d => { if(d.tipo === "Leche") totalOz += parseFloat(d.onzas); });

    // Animación biberón (máximo 30oz para el ejemplo)
    let porcentaje = (totalOz / 30) * 100;
    document.getElementById('bottle-filler').style.height = Math.min(porcentaje, 100) + "%";
    document.getElementById('total-onzas-text').innerText = totalOz + " oz en las últimas " + horas + "h";
}

function resetearApp() {
    if(confirm("¿ESTÁS SEGURO? Se borrarán todos los datos permanentemente.")) {
        localStorage.clear();
        location.reload();
    }
}

// Inicialización
actualizarInterfazSueno();
// (Copia el resto de funciones de guardado del script anterior adaptándolas...)
