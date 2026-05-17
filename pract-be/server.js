const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ─── DB CONNECTION ────────────────────────────────────────────────────────────
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sun(123)",
    database: "SIMS"
});

db.connect((err) => {
    if (err) {
        console.error("Database failed 💔", err);
    } else {
        console.log("Connected successfully 😍");
    }
});

// ─── MIDDLEWARES ──────────────────────────────────────────────────────────────

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    const actualToken = token.split(" ")[1];
    const realToken = await jwt.verify(actualToken, "secretKey");
    req.user = realToken;
    next();
};

const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// POST /api/register
app.post("/api/register", async (req, res) => {
    const { email, password, role } = req.body;

    const checkQuery = "SELECT * FROM Users WHERE Email = ?";
    db.query(checkQuery, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "DB error", err });
        }
        if (results.length > 0) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = "INSERT INTO Users (Email, Password, Role) VALUES (?,?,?)";
        db.query(insertQuery, [email, hashedPassword, role || "user"], (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Failed to create user", err });
            }
            return res.status(201).json({ message: "User created", results });
        });
    });
});

// POST /api/login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const myQuery = "SELECT * FROM Users WHERE Email = ?";
    db.query(myQuery, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: "DB network error", err });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, results[0].Password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = await jwt.sign(
            {
                id: results[0].UserID,
                email: results[0].Email,
                role: results[0].Role
            },
            "secretKey",
            { expiresIn: "1d" }
        );
        if (!token) {
            return res.status(500).json({ message: "Token generation failed" });
        }

        return res.status(200).json({ message: "Login successfully", token });
    });
});

// POST /api/logout  (client drops the token; this just confirms)
app.post('/api/logout', (req, res) => res.json({ message: 'Logged out' }));

// GET /api/me
app.get('/api/me', verifyToken, (req, res) => res.json({ user: req.user }));


// ─── SPARE PARTS ──────────────────────────────────────────────────────────────

// GET /api/spare-parts
app.get("/api/spare-parts", verifyToken, (req, res) => {
    const myQuery = "SELECT * FROM Spare_Part ORDER BY Name";
    db.query(myQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Server error", err });
        }
        return res.status(200).json({ message: "Got spare parts", results });
    });
});

// POST /api/spare-parts  (admin only)
app.post("/api/spare-parts", verifyToken, checkRole("admin"), (req, res) => {
    const { name, category, quantity, unitPrice } = req.body;

    const myQuery = "INSERT INTO Spare_Part (Name, Category, Quantity, UnitPrice) VALUES (?,?,?,?)";
    db.query(myQuery, [name, category, quantity, unitPrice], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Cannot create spare part", err });
        }
        return res.status(201).json({ message: "Spare part created", results });
    });
});

// GET /api/spare-parts/:id
app.get("/api/spare-parts/:id", verifyToken, (req, res) => {
    const id = req.params.id;

    const myQuery = "SELECT * FROM Spare_Part WHERE SparePartID = ?";
    db.query(myQuery, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "ID not found", err });
        }
        return res.status(200).json({ message: "Spare part found", results });
    });
});

// ─── STOCK IN ─────────────────────────────────────────────────────────────────

// GET /api/stock-in
app.get("/api/stock-in", verifyToken, (req, res) => {
    const myQuery = `
        SELECT si.*, sp.Name AS PartName
        FROM Stock_In si
        JOIN Spare_Part sp ON si.SparePartID = sp.SparePartID
        ORDER BY si.StockInDate DESC
    `;
    db.query(myQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Server error", err });
        }
        return res.status(200).json({ message: "Got stock in records", results });
    });
});

// POST /api/stock-in
app.post("/api/stock-in", verifyToken, (req, res) => {
    const { sparePartId, stockInQuantity, stockInDate } = req.body;

    const insertQuery = "INSERT INTO Stock_In (SparePartID, StockInQuantity, StockInDate) VALUES (?,?,?)";
    db.query(insertQuery, [sparePartId, stockInQuantity, stockInDate], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Cannot record stock in", err });
        }

        // update spare part quantity
        const updateQuery = "UPDATE Spare_Part SET Quantity = Quantity + ? WHERE SparePartID = ?";
        db.query(updateQuery, [stockInQuantity, sparePartId], (err2) => {
            if (err2) {
                return res.status(500).json({ message: "Stock in saved but quantity update failed", err2 });
            }
            return res.status(201).json({ message: "Stock in recorded", results });
        });
    });
});

// ─── STOCK OUT ────────────────────────────────────────────────────────────────

// GET /api/stock-out
app.get("/api/stock-out", verifyToken, (req, res) => {
    const myQuery = `
        SELECT so.*, sp.Name AS PartName, u.Email
        FROM Stock_Out so
        JOIN Spare_Part sp ON so.SparePartID = sp.SparePartID
        JOIN Users u       ON so.UserID = u.UserID
        ORDER BY so.StockOutDate DESC
    `;
    db.query(myQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Server error", err });
        }
        return res.status(200).json({ message: "Got stock out records", results });
    });
});

// POST /api/stock-out
app.post("/api/stock-out", verifyToken, (req, res) => {
    const { sparePartId, stockOutQuantity, stockOutUnitPrice, stockOutDate } = req.body;

    // first check available quantity
    const checkQuery = "SELECT Quantity FROM Spare_Part WHERE SparePartID = ?";
    db.query(checkQuery, [sparePartId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "DB error", err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Spare part not found" });
        }
        if (results[0].Quantity < stockOutQuantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        const insertQuery = `
            INSERT INTO Stock_Out (SparePartID, UserID, StockOutQuantity, StockOutUnitPrice, StockOutDate)
            VALUES (?,?,?,?,?)
        `;
        db.query(insertQuery, [sparePartId, req.user.id, stockOutQuantity, stockOutUnitPrice, stockOutDate], (err2, results2) => {
            if (err2) {
                return res.status(500).json({ message: "Cannot record stock out", err2 });
            }

            // deduct from spare part quantity
            const updateQuery = "UPDATE Spare_Part SET Quantity = Quantity - ? WHERE SparePartID = ?";
            db.query(updateQuery, [stockOutQuantity, sparePartId], (err3) => {
                if (err3) {
                    return res.status(500).json({ message: "Stock out saved but quantity update failed", err3 });
                }
                return res.status(201).json({ message: "Stock out recorded", results: results2 });
            });
        });
    });
});

// GET /api/stock-out/:id
app.get("/api/stock-out/:id", verifyToken, (req, res) => {
    const id = req.params.id;

    const myQuery = `
        SELECT so.*, sp.Name AS PartName, u.Email
        FROM Stock_Out so
        JOIN Spare_Part sp ON so.SparePartID = sp.SparePartID
        JOIN Users u       ON so.UserID = u.UserID
        WHERE so.StockOutID = ?
    `;
    db.query(myQuery, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "ID not found", err });
        }
        return res.status(200).json({ message: "Stock out found", results });
    });
});

// PUT /api/stock-out/:id
app.put("/api/stock-out/:id", verifyToken, checkRole("admin"), (req, res) => {
    const { stockOutQuantity, stockOutUnitPrice, stockOutDate } = req.body;
    const id = req.params.id;

    const myQuery = `
        UPDATE Stock_Out
        SET StockOutQuantity = ?, StockOutUnitPrice = ?, StockOutDate = ?
        WHERE StockOutID = ?
    `;
    db.query(myQuery, [stockOutQuantity, stockOutUnitPrice, stockOutDate, id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Cannot update stock out", err });
        }
        return res.status(200).json({ message: "Stock out updated", results });
    });
});

// DELETE /api/stock-out/:id
app.delete("/api/stock-out/:id", verifyToken, checkRole("admin"), (req, res) => {
    const id = req.params.id;

    const myQuery = "DELETE FROM Stock_Out WHERE StockOutID = ?";
    db.query(myQuery, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Cannot delete stock out", err });
        }
        return res.status(200).json({ message: "Stock out deleted", results });
    });
});

// ─── REPORTS ──────────────────────────────────────────────────────────────────

// GET /api/reports/daily?date=2025-01-15
app.get("/api/reports/daily", verifyToken, (req, res) => {
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const myQuery = `
        SELECT so.StockOutID, sp.Name AS PartName, sp.Category,
               so.StockOutQuantity, so.StockOutUnitPrice, so.StockOutTotalPrice,
               so.StockOutDate, u.Email
        FROM Stock_Out so
        JOIN Spare_Part sp ON so.SparePartID = sp.SparePartID
        JOIN Users u       ON so.UserID = u.UserID
        WHERE so.StockOutDate = ?
        ORDER BY so.StockOutID
    `;
    db.query(myQuery, [date], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Server error", err });
        }
        return res.status(200).json({ message: "Daily report", results });
    });
});

// GET /api/reports/status
app.get("/api/reports/status", verifyToken, (req, res) => {
    const myQuery = `
        SELECT
            sp.SparePartID,
            sp.Name,
            sp.Category,
            COALESCE(SUM(si.StockInQuantity),  0) AS TotalIn,
            COALESCE(SUM(so.StockOutQuantity), 0) AS TotalOut,
            sp.Quantity AS RemainingQuantity
        FROM Spare_Part sp
        LEFT JOIN Stock_In  si ON sp.SparePartID = si.SparePartID
        LEFT JOIN Stock_Out so ON sp.SparePartID = so.SparePartID
        GROUP BY sp.SparePartID, sp.Name, sp.Category, sp.Quantity
        ORDER BY sp.Name
    `;
    db.query(myQuery, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Server error", err });
        }
        return res.status(200).json({ message: "Stock status report", results });
    });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});