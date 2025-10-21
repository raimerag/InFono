import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 py-12">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            Generador de Informes Fonoaudiológicos
          </h1>
          <p className="text-gray-500 mt-2">
            Crea y descarga informes profesionales en formato PDF o Word
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full px-6">
          <button
            onClick={() => navigate("/informe-ninos")}
            className="bg-white hover:bg-blue-50 border border-blue-200 p-8 rounded-2xl shadow-sm hover:shadow-lg transition flex flex-col items-center"
          >
            <div className="text-5xl mb-3">🧒</div>
            <span className="text-lg font-semibold text-blue-700">
              Nuevo informe
            </span>
            <span className="text-sm text-gray-500 mt-1">
              Niños / Adolescentes
            </span>
          </button>

          <button
            disabled
            className="bg-gray-100 p-8 rounded-2xl shadow-sm text-gray-400 flex flex-col items-center cursor-not-allowed"
          >
            <div className="text-5xl mb-3">👶</div>
            <span className="text-lg font-semibold">Nuevo informe</span>
            <span className="text-sm mt-1">Bebés (Próximamente)</span>
          </button>

          <button
            onClick={() => alert("Funcionalidad de guardar próxima versión 🚀")}
            className="bg-white hover:bg-blue-50 border border-blue-200 p-8 rounded-2xl shadow-sm hover:shadow-lg transition flex flex-col items-center"
          >
            <div className="text-5xl mb-3">📂</div>
            <span className="text-lg font-semibold text-blue-700">
              Mis informes
            </span>
            <span className="text-sm text-gray-500 mt-1">Ver y descargar</span>
          </button>
        </div>

        <footer className="mt-16 text-sm text-gray-400">
          © {new Date().getFullYear()} | Proyecto MVP — Raimer Aguilar
        </footer>
      </div>
    </>
  );
};

export default Home;
