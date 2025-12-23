
import React, { useState } from 'react';
import { Link, Outlet, NavLink } from 'react-router-dom';
import AppLogo from '../components/AppLogo';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeLinkStyle = ({ isActive }: { isActive: boolean }) => 
    `transition-all duration-200 uppercase tracking-widest text-[11px] font-bold py-2 border-b-2 ${
      isActive ? 'text-[var(--primary-gold)] border-[var(--primary-gold)]' : 'text-[var(--text-muted)] border-transparent hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-[var(--bg-main)] border-b border-white/5 sticky top-0 z-[100] px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <AppLogo className="h-8 md:h-10" />
            <div className="text-xl font-black tracking-tighter flex items-center leading-none">
              <span className="text-[var(--primary-gold)]">EAGLE</span>
              <span className="text-white">HUB</span>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            <NavLink to="/" className={activeLinkStyle}>Home</NavLink>
            <NavLink to="/customers" className={activeLinkStyle}>Customers</NavLink>
            <NavLink to="/influencers" className={activeLinkStyle}>Influencers</NavLink>
            <NavLink to="/sellers" className={activeLinkStyle}>Sellers</NavLink>
            <Link to="/admin" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-white ml-4 border border-white/10 px-4 py-2 rounded-full transition">Admin Panel</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 pb-6 space-y-6 flex flex-col text-center bg-[var(--bg-main)] animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-center mb-4">
              <AppLogo className="h-12" />
            </div>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-[var(--primary-gold)] font-bold uppercase tracking-widest">Home</Link>
            <Link to="/customers" onClick={() => setIsMenuOpen(false)} className="text-white font-bold uppercase tracking-widest">Customers</Link>
            <Link to="/influencers" onClick={() => setIsMenuOpen(false)} className="text-white font-bold uppercase tracking-widest">Influencers</Link>
            <Link to="/sellers" onClick={() => setIsMenuOpen(false)} className="text-white font-bold uppercase tracking-widest">Sellers</Link>
            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-[var(--text-muted)] font-bold uppercase tracking-widest">Admin</Link>
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#03050d] py-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <AppLogo className="h-10" />
              <h4 className="text-2xl font-black text-[var(--primary-gold)] tracking-tighter">EAGLEHUB</h4>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-sm">
              Nagpur's elite ecosystem for smart shoppers, professional creators, and premium merchants. 
              Join the most exclusive promotional network in Central India.
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <h5 className="font-bold text-white uppercase text-xs tracking-[0.2em] mb-2">Company</h5>
            <Link to="/privacy" className="text-[var(--text-muted)] hover:text-[var(--primary-gold)] text-sm transition">Privacy Policy</Link>
            <Link to="/contact" className="text-[var(--text-muted)] hover:text-[var(--primary-gold)] text-sm transition">Contact Hub</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <h5 className="font-bold text-white uppercase text-xs tracking-[0.2em] mb-2">Network</h5>
            <a 
              href="https://www.instagram.com/eagle190ts?igsh=NXN5OHpmMzBnbjk4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 text-[var(--text-muted)] hover:text-[var(--primary-gold)] transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="text-sm font-bold">@eagle190ts</span>
            </a>
          </div>
        </div>
        <div className="mt-16 text-center text-[var(--text-muted)] text-[10px] uppercase tracking-[0.4em] border-t border-white/5 pt-10">
          &copy; {new Date().getFullYear()} EAGLE PROMO HUB NAGPUR. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
