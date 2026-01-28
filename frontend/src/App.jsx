import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // 👈 1. Import Toaster
import Login from "./pages/Login";
import Home from "./pages/Home";
import Documents from "./pages/Documents";
// import Records from "./pages/Records"; // Deprecated
// import Certificates from "./pages/Certificates"; // Deprecated
import AISummary from "./pages/AISummary";
// import AISummary from "./pages/AISummary";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Notifications from "./pages/Notifications";
import Signup from "./pages/Signup";
import Patients from "./pages/Patients";
import SharedRecords from "./pages/SharedRecords";
import AITools from "./pages/AITools";

function App() {
  return (
    <BrowserRouter>
      {/* 👈 2. Add Toaster here so it works globally */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Public Route for QR Scanning */}
        <Route path="/shared/:token" element={<SharedRecords />} />

        <Route path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        {/* NEW UNIFIED ROUTE */}
        <Route path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />

        {/* Redirect Legacy Routes */}
        <Route path="/records" element={<Navigate to="/documents?tab=records" replace />} />
        <Route path="/certificates" element={<Navigate to="/documents?tab=certificates" replace />} />

        <Route path="/ai-summary"
          element={
            <ProtectedRoute>
              <AISummary />
            </ProtectedRoute>
          }
        />
        <Route path="/ai-tools"
          element={
            <ProtectedRoute>
              <AITools />
            </ProtectedRoute>
          }
        />
        <Route path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route path="/patients"
          element={
            <ProtectedRoute>
              <Patients />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;