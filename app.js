let movimientos =
    JSON.parse(localStorage.getItem("movimientos")) || [];

//********************************************************
let gastos =
    JSON.parse(localStorage.getItem("gastos")) || [];

let Jornada =
    JSON.parse(localStorage.getItem("Jornada")) || [];
//********************************************************

let tipoActual = "venta";

const modal = document.getElementById("modal");

document.getElementById("fecha").innerText =
    new Date().toLocaleDateString("es-ES");

document
    .getElementById("btnVenta")
    .addEventListener("click", () => {

        tipoActual = "venta";

        document.getElementById("tituloModal").innerText =
            "Nueva Venta";

        modal.classList.remove("oculto");
    });

document
    .getElementById("btnDevolucion")
    .addEventListener("click", () => {

        tipoActual = "devolucion";

        document.getElementById("tituloModal").innerText =
            "Nueva Devolución";

        modal.classList.remove("oculto");
    });

//********************************************************

document
    .getElementById("btnGastos")
    .addEventListener("click", () => {

        tipoActual = "devolucion";

        document.getElementById("tituloModal").innerText =
            "Gastos";

        modal.classList.remove("oculto");
    });

  document
	.getElementById("btnJornada")
	.addEventListener("click", finalizarJornada);


function finalizarJornada() {

   if ((movimientos.length === 0)) {
    alert("No hay movimientos para guardar en la jornada.");
    return;
  }	
  // Obtener valores actuales
  const fecha = new Date().toISOString();
  const efectivo = parseFloat(document.getElementById("efectivo").innerText) || 0;
  const tarjeta = parseFloat(document.getElementById("tarjeta").innerText) || 0;
  const neto = parseFloat(document.getElementById("neto").innerText) || 0;

  // Copiar movimientos y gastos del día (asume arrays movimientos y gastos en memoria)
  const movimientosDelDia = movimientos.slice(); // copia completa del array actual
  const gastosDelDia = gastos.slice(); // copia completa del array actual

  // Crear objeto jornada
  const jornada = {
    id: Date.now(),
    fecha,
    fechaLocal: new Date().toLocaleString("es-ES"),
    neto,
    efectivo,
    tarjeta,
    movimientos: movimientosDelDia
    
  };

  // Leer/crear almacén 'jornadas' en localStorage
  const jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];
  jornadas.push(jornada);
  localStorage.setItem("jornadas", JSON.stringify(jornadas));

  // Limpiar datos del día para empezar la siguiente jornada
  movimientos = [];
  gastos = [];
  localStorage.removeItem("movimientos");
  localStorage.removeItem("gastos");

  // Actualizar UI
  actualizar();

  // Mensaje de confirmación breve
  alert(`Jornada guardada: ${new Date(jornada.fecha).toLocaleString("es-ES")}`);
}


//********************************************************


document
    .getElementById("cancelar")
    .addEventListener("click", () => {

        modal.classList.add("oculto");
        limpiarFormulario();
    });

document
    .getElementById("guardar")
    .addEventListener("click", guardarMovimiento);

function guardarMovimiento() {

    const descripcion =
        document.getElementById("descripcion").value.trim();

    const importe =
        parseFloat(document.getElementById("importe").value);

    const pago =
        document.querySelector(
            'input[name="pago"]:checked'
        ).value;

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

    localStorage.setItem(
        "movimientos",
        JSON.stringify(movimientos)
    );

    actualizar();

    limpiarFormulario();

    modal.classList.add("oculto");
}



// Referencias modal historial
const modalHistorial = document.getElementById("modalHistorial");
const btnHistorial = document.getElementById("btnHistorial");
const cerrarHistorial = document.getElementById("cerrarHistorial");
const buscarJornadasBtn = document.getElementById("buscarJornadas");
const fechaBusquedaInput = document.getElementById("fechaBusqueda");
const resultadosHistorial = document.getElementById("resultadosHistorial");

// Abrir modal historial
btnHistorial.addEventListener("click", () => {
  fechaBusquedaInput.value = "";
  resultadosHistorial.innerHTML = `<p class="muted">Selecciona una fecha y pulsa Buscar.</p>`;
  modalHistorial.classList.remove("oculto");
});

// Cerrar modal historial
cerrarHistorial.addEventListener("click", () => {
  modalHistorial.classList.add("oculto");
});

// Buscar jornadas por fecha
buscarJornadasBtn.addEventListener("click", () => {
  const fechaSeleccionada = fechaBusquedaInput.value; // "YYYY-MM-DD"
  if (!fechaSeleccionada) {
    alert("Selecciona una fecha para buscar.");
    return;
  }

  const jornadas = JSON.parse(localStorage.getItem("jornadas")) || [];

  const resultados = jornadas.filter(j => {
    const jFecha = new Date(j.fecha);
    const yyyy = jFecha.getFullYear();
    const mm = String(jFecha.getMonth() + 1).padStart(2, "0");
    const dd = String(jFecha.getDate()).padStart(2, "0");
    const jFechaSimple = `${yyyy}-${mm}-${dd}`;
    return jFechaSimple === fechaSeleccionada;
  });

  mostrarResultadosHistorial(resultados, fechaSeleccionada);
});

function mostrarResultadosHistorial(resultados, fechaSeleccionada) {
  if (!resultados || resultados.length === 0) {
    resultadosHistorial.innerHTML = `<p>No se encontraron jornadas para ${fechaSeleccionada}.</p>`;
    return;
  }

  const html = resultados.map(j => {
    const fechaLocal = new Date(j.fecha).toLocaleString("es-ES");
    const neto = Number(j.neto).toFixed(2);
    const efectivo = Number(j.efectivo).toFixed(2);
    const tarjeta = Number(j.tarjeta).toFixed(2);

    return `
      <div class="jornada-item" style="margin-bottom:10px; padding:8px; border-radius:8px; background:#fafafa;">
        <strong>${fechaLocal}</strong><br>
        Neto: ${neto} € | Efectivo: ${efectivo} € | Tarjeta: ${tarjeta} €<br>
        <button class="verJornada" data-id="${j.id}" style="margin-top:6px;">Ver detalles</button>
      </div>
    `;
  }).join("");

  resultadosHistorial.innerHTML = html;

  const botones = resultadosHistorial.querySelectorAll(".verJornada");
  botones.forEach(b => {
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-id");
      const jornada = resultados.find(x => String(x.id) === String(id));
      if (jornada) mostrarDetalleJornada(jornada);
    });
  });
}

function mostrarDetalleJornada(j) {
  const movimientosHtml = (j.movimientos || []).map(m => {
    const signo = m.tipo === "venta" ? "+" : "-";
    return `<div style="padding:6px 0;">${signo}${Number(m.importe).toFixed(2)} € — ${m.descripcion} | ${m.pago}</div>`;
  }).join("");

  const detalle = `
    <div>
      <h3>Jornada: ${new Date(j.fecha).toLocaleString("es-ES")}</h3>
      <p><strong>Neto:</strong> ${Number(j.neto).toFixed(2)} € — <strong>Efectivo:</strong> ${Number(j.efectivo).toFixed(2)} € — <strong>Tarjeta:</strong> ${Number(j.tarjeta).toFixed(2)} €</p>
      <h4>Movimientos</h4>
      <div style="max-height:300px; overflow:auto; border:1px solid #eee; padding:8px;">${movimientosHtml || "<em>No hay movimientos</em>"}</div>
      <div style="margin-top:12px;">
        <button id="cerrarDetalle" class="secundario">Volver</button>
      </div>
    </div>
  `;

  resultadosHistorial.innerHTML = detalle;

  document.getElementById("cerrarDetalle").addEventListener("click", () => {
    resultadosHistorial.innerHTML = `<p class="muted">Selecciona una fecha y pulsa Buscar.</p>`;
  });
}



function limpiarFormulario() {

    document.getElementById("descripcion").value = "";
    document.getElementById("importe").value = "";
}

function actualizar() {

    let efectivo = 0;
    let tarjeta = 0;

    const lista =
        document.getElementById("movimientos");

    lista.innerHTML = "";

    [...movimientos]
        .reverse()
        .forEach(m => {

            const signo =
                m.tipo === "venta" ? 1 : -1;

            if (m.pago === "efectivo") {
                efectivo += m.importe * signo;
            } else {
                tarjeta += m.importe * signo;
            }

            const div = document.createElement("div");

            div.className =
                `movimiento ${m.tipo}`;

            div.innerHTML = `
                <strong>${m.descripcion}</strong><br>
                ${m.tipo === "venta" ? "+" : "-"}
                ${m.importe.toFixed(2)} €
                | ${m.pago}
            `;

            lista.appendChild(div);
        });

    document.getElementById("efectivo").innerText =
        efectivo.toFixed(2) + " €";

    document.getElementById("tarjeta").innerText =
        tarjeta.toFixed(2) + " €";

    document.getElementById("neto").innerText =
        (efectivo + tarjeta).toFixed(2) + " €";
}

actualizar();