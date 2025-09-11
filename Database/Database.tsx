import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("insight.db");

//  Setup Database (Creates both tables)
export const setupDatabase = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ph ,
        dateTime TEXT
      );
      
      CREATE TABLE IF NOT EXISTS preferences (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        field TEXT,
        value TEXT
      );
    `);
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Database setup error:", error);
  }
};

// Insert Record
export const insertRecord = async (ph: number, dateTime: string) => {
  try {
    await db.runAsync("INSERT INTO records (ph, dateTime) VALUES (?, ?);", [ph, dateTime]);
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

//  Insert Preference
export const insertPreference = async (field: string, value: string) => {
  try {
    await db.runAsync("INSERT OR REPLACE INTO preferences(field, value) VALUES (?, ?);", [field, value]);
    console.log("Preference inserted successfully");
  } catch (error) {
    console.error("Error inserting preference:", error);
  }
};

// Fetch All Records
export const fetchRecords = async (): Promise<Array<{ id: number; ph: number; dateTime: string }>> => {
  try {
    return await db.getAllAsync("SELECT * FROM records;");
  } catch (error) {
    console.error("Error retrieving records:", error);
    return [];
  }
};

// Fetch All Preferences
export const fetchPreferencesAsync = async (): Promise<Array<{ field: string; value: string }>> => {
  try {
    return await db.getAllAsync("SELECT * FROM preferences;");
  } catch (error) {
    console.error("Error retrieving preferences:", error);
    return [];
  }
};

//  Update Preference
export const updateData = async (field: string, value: string) => {
  try {
    await db.runAsync(
      `UPDATE preferences SET value = ? WHERE field = ?;`,
      [value, field] 
    );
    console.log("Data updated successfully");
  } catch (error) {
    console.error("Error updating data:", error);
  }
};

//  Delete Record
export const deleteRecord = async (id: number) => {
  try {
    await db.runAsync("DELETE FROM records WHERE id = ?;", [id]);
    console.log("Record deleted successfully");
  } catch (error) {
    console.error("Error deleting record:", error);
  }
};