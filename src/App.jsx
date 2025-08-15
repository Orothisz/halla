import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home.jsx';
import Assistance from './pages/Assistance.jsx';
import Legal from './pages/Legal.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assistance" element={<Assistance />} />
        <Route path="/legal" element={<Legal />} />
      </Routes>
    </BrowserRouter>
  );
}
