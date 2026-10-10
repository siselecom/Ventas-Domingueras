let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
let gastos = JSON.parse(localStorage.getItem("gastos")) || [];
let Jornada = JSON.parse(localStorage.getItem("Jornada")) || [];

let tipoActual = "venta";

const modal = document.getElementById("modal");

document.getElementById("fecha").innerText =
    new Date().toLocaleDateString("es-ES");

// =========================
// BOTONES PRINCIPALES
// =========================

document.getElementById("btnVenta").addEventListener("click", () => {
    tipoActual = "venta";
    document.getElementById("tituloModal").innerText = "Nueva Venta";
    modal.classList.remove("oculto");
});

document.getElementById("btnDevolucion").addEventListener("click", () => {
    tipoActual = "devolucion";
    document.getElementById("tituloModal").innerText = "Nueva Devolución";
    modal.classList.remove("oculto");
});

document.getElementById("btnGastos").addEventListener("click", () => {
    tipoActual = "devolucion";
    document.getElementById("tituloModal").innerText = "Gastos";
    modal.classList.remove("oculto");
});

document.getElementById("btnJornada").addEventListener("click", finalizarJornada);

// =========================
// FINALIZAR JORNADA
// =========================

function finalizarJornada() {

    if (movimientos.length === 0) {
        alert("No hay movimientos para guardar en la jornada.");
        return;
    }

    const fecha = new Date().toISOString();
    const efectivo = parseFloat(document.getElementById("efectivo").innerText) || 0;
    const tarjeta = parseFloat(document.getElementById("tarjeta").innerText) || 0;
    const neto = parseFloat(document.getElementById("neto").innerText) || 0;

    const movimientosDelDia = movimientos.slice();
    const gastosDelDia = gastos.slice();

    const jornada = {
        id: Date.now(),
        fecha,
        fechaLocal: new Date().toLocaleString("es-ES"),
        neto,
        efectivo,
        tarjeta,
        movimientos: movimientosDelDia
    };

    const jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
    jornadas.push(jornada);
    localStorage.setItem("jornadas", JSON.stringify(jornadas));

    movimientos = [];
    gastos = [];
    localStorage.removeItem("movimientos");
    localStorage.removeItem("gastos");

    actualizar();

    alert(`Jornada guardada: ${new Date(jornada.fecha).toLocaleString("es-ES")}`);
}

// =========================
// GUARDAR MOVIMIENTO
// =========================

document.getElementById("cancelar").addEventListener("click", () => {
    modal.classList.add("oculto");
    limpiarFormulario();
});

document.getElementById("guardar").addEventListener("click", guardarMovimiento);

function guardarMovimiento() {

    const descripcion = document.getElementById("descripcion").value.trim();
    const importe = parseFloat(document.getElementById("importe").value);
    const pago = document.querySelector('input[name="pago"]:checked').value;

    if (!descripcion) {
        alert("Introduce una descripción");
        return;
    }

    if (isNaN(importe) || importe <= 0) {
        alert("Introduce un importe válido");
        return;
    }

    movimientos.push({
        id: Date.now(),
        fecha: new Date().toISOString(),
        descripcion,
        importe,
        pago,
        tipo: tipoActual
    });

    localStorage.setItem("movimientos", JSON.stringify(movimientos));

    actualizar();
    limpiarFormulario();
    modal.classList.add("oculto");
}

// =========================
// HISTORIAL DE JORNADAS
// =========================

const modalHistorial = document.getElementById("modalHistorial");
const btnHistorial = document.getElementById("btnHistorial");
const cerrarHistorial = document.getElementById("cerrarHistorial");
const buscarJornadasBtn = document.getElementById("buscarJornadas");
const selectFechaJornada = document.getElementById("selectFechaJornada");
const resultadoHistorial = document.getElementById("resultadoHistorial");

// Abrir historial y cargar fechas
btnHistorial.addEventListener("click", () => {
    const jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
    selectFechaJornada.innerHTML = "";

    jornadas.forEach(j => {
        const option = document.createElement("option");
        option.value = j.fecha;
        option.textContent = new Date(j.fecha).toLocaleDateString("es-ES");
        selectFechaJornada.appendChild(option);
    });

    resultadoHistorial.innerHTML = "";
    modalHistorial.classList.remove("oculto");
});

// Cerrar historial
cerrarHistorial.addEventListener("click", () => {
    modalHistorial.classList.add("oculto");
});

// Ver jornada seleccionada
buscarJornadasBtn.addEventListener("click", () => {
    const fecha = selectFechaJornada.value;
    const jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
    const jornada = jornadas.find(j => j.fecha === fecha);

    if (!jornada) {
        resultadoHistorial.innerHTML = "<p>No se encontró la jornada.</p>";
        return;
    }

    const movimientosHtml = (jornada.movimientos || [])
        .map(m => {
            const signo = m.tipo === "venta" ? "+" : "-";
            return `<li>${signo}${m.importe.toFixed(2)} € — ${m.descripcion} | ${m.pago}</li>`;
        })
        .join("");

    resultadoHistorial.innerHTML = `
        <h3>Jornada del ${new Date(jornada.fecha).toLocaleDateString("es-ES")}</h3>
        <p><strong>Neto:</strong> ${jornada.neto} €</p>
        <p><strong>Efectivo:</strong> ${jornada.efectivo} €</p>
        <p><strong>Tarjeta:</strong> ${jornada.tarjeta} €</p>

        <h4>Movimientos</h4>
        <ul>${movimientosHtml}</ul>

        <button class="verde" onclick="imprimirPDF('${jornada.fecha}')">Imprimir PDF</button>
    `;
});

// Imprimir PDF
function imprimirPDF(fecha) {
    const jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
    const jornada = jornadas.find(j => j.fecha === fecha);

    if (!jornada) return;

    const movimientosHtml = (jornada.movimientos || [])
        .map(m => {
            const signo = m.tipo === "venta" ? "+" : "-";
            return `<li>${signo}${m.importe.toFixed(2)} € — ${m.descripcion} | ${m.pago}</li>`;
        })
        .join("");

    const ventana = window.open("", "_blank");

    ventana.document.write(`
        <html>
        <head>
            <title>Jornada ${new Date(jornada.fecha).toLocaleDateString("es-ES")}</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                h2 { color: #2ecc71; }
            </style>
        </head>
        <body>
            <h2>Jornada del ${new Date(jornada.fecha).toLocaleDateString("es-ES")}</h2>
            <p><strong>Neto:</strong> ${jornada.neto} €</p>
            <p><strong>Efectivo:</strong> ${jornada.efectivo} €</p>
            <p><strong>Tarjeta:</strong> ${jornada.tarjeta} €</p>

            <h3>Movimientos</h3>
            <ul>${movimientosHtml}</ul>

            <script>
                window.print();
            </script>
        </body>
        </html>
    `);

    ventana.document.close();
}

// =========================
// FUNCIONES AUXILIARES
// =========================

function limpiarFormulario() {
    document.getElementById("descripcion").value = "";
    document.getElementById("importe").value = "";
}

function actualizar() {

    let efectivo = 0;
    let tarjeta = 0;

    const lista = document.getElementById("movimientos");
    lista.innerHTML = "";

    [...movimientos].reverse().forEach(m => {

        const signo = m.tipo === "venta" ? 1 : -1;

        if (m.pago === "efectivo") {
            efectivo += m.importe * signo;
        } else {
            tarjeta += m.importe * signo;
        }

        const div = document.createElement("div");
        div.className = `movimiento ${m.tipo}`;

        div.innerHTML = `
            <strong>${m.descripcion}</strong><br>
            ${m.tipo === "venta" ? "+" : "-"}${m.importe.toFixed(2)} €
            | ${m.pago}
        `;

        lista.appendChild(div);
    });

    document.getElementById("efectivo").innerText = efectivo.toFixed(2) + " €";
    document.getElementById("tarjeta").innerText = tarjeta.toFixed(2) + " €";
    document.getElementById("neto").innerText = (efectivo + tarjeta).toFixed(2) + " €";
}

actualizar();