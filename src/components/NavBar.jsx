import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
const NavBar = () => {
  const location = useLocation();
  return (
    <>
      <nav className="w-full bg-white shadow-sm py-4 px-6 flex justify-between items-center border-b border-gray-100">
        {/* Logo o título */}
        <Link
          to="/"
          className="text-blue-700 font-bold text-lg hover:text-blue-800 transition-colors text-center mr-4"
        >
          <span className="">🩺</span> InFono
        </Link>

        {/* Botones de navegación */}
        <div className="flex items-center gap-4 text-center">
          <Link
            to="/"
            className={`px-3 py-2 rounded-md font-medium text-xs xl:text-lg ${
              location.pathname === "/"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:text-blue-700"
            }`}
          >
            Inicio
          </Link>

          <Link
            to="/informe-ninos"
            className={`px-3 py-2 rounded-md font-medium text-xs xl:text-lg ${
              location.pathname === "/informe-ninos"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:text-blue-700"
            }`}
          >
            Niños / Adolescentes
          </Link>

          <Link
            to="/informe-bebes"
            className={`px-3 py-2 rounded-md font-medium text-xs xl:text-lg ${
              location.pathname === "/informe-bebes"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:text-blue-700"
            }`}
          >
            Bebés
          </Link>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
