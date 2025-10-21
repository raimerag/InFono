import InformeForm from "./components/InformeForm";
import Home from "./components/Home";
import Nav from "./components/Nav";
import { Routes, Route } from "react-router-dom";
function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/informe-ninos" element={<InformeForm />} />
      </Routes>
    </>
  );
}

export default App;
