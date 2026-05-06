import { useNavigate } from "react-router-dom";
import logo from "../logo.png";
import { FaUser, FaNotesMedical, FaSearch ,FaCalendarAlt, FaMoneyBill } from "react-icons/fa";

function Home() {

  const navigate = useNavigate();

  const cardStyle = {
    width: "200px",
    height: "180px",
    margin: "15px",
    borderRadius: "18px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    background: "#ffffff",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    transition: "0.3s",
    border: "1px solid #eaeaea"
  };

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f5f9ff, #ffffff)",
    padding: "30px",
    textAlign: "center"
  };

  return (
    <div style={containerStyle}>

      {/* LOGO */}
      <img 
        src={logo} 
        alt="NURU VISION COL"
        style={{ width: "160px", marginBottom: "10px" }}
      />
      <h3 style={{ color: "#0a3d62" }}>BIENVENIDO A NURU VISION ÓPTICA</h3>
      <h2 style={{ color: "#0a3d62" }}>Panel Principal</h2>

      {/* MODULOS */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        marginTop: "40px"
      }}>

        <div
          style={cardStyle}
          onClick={() => navigate("/admisiones")}
        >
          <FaUser size={40} color="#0a3d62" />
          <p>Admisiones</p>
        </div>

        <div
          style={cardStyle}
          onClick={() => navigate("/historias")}
        >
          <FaNotesMedical size={40} color="#0a3d62" />
          <p>Historias Clínicas</p>
        </div>
         
         <div
          style={cardStyle}
          onClick={() => navigate("/buscarHistorias")}
        >
          <FaSearch size={40} color="#0a3d62" />
          <p>Buscar Historias</p>
        </div>
      
        
        <div
          style={cardStyle}
          onClick={() => navigate("/citas")}
        >
          <FaCalendarAlt size={40} color="#0a3d62" />
          <p>Citas</p>
        </div>

        <div
          style={cardStyle}
          onClick={() => navigate("/facturacion")}
        >
          <FaMoneyBill size={40} color="#0a3d62" />
          <p>Facturación</p>
        </div>



      </div>



        <h2 style={{ color: "#0a3d62" }}>Dra. Andrea Caceres Perez</h2>
    </div>
  );
}

export default Home;
