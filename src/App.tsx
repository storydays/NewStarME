import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { StarSelection } from './pages/StarSelection';
import { Dedication } from './pages/Dedication';
import { SharedStar } from './pages/SharedStar';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stars/:emotionId" element={<StarSelection />} />
          <Route path="/dedicate/:starId" element={<Dedication />} />
          <Route path="/star/:dedicationId" element={<SharedStar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;