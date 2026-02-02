// 1. VARIABLES GLOBALES E INICIO
document.getElementById('fecha-actual').innerText = new Date().toLocaleDateString();
let durmiendo = localStorage.getItem('horaInicio') !== null;
let tomandoLeche = localStorage.getItem('inicioLeche') !== null;
let rangoActual = 24; 

// 2. GUARDADO GENÉRICO (Corregido para ser compatible con filtros)
function guardarDato(obj) {
    obj.id = Date.now();
    // Guardamos la fecha en ISO para que el Dashboard siempre pueda leerla sin errores
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

// ... (Tus funciones de actualizarBotonesLeche, Pañales y Sueño están bien, mantenlas igual) ...

// 5. DASHBOARD Y FILTROS (CORREGIDO)
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
        
        // Usamos fechaISO para mayor precisión, si no existe usamos la fecha normal
        const fechaToma = d.fechaISO ? new Date(d.fechaISO) : new Date(d.fecha);
        
        if (rangoActual === 24) {
            return (ahora - fechaToma) <= (24 * 60 * 60 * 1000);
        } else if (rangoActual === 'semana') {
            return (ahora - fechaToma) <= (7 * 24 * 60 * 60 * 1000);
        } else if (rangoActual === 'mes') {
            return (ahora - fechaToma) <= (30 * 24 * 60 * 60 * 1000);
        } else if (rangoActual === 'rango' && fInicio && fFin) {
            const inicio = new Date(fInicio + "T00:00:00");
            const fin = new Date(fFin + "T23:59:59");
            return fechaToma >= inicio && fechaToma <= fin;
        }
        return false;
    });

    // Sumar Onzas (Limpieza de strings para evitar NaN)
    let totalOz = 0;
    tomasFiltradas.forEach(t => {
        const num = t.valorOz || parseFloat(t.detalle);
        if (!isNaN(num)) totalOz += num;
    });

    // Actualizar Biberón
    const txtOz = document.getElementById('total-onzas-texto');
    if (txtOz) txtOz.innerText = totalOz.toFixed(1) + " oz";
    
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
        filler.style.backgroundColor = totalOz > 0 ? "#ffffff" : "transparent";
    }

    if (rangoTxt) {
        if (rangoActual === 'rango' && fInicio) {
            rangoTxt.innerText = `Periodo: ${fInicio} al ${fFin}`;
        } else {
            const labels = { '24': 'Últimas 24 horas', 'semana': 'Última semana', 'mes': 'Último mes' };
            rangoTxt.innerText = labels[rangoActual] || "Personalizado";
        }
    }
}

// 6. HISTORIAL (Corregido para mostrar fechaTexto)
function actualizarVista() {
    const lista = document.getElementById('listaRegistros');
    if (!lista) return;
    const datos = JSON.parse(localStorage.getItem('bebeData')) || [];
    lista.innerHTML = datos.slice().reverse().map(d => `
        <div class="registro-item">
            <small>${d.fechaTexto || d.fecha}</small><br>
            <strong>${d.tipo}:</strong> ${d.detalle}
            <button onclick="borrarRegistro(${d.id})" style="float:right; color:red; background:none; border:none; cursor:pointer;">🗑️</button>
        </div>
    `).join('');
}

// ... (Manten tus funciones de toggleMenu, cambiarTema y window.onload igual) ...
