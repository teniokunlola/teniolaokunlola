import React from 'react';

import { Github, Linkedin, Twitter, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useSettingsStore, useUIStore, useThemeSync } from '@/store';

import '@/index.css'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  useThemeSync();
  const theme = useUIStore(state => state.theme);
  const { settings, fetchSettings } = useSettingsStore();

  React.useEffect(() => {
    if (!settings.site_name) {
      fetchSettings();
    }
  }, [settings.site_name, fetchSettings]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const quickLinks = [
    { name: 'Home', id: 'home' },
    // { name: 'About', id: 'about' },
    { name: 'Projects', id: 'projects' },
    { name: 'Services', id: 'services' },
    { name: 'Contact', id: 'contact' },
  ];

  // Fallbacks for social links, email, phone, address
  const socialLinks = [
    { icon: Github, href: settings.site_github || 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: settings.site_linkedin || 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: settings.site_twitter || 'https://twitter.com', label: 'Twitter' },
    { icon: Mail, href: `mailto:${settings.site_email || 'teniolaokunlola@proton.me'}`, label: 'Email' },
  ];

  return (
    <footer className="bg-background text-foreground border-t border-purple-800 rounded-t-3xl" data-theme={theme}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex flex-col space-x-2 mb-4">
              
              <h1 className="font-radio-canada uppercase font-bold text-foreground text-2xl ">{settings.site_name || 'Teniola Okunlola'}</h1>
              <p className="text-muted-foreground mb-6 max-w-md font-raleway 
            border-b border-purple-800 pb-4">
                {settings.site_description || 'Passionate Full-Stack developer & UX Designer, creating innovative solutions and exceptional digital experiences. Let\'s build something amazing together.'}                     
              </p>
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted rounded-3xl flex items-center justify-center hover:bg-muted/80 transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-raleway text-purple-400 mb-4">Navigate To</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-muted-foreground font-raleway font-normal hover:text-foreground transition-colors text-left w-full cursor-pointer hover:translate-x-1 transform transition-all duration-200"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-raleway text-purple-400 mb-4">Get In Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="h-4 w-4 text-purple-400" />
                <a href={`mailto:${settings.site_email || 'teniolaokunlola@proton.me'}`} target="_blank" rel="noopener noreferrer" className="text-sm font-raleway ">{settings.site_email || 'teniolaokunlola@proton.me'}</a>
              </div>

              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="h-4 w-4 text-purple-400" />
                <a href={`tel:${settings.site_phone || '+234 7019857833'}`} target="_blank" rel="noopener noreferrer" className="text-sm font-raleway ">{settings.site_phone || '+234 7019857833'}</a>
              </div>

              <div className="flex items-start space-x-3 text-muted-foreground">
                <MapPin className="h-4 w-4 text-purple-400 mt-0.5" />
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.site_address || 'Lagos, Nigeria')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-raleway font-light">
                  {settings.site_address || 'Lagos, Nigeria'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm mb-4 md:mb-0 font-raleway font-light font-semibold">
              © {currentYear} {settings.site_name || 'Teniola Okunlola'}. All Rights Reserved.
            </p>
            <div className="flex items-center space-x-1 text-muted-foreground text-sm font-raleway ">
              <span>Made Through Lack Of Sleep & Anemia</span>
              <Heart className="h-4 w-4 text-red-400 fill-current fill-opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
