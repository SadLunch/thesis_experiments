import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ThreeInstant from "./pages/ThreeInstant";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/three_instant_tracking" element={<ThreeInstant />} />
      </Routes>
    </Router>
  );
};

export default App;
