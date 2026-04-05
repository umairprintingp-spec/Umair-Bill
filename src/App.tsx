import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MainApp from './pages/MainApp';
import OwnerPanel from './pages/OwnerPanel';
import CustomerPortal from './pages/CustomerPortal';
import TemplateGallery from './pages/TemplateGallery';
import PricingPage from './pages/PricingPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<MainApp />} />
        <Route path="/owner" element={<OwnerPanel />} />
        <Route path="/portal" element={<CustomerPortal />} />
        <Route path="/templates" element={<TemplateGallery />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
    </Router>
  );
}
