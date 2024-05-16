const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
console.log("process.env.dbPath",process.env.dbPath)
const db = new Database(process.env.dbPath)
db.pragma('journal_mode = WAL');


// Function to initialize migration tracking table and apply pending migrations
// const initializeMigrations = async () => {
//     console.log("running the migrations")
//     // Create a table to track migrations
//     // const sql = db.prepare()
//     db.run(`CREATE TABLE IF NOT EXISTS migrations (
//         id INTEGER PRIMARY KEY,
//         name TEXT,
//         applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     )`);

//     console.log("after ")

//     // Read migration files
//     const migrationFiles = fs.readdirSync(path.join(__dirname, 'migrations')).sort();

//     for (const file of migrationFiles) {
//         const migration = require(`./migrations/${file}`);
//         const migrationName = path.parse(file).name;
//         console.log("getting migration ")
//         // Check if this migration has already been applied
//         db.get(`SELECT name FROM migrations WHERE name = ?`, [migrationName], (err, row) => {
//             if (err) throw err;
            
//             if (!row) {
//                 // Run migration if it hasn't been applied
//                 db.run(migration.up, [], function(err) {
//                     if (err) throw err;
//                     // Log the applied migration
//                     db.run(`INSERT INTO migrations (name) VALUES (?)`, [migrationName], (err) => {
//                         if (err) throw err;
//                         console.log(`Migration ${migrationName} applied.`);
//                     });
//                 });
//             }
//         });
//     }
// };

const initializeMigrations = async () => {
    try {
        const stmt = db.prepare(`CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY,
            name TEXT,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        stmt.run();
        // Read migration files
        const migrationFiles = fs.readdirSync(path.join(__dirname, 'migrations')).sort();
     
        for (const file of migrationFiles) {
            const migration = require(`./migrations/${file}`);
         
            const migrationName = path.parse(file).name;
      
            // Check if this migration has already been applied
            const q = db.prepare(`SELECT name FROM migrations WHERE name = ?`);
        
            const row = q.get(migrationName) ; // Execute the SELECT query using get()
         
            if (!row) {
                for (const m of migration.up){
                    // db.prepare(m).run();
                    console.log("7 ==> M ==> ", m," == m.migration.up ===> ", migration.up, db.prepare(m).run())
                }
                console.log("8", db.prepare(`INSERT INTO migrations (name) VALUES (?)`).run(migrationName))
                // db.prepare(`INSERT INTO migrations (name) VALUES (?)`).run(migrationName)
            }
        }
    } catch (err) {
        console.error("Error creating table:", err);
    }
};

initializeMigrations()

// Export db function
module.exports = { db };


