import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../logo.png";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
  try {
    setError("");

    console.log("Intentando login con:", email, password);

    const res = await signInWithEmailAndPassword(auth, email, password);

    console.log("LOGIN OK:", res.user);

  } catch (err) {
    console.log("ERROR COMPLETO:", err);

    alert(
      "Código: " + err.code + "\n" +
      "Mensaje: " + err.message
    );

    setError("Credenciales incorrectas ❌");
  }
};
  return (
    <div style={styles.container}>

      <div style={styles.card}>

        <img src={logo} alt="logo" style={styles.logo} />

        <h2 style={{ color: "#0a3d62" }}>NURU VISION COL</h2>
        <p style={{ color: "#777" }}>Acceso al sistema</p>

        <input
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p style={{ color: "red", fontSize: "13px" }}>
            {error}
          </p>
        )}

        <button style={styles.button} onClick={login}>
          Ingresar
        </button>

      </div>

    </div>
  );
}

export default Login;

// 🎨 ESTILOS
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0a3d62, #3c6382, #82ccdd)"
  },

  card: {
    width: "320px",
    padding: "30px",
    borderRadius: "15px",
    background: "#fff",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
  },

  logo: {
    width: "100px",
    marginBottom: "10px"
  },

  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none"
  },

  button: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    background: "#0a3d62",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};
