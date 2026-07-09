const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder static
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));

const DATA_DIR = path.join(__dirname, 'data');
const SCHEDULES_FILE = path.join(DATA_DIR, 'schedules.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const VIDEOS_DIR = path.join(__dirname, 'public', 'videos');

// Pastikan folder data dan videos ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// Helper read/write JSON
function readJsonFile(file, defaultData = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultData;
  }
}

function writeJsonFile(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// Konfigurasi Multer untuk Upload Video/Audio
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEOS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}_${cleanName}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 } // limit 500MB
});

// API: Ambil semua berkas video/audio di folder videos
app.get('/api/videos', (req, res) => {
  try {
    fs.readdir(VIDEOS_DIR, (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Gagal memindai folder video.' });
      }

      const mediaFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.mp4' || ext === '.mp3' || ext === '.mpeg' || ext === '.mpg';
      }).map(file => {
        const stats = fs.statSync(path.join(VIDEOS_DIR, file));
        return {
          name: file,
          size: stats.size
        };
      });

      res.json(mediaFiles);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Upload video/audio
app.post('/api/upload', upload.single('videoFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada berkas yang diunggah.' });
  }
  res.status(201).json({
    message: 'Berkas berhasil diunggah.',
    filename: req.file.filename,
    size: req.file.size
  });
});

// API: Hapus video/audio
app.delete('/api/videos/:name', (req, res) => {
  const filename = req.params.name;
  const filePath = path.join(VIDEOS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Berkas tidak ditemukan.' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal menghapus berkas di disk.' });
    }
    res.json({ message: 'Berkas berhasil dihapus.' });
  });
});

// API: Ubah nama berkas (Rename)
app.put('/api/videos/rename', (req, res) => {
  const { oldName, newName } = req.body;
  if (!oldName || !newName) {
    return res.status(400).json({ error: 'Nama lama dan nama baru wajib diisi.' });
  }

  const ext = path.extname(oldName);
  const cleanNewName = newName.replace(ext, '').replace(/[^a-zA-Z0-9.-]/g, '_') + ext;

  const oldPath = path.join(VIDEOS_DIR, oldName);
  const newPath = path.join(VIDEOS_DIR, cleanNewName);

  const schedules = readJsonFile(SCHEDULES_FILE);
  let updated = false;

  const updateSchedulesDb = () => {
    schedules.forEach(sch => {
      if (sch.videoName === oldName) {
        sch.videoName = cleanNewName;
        updated = true;
      }
      if (sch.mediaList) {
        sch.mediaList = sch.mediaList.map(item => {
          if (item === oldName) {
            updated = true;
            return cleanNewName;
          }
          return item;
        });
      }
    });

    if (updated) {
      writeJsonFile(SCHEDULES_FILE, schedules);
    }
  };

  // KASUS 1: File lama sudah tidak ada di disk, tapi file baru SUDAH ADA (berarti pengguna mengubahnya manual di Windows)
  if (!fs.existsSync(oldPath) && fs.existsSync(newPath)) {
    updateSchedulesDb();
    return res.json({ 
      message: 'Sinkronisasi berhasil! Nama jadwal disesuaikan dengan berkas fisik.', 
      newName: cleanNewName,
      manualSync: true 
    });
  }

  // KASUS 2: File lama tidak ada dan file baru juga tidak ada
  if (!fs.existsSync(oldPath)) {
    return res.status(404).json({ error: 'Berkas fisik lama tidak ditemukan di server.' });
  }

  // KASUS 3: File lama ada, tapi nama baru bentrok dengan file lain
  if (fs.existsSync(newPath) && oldName !== cleanNewName) {
    return res.status(400).json({ error: 'Berkas dengan nama baru tersebut sudah ada.' });
  }

  // Lakukan rename fisik file
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Gagal mengubah nama berkas di disk.' });
    }

    updateSchedulesDb();
    res.json({ message: 'Berkas berhasil diubah namanya.', newName: cleanNewName });
  });
});

// API: Ambil semua jadwal
app.get('/api/schedules', (req, res) => {
  res.json(readJsonFile(SCHEDULES_FILE));
});

// API: Simpan/Tambah jadwal baru
app.post('/api/schedules', (req, res) => {
  const { videoName, mediaList, timeSlots, loop } = req.body;

  if (!videoName || !timeSlots || timeSlots.length === 0) {
    return res.status(400).json({ error: 'Nama video dan slot waktu wajib diisi.' });
  }

  const schedules = readJsonFile(SCHEDULES_FILE);
  const newSchedule = {
    id: Date.now().toString(),
    videoName,
    mediaList: mediaList || [videoName],
    timeSlots,
    loop: loop !== undefined ? loop : true,
    createdAt: new Date().toISOString()
  };

  schedules.push(newSchedule);
  writeJsonFile(SCHEDULES_FILE, schedules);
  res.status(201).json(newSchedule);
});

// API: Edit jadwal (Update mediaList, timeSlots, dan loop)
app.put('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  const { videoName, mediaList, timeSlots, loop } = req.body;

  const schedules = readJsonFile(SCHEDULES_FILE);
  const index = schedules.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Jadwal tidak ditemukan.' });
  }

  schedules[index].videoName = videoName || schedules[index].videoName;
  schedules[index].mediaList = mediaList || schedules[index].mediaList;
  schedules[index].timeSlots = timeSlots || schedules[index].timeSlots;
  schedules[index].loop = loop !== undefined ? loop : schedules[index].loop;

  writeJsonFile(SCHEDULES_FILE, schedules);
  res.json(schedules[index]);
});

// API: Hapus jadwal
app.delete('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  let schedules = readJsonFile(SCHEDULES_FILE);
  const exists = schedules.some(s => s.id === id);

  if (!exists) {
    return res.status(404).json({ error: 'Jadwal tidak ditemukan.' });
  }

  schedules = schedules.filter(s => s.id !== id);
  writeJsonFile(SCHEDULES_FILE, schedules);
  res.json({ message: 'Jadwal berhasil dihapus.' });
});

// API: Mendapatkan log pemutaran
app.get('/api/logs', (req, res) => {
  const logs = readJsonFile(LOGS_FILE);
  res.json(logs.reverse().slice(0, 100));
});

// API: Menambahkan log baru
app.post('/api/logs', (req, res) => {
  const { event, videoName, details } = req.body;
  if (!event || !videoName) {
    return res.status(400).json({ error: 'Log event dan nama video wajib diisi.' });
  }

  const logs = readJsonFile(LOGS_FILE);
  const newLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    event,
    videoName,
    details: details || ''
  };

  logs.push(newLog);
  if (logs.length > 500) {
    logs.shift();
  }
  writeJsonFile(LOGS_FILE, logs);
  res.status(201).json(newLog);
});


// Rute fallback untuk SPA frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Mulai Server
app.listen(PORT, () => {
  const networkInterfaces = os.networkInterfaces();
  const ipAddresses = [];

  for (const interfaceName in networkInterfaces) {
    for (const net of networkInterfaces[interfaceName]) {
      if (net.family === 'IPv4' && !net.internal) {
        ipAddresses.push(net.address);
      }
    }
  }

  console.log(`====================================================`);
  console.log(` Server Pemutar Video Terjadwal Aktif!`);
  console.log(` Akses Lokal (PC ini):`);
  console.log(` http://localhost:${PORT}`);
  console.log(`\n Akses Jaringan Lokal (Wi-Fi yang sama untuk HP/PC lain):`);
  ipAddresses.forEach(ip => {
    console.log(` http://${ip}:${PORT}`);
  });
  console.log(`====================================================`);
});
