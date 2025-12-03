import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const LocationContext = createContext();

export const useLocation = () => {
    return useContext(LocationContext);
};

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
        city: null,
        state: null,
        loading: true,
        error: null,
    });

    const updateCity = (city) => {
        const newLocation = { ...location, city, loading: false, error: null };
        setLocation(newLocation);
        localStorage.setItem('userLocation', JSON.stringify(newLocation));
    };

    const detectLocation = () => {
        setLocation(prev => ({ ...prev, loading: true, error: null }));

        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation is not supported by your browser' }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Reverse geocoding using our backend proxy to avoid CORS
                    const { data } = await axiosInstance.get('/location/reverse', {
                        params: { lat: latitude, lon: longitude }
                    });

                    const address = data.address;
                    const city = address.city || address.town || address.village || address.county;
                    const state = address.state;

                    const newLocation = {
                        latitude,
                        longitude,
                        city,
                        state,
                        loading: false,
                        error: null,
                    };

                    setLocation(newLocation);
                    localStorage.setItem('userLocation', JSON.stringify(newLocation));

                } catch (error) {
                    console.error('Error fetching address:', error);
                    setLocation(prev => ({
                        ...prev,
                        latitude,
                        longitude,
                        loading: false,
                        error: 'Failed to fetch address details'
                    }));
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setLocation(prev => ({ ...prev, loading: false, error: 'Unable to retrieve your location' }));
            }
        );
    };

    // Load from local storage on mount
    useEffect(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            setLocation({ ...JSON.parse(savedLocation), loading: false, error: null });
        } else {
            // Optional: Auto-detect on first load
            detectLocation();
            setLocation(prev => ({ ...prev, loading: false }));
        }
    }, []);

    return (
        <LocationContext.Provider value={{ location, detectLocation, updateCity }}>
            {children}
        </LocationContext.Provider>
    );
};
