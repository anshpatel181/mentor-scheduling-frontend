import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import { useState } from "react";

function App() {

  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <Routes>
        {!token && (
          <>
            <Route path="/" element={<Login setToken={setToken}/>} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {token && (
          <>
            <Route path="/adminDashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/adminDashboard" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;