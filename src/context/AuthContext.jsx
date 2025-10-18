import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        // This effect runs once when the app loads
        const checkAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                    // If stars not present locally, hydrate from server best scores
                    try {
                        const existing = Number(localStorage.getItem('hs_stars_total_v1'));
                        if (!Number.isFinite(existing) || existing <= 0) {
                            await hydrateStarsFromServer(parsed?._id);
                        }
                    } catch (_) {}
                }
            } catch (error) {
                console.error("Failed to parse user from localStorage", error);
            }
            
            // Add a minimum loading time to show the loading screen
            await new Promise(resolve => setTimeout(resolve, 1500));
            setLoading(false);
        };
        
        checkAuth();
    }, []);

    const hydrateStarsFromServer = async (uid) => {
        try {
            if (!uid) return;
            const { data } = await authService.getProgress(uid);
            const arr = Array.isArray(data) ? data : [];
            let total = 0;
            for (const entry of arr) {
                const stats = entry?.stats || {};
                // stats may be a plain object or Map serialized by server; iterate keys
                const values = typeof stats.entries === 'function' ? Array.from(stats.entries()) : Object.entries(stats);
                for (const [, val] of values) {
                    const best = Number(val?.bestScore || 0);
                    if (Number.isFinite(best)) total += best;
                }
            }
            try { localStorage.setItem('hs_stars_total_v1', String(Math.max(0, total))); } catch (_) {}
        } catch (_) {}
    };

    const login = (userData) => {
        try {
            // If switching accounts, reset kid-score counters stored locally
            const prev = localStorage.getItem('user');
            const prevId = prev ? (JSON.parse(prev)?._id || null) : null;
            const nextId = userData?._id || null;
            if (!prevId || (prevId && nextId && String(prevId) !== String(nextId))) {
                try { localStorage.removeItem('hs_stars_total_v1'); } catch (_) {}
                try { localStorage.removeItem('hs_stars_per_module_v1'); } catch (_) {}
                try { localStorage.removeItem('hs_stars_per_question_v1'); } catch (_) {}
            }
        } catch (_) {}
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        // Hydrate stars for this user from server best scores
        try { hydrateStarsFromServer(userData?._id); } catch (_) {}
    };

    const logout = () => {
        localStorage.removeItem('user');
        // Optionally clear score counters on logout as well
        try { localStorage.removeItem('hs_stars_total_v1'); } catch (_) {}
        try { localStorage.removeItem('hs_stars_per_module_v1'); } catch (_) {}
        try { localStorage.removeItem('hs_stars_per_question_v1'); } catch (_) {}
        setUser(null);
    };

    const value = {
        user,
        loading, // Provide loading state to other components
        login,
        logout,
    };

    // Always render children, let ProtectedRoute handle the loading state
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

