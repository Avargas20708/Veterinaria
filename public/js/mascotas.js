const form = document.getElementById("formMascota");
const tabla = document.getElementById("tablaMascotas");
const mensaje = document.getElementById("mensaje");
const btnCancelar = document.getElementById("btnCancelar");
const clienteSelect = document.getElementById("cliente_id");

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

async function cargarClientesEnSelect() {
  const res = await fetch("/api/clientes");
  const data = await res.json();

  if (!data.ok) {
    mostrarMensaje("Primero verifique que la tabla CLIENTES exista y tenga datos.", "error");
    return;
  }

  clienteSelect.innerHTML =
    '<option value="">Seleccione un cliente</option>' +
    data.data
      .map(c => `<option value="${c.ID}">${c.ID} - ${c.NOMBRE} ${c.APELLIDO}</option>`)
      .join("");
}

async function cargarMascotas() {
  const res = await fetch("/api/mascotas");
  const data = await res.json();

  if (!data.ok) {
    mostrarMensaje(data.error || "No se pudieron cargar las mascotas.", "error");
    return;
  }

  tabla.innerHTML = data.data.map(m => `
    <tr>
      <td>${m.ID}</td>
      <td>${m.NOMBRE}</td>
      <td>${m.ESPECIE}</td>
      <td>${m.RAZA}</td>
      <td>${m.EDAD}</td>
      <td>${m.DUENO}</td>
      <td>
        <button class="btn-success" onclick='editarMascota(${JSON.stringify(m)})'>Editar</button>
        <button class="btn-danger" onclick="eliminarMascota(${m.ID})">Eliminar</button>
      </td>
    </tr>
  `).join("");
}

window.editarMascota = function(m) {
  document.getElementById("id").value = m.ID;
  document.getElementById("id").disabled = true;
  document.getElementById("nombre").value = m.NOMBRE;
  document.getElementById("especie").value = m.ESPECIE;
  document.getElementById("raza").value = m.RAZA;
  document.getElementById("edad").value = m.EDAD;
  document.getElementById("cliente_id").value = m.CLIENTE_ID;
  editando = true;
  idEditando = m.ID;
};

window.eliminarMascota = async function(id) {
  if (!confirm("¿Desea eliminar esta mascota?")) return;

  const res = await fetch(`/api/mascotas/${id}`, { method: "DELETE" });
  const data = await res.json();

  if (!data.ok) {
    mostrarMensaje(data.error || "No se pudo eliminar la mascota.", "error");
    return;
  }

  mostrarMensaje(data.mensaje);
  cargarMascotas();
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    id: document.getElementById("id").value,
    nombre: document.getElementById("nombre").value,
    especie: document.getElementById("especie").value,
    raza: document.getElementById("raza").value,
    edad: document.getElementById("edad").value,
    cliente_id: document.getElementById("cliente_id").value
  };

  const url = editando ? `/api/mascotas/${idEditando}` : "/api/mascotas";
  const method = editando ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!data.ok) {
    mostrarMensaje(data.error || "Ocurrió un error al guardar la mascota.", "error");
    return;
  }

  mostrarMensaje(data.mensaje);
  limpiarFormulario();
  cargarMascotas();
});

btnCancelar.addEventListener("click", limpiarFormulario);

(async function init() {
  await cargarClientesEnSelect();
  await cargarMascotas();
})();