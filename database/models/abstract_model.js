const dbmgr = require( '../db');

const db = dbmgr.db

class AbstractModel {
    constructor(tableName) {
        this.tableName = tableName;
    }

    // initializeDatabase(columns) { // Currently not used, as the initialization is done by migration part
        // try {
            // Check if the table exists, if not, create it
            // const tableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(this.tableName);
            // if (!tableExists) {
                // Table doesn't exist, create it
    //             db.prepare(`CREATE TABLE ${this.tableName} (${columns})`).run();
    //         }
    //     } catch (error) {
    //         console.error("Error initializing database:", error);
    //     }
    // }
    
    getAll(where = '', sort = '', limit = '', params = []) {  
        let sql = `SELECT * FROM ${this.tableName}`;
        if (where) sql += ` WHERE ${where}`;
        if (sort) sql += ` ORDER BY ${sort}`;
        if(limit) sql +=` LIMIT ${limit}`

        try {
            const stmt = db.prepare(sql);
            const res = stmt.all(...params);
            return res;
        } catch (error) {
            console.error("Error executing getAll query:", error);
            return [];
        }
    }

    getByField(field, value) {
        const sql = `SELECT * FROM ${this.tableName} WHERE ${field} = ?`;
    
        try {
            const row = db.prepare(sql).get(value);
            return row;
        } catch (error) {
            console.error("Error executing getByField query:", error);
            return null;
        }
    }
    

    delete(value,field) {
        const sql = `DELETE FROM ${this.tableName} WHERE ${field} = ?`;
        try {
            db.prepare(sql).run(value);
            return { success:true };
        } catch (error) {
            console.error("Error executing delete query:", error);
            return { success:false };
        }
    }

    update(value, post, field) {
        const keys = Object.keys(post);
        const values = Object.values(post);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE ${field} = ?`;
        try {
            const stmt = db.prepare(sql);
            const parameters = [...values, value];
            const result = stmt.run(parameters);
            return result;
        } catch (error) {
            console.error("Error executing update query:", error);
            return null;
        }
    }
    
    insert(post) {
        try {
            const columns = Object.keys(post).join(', ');
            const placeholders = Object.keys(post).map(() => '?').join(', ');
            const values = Object.values(post);
    
            const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
            const stmt = db.prepare(sql);
    
            const result = stmt.run(values);
            return result;
        } catch (error) {
            console.error("Error executing insert query:", error);
            return null;
        }
    }
    

}

module.exports = AbstractModel;
