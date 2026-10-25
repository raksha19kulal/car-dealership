
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dealership.db');
const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL CHECK (price >= 0),
        quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
    )
`);

// Add sample vehicles only when the inventory is empty.
const vehicleCount = db.prepare(
    'SELECT COUNT(*) AS count FROM vehicles'
).get().count;

if (vehicleCount === 0) {
    const insertVehicle = db.prepare(`
        INSERT INTO vehicles (make, model, category, price, quantity)
        VALUES (?, ?, ?, ?, ?)
    `);

    insertVehicle.run('Toyota', 'Camry', 'Sedan', 28000, 5);
    insertVehicle.run('Hyundai', 'Creta', 'SUV', 18000, 4);
    insertVehicle.run('Honda', 'Civic', 'Sedan', 25000, 3);
    insertVehicle.run('Tata', 'Nexon EV', 'Electric', 20000, 6);
    insertVehicle.run('Maruti Suzuki', 'Swift', 'Hatchback', 9000, 8);
}

module.exports = db;
