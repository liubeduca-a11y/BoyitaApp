// 1. Mostrar fecha
document.getElementById('fecha-actual').innerText = new Date().toLocaleDateString();

// 2. Funciones de Navegación
function mostrarSeccion(sec) {
    document.getElementById('seccion-registro').style.display = sec === 'registro' ? 'block' : 'none';
    document.getElementById('seccion-dashboard').style.display = sec === 'dashboard' ? 'block' : 'none';
    if(sec === 'dashboard') actualizarBiberon();
}

// 3. Alimentación
function setOz(n) { document.getElementById('onzas').value = n; }

function guardarAlimento() {
    const oz = document.getElementById('onzas').value;
    const nota = document.getElementById('notaLeche').value; // Nueva línea
    if(!oz) return alert("Pon las onzas");
    
    guardarDato({ 
        tipo: "Leche", 
        detalle: `${oz} oz ${nota ? '('+nota+')' : ''}`, 
        valor: parseFloat(oz) 
    });
    
    document.getElementById('onzas').value = "";
    document.getElementById('notaLeche').value = ""; // Limpiar nota
}

// 4. Pañales
function cambiarVistaPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    document.getElementById('opcionPipi').style.display = tipo === 'pipi' ? 'block' : 'none';
    document.getElementById('opcionPopo').style.display = tipo === 'popo' ? 'block' : 'none';
}

function guardarPañal() {
    const tipo = document.getElementById('tipoPañal').value;
    const nota = document.getElementById('notaPañal').value; // Nueva línea
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
    document.getElementById('notaPañal').value = ""; // Limpiar nota
}

// 5. Sueño (Modo Cronómetro)
// En la función toggleSueno(), busca la parte donde se guarda el dato y cámbiala:
let durmiendo = localStorage.getItem('horaInicio') !== null;
function toggleSueno() {
    if(!durmiendo) {
        localStorage.setItem('horaInicio', new Date().toISOString());
        durmiendo = true;
        actualizarBotonesSueno();
    } else {
        const inicio = new Date(localStorage.getItem('horaInicio'));
        const fin = new Date();
        const estado = document.getElementById('estadoDespertar').value;
        const nota = document.getElementById('notaSueno').value; // Nueva línea
        const duracion = Math.round((fin - inicio) / 1000 / 60);
        
        let det = `Durmió ${duracion} min (${estado})`;
        if(nota) det += ` - Nota: ${nota}`;
        
        guardarDato({ tipo: "Sueño", detalle: det });
        
        localStorage.removeItem('horaInicio');
        durmiendo = false;
        document.getElementById('notaSueno').value = ""; // Limpiar nota
        actualizarBotonesSueno();
    }
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

// 6. Base de Datos Local
function guardarDato(obj) {
    obj.fecha = new Date().toLocaleString();
    obj.id = Date.now();
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    datos.push(obj);
    localStorage.setItem('bebeData', JSON.stringify(datos));
    actualizarVista();
}

function borrarRegistro(id) {
    let datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    datos = datos.filter(d => d.id !== id);
    localStorage.setItem('bebeData', JSON.stringify(datos));
    actualizarVista();
}

function actualizarVista() {
    const lista = document.getElementById('listaRegistros');
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    lista.innerHTML = datos.slice().reverse().map(d => `
        <div class="registro-item">
            <small>${d.fecha}</small><br>
            <strong>${d.tipo}:</strong> ${d.detalle}
            <button class="btn-delete" onclick="borrarRegistro(${d.id})">🗑️</button>
        </div>
    `).join('');
}

function actualizarBiberon() {
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    const hoy = new Date().toLocaleDateString();
    let total = 0;
    datos.forEach(d => {
        if(d.tipo === "Leche" && d.fecha.includes(hoy)) total += d.valor;
    });
    document.getElementById('total-onzas-texto').innerText = total + " oz hoy";
    let porcentaje = (total / 32) * 100; // 32oz como meta
    document.getElementById('bottle-filler').style.height = Math.min(porcentaje, 100) + "%";
}

function resetearApp() {
    if(confirm("¿Borrar todo?")) { localStorage.clear(); location.reload(); }
}

// Iniciar app
actualizarVista();
actualizarBotonesSueno();
function descargarCSV() {
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    if (datos.length === 0) return alert("No hay datos para descargar");

    // Crear el encabezado del archivo
    let contenido = "Fecha,Tipo,Detalle,Valor\n";

    // Llenar las filas con la información
    datos.forEach(d => {
        let valor = d.valor ? d.valor : "";
        contenido += `"${d.fecha}","${d.tipo}","${d.detalle}","${valor}"\n`;
    });

    // Crear el archivo y descargarlo
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "historial_bebe.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
