import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation as useUserLocation } from '../context/LocationContext';
import logo from '../assets/images/logo.png';
import userImg from '../assets/images/user.png';
import { LucideMapPin, LucideShoppingCart, LucideUser, LucideLogOut, LucideMenu, LucideX, LucideChevronDown } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const { isAuthenticated, logout, user } = useAuth();
  const { location: userLocation, detectLocation } = useUserLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/categories' },
    { name: 'About Us', path: '/about' }, // Placeholder
    { name: 'Contact', path: '/contact' }, // Placeholder
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 rounded-lg p-1.5 transition-transform group-hover:scale-105">
              <img src={logo} alt="RanX24" className="h-6 w-auto brightness-0 invert" />
            </div>
            <span className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              RanX<span className="text-blue-600">24</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname === link.path ? 'text-blue-600' : 'text-gray-600'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Location Pill */}
            <button
              onClick={detectLocation}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-sm text-gray-700"
            >
              <LucideMapPin size={14} className="text-blue-600" />
              <span className="max-w-[100px] truncate">
                {userLocation.loading ? 'Locating...' : userLocation.city || 'Set Location'}
              </span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/user_cart" className="relative group">
                  <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <LucideShoppingCart size={20} className="text-gray-700 group-hover:text-blue-600" />
                  </div>
                  {cartItems.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                      {cartItems.length}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-3 focus:outline-none group"
                  >
                    <img
                      src={userImg}
                      alt="User"
                      className="w-9 h-9 rounded-full border-2 border-white shadow-sm group-hover:border-blue-100 transition-all"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name?.split(' ')[0]}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Member</p>
                    </div>
                    <LucideChevronDown size={16} className="text-gray-400 group-hover:text-gray-600" />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 transform origin-top-right transition-all">
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || user?.phone}</p>
                      </div>

                      <div className="py-1">
                        {user?.role === 'worker' ? (
                          <Link to="/worker-dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                            <LucideUser size={16} className="mr-2" /> Worker Dashboard
                          </Link>
                        ) : user?.role === 'admin' ? (
                          <Link to="/admin-dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                            <LucideUser size={16} className="mr-2" /> Admin Dashboard
                          </Link>
                        ) : (
                          <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                            <LucideUser size={16} className="mr-2" /> My Profile
                          </Link>
                        )}
                        <Link to="/my-bookings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                          My Bookings
                        </Link>
                        <Link to="/user-wallet" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                          Wallet
                        </Link>
                      </div>

                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LucideLogOut size={16} className="mr-2" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Log in
                </Link>
                <Link
                  to="/categories"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
                >
                  Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <LucideX size={24} /> : <LucideMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-base font-medium text-gray-700 py-2 border-b border-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="flex flex-col gap-3 mt-2">
              <Link to="/login" className="w-full text-center py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium">
                Log in
              </Link>
              <Link to="/categories" className="w-full text-center py-2.5 rounded-lg bg-blue-600 text-white font-medium">
                Book Now
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
