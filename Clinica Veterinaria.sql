CREATE DATABASE Veterinaria
GO

USE Veterinaria
GO

CREATE TABLE Clientes(
id INT IDENTITY(1,1) PRIMARY KEY,
nombre VARCHAR(100),
telefono VARCHAR(20),
direccion VARCHAR(200)
)
