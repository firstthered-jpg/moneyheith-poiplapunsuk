const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    // Transactions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'completed',
        receiptUrl TEXT,
        tags TEXT,
        isFavorite INTEGER DEFAULT 0,
        deductions TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Goals table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        targetAmount REAL NOT NULL,
        currentAmount REAL DEFAULT 0,
        category TEXT,
        deadline TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
  }

  // Transaction operations
  getTransactions() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM transactions ORDER BY date DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  addTransaction(transaction) {
    return new Promise((resolve, reject) => {
      const {
        id,
        type,
        amount,
        category,
        description,
        date,
        status,
        receiptUrl,
        tags,
        isFavorite,
        deductions,
      } = transaction;

      this.db.run(
        `INSERT INTO transactions (id, type, amount, category, description, date, status, receiptUrl, tags, isFavorite, deductions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          type,
          amount,
          category,
          description,
          date,
          status || 'completed',
          receiptUrl,
          JSON.stringify(tags || []),
          isFavorite ? 1 : 0,
          JSON.stringify(deductions || []),
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ id, ...transaction });
        }
      );
    });
  }

  updateTransaction(id, transaction) {
    return new Promise((resolve, reject) => {
      const {
        type,
        amount,
        category,
        description,
        date,
        status,
        receiptUrl,
        tags,
        isFavorite,
        deductions,
      } = transaction;

      this.db.run(
        `UPDATE transactions SET type=?, amount=?, category=?, description=?, date=?, status=?, receiptUrl=?, tags=?, isFavorite=?, deductions=?
         WHERE id=?`,
        [
          type,
          amount,
          category,
          description,
          date,
          status,
          receiptUrl,
          JSON.stringify(tags || []),
          isFavorite ? 1 : 0,
          JSON.stringify(deductions || []),
          id,
        ],
        function (err) {
          if (err) reject(err);
          else resolve({ id, ...transaction });
        }
      );
    });
  }

  deleteTransaction(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM transactions WHERE id=?', [id], function (err) {
        if (err) reject(err);
        else resolve({ id });
      });
    });
  }

  // Goals operations
  getGoals() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM goals ORDER BY createdAt DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  addGoal(goal) {
    return new Promise((resolve, reject) => {
      const { id, name, targetAmount, currentAmount, category, deadline } = goal;

      this.db.run(
        `INSERT INTO goals (id, name, targetAmount, currentAmount, category, deadline)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, targetAmount, currentAmount || 0, category, deadline],
        function (err) {
          if (err) reject(err);
          else resolve({ id, ...goal });
        }
      );
    });
  }

  updateGoal(id, goal) {
    return new Promise((resolve, reject) => {
      const { name, targetAmount, currentAmount, category, deadline } = goal;

      this.db.run(
        `UPDATE goals SET name=?, targetAmount=?, currentAmount=?, category=?, deadline=?
         WHERE id=?`,
        [name, targetAmount, currentAmount, category, deadline, id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, ...goal });
        }
      );
    });
  }

  deleteGoal(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM goals WHERE id=?', [id], function (err) {
        if (err) reject(err);
        else resolve({ id });
      });
    });
  }

  // Settings
  getSetting(key) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT value FROM settings WHERE key=?', [key], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.value : null);
      });
    });
  }

  setSetting(key, value) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value],
        function (err) {
          if (err) reject(err);
          else resolve({ key, value });
        }
      );
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;
