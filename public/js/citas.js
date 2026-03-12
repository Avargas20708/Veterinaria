const form = document.getElementById("formCita");
const tabla = document.getElementById("tablaCitas");
const mensaje = document.getElementById("mensaje");
const btnCancelar = document.getElementById("btnCancelar");
const mascotaSelect = document.getElementById("mascota_id");

let editando = false;
let idEditando = null;

function mostrarMensaje(texto, tipo = "success") {
  mensaje.textContent = texto;
  mensaje.className = `alert show ${tipo}`;
  setTimeout(() => {
    mensaje.className = "alert";
  }, 4000);
}

function limpiarFormulario() {
  form.reset();
  document.getElementById("id").disabled = false;
  editando = false;
  idEditando = null;
}

function formatearFecha(valor) {
  const fecha = new Date(valor);
  return fecha.toLocaleString("es-CR");
}

function normalizarFechaParaInput(valor) {
  const fecha = new Date(valor);
  const offset = fecha.getTimezoneOffset();
  const ajustada = new Date(fecha.getTime() - offset * 60000);
  return ajustada.toISOString().slice(0, 16);
}

async function cargarMascotasEnSelect() {
  const res = await fetch("/api/mascotas");
  const data = await res.json();

  if (!data.ok) {
    mostrarMensaje("Primero verifique que existan mascotas registradas.", "error");
    return;
  }

  mascotaSelect.innerHTML =
    '<option value="">Seleccione una mascota</option>' +
    data.data
      .map(m => `<option value="${m.ID}">${m.ID} - ${m.NOMBRE} (${m.DUENO})</option>`)
      .join("");
}

async function cargarCitas() {
  const res = await fetch("/api/citas");
  const data = await res.json();

  if (!data.ok) {
    mostrarMensaje(data.error || "No se pudieron cargar las citas.", "error");
    return;
  }

  tabla.innerHTML = data.data.map(c => `
    <tr>
      <td>${c.ID}</td>
      <td>${formatearFecha(c.FECHA)}</td>
      <td>${c.MASCOTA}</td>
      <td>${c.DUENO}</td>
      <td>${c.MOTIVO}</td>
      <td>
        <button class="btn-success" onclick='editarCita(${JSON.stringify(c)})'>Editar</button>
        <button class="btn-danger" onclick="eliminarCita(${c.ID})">Eliminar</button>
      </td>
    </tr>
  `).join("");
}

window.editarCita = function(c) {
  document.getElementById("id").value = c.ID;
  document.getElementById("id").disabled = true;
  document.getElementById("fecha").value = normalizarFechaParaInput(c.FECHA);
  document.getElementById("motivo").value = c.MOTIVO;
  document.getElementById("mascota_id").value = c.MASCOTA_ID;
  editando = true;
  idEditando = c.ID;
};

window.eliminarCita = async function(id) {
  if (!confirm("¿Desea eliminar esta cita?")) return;

  const res = await fetch(`/api/citas/${id}`, { method: "DELETE" });
  const data = await res.json();

  if (!data.ok) {
    mostrarMensaje(data.error || "No se pudo eliminar la cita.", "error");
    return;
  }

  mostrarMensaje(data.mensaje);
  cargarCitas();
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    id: document.getElementById("id").value,
    fecha: document.getElementById("fecha").value,
    motivo: document.getElementById("motivo").value,
    mascota_id: document.getElementById("mascota_id").value
  };

  const url = editando ? `/api/citas/${idEditando}` : "/api/citas";
  const method = editando ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!data.ok) {
    mostrarMensaje(data.error || "Ocurrió un error al guardar la cita.", "error");
    return;
  }

  mostrarMensaje(data.mensaje);
  limpiarFormulario();
  cargarCitas();
});

btnCancelar.addEventListener("click", limpiarFormulario);

(async function init() {
  await cargarMascotasEnSelect();
  await cargarCitas();
})();