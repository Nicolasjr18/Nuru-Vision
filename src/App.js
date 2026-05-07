import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { UserContext } from "./context/UserContext";
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

  return (
  <UserContext.Provider value={user}>
    <div>
      {/* HEADER */}
      {user && (
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
            👤 {user?.email}
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
      )}

      {/* RUTAS */}
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />

        {/* HOME */}
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" />}
        />

        {/* PROTEGIDAS */}
        <Route
          path="/admisiones"
          element={user ? <Admisiones /> : <Navigate to="/login" />}
        />

        <Route
          path="/historias"
          element={user ? <Historias /> : <Navigate to="/login" />}
        />

        <Route
          path="/citas"
          element={user ? <Citas /> : <Navigate to="/login" />}
        />

        <Route
          path="/facturacion"
          element={user ? <Facturacion /> : <Navigate to="/login" />}
        />

        <Route
          path="/buscarHistorias"
          element={user ? <BuscarHistorias /> : <Navigate to="/login" />}
        />

      </Routes>
    </div>
  </UserContext.Provider>
  );
};

export default App;