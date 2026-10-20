/**
 * src/services/mockData.js
 * ---------------------------------------------------------------
 * Isolated mock data layer for the Legal Procedural Intelligence app.
 * All mock responses are defined here so they can be replaced
 * with real API calls without touching the rest of the codebase.
 * ---------------------------------------------------------------
 */

export const MOCK_ENTITIES = [
  { entity: 'COURT',        text: 'Supreme Court of India',       start: 43,  end: 65  },
  { entity: 'JUDGE',        text: 'Justice A.K. Sharma',          start: 75,  end: 94  },
  { entity: 'DATE',         text: '15 January 2024',              start: 102, end: 117 },
  { entity: 'PETITIONER',   text: 'Ramesh Kumar Verma',           start: 4,   end: 21  },
  { entity: 'RESPONDENT',   text: 'State of Maharashtra',         start: 28,  end: 47  },
  { entity: 'LAWYER',       text: 'Adv. Priya Mehta',             start: 130, end: 145 },
  { entity: 'STATUTE',      text: 'Code of Civil Procedure, 1908',start: 180, end: 211 },
  { entity: 'PROVISION',    text: 'Section 34',                   start: 215, end: 225 },
  { entity: 'PRECEDENT',    text: 'Maneka Gandhi v. Union of India',start: 260, end: 294},
  { entity: 'CASE_NUMBER',  text: 'Writ Petition No. 1234/2023',  start: 300, end: 329 },
  { entity: 'ORG',          text: 'National Legal Services Authority', start: 340, end: 375 },
  { entity: 'GPE',          text: 'New Delhi',                    start: 380, end: 389 },
  { entity: 'WITNESS',      text: 'Suresh Babu',                  start: 400, end: 410 },
  { entity: 'DATE',         text: '22 March 2023',                start: 420, end: 434 },
  { entity: 'JUDGE',        text: 'Justice B.L. Narayana',        start: 450, end: 470 },
];

export const MOCK_ANALYSIS_RESULT = {
  documentId: 'doc_mock_001',
  text: 'Ramesh Kumar Verma versus State of Maharashtra before the Supreme Court of India. Justice A.K. Sharma presided over the hearing on 15 January 2024. The petitioner was represented by Adv. Priya Mehta. The court examined provisions under the Code of Civil Procedure, 1908 specifically Section 34. Reliance was placed on the precedent Maneka Gandhi v. Union of India as cited in Writ Petition No. 1234/2023. The National Legal Services Authority office in New Delhi submitted an amicus brief. Witness Suresh Babu testified on 22 March 2023 before Justice B.L. Narayana.',
  entities: MOCK_ENTITIES,
  entityCount: MOCK_ENTITIES.length,
  processingTime: '1.24s',
};

export const MOCK_DOCUMENTS = [
  {
    id: 'doc_001',
    name: 'Writ Petition - Environmental Case.pdf',
    dateAnalyzed: '2024-01-15',
    entityCount: 23,
    status: 'completed',
    type: 'pdf',
  },
  {
    id: 'doc_002',
    name: 'High Court Order - Land Dispute.txt',
    dateAnalyzed: '2024-01-13',
    entityCount: 18,
    status: 'completed',
    type: 'text',
  },
  {
    id: 'doc_003',
    name: 'Supreme Court Judgment - Tax Matter.pdf',
    dateAnalyzed: '2024-01-10',
    entityCount: 31,
    status: 'completed',
    type: 'pdf',
  },
  {
    id: 'doc_004',
    name: 'FIR Copy - Criminal Case 2024.pdf',
    dateAnalyzed: '2024-01-08',
    entityCount: 12,
    status: 'completed',
    type: 'pdf',
  },
  {
    id: 'doc_005',
    name: 'Arbitration Award - Commercial Dispute.txt',
    dateAnalyzed: '2024-01-05',
    entityCount: 27,
    status: 'processing',
    type: 'text',
  },
];

/**
 * Mock procedural timeline events.
 * -----------------------------------------------------------------
 * TODO (Model 2 integration): Replace this with a real API call to
 * your timeline extraction endpoint when the backend is ready.
 * Expected endpoint: GET /api/timeline/:documentId
 * -----------------------------------------------------------------
 */
export const MOCK_TIMELINE = [
  {
    id: 'evt_001',
    event: 'Case Filing',
    label: 'Filing',
    date: '22 March 2023',
    description: 'Writ Petition No. 1234/2023 filed by petitioner Ramesh Kumar Verma before the Supreme Court of India.',
    sourceSentence: 'The petitioner filed Writ Petition No. 1234/2023 before the Supreme Court of India on 22 March 2023.',
    confidence: 0.97,
    status: 'completed',
    icon: 'FileText',
  },
  {
    id: 'evt_002',
    event: 'Notice Issued',
    label: 'Notice',
    date: '05 April 2023',
    description: 'Court issued notice to the respondent State of Maharashtra directing a reply within four weeks.',
    sourceSentence: 'Notice was issued to the respondent on 05 April 2023 directing filing of counter-affidavit.',
    confidence: 0.92,
    status: 'completed',
    icon: 'Bell',
  },
  {
    id: 'evt_003',
    event: 'Preliminary Hearing',
    label: 'Hearing',
    date: '10 July 2023',
    description: 'Preliminary hearing conducted before Justice B.L. Narayana. Witness Suresh Babu deposed.',
    sourceSentence: 'Preliminary hearing held before Justice B.L. Narayana on 10 July 2023.',
    confidence: 0.89,
    status: 'completed',
    icon: 'Scale',
  },
  {
    id: 'evt_004',
    event: 'Final Hearing',
    label: 'Hearing',
    date: '15 January 2024',
    description: 'Final arguments heard by Justice A.K. Sharma. Adv. Priya Mehta appeared for the petitioner.',
    sourceSentence: 'Justice A.K. Sharma presided over the final hearing on 15 January 2024.',
    confidence: 0.96,
    status: 'completed',
    icon: 'Gavel',
  },
  {
    id: 'evt_005',
    event: 'Judgment Reserved',
    label: 'Order',
    date: '20 January 2024',
    description: 'Judgment reserved after hearing all parties. Expected delivery within 30 days.',
    sourceSentence: 'Judgment reserved on 20 January 2024.',
    confidence: 0.84,
    status: 'pending',
    icon: 'Clock',
  },
  {
    id: 'evt_006',
    event: 'Final Judgment',
    label: 'Judgment',
    date: 'Awaited',
    description: 'Final judgment to be delivered by the bench. Outcome pending.',
    sourceSentence: '',
    confidence: null,
    status: 'pending',
    icon: 'BookOpen',
  },
];

/**
 * Mock Q&A responses.
 * -----------------------------------------------------------------
 * TODO (RAG integration): Replace this with a real API call to
 * your RAG backend endpoint when it is ready.
 * Expected endpoint: POST /api/qa
 * Body: { question: string, documentId: string }
 * -----------------------------------------------------------------
 */
export const MOCK_QA_RESPONSES = {
  'what court heard this case': {
    answer: 'The case was heard before the **Supreme Court of India**. The bench was presided over by Justice A.K. Sharma during the final hearing on 15 January 2024, and earlier proceedings were handled by Justice B.L. Narayana.',
    evidence: [
      { text: 'before the Supreme Court of India. Justice A.K. Sharma presided over the hearing on 15 January 2024.', score: 0.97 },
      { text: 'Preliminary hearing held before Justice B.L. Narayana on 10 July 2023.', score: 0.89 },
    ],
  },
  'when was the case filed': {
    answer: 'The case (Writ Petition No. 1234/2023) was filed on **22 March 2023** by the petitioner Ramesh Kumar Verma before the Supreme Court of India.',
    evidence: [
      { text: 'The petitioner filed Writ Petition No. 1234/2023 before the Supreme Court of India on 22 March 2023.', score: 0.96 },
    ],
  },
  'who was the petitioner': {
    answer: 'The petitioner in this case was **Ramesh Kumar Verma**, represented by Advocate Priya Mehta.',
    evidence: [
      { text: 'Ramesh Kumar Verma versus State of Maharashtra before the Supreme Court of India.', score: 0.98 },
      { text: 'The petitioner was represented by Adv. Priya Mehta.', score: 0.93 },
    ],
  },
  'what statutes were mentioned': {
    answer: 'The following statutes were referenced in the document:\n\n1. **Code of Civil Procedure, 1908** — specifically Section 34.\n2. The precedent **Maneka Gandhi v. Union of India** was also cited.',
    evidence: [
      { text: 'provisions under the Code of Civil Procedure, 1908 specifically Section 34.', score: 0.95 },
      { text: 'Reliance was placed on the precedent Maneka Gandhi v. Union of India', score: 0.91 },
    ],
  },
};

export const MOCK_DASHBOARD_STATS = {
  documentsAnalyzed: 24,
  entitiesExtracted: 487,
  proceduralEvents: 63,
  questionsAsked: 41,
};

/**
 * Generic fallback answer for unrecognized QA queries (mock).
 */
export function getMockQAResponse(question) {
  const key = question.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  for (const [k, v] of Object.entries(MOCK_QA_RESPONSES)) {
    if (key.includes(k) || k.includes(key.split(' ').slice(0, 4).join(' '))) {
      return v;
    }
  }
  return {
    answer: 'Based on the analyzed document, I found relevant information but could not generate a high-confidence answer. Please ensure the document has been analyzed and try rephrasing your question.\n\n*(This is a mock response — connect the RAG backend to get real answers.)*',
    evidence: [],
  };
}
