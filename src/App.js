
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import Home from "./pages/Home";
import Admisiones from "./pages/Admisiones";
import Historias from "./pages/Historias";
import Citas from "./pages/Citas";
import Facturacion from "./pages/Facturacion";
import Login from "./pages/Login";
import BuscarHistorias from "./pages/BuscarHistorias";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 20px",
          background: "#0a3d62",
          color: "white",
        }}
      >
        <div>👁️ NURU VISION COL</div>
        <div>
          👤 {user.email}
          <button
            onClick={logout}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* RUTAS */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admisiones" element={<Admisiones />} />
        <Route path="/historias" element={<Historias />} />
        <Route path="/citas" element={<Citas />} />
        <Route path="/facturacion" element={<Facturacion />} />
        <Route path="/buscarHistorias" element={<BuscarHistorias />} />
      </Routes>
    </div>
  );
}

export default App;