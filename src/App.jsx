import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages publiques
import HomePage from "./pages/HomePage";
import ThemePage from "./pages/ThemePage";
import ArticlePage from "./pages/ArticlePage";

// Composants admin
import AdminLayout from "./admin/components/AdminLayout";
import ProtectedRoute from "./admin/components/ProtectedRoute";

// Pages admin
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminArticles from "./admin/pages/AdminArticles";
import AdminArticleForm from "./admin/pages/AdminArticleForm";
import AdminThemes from "./admin/pages/AdminThemes";
import AdminThemeForm from "./admin/pages/AdminThemeForm";
import MediaLibrary from "./admin/components/MediaLibrary";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/theme/:themeSlug" element={<ThemePage />} />
        <Route path="/article/:articleSlug" element={<ArticlePage />} />

        {/* Route de login admin (non protégée) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Routes admin protégées */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard par défaut */}
          <Route index element={<AdminDashboard />} />
          <Route path="media" element={<MediaLibrary />} />

          {/* Gestion des articles */}
          <Route path="articles" element={<AdminArticles />} />
          <Route path="articles/new" element={<AdminArticleForm />} />
          <Route
            path="articles/edit/:articleId"
            element={<AdminArticleForm />}
          />

          {/* Gestion des thèmes */}
          <Route path="themes" element={<AdminThemes />} />
          <Route path="themes/new" element={<AdminThemeForm />} />

          <Route path="themes/edit/:themeId" element={<AdminThemeForm />} />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<div>Page non trouvée</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
