import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// Enable CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// In-Memory Document Store
const documentsStore = new Map();

// Initialize default sample document
const sampleDocId = 'doc_sample_001';
documentsStore.set(sampleDocId, {
  id: sampleDocId,
  documentId: sampleDocId,
  documentName: 'Sample_Supreme_Court_Judgment.txt',
  text: `In the High Court of Delhi, Petitioner Ramesh Kumar filed a writ petition against Respondent State of Delhi under Section 482 of the Code of Criminal Procedure, 1973 on 12th January 2024. Justice S. Muralidhar presided over the hearing. Advocates Sanjay Jain and Arvind Datar appeared for the petitioner.`,
  entities: [
    { entity: 'COURT', text: 'High Court of Delhi', start: 7, end: 26, score: 0.9959 },
    { entity: 'PETITIONER', text: 'Ramesh Kumar', start: 39, end: 51, score: 0.9799 },
    { entity: 'RESPONDENT', text: 'State of Delhi', start: 89, end: 103, score: 0.9127 },
    { entity: 'PROVISION', text: 'Section 482', start: 110, end: 121, score: 0.998 },
    { entity: 'STATUTE', text: 'Code of Criminal Procedure, 1973', start: 129, end: 161, score: 0.9949 },
    { entity: 'DATE', text: '12th January 2024', start: 165, end: 182, score: 0.9876 },
    { entity: 'JUDGE', text: 'S. Muralidhar', start: 192, end: 205, score: 0.9949 },
    { entity: 'LAWYER', text: 'Sanjay Jain', start: 242, end: 253, score: 0.985 },
    { entity: 'LAWYER', text: 'Arvind Datar', start: 258, end: 270, score: 0.982 },
  ],
  entityCount: 9,
  processingTime: 0.12,
  createdAt: new Date().toISOString(),
});

// -------------------------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  let mlStatus = 'unreachable';
  try {
    const mlHealth = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 3000 });
    mlStatus = mlHealth.data;
  } catch (err) {
    mlStatus = 'offline';
  }

  res.json({
    status: 'healthy',
    backend: 'Node.js Express API Gateway',
    port: PORT,
    mlService: mlStatus,
  });
});

// -------------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    token: `jwt_token_${Date.now()}`,
    user: { id: 'user_litigant_01', name: 'Litigant User', email: email || 'user@legal.ai', role: 'Self-represented Litigant' },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email } = req.body;
  res.json({
    token: `jwt_token_${Date.now()}`,
    user: { id: `user_${Date.now()}`, name: name || 'New User', email, role: 'Self-represented Litigant' },
  });
});

// -------------------------------------------------------------------
// DOCUMENT ANALYSIS ROUTES
// -------------------------------------------------------------------

// 1. Analyze Raw Text
app.post('/api/analysis/text', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    console.log(`[Express Backend] Forwarding text (${text.length} chars) to FastAPI ML Service...`);

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict-entities`, { text }, { timeout: 120000 });
    const result = mlResponse.data;

    const docId = result.documentId || `doc_${Date.now()}`;
    const docRecord = {
      id: docId,
      documentId: docId,
      documentName: 'Text_Analysis_Input.txt',
      text: result.text,
      entities: result.entities,
      entityCount: result.entityCount,
      processingTime: result.processingTime,
      createdAt: new Date().toISOString(),
    };

    documentsStore.set(docId, docRecord);
    res.json(docRecord);
  } catch (err) {
    console.error('[Express Backend] Error during text analysis:', err.message);
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(500).json({ error: 'Failed to connect to ML Service', details: err.message });
  }
});

// 2. Analyze Uploaded Document (PDF / TXT)
app.post('/api/analysis/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    console.log(`[Express Backend] Received file: ${fileName} (${req.file.size} bytes)`);

    let textContent = '';

    if (fileName.endsWith('.txt')) {
      textContent = fs.readFileSync(filePath, 'utf-8');
    } else {
      // Send file to FastAPI parse-and-predict endpoint
      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath), fileName);

      const mlResponse = await axios.post(`${ML_SERVICE_URL}/parse-and-predict`, form, {
        headers: form.getHeaders(),
        timeout: 180000,
      });

      const result = mlResponse.data;
      const docId = result.documentId || `doc_${Date.now()}`;
      const docRecord = {
        id: docId,
        documentId: docId,
        documentName: fileName,
        text: result.text,
        entities: result.entities,
        entityCount: result.entityCount,
        processingTime: result.processingTime,
        createdAt: new Date().toISOString(),
      };

      documentsStore.set(docId, docRecord);
      return res.json(docRecord);
    }

    // Standard text analysis for .txt
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict-entities`, { text: textContent }, { timeout: 120000 });
    const result = mlResponse.data;

    const docId = result.documentId || `doc_${Date.now()}`;
    const docRecord = {
      id: docId,
      documentId: docId,
      documentName: fileName,
      text: result.text,
      entities: result.entities,
      entityCount: result.entityCount,
      processingTime: result.processingTime,
      createdAt: new Date().toISOString(),
    };

    documentsStore.set(docId, docRecord);
    res.json(docRecord);
  } catch (err) {
    console.error('[Express Backend] Upload processing error:', err.message);
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(500).json({ error: 'Failed to process document file', details: err.message });
  }
});

// -------------------------------------------------------------------
// ENTITIES & DOCUMENTS FETCH ROUTES
// -------------------------------------------------------------------
app.get('/api/entities/:documentId', (req, res) => {
  const { documentId } = req.params;
  const doc = documentsStore.get(documentId);

  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json({ entities: doc.entities });
});

app.get('/api/documents', (req, res) => {
  const docsList = Array.from(documentsStore.values()).map((d) => ({
    id: d.id,
    documentId: d.documentId,
    documentName: d.documentName || 'Legal Document',
    textSnippet: d.text.slice(0, 150) + '...',
    entityCount: d.entityCount,
    createdAt: d.createdAt,
  }));
  res.json(docsList);
});

app.get('/api/documents/:documentId', (req, res) => {
  const { documentId } = req.params;
  const doc = documentsStore.get(documentId);

  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json(doc);
});

// -------------------------------------------------------------------
// DASHBOARD STATS & PROFILE
// -------------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  let totalEntities = 0;
  for (const doc of documentsStore.values()) {
    totalEntities += doc.entityCount || 0;
  }

  res.json({
    documentsAnalyzed: documentsStore.size,
    entitiesExtracted: totalEntities,
    proceduralEvents: Math.round(totalEntities * 0.4),
    questionsAsked: 12,
  });
});

app.get('/api/profile', (req, res) => {
  res.json({
    id: 'user_001',
    name: 'Litigant User',
    email: 'litigant@lpi.ai',
    role: 'Self-represented Litigant',
    joinedAt: '2024-01-01',
    documentsAnalyzed: documentsStore.size,
  });
});

app.post('/api/qa', (req, res) => {
  const { question } = req.body;
  res.json({
    answer: `Based on Model 1 legal analysis, the question "${question}" relates to procedural timelines and section requirements.`,
    evidence: [
      { text: 'Section 482 of CrPC provides inherent powers of the High Court.', score: 0.95 },
    ],
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Node.js Express Backend running on http://localhost:${PORT}`);
  console.log(`Proxying ML requests to FastAPI: ${ML_SERVICE_URL}`);
  console.log(`=======================================================`);
});
