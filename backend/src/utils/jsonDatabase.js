const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data'); // Path ke backend/data/

// Pastikan file JSON ada, jika tidak buat array kosong
function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

// Fungsi utama untuk membaca JSON
function readData(modelName) {
  const filePath = path.join(dataDir, `${modelName}.json`);
  ensureFileExists(filePath);
  const fileData = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(fileData);
  } catch (e) {
    return [];
  }
}

// Fungsi utama untuk menulis ke JSON
function writeData(modelName, data) {
  const filePath = path.join(dataDir, `${modelName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Menghasilkan ID Auto-Increment
function getNextId(dataArray) {
  if (dataArray.length === 0) return 1;
  const maxId = Math.max(...dataArray.map((item) => item.id));
  return maxId + 1;
}

// --- CRUD Dasar ---

const db = {
  // Model: 'users', 'services', 'orders'

  findMany: (modelName, filterFn = null) => {
    let data = readData(modelName);
    
    // TAHAP 6: Mapping relasi saat mengambil Order
    if (modelName === 'orders') {
      const users = readData('users');
      data = data.map(order => {
        // Melakukan mapping "JOIN" dengan JSON Users
        const user = users.find(u => u.id === order.userId);
        return {
          ...order,
          user: user || null // Menyematkan data user (seperti include: { user: true } di Prisma)
        };
      });
    }

    if (filterFn) {
      data = data.filter(filterFn);
    }
    return data;
  },

  findUnique: (modelName, id) => {
    const data = db.findMany(modelName); // Menggunakan findMany agar otomatis mendapat mapping jika orders
    return data.find((item) => item.id === parseInt(id)) || null;
  },

  findFirst: (modelName, filterFn) => {
    const data = db.findMany(modelName);
    return data.find(filterFn) || null;
  },

  create: (modelName, itemData) => {
    const data = readData(modelName);
    const newItem = {
      id: getNextId(data),
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newItem);
    writeData(modelName, data);
    return newItem;
  },

  update: (modelName, id, updateData) => {
    const data = readData(modelName);
    const index = data.findIndex((item) => item.id === parseInt(id));
    if (index === -1) return null;

    data[index] = {
      ...data[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeData(modelName, data);
    return data[index];
  },

  delete: (modelName, id) => {
    let data = readData(modelName);
    const index = data.findIndex((item) => item.id === parseInt(id));
    if (index === -1) return null;

    const deletedItem = data.splice(index, 1)[0];
    writeData(modelName, data);
    return deletedItem;
  }
};

module.exports = db;
