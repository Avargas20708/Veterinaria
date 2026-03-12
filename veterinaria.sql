/*====================================================
CREAR BASE DE DATOS
====================================================*/
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ClinicaVeterinaria')
BEGIN
    CREATE DATABASE ClinicaVeterinaria;
END
GO

USE ClinicaVeterinaria;
GO

/*====================================================
TABLAS
====================================================*/
CREATE TABLE HISTORIAL_CLINICO(
ID INT PRIMARY KEY,
DIAGNOSTICO VARCHAR(200),
TRATAMIENTO VARCHAR(200),
MASCOTA_ID INT,
FOREIGN KEY (MASCOTA_ID) REFERENCES MASCOTAS(ID)
);

CREATE TABLE FACTURAS(
ID INT PRIMARY KEY,
FECHA DATETIME,
TOTAL DECIMAL(10,2),
CLIENTE_ID INT,
FOREIGN KEY (CLIENTE_ID) REFERENCES CLIENTES(ID)
);

CREATE TABLE CLIENTES(
ID INT PRIMARY KEY,
NOMBRE VARCHAR(50),
APELLIDO VARCHAR(50),
TELEFONO VARCHAR(20)
);

CREATE TABLE MASCOTAS(
ID INT PRIMARY KEY,
NOMBRE VARCHAR(50),
ESPECIE VARCHAR(50),
RAZA VARCHAR(50),
EDAD INT,
CLIENTE_ID INT,
FOREIGN KEY (CLIENTE_ID) REFERENCES CLIENTES(ID)
);

CREATE TABLE CITAS(
ID INT PRIMARY KEY,
FECHA DATETIME,
MOTIVO VARCHAR(200),
MASCOTA_ID INT,
FOREIGN KEY (MASCOTA_ID) REFERENCES MASCOTAS(ID)
);

CREATE TABLE HISTORIAL_CLINICO(
ID INT PRIMARY KEY,
DIAGNOSTICO VARCHAR(200),
TRATAMIENTO VARCHAR(200),
MASCOTA_ID INT,
FOREIGN KEY (MASCOTA_ID) REFERENCES MASCOTAS(ID)
);

CREATE TABLE FACTURAS(
ID INT PRIMARY KEY,
FECHA DATETIME,
TOTAL DECIMAL(10,2),
CLIENTE_ID INT,
FOREIGN KEY (CLIENTE_ID) REFERENCES CLIENTES(ID)
);
GO

/*====================================================
PROCEDIMIENTOS (CRUD)
====================================================*/

CREATE PROCEDURE sp_insertar_cliente
@id INT,
@nombre VARCHAR(50),
@apellido VARCHAR(50),
@telefono VARCHAR(20)
AS
BEGIN
INSERT INTO CLIENTES VALUES(@id,@nombre,@apellido,@telefono)
END
GO

CREATE PROCEDURE sp_actualizar_cliente
@id INT,
@telefono VARCHAR(20)
AS
BEGIN
UPDATE CLIENTES
SET TELEFONO=@telefono
WHERE ID=@id
END
GO

CREATE PROCEDURE sp_eliminar_cliente
@id INT
AS
BEGIN
DELETE FROM CLIENTES
WHERE ID=@id
END
GO

CREATE PROCEDURE sp_insertar_mascota
@id INT,
@nombre VARCHAR(50),
@especie VARCHAR(50),
@raza VARCHAR(50),
@edad INT,
@cliente_id INT
AS
BEGIN
INSERT INTO MASCOTAS
VALUES(@id,@nombre,@especie,@raza,@edad,@cliente_id)
END
GO

CREATE PROCEDURE sp_actualizar_mascota
@id INT,
@edad INT
AS
BEGIN
UPDATE MASCOTAS
SET EDAD=@edad
WHERE ID=@id
END
GO

CREATE PROCEDURE sp_eliminar_mascota
@id INT
AS
BEGIN
DELETE FROM MASCOTAS
WHERE ID=@id
END
GO

CREATE PROCEDURE sp_crear_cita
@id INT,
@fecha DATETIME,
@motivo VARCHAR(200),
@mascota_id INT
AS
BEGIN
INSERT INTO CITAS
VALUES(@id,@fecha,@motivo,@mascota_id)
END
GO

CREATE PROCEDURE sp_cancelar_cita
@id INT
AS
BEGIN
DELETE FROM CITAS
WHERE ID=@id
END
GO

CREATE PROCEDURE sp_insertar_historial
@id INT,
@diagnostico VARCHAR(200),
@tratamiento VARCHAR(200),
@mascota_id INT
AS
BEGIN
INSERT INTO HISTORIAL_CLINICO
VALUES(@id,@diagnostico,@tratamiento,@mascota_id)
END
GO

CREATE PROCEDURE sp_generar_factura
@id INT,
@fecha DATETIME,
@total DECIMAL(10,2),
@cliente_id INT
AS
BEGIN
INSERT INTO FACTURAS
VALUES(@id,@fecha,@total,@cliente_id)
END
GO

/*====================================================
VISTAS
====================================================*/
CREATE VIEW vista_historial_mascotas AS
SELECT M.NOMBRE,H.DIAGNOSTICO,H.TRATAMIENTO
FROM MASCOTAS M
JOIN HISTORIAL_CLINICO H ON M.ID=H.MASCOTA_ID;
GO



CREATE VIEW vista_clientes_mascotas AS
SELECT C.NOMBRE,C.APELLIDO,M.NOMBRE AS MASCOTA
FROM CLIENTES C
JOIN MASCOTAS M ON C.ID=M.CLIENTE_ID;
GO

CREATE VIEW vista_citas_detalladas AS
SELECT C.ID,C.FECHA,C.MOTIVO,M.NOMBRE AS MASCOTA
FROM CITAS C
JOIN MASCOTAS M ON C.MASCOTA_ID=M.ID;
GO

CREATE VIEW vista_historial_mascotas AS
SELECT M.NOMBRE,H.DIAGNOSTICO,H.TRATAMIENTO
FROM MASCOTAS M
JOIN HISTORIAL_CLINICO H ON M.ID=H.MASCOTA_ID;
GO

CREATE VIEW vista_facturas_clientes AS
SELECT C.NOMBRE,C.APELLIDO,F.TOTAL
FROM CLIENTES C
JOIN FACTURAS F ON C.ID=F.CLIENTE_ID;
GO

/*====================================================
FUNCIONES
====================================================*/

CREATE FUNCTION fn_contar_mascotas(@cliente_id INT)
RETURNS INT
AS
BEGIN
DECLARE @total INT
SELECT @total=COUNT(*) FROM MASCOTAS WHERE CLIENTE_ID=@cliente_id
RETURN @total
END
GO

CREATE FUNCTION fn_total_facturas_cliente(@cliente_id INT)
RETURNS DECIMAL(10,2)
AS
BEGIN
DECLARE @total DECIMAL(10,2)
SELECT @total=SUM(TOTAL) FROM FACTURAS WHERE CLIENTE_ID=@cliente_id
RETURN ISNULL(@total,0)
END
GO

CREATE FUNCTION fn_contar_citas(@mascota_id INT)
RETURNS INT
AS
BEGIN
DECLARE @total INT
SELECT @total=COUNT(*) FROM CITAS WHERE MASCOTA_ID=@mascota_id
RETURN @total
END
GO

/*====================================================
TRIGGERS
====================================================*/
CREATE TRIGGER trg_historial_insert
ON HISTORIAL_CLINICO
AFTER INSERT
AS
BEGIN
PRINT 'Nuevo historial clínico registrado'
END
GO

CREATE TRIGGER trg_historial_insert
ON HISTORIAL_CLINICO
AFTER INSERT
AS
BEGIN
PRINT 'Nuevo historial clínico registrado'
END
GO

CREATE TRIGGER trg_cliente_insert
ON CLIENTES
AFTER INSERT
AS
BEGIN
PRINT 'Nuevo cliente registrado'
END
GO

CREATE TRIGGER trg_mascota_insert
ON MASCOTAS
AFTER INSERT
AS
BEGIN
PRINT 'Nueva mascota registrada'
END
GO

/*====================================================
CURSOR
====================================================*/

DECLARE cursor_clientes CURSOR FOR
SELECT NOMBRE,APELLIDO FROM CLIENTES

DECLARE @nombre VARCHAR(50)
DECLARE @apellido VARCHAR(50)

OPEN cursor_clientes
FETCH NEXT FROM cursor_clientes INTO @nombre,@apellido

WHILE @@FETCH_STATUS=0
BEGIN
PRINT @nombre + ' ' + @apellido
FETCH NEXT FROM cursor_clientes INTO @nombre,@apellido
END

CLOSE cursor_clientes
DEALLOCATE cursor_clientes
GO

