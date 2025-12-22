import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Records from "./pages/Records";
import Certificates from "./pages/Certificates";
import AISummary from "./pages/AISummary";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Notifications from "./pages/Notifications";
import Signup from "./pages/Signup";
import Patients from "./pages/Patients";
import SharedRecords from "./pages/SharedRecords";

function App() {
  return (
    <BrowserRouter>
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
         <Route path="/records" 
        element={
          <ProtectedRoute>
          <Records />
          </ProtectedRoute>
        }
        />
        <Route path="/certificates"
        element={
          <ProtectedRoute>
            <Certificates />
          </ProtectedRoute>
        }
        />
        <Route path="/ai-summary"
        element={
          <ProtectedRoute>
            <AISummary />
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
