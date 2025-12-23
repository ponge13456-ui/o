
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Customers from './pages/Customers';
import Influencers from './pages/Influencers';
import Sellers from './pages/Sellers';
import Admin from './pages/Admin';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="customers" element={<Customers />} />
          <Route path="influencers" element={<Influencers />} />
          <Route path="sellers" element={<Sellers />} />
          <Route path="admin" element={<Admin />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
