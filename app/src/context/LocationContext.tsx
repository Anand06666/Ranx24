import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationData {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    state: string | null;
    loading: boolean;
    error: string | null;
}

interface LocationContextType {
    location: LocationData;
    detectLocation: () => Promise<void>;
    setManualLocation: (data: { latitude: number; longitude: number; city: string; state: string }) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState<LocationData>({
        latitude: null,
        longitude: null,
        city: null,
        state: null,
        loading: true,
        error: null,
    });

    const setManualLocation = (data: { latitude: number; longitude: number; city: string; state: string }) => {
        setLocation({
            ...data,
            loading: false,
            error: null,
        });
    };

    const detectLocation = async () => {
        setLocation(prev => ({ ...prev, loading: true, error: null }));

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocation(prev => ({ ...prev, loading: false, error: 'Permission to access location was denied' }));
                return;
            }

            const userLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = userLocation.coords;

            const geo = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            let city = null;
            let state = null;

            if (geo && geo.length > 0) {
                city = geo[0].city || geo[0].district || geo[0].subregion || null;
                state = geo[0].region || geo[0].subregion || null;
            }

            setLocation({
                latitude,
                longitude,
                city,
                state,
                loading: false,
                error: null,
            });

        } catch (error) {
            console.error('Error detecting location:', error);
            setLocation(prev => ({ ...prev, loading: false, error: 'Failed to detect location' }));
        }
    };

    useEffect(() => {
        detectLocation();
    }, []);

    return (
        <LocationContext.Provider value={{ location, detectLocation, setManualLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
