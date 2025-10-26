import NavBar from "./components/NavBar";
import Home from "./components/Home";
import InformeForm from "./components/InformeForm";
import InformeBebes from "./components/InformeBebes";
import NewForm from "./components/NewForm";
import { Routes, Route } from "react-router-dom";
function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/informe-ninos" element={<NewForm />} />
        <Route path="/informe-bebes" element={<InformeBebes />} />
      </Routes>
    </>
  );
}

export default App;
