import { Link, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import cuLogo from '../../assets/cuLogoUAR.png';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/#about' },
  { label: 'Ministries', href: '/ministries' },
  { label: 'Bible Study', href: '/Bs' },
  { label: 'Library', href: '/library' },
  { label: 'Constitution', href: '/pdfs/constitution.pdf', external: true },
];

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/ksucumaincampus', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/ksucu_mc', label: 'Instagram' },
  { icon: Youtube, href: 'https://www.youtube.com/@ksucu-mc', label: 'YouTube' },
  { icon: Twitter, href: 'https://twitter.com/ksucumc', label: 'Twitter' },
];


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isPatronDashboard = location.pathname.startsWith('/patron');

  return (
    <footer className="bg-[#730051] text-white">
      {/* Main Footer Content */}
      {!isPatronDashboard && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={cuLogo} alt="KSUCU Logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
              <div>
                <h3 className="font-bold text-lg">KSUCU-MC</h3>
                <p className="text-sm text-purple-200">Main Campus</p>
              </div>
            </div>
            <p className="text-sm text-purple-200 leading-relaxed">
              Producing relevant and effective Christians to the church and society through equipping, empowering and offering a conducive environment for effective living.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-200 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-purple-200 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-purple-300 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-purple-200">
                  P.O BOX 408-40200<br />Kisii, Kenya
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-purple-300 flex-shrink-0" />
                <a href="tel:+254748290170" className="text-sm text-purple-200 hover:text-white transition-colors">
                  +254 748 290 170
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-purple-300 flex-shrink-0" />
                <a href="mailto:ksuchristianunion@gmail.com" className="text-sm text-purple-200 hover:text-white transition-colors break-all">
                  ksuchristianunion@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Affiliation */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Connect With Us</h4>
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#730051] transition-all duration-200"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
            <p className="text-sm text-purple-200">
              Member of <span className="font-semibold text-white">FOCUS Kenya</span>
            </p>
            <p className="text-xs text-purple-300 mt-1">
              Fellowship of Christian Unions
            </p>
          </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="border-t border-purple-400/30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-purple-200">
            <p>
              Kisii University Christian Union &#169; {currentYear}
              <Link
                to="/worship-docket-admin"
                style={{ marginLeft: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', textDecoration: 'none' }}
              >
                Admin
              </Link>
            </p>
            <p className="text-xs">Established 2002</p>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #4a0034, #730051, #a8006e, #730051, #4a0034)' }} />
    </footer>
  );
};

export default Footer;
