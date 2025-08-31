import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';
import { useSettingsStore } from '@/store';
import '@/index.css'

const navigation = [
  { name: 'Home', id: 'home' },
  // { name: 'About', id: 'about' },
  { name: 'Projects', id: 'projects' },
  { name: 'Services', id: 'services' },
  { name: 'Testimonials', id: 'testimonials' },
  { name: 'Contact', id: 'contact' },
];

const Header: React.FC = () => {
  const location = useLocation();

  const { settings, fetchSettings } = useSettingsStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  React.useEffect(() => {
    if (!settings.site_name) fetchSettings();
  }, [settings.site_name, fetchSettings]);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = navigation.map(item => item.id);
      const scrollPosition = window.scrollY + 100; // Offset for header height

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setMenuOpen(false);
  };

  const isActive = (id: string) => {
    return location.pathname === '/' && activeSection === id;
  };

  return (
    <header className="w-full pt-3 sm:pt-4 pb-1 sm:pb-2 fixed top-0 left-0 right-0 z-50">
      <div className=" flex items-center justify-between px-3 sm:px-6 rounded-full m-4 mb-0 border-2 border-purple-800 p-2 bg-black  sm:m-6 sm:p-3 max-sm:p-4">
        {/* Logo */}
        <Link to="/" className="flex items-center select-none z-20">
          <span
            className="sm:text-3xl md:text-3xl max-sm:text-3xl font-bold tracking-tight font-radio-canada uppercase text-white"
          > Teniola
            {/* {settings.siteName || 'Teniola'} */}
          </span>
        </Link>
        {/* Desktop Navigation Bar */}
        <nav className="flex-1 hidden lg:flex justify-center items-center">
          <div
            className="flex items-center px-3 sm:px-6 md:px-8 py-1 sm:py-2 "
            style={{ minWidth: 0, width: '100%', maxWidth: 900 }}
          >
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                className={
                  'mx-2 sm:mx-4 text-white font-raleway font-bold uppercase tracking-wide transition-colors text-center hover:text-purple-500 hover:scale-110'+
                  (isActive(item.id) ? ' text-purple-500' : '')
                }
              >
                {item.name}
              </button>
            ))}
          </div>
        </nav>
        {/* Desktop User Icon */}
        <button
          className="ml-3 sm:ml-6 hidden lg:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-violet-500 hover:bg-violet-400 transition-colors"
          onClick={() => window.open('/admin/login', '_blank')}
          aria-label="Admin Login"
        >
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </button>
        {/* Hamburger for mobile/tablet */}
        <button
          className="ml-2 sm:ml-4 flex lg:hidden items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-violet-500 bg-black text-violet-400 "
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {/* Mobile/Tablet Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 flex flex-col items-center justify-center lg:hidden px-4">
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-white p-2 rounded-full m-6 bg-purple-500 "
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-8 w-8" />
          </button>
          <nav className="flex flex-col gap-6 sm:gap-8 items-center w-full ">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                className={
                  'text-lg sm:text-xl text-white font-bold front-raleway tracking-wide transition-colors py-2 w-full text-center rounded-lg hover:text-purple-500 hover:scale-110' +
                  (isActive(item.id) ? ' text-violet-400' : '')
                }
                style={{ fontFamily: 'Raleway, sans-serif' }}
              >
                {item.name}
              </button>
            ))}
            <div className="flex items-center justify-center w-full">
            <button
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-500 hover:bg-purple-400 transition-colors"
            onClick={() => {  setMenuOpen(false); window.open('/admin/login', '_blank'); }}
            aria-label="Admin Login"
          >
            <User className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </button>
            </div>
    </nav>
          
        </div>
      )}
  </header>
);
};

export default Header;
