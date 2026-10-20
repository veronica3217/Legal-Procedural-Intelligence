import React, { createContext, useContext, useState } from 'react';

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const [currentDocument, setCurrentDocument] = useState(null);
  const [analysisResult, setAnalysisResult]   = useState(null);
  const [isAnalyzing, setIsAnalyzing]         = useState(false);

  const clearDocument = () => {
    setCurrentDocument(null);
    setAnalysisResult(null);
  };

  return (
    <DocumentContext.Provider
      value={{
        currentDocument, setCurrentDocument,
        analysisResult,  setAnalysisResult,
        isAnalyzing,     setIsAnalyzing,
        clearDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error('useDocument must be used within DocumentProvider');
  return ctx;
}
