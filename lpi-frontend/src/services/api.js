/**
 * src/services/api.js
 * ---------------------------------------------------------------
 * Centralized API service for the Legal Procedural Intelligence app.
 *
 * Architecture:
 *   React Frontend
 *       ↓  (this file — Axios)
 *   Node.js Express  (VITE_API_URL = http://localhost:5000/api)
 *       ↓
 *   Python FastAPI   (http://127.0.0.1:8000)
 *       ↓
 *   BERT Legal NER Model
 *
 * When the Node.js backend is not running, all API calls fall back
 * to mock data automatically (when VITE_USE_MOCK_FALLBACK=true).
 * ---------------------------------------------------------------
 */
import axios from 'axios';
import {
  MOCK_ANALYSIS_RESULT,
  MOCK_DOCUMENTS,
  MOCK_DASHBOARD_STATS,
  getMockQAResponse,
} from './mockData';

// ----------------------------------------------------------------
// Axios instance — all requests go through here
// ----------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lpi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------------------------------------------
// Mock fallback helper
// ----------------------------------------------------------------
const USE_MOCK = import.meta.env.VITE_USE_MOCK_FALLBACK === 'true';

function mockDelay(ms = 800) {
  return new Promise((res) => setTimeout(res, ms));
}

async function withMockFallback(apiCall, mockData) {
  try {
    return await apiCall();
  } catch (err) {
    const isNetworkError = !err.response; // backend not running
    if (USE_MOCK && isNetworkError) {
      console.warn(
        '[LPI API] Backend unreachable — using mock data. Start the Node.js backend to use real data.'
      );
      await mockDelay();
      return mockData;
    }
    throw err;
  }
}

// ----------------------------------------------------------------
// AUTH endpoints
// ----------------------------------------------------------------

/**
 * Login user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function login(email, password) {
  return withMockFallback(
    () => api.post('/auth/login', { email, password }).then((r) => r.data),
    {
      token: 'mock_jwt_token_' + Date.now(),
      user: { id: 'user_001', name: 'Demo User', email, role: 'litigant' },
    }
  );
}

/**
 * Register new user.
 * @param {object} userData - { name, email, password }
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function register(userData) {
  return withMockFallback(
    () => api.post('/auth/register', userData).then((r) => r.data),
    {
      token: 'mock_jwt_token_' + Date.now(),
      user: { id: 'user_002', name: userData.name, email: userData.email, role: 'litigant' },
    }
  );
}

// ----------------------------------------------------------------
// DOCUMENT ANALYSIS endpoints
// ----------------------------------------------------------------

/**
 * Analyze a raw legal text string.
 * Calls: POST /api/analysis/text → Node.js → POST /predict-entities (FastAPI)
 *
 * @param {string} text - Legal document text
 * @returns {Promise<{ documentId, text, entities, entityCount, processingTime }>}
 */
export async function analyzeText(text) {
  return withMockFallback(
    () => api.post('/analysis/text', { text }).then((r) => r.data),
    { ...MOCK_ANALYSIS_RESULT, text }
  );
}

/**
 * Upload a PDF document for analysis.
 * Calls: POST /api/analysis/upload (multipart/form-data)
 *
 * @param {File} file - PDF file object
 * @param {function} onProgress - optional upload progress callback (0-100)
 * @returns {Promise<{ documentId, text, entities, entityCount, processingTime }>}
 */
export async function uploadDocument(file, onProgress) {
  const formData = new FormData();
  formData.append('document', file);

  return withMockFallback(
    () =>
      api
        .post('/analysis/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
          },
        })
        .then((r) => r.data),
    { ...MOCK_ANALYSIS_RESULT, documentName: file.name }
  );
}

/**
 * Fetch entities for a previously analyzed document by ID.
 * Calls: GET /api/entities/:documentId
 *
 * @param {string} documentId
 * @returns {Promise<{ entities: Entity[] }>}
 */
export async function getEntities(documentId) {
  return withMockFallback(
    () => api.get(`/entities/${documentId}`).then((r) => r.data),
    { entities: MOCK_ANALYSIS_RESULT.entities }
  );
}

// ----------------------------------------------------------------
// DOCUMENT HISTORY endpoints
// ----------------------------------------------------------------

/**
 * Fetch all previously analyzed documents for the current user.
 * Calls: GET /api/documents
 *
 * @returns {Promise<Document[]>}
 */
export async function getDocuments() {
  return withMockFallback(
    () => api.get('/documents').then((r) => r.data),
    MOCK_DOCUMENTS
  );
}

/**
 * Fetch a single document with its full analysis.
 * Calls: GET /api/documents/:documentId
 *
 * @param {string} documentId
 * @returns {Promise<Document>}
 */
export async function getDocument(documentId) {
  return withMockFallback(
    () => api.get(`/documents/${documentId}`).then((r) => r.data),
    { ...MOCK_ANALYSIS_RESULT, id: documentId }
  );
}

// ----------------------------------------------------------------
// LEGAL QA / RAG endpoints
// ----------------------------------------------------------------

/**
 * Ask a legal question about a document.
 * Calls: POST /api/qa
 *
 * TODO (RAG integration): This endpoint will call your RAG backend.
 * Expected response: { answer: string, evidence: { text, score }[] }
 *
 * @param {string} question - Natural language question
 * @param {string} documentId - Document context
 * @returns {Promise<{ answer: string, evidence: Array }>}
 */
export async function askLegalQuestion(question, documentId) {
  return withMockFallback(
    () => api.post('/qa', { question, documentId }).then((r) => r.data),
    getMockQAResponse(question)
  );
}

// ----------------------------------------------------------------
// DASHBOARD STATS endpoint
// ----------------------------------------------------------------

/**
 * Fetch dashboard statistics for the current user.
 * Calls: GET /api/stats
 *
 * @returns {Promise<{ documentsAnalyzed, entitiesExtracted, proceduralEvents, questionsAsked }>}
 */
export async function getDashboardStats() {
  return withMockFallback(
    () => api.get('/stats').then((r) => r.data),
    MOCK_DASHBOARD_STATS
  );
}

// ----------------------------------------------------------------
// PROFILE endpoint
// ----------------------------------------------------------------

/**
 * Fetch the current user's profile.
 * Calls: GET /api/profile
 */
export async function getProfile() {
  return withMockFallback(
    () => api.get('/profile').then((r) => r.data),
    {
      id: 'user_001',
      name: 'Demo User',
      email: 'demo@legalprocedural.ai',
      role: 'Self-represented Litigant',
      joinedAt: '2024-01-01',
      documentsAnalyzed: MOCK_DASHBOARD_STATS.documentsAnalyzed,
    }
  );
}

export default api;
