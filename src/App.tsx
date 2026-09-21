import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import SolarSizer from "./components/games/solar-sizer/SolarSizer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path= "/solar-sizer" element={<SolarSizer/>} />
    </Routes>
  );
}

export default App;