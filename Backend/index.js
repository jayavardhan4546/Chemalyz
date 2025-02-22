require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Corrected frontend path (now inside Backend/build)
const FRONTEND_DIR = path.join(__dirname, 'Backend', 'build');

// Paths for file operations
const TEMP_IMAGE_PATH = path.join(__dirname, 'temp_image.jpg');
const CHEMICAL_NAMES_PATH = path.join(__dirname, 'chemical_names.txt');
const ANS_FILE_PATH = path.join(__dirname, 'ans.txt');
const OCR_SCRIPT_PATH = path.join(__dirname, 'OCR_text.py');
const GENERATE_SCRIPT_PATH = path.join(__dirname, 'generate.py');

// Middleware
app.use(cors());
app.use(express.static(FRONTEND_DIR));  // ✅ Serve React build folder
app.use(express.json());

// Multer configuration for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Handle OCR image upload and processing
 */
app.post('/analyze', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    try {
        fs.writeFileSync(TEMP_IMAGE_PATH, req.file.buffer);
    } catch (err) {
        console.error('Error saving image:', err);
        return res.status(500).json({ error: 'Failed to save image' });
    }

    if (!fs.existsSync(OCR_SCRIPT_PATH)) {
        console.error(`OCR script not found: ${OCR_SCRIPT_PATH}`);
        return res.status(500).json({ error: 'OCR script not found' });
    }

    const pythonProcess = spawn('python', [OCR_SCRIPT_PATH, TEMP_IMAGE_PATH], { cwd: __dirname });
    let output = '', errorOutput = '';

    pythonProcess.stdout.on('data', (data) => output += data.toString());
    pythonProcess.stderr.on('data', (data) => errorOutput += data.toString());

    pythonProcess.on('close', (code) => {
        fs.unlinkSync(TEMP_IMAGE_PATH);
        if (code === 0) {
            try {
                fs.writeFileSync(CHEMICAL_NAMES_PATH, output.trim());
                res.json({
                    message: 'OCR completed successfully.',
                    extractedText: output.trim(),
                    file: 'chemical_names.txt'
                });
            } catch (err) {
                console.error('Error writing extracted text:', err);
                res.status(500).json({ error: 'Failed to write extracted text' });
            }
        } else {
            console.error('OCR Error:', errorOutput);
            res.status(500).json({ error: 'Failed to extract text using OCR' });
        }
    });
});

/**
 * Handle "Generate" button click to process chemical names
 */
app.get('/generate', (req, res) => {
    if (!fs.existsSync(CHEMICAL_NAMES_PATH)) {
        return res.status(400).json({ error: 'No chemical names extracted yet' });
    }

    if (!fs.existsSync(GENERATE_SCRIPT_PATH)) {
        console.error(`Generation script not found: ${GENERATE_SCRIPT_PATH}`);
        return res.status(500).json({ error: 'Generation script not found' });
    }

    const generateProcess = spawn('python', [GENERATE_SCRIPT_PATH], { cwd: __dirname });
    let errorOutput = '';

    generateProcess.stderr.on('data', (data) => errorOutput += data.toString());
    generateProcess.on('close', (code) => {
        if (code === 0 && fs.existsSync(ANS_FILE_PATH)) {
            try {
                const ansContent = fs.readFileSync(ANS_FILE_PATH, 'utf8').trim();
                res.json({ generatedText: ansContent });
            } catch (err) {
                console.error('Error reading generated analysis:', err);
                res.status(500).json({ error: 'Failed to read generated analysis' });
            }
        } else {
            console.error('Generation Error:', errorOutput);
            res.status(500).json({ error: 'Failed to generate analysis' });
        }
    });
});

/**
 * Serve Frontend (React App)
 */
app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
