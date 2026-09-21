import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import SolarSizer from "./components/games/solar-sizer/SolarSizer";
import LearnWithPixel from "./components/games/learn-with-pixel/LearnWithPixel";
import VibeCheck from "./components/games/vibe-check/VibeCheck";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path= "/solar-sizer" element={<SolarSizer/>} />
      <Route path="/learn-with-pixel" element ={<LearnWithPixel/>}/>
      <Route path="/vibe-check" element = {<VibeCheck/>}/>
    </Routes>
  );
}

export default App;