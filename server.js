const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const historyFilePath = path.join(__dirname, 'history.txt');
const statistics = {
    persegi: 0,
    'persegi-panjang': 0,
    lingkaran: 0,
    segitiga: 0,
};



// Middleware
app.use(cors({ origin: 'http://127.0.0.1:5501' })); // memastikan origin sesuai dengan frontend Anda
app.use(express.json());

// Membuat file JSON jika belum ada
if (!fs.existsSync(historyFilePath)) {
    fs.writeFileSync(historyFilePath, JSON.stringify([]));
}

// Route untuk menyimpan history
app.post('/save-history', (req, res) => {
    const { shape, calculationType, result } = req.body;

    if (!shape || !calculationType || !result) {
        return res.status(400).send('Data tidak valid.'); // memeriksa valid atau tidak data itu untuk di save
    }

    fs.readFile(historyFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Gagal membaca file:', err);
            return res.status(500).send('Gagal membaca file.');
        }

        let history = JSON.parse(data);
        const newEntry = { id: history.length + 1, shape, calculationType, result, time: new Date().toISOString() };
        history.push(newEntry);

        if (statistics.hasOwnProperty(shape)) {
            statistics[shape]++;
        } else {
            statistics[shape] = 1; // Menambahkan kategori baru jika belum ada
        }
        

        fs.writeFile(historyFilePath, JSON.stringify(history, null, 2), (err) => {
            if (err) {
                console.error('Gagal menyimpan history:', err);
                return res.status(500).send('Gagal menyimpan history.');
            }
            res.status(200).json({ message: 'Riwayat berhasil disimpan.', history });
        });        
    });
});


// Route untuk mendapatkan history
app.get('/history', (req, res) => {
    fs.readFile(historyFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Gagal membaca file:', err);
            return res.status(500).send('Gagal membaca file.');
        }

        const history = JSON.parse(data);
        res.status(200).json(history);
    });
});

app.get('/statistics', (req, res) => {
    res.json({ statistics });
});



// Menjalankan server
app.listen(8080, () => console.log('Server listening on http://localhost:8080 CUYY'));
