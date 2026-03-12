const express = require("express");
const cors = require("cors");
const path = require("path");
const { getConnection } = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Middleware helper para manejar conexión y errores de forma uniforme
function asyncHandler(handler) {
  return async (req, res, next) => {
    let conn;
    try {
      conn = await getConnection();
      await handler(req, res, conn);
    } catch (error) {
      console.error("Error en la API:", error);
      res.status(500).json({
        ok: false,
        error: error.message || "Error interno del servidor.",
      });
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (closeError) {
          console.error("Error cerrando conexión:", closeError);
        }
      }
    }
  };
}

// =========================
// CLIENTES
// =========================
app.get("/api/clientes", asyncHandler(async (req, res, conn) => {
  const result = await conn.execute(`
    SELECT ID, NOMBRE, APELLIDO, TELEFONO
    FROM CLIENTES
    ORDER BY ID
  `);
  res.json({ ok: true, data: result.rows });
}));

app.post("/api/clientes", asyncHandler(async (req, res, conn) => {
  const { id, nombre, apellido, telefono } = req.body;

  if (!id || !nombre || !apellido || !telefono) {
    return res.status(400).json({
      ok: false,
      error: "Todos los campos del cliente son obligatorios."
    });
  }

  await conn.execute(
    `INSERT INTO CLIENTES (ID, NOMBRE, APELLIDO, TELEFONO)
     VALUES (:id, :nombre, :apellido, :telefono)`,
    {
      id: Number(id),
      nombre,
      apellido,
      telefono
    },
    { autoCommit: true }
  );

  res.json({ ok: true, mensaje: "Cliente guardado correctamente." });
}));

app.put("/api/clientes/:id", asyncHandler(async (req, res, conn) => {
  const id = Number(req.params.id);
  const { nombre, apellido, telefono } = req.body;

  const result = await conn.execute(
    `UPDATE CLIENTES
     SET NOMBRE = :nombre,
         APELLIDO = :apellido,
         TELEFONO = :telefono
     WHERE ID = :id`,
    { id, nombre, apellido, telefono },
    { autoCommit: true }
  );

  if (result.rowsAffected === 0) {
    return res.status(404).json({ ok: false, error: "Cliente no encontrado." });
  }

  res.json({ ok: true, mensaje: "Cliente actualizado correctamente." });
}));

app.delete("/api/clientes/:id", asyncHandler(async (req, res, conn) => {
  const id = Number(req.params.id);

  const result = await conn.execute(
    `DELETE FROM CLIENTES WHERE ID = :id`,
    { id },
    { autoCommit: true }
  );

  if (result.rowsAffected === 0) {
    return res.status(404).json({ ok: false, error: "Cliente no encontrado." });
  }

  res.json({ ok: true, mensaje: "Cliente eliminado correctamente." });
}));

// =========================
// MASCOTAS
// =========================
app.get("/api/mascotas", asyncHandler(async (req, res, conn) => {
  const result = await conn.execute(`
    SELECT M.ID,
           M.NOMBRE,
           M.ESPECIE,
           M.RAZA,
           M.EDAD,
           M.CLIENTE_ID,
           C.NOMBRE || ' ' || C.APELLIDO AS DUENO
    FROM MASCOTAS M
    JOIN CLIENTES C ON C.ID = M.CLIENTE_ID
    ORDER BY M.ID
  `);

  res.json({ ok: true, data: result.rows });
}));

app.post("/api/mascotas", asyncHandler(async (req, res, conn) => {
  const { id, nombre, especie, raza, edad, cliente_id } = req.body;

  if (!id || !nombre || !especie || !raza || edad === undefined || !cliente_id) {
    return res.status(400).json({
      ok: false,
      error: "Todos los campos de la mascota son obligatorios."
    });
  }

  await conn.execute(
    `INSERT INTO MASCOTAS (ID, NOMBRE, ESPECIE, RAZA, EDAD, CLIENTE_ID)
     VALUES (:id, :nombre, :especie, :raza, :edad, :cliente_id)`,
    {
      id: Number(id),
      nombre,
      especie,
      raza,
      edad: Number(edad),
      cliente_id: Number(cliente_id)
    },
    { autoCommit: true }
  );

  res.json({ ok: true, mensaje: "Mascota guardada correctamente." });
}));

app.put("/api/mascotas/:id", asyncHandler(async (req, res, conn) => {
  const id = Number(req.params.id);
  const { nombre, especie, raza, edad, cliente_id } = req.body;

  const result = await conn.execute(
    `UPDATE MASCOTAS
     SET NOMBRE = :nombre,
         ESPECIE = :especie,
         RAZA = :raza,
         EDAD = :edad,
         CLIENTE_ID = :cliente_id
     WHERE ID = :id`,
    {
      id,
      nombre,
      especie,
      raza,
      edad: Number(edad),
      cliente_id: Number(cliente_id)
    },
    { autoCommit: true }
  );

  if (result.rowsAffected === 0) {
    return res.status(404).json({ ok: false, error: "Mascota no encontrada." });
  }

  res.json({ ok: true, mensaje: "Mascota actualizada correctamente." });
}));

app.delete("/api/mascotas/:id", asyncHandler(async (req, res, conn) => {
  const id = Number(req.params.id);

  const result = await conn.execute(
    `DELETE FROM MASCOTAS WHERE ID = :id`,
    { id },
    { autoCommit: true }
  );

  if (result.rowsAffected === 0) {
    return res.status(404).json({ ok: false, error: "Mascota no encontrada." });
  }

  res.json({ ok: true, mensaje: "Mascota eliminada correctamente." });
}));

// =========================
// CITAS
// =========================
app.get("/api/citas", asyncHandler(async (req, res, conn) => {
  const result = await conn.execute(`
    SELECT CI.ID,
           CI.FECHA,
           CI.MOTIVO,
           CI.MASCOTA_ID,
           M.NOMBRE AS MASCOTA,
           C.NOMBRE || ' ' || C.APELLIDO AS DUENO
    FROM CITAS CI
    JOIN MASCOTAS M ON M.ID = CI.MASCOTA_ID
    JOIN CLIENTES C ON C.ID = M.CLIENTE_ID
    ORDER BY CI.FECHA, CI.ID
  `);

  const data = result.rows.map((row) => ({
    ...row,
    FECHA: row.FECHA ? new Date(row.FECHA).toISOString() : null
  }));

  res.json({ ok: true, data });
}));

app.post("/api/citas", asyncHandler(async (req, res, conn) => {
  const { id, fecha, motivo, mascota_id } = req.body;

  if (!id || !fecha || !motivo || !mascota_id) {
    return res.status(400).json({
      ok: false,
      error: "Todos los campos de la cita son obligatorios."
    });
  }

  await conn.execute(
    `INSERT INTO CITAS (ID, FECHA, MOTIVO, MASCOTA_ID)
     VALUES (:id, TO_DATE(:fecha, 'YYYY-MM-DD"T"HH24:MI'), :motivo, :mascota_id)`,
    {
      id: Number(id),
      fecha,
      motivo,
      mascota_id: Number(mascota_id)
    },
    { autoCommit: true }
  );

  res.json({ ok: true, mensaje: "Cita guardada correctamente." });
}));

app.put("/api/citas/:id", asyncHandler(async (req, res, conn) => {
  const id = Number(req.params.id);
  const { fecha, motivo, mascota_id } = req.body;

  const result = await conn.execute(
    `UPDATE CITAS
     SET FECHA = TO_DATE(:fecha, 'YYYY-MM-DD"T"HH24:MI'),
         MOTIVO = :motivo,
         MASCOTA_ID = :mascota_id
     WHERE ID = :id`,
    {
      id,
      fecha,
      motivo,
      mascota_id: Number(mascota_id)
    },
    { autoCommit: true }
  );

  if (result.rowsAffected === 0) {
    return res.status(404).json({ ok: false, error: "Cita no encontrada." });
  }

  res.json({ ok: true, mensaje: "Cita actualizada correctamente." });
}));

app.delete("/api/citas/:id", asyncHandler(async (req, res, conn) => {
  const id = Number(req.params.id);

  const result = await conn.execute(
    `DELETE FROM CITAS WHERE ID = :id`,
    { id },
    { autoCommit: true }
  );

  if (result.rowsAffected === 0) {
    return res.status(404).json({ ok: false, error: "Cita no encontrada." });
  }

  res.json({ ok: true, mensaje: "Cita eliminada correctamente." });
}));

app.use("/api", (req, res) => {
  res.status(404).json({ ok: false, error: "Ruta API no encontrada." });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});