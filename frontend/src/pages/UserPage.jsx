import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { Link } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { LucideSearch, LucideMapPin, LucideShieldCheck, LucideClock, LucideStar, LucideArrowRight, LucideX, LucideChevronDown } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://www.ranx24.com';

const UserPage = () => {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { location, detectLocation, updateCity } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Location State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [citySearch, setCitySearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Banners
        try {
          const bannersRes = await axiosInstance.get('/banners/active/landing');
          setBanners(bannersRes.data);
        } catch (bannerErr) {
          console.log('Banner fetch error:', bannerErr);
        }

        let url = '/categories';

        // If city is detected, fetch city-specific categories
        if (location.city) {
          try {
            const cityRes = await axiosInstance.get(`/cities/name/${location.city}`);
            const cityData = cityRes.data;

            if (cityData && cityData.assignedCategories?.length > 0) {
              const { data: allCategories } = await axiosInstance.get('/categories');
              const assignedNames = cityData.assignedCategories.map(c => c.category);
              const filtered = allCategories.filter(c => assignedNames.includes(c.name));
              setCategories(filtered);
              setLoading(false);
              return;
            }
          } catch (cityErr) {
            console.log('City not found or error fetching city, showing all categories');
          }
        }

        const { data } = await axiosInstance.get(url);
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.city]);

  const fetchCities = async () => {
    try {
      const { data } = await axiosInstance.get('/cities');
      setAvailableCities(data);
    } catch (error) {
      console.error("Error fetching cities", error);
    }
  };

  const openLocationModal = () => {
    fetchCities();
    setIsLocationModalOpen(true);
  };

  const handleCitySelect = (city) => {
    updateCity(city.name);
    setIsLocationModalOpen(false);
  };

  const filteredCities = availableCities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581578731117-104f2a863a30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-blue-900/95"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Expert Home Services,<br />
            <span className="text-blue-400">On Demand</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Book trusted professionals for cleaning, repair, painting, and more. Quality service at your doorstep.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-full p-2 flex shadow-2xl transform hover:scale-[1.01] transition-transform relative z-20">
            <div className="flex-grow flex items-center px-4 md:px-6 border-r border-gray-200">
              <LucideSearch className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="What service do you need?"
                className="w-full py-3 outline-none text-gray-700 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div
              className="hidden md:flex items-center px-4 md:px-6 cursor-pointer hover:bg-gray-50 transition-colors rounded-r-full"
              onClick={openLocationModal}
            >
              <LucideMapPin className="text-blue-600 mr-2" />
              <div className="flex flex-col items-start">
                <span className="text-gray-600 text-sm font-medium whitespace-nowrap flex items-center gap-1">
                  {location.city || 'Select Location'}
                  <LucideChevronDown size={14} className="text-gray-400" />
                </span>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors ml-2">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Select your City</h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <LucideX size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search for your city..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <button
                  onClick={() => {
                    detectLocation();
                    setIsLocationModalOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors border border-dashed border-blue-200"
                >
                  <LucideMapPin size={18} />
                  Use Current Location
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filteredCities.length > 0 ? (
                  filteredCities.map(city => (
                    <button
                      key={city._id}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all flex justify-between items-center ${location.city === city.name ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      {city.name}
                      {location.city === city.name && <LucideArrowRight size={16} />}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No cities found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Services</h2>
            <p className="text-gray-500">Explore our wide range of professional services in {location.city || 'your area'}</p>
          </div>
          <Link to="/categories" className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            View All <LucideArrowRight size={18} className="ml-2" />
          </Link>
        </div>

        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Link key={category._id} to={`/category/${category._id}`} className="group">
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={`${SERVER_URL}/${category.image}`}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://placehold.co/300?text=' + category.name; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{category.name}</h3>
                    <p className="text-sm text-gray-500">Professional {category.name} services</p>
                  </div>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    Book Now <LucideArrowRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RanX24?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We are committed to providing the best home service experience with verified professionals and transparent pricing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<LucideShieldCheck size={40} className="text-blue-600" />}
              title="Verified Professionals"
              description="All our workers are background checked and trained to deliver high-quality service."
            />
            <FeatureCard
              icon={<LucideClock size={40} className="text-blue-600" />}
              title="On-Time Service"
              description="We value your time. Our professionals arrive on schedule and complete the job efficiently."
            />
            <FeatureCard
              icon={<LucideStar size={40} className="text-blue-600" />}
              title="Top Rated Quality"
              description="Our services are rated 4.8/5 by thousands of satisfied customers across the city."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of happy customers who trust RanX24 for their home service needs.
          </p>
          <Link to="/categories" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Book a Service Now
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
    <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </div>
);

export default UserPage;
