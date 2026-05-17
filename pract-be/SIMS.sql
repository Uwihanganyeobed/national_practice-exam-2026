CREATE DATABASE IF NOT EXISTS SIMS;
USE SIMS;

CREATE TABLE Users (
  UserID   INT AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(50) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,   -- bcrypt hash
  Role     VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE Spare_Part (
  SparePartID INT AUTO_INCREMENT PRIMARY KEY,
  Name        VARCHAR(100) NOT NULL,
  Category    VARCHAR(50)  NOT NULL,
  Quantity    INT          NOT NULL DEFAULT 0,
  UnitPrice   DECIMAL(10,2) NOT NULL,
  TotalPrice  DECIMAL(10,2) GENERATED ALWAYS AS (Quantity * UnitPrice) STORED
);

CREATE TABLE Stock_In (
  StockInID       INT AUTO_INCREMENT PRIMARY KEY,
  SparePartID     INT NOT NULL,
  StockInQuantity INT NOT NULL,
  StockInDate     DATE NOT NULL DEFAULT (CURRENT_DATE),
  FOREIGN KEY (SparePartID) REFERENCES Spare_Part(SparePartID)
);

CREATE TABLE Stock_Out (
  StockOutID         INT AUTO_INCREMENT PRIMARY KEY,
  SparePartID        INT NOT NULL,
  UserID             INT NOT NULL,
  StockOutQuantity   INT          NOT NULL,
  StockOutUnitPrice  DECIMAL(10,2) NOT NULL,
  StockOutTotalPrice DECIMAL(10,2) GENERATED ALWAYS AS (StockOutQuantity * StockOutUnitPrice) STORED,
  StockOutDate       DATE NOT NULL DEFAULT (CURRENT_DATE),
  FOREIGN KEY (SparePartID) REFERENCES Spare_Part(SparePartID),
  FOREIGN KEY (UserID)      REFERENCES Users(UserID)
);