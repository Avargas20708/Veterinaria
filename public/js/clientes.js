const form = document.getElementById("formCliente");
const tabla = document.getElementById("tablaClientes");
const mensaje = document.getElementById("mensaje");
const btnCancelar = document.getElementById("btnCancelar");

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

async function cargarClientes() {
  try {
    const res = await fetch("/api/clientes");
    const data = await res.json();

    if (!data.ok) {
      mostrarMensaje(data.error || "No se pudieron cargar los clientes.", "error");
      return;
    }

    tabla.innerHTML = data.data.map(cliente => `
      <tr>
        <td>${cliente.ID}</td>
        <td>${cliente.NOMBRE}</td>
        <td>${cliente.APELLIDO}</td>
        <td>${cliente.TELEFONO}</td>
        <td>
          <button type="button" class="btn-warning" onclick='editarCliente(${JSON.stringify(cliente)})'>Editar</button>
          <button type="button" class="btn-danger" onclick="eliminarCliente(${cliente.ID})">Eliminar</button>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    mostrarMensaje("Error de conexión con la API.", "error");
  }
}

window.editarCliente = function(cliente) {
  document.getElementById("id").value = cliente.ID;
  document.getElementById("id").disabled = true;
  document.getElementById("nombre").value = cliente.NOMBRE;
  document.getElementById("apellido").value = cliente.APELLIDO;
  document.getElementById("telefono").value = cliente.TELEFONO;
  editando = true;
  idEditando = cliente.ID;
};

window.eliminarCliente = async function(id) {
  if (!confirm("¿Desea eliminar este cliente?")) return;

  try {
    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!data.ok) {
      mostrarMensaje(data.error || "No se pudo eliminar el cliente.", "error");
      return;
    }

    mostrarMensaje(data.mensaje);
    cargarClientes();
  } catch (error) {
    mostrarMensaje("Error de conexión con la API.", "error");
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    id: document.getElementById("id").value,
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    telefono: document.getElementById("telefono").value
  };

  const url = editando ? `/api/clientes/${idEditando}` : "/api/clientes";
  const method = editando ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.ok) {
      mostrarMensaje(data.error || "Ocurrió un error al guardar el cliente.", "error");
      return;
    }

    mostrarMensaje(data.mensaje);
    limpiarFormulario();
    cargarClientes();
  } catch (error) {
    mostrarMensaje("Error de conexión con la API.", "error");
  }
});

if (btnCancelar) {
  btnCancelar.addEventListener("click", limpiarFormulario);
}

cargarClientes();