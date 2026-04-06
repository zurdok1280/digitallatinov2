import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { LoginForm } from './components/LoginForm';
import SongChart from './components/SongChart';
import ArtistDetailsModal from './components/ArtistDetailsModal';
import SearchModal from './components/SearchModal';
import { Toaster } from './components/Toaster';
import PaymentPage from './components/PaymentPage';
import { getCountries, getFormatsByCountry, getCitiesByCountry, getChartDigital } from './services/api';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { ArtistSelectionModal } from './components/ArtistSelectionModal';
import MyArtist from './pages/MyArtist';
import SongDetailsModal from './components/SongDetailsModal';

function App() {
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [countriesList, setCountriesList] = useState([]);
  const [genresList, setGenresList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const [showArtistSelection, setShowArtistSelection] = useState(false);

  useEffect(() => {
    if (user?.role === 'ARTIST') {
      if (!user.allowedArtistId) {
        setShowArtistSelection(true);
      } else {
        setShowArtistSelection(false);
      }
    } else {
      setShowArtistSelection(false);
    }
  }, [user]);

  const handleArtistSelected = async (artistId, artistName) => {
    try {
      if (user?.email) {
        localStorage.setItem(`artistId_${user.email}`, artistId);
        localStorage.setItem(`artistName_${user.email}`, artistName);
      }
      updateUser({ allowedArtistId: artistId, allowedArtistName: artistName });
      setShowArtistSelection(false);
    } catch (error) {
       console.error("Error setting artist:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCountries();
      setCountriesList(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFormatsAndCities = async () => {
      if (selectedCountry && selectedCountry !== 'All') {
        const [formatsData, citiesData] = await Promise.all([
          getFormatsByCountry(selectedCountry),
          getCitiesByCountry(selectedCountry)
        ]);
        setGenresList(formatsData);
        setCitiesList(citiesData);
      } else {
        setGenresList([]);
        setCitiesList([]);
      }
      setSelectedGenre(selectedCountry !== 'All' ? 0 : 'All'); // Always default to General (id=0) for a selected country
      setSelectedCity('All');  // Reset city on country change
    };
    fetchFormatsAndCities();
  }, [selectedCountry]);

  useEffect(() => {
    const fetchChart = async () => {
      setIsLoading(true);
      const data = await getChartDigital(selectedGenre, selectedCountry, selectedCity);
      setSongs(data);
      setIsLoading(false);
    };
    fetchChart();
  }, [selectedCountry, selectedGenre, selectedCity]);

  return (
    <>
      <div className="app-container">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="main-content">
          <Header
            countries={countriesList}
            genres={genresList}
            cities={citiesList}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            onToggleSidebar={() => setIsSidebarOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            user={user}
            onLoginClick={() => setIsLoginModalOpen(true)}
            onLogoutClick={logout}
          />

          <Routes>
            <Route path="/" element={
              <SongChart
                songs={songs}
                isLoading={isLoading}
                onArtistClick={setSelectedArtist}
                onSongClick={setSelectedSong}
                onLoginClick={() => setIsLoginModalOpen(true)}
              />
            } />
            <Route path="/my-artist" element={<MyArtist onSongClick={setSelectedSong} />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </main>
      </div>

      {/* MODALES GLOBALES */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onArtistClick={setSelectedArtist}
      />

      {selectedArtist && user && (
        <ArtistDetailsModal
          artist={selectedArtist}
          countries={countriesList}
          onClose={() => setSelectedArtist(null)}
        />
      )}

      {selectedSong && (
        <SongDetailsModal
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
        />
      )}

      {isLoginModalOpen && (
        <div 
          className="flex-center"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, padding: '1rem' }}
          onClick={(e) => e.target === e.currentTarget && setIsLoginModalOpen(false)}
        >
          <div style={{ width: '100%', maxWidth: '450px' }}>
            <LoginForm onClose={() => setIsLoginModalOpen(false)} />
          </div>
        </div>
      )}

      <ArtistSelectionModal
        isOpen={showArtistSelection}
        onArtistSelected={handleArtistSelected}
      />
      
      <Toaster />
    </>
  );
}

export default App;
