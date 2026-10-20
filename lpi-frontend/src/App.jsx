import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar  from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login             from './pages/Login';
import Register          from './pages/Register';
import Dashboard         from './pages/Dashboard';
import DocumentAnalysis  from './pages/DocumentAnalysis';
import EntityResults     from './pages/EntityResults';
import ProceduralTimeline from './pages/ProceduralTimeline';
import LegalQA           from './pages/LegalQA';
import DocumentHistory   from './pages/DocumentHistory';
import Profile           from './pages/Profile';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes — wrapped in layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/documents"  element={<DocumentAnalysis />} />
        <Route path="/analysis"   element={<DocumentAnalysis />} />
        <Route path="/entities"   element={<EntityResults />} />
        <Route path="/timeline"   element={<ProceduralTimeline />} />
        <Route path="/legal-qa"   element={<LegalQA />} />
        <Route path="/history"    element={<DocumentHistory />} />
        <Route path="/profile"    element={<Profile />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
