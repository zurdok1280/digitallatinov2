import { BarChart3 } from "lucide-react";
import React, { useState, useMemo, useEffect, lazy, Suspense } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { LoginForm } from "./components/LoginForm";
import SongChart from "./components/SongChart";
import ArtistDetailsModal from "./components/ArtistDetailsModal";
import PlatformsDetailsModal from "./components/PlatformsDetailsModal";
import SearchModal from "./components/SearchModal";
import TopPlatformsChart from "./components/TopPlatformsChart";
import ArtistContextModal from "./components/ArtistContextModal";
import {
  getCountries,
  getFormatsByCountry,
  getCitiesByCountry,
  getChartDigital,
  getFormatsByCountryArtist,
  getDebutSongs,
  getCuratorPics,
  getPlaylistType,
  getTiktokPics,
  getChartDigitalHitsRadio,
} from "./services/api";
import TopArtistsChart from "./components/TopArtistsChart";
import TopArtistReportModal from "./components/TopArtistReportModal";
import HeavyHittersChart from "./components/HeavyHittersChart";
import CuratorPicksChart from "./components/CuratorPicksChart";
import TiktokerPicksChart from "./components/TiktokerPicksChart";
import CampaignPage from "./components/CampaignPage";
import ComparisonBar from "./components/ComparisonBar";
import SongCompareModal from "./components/SongCompareModal";
import FloatingScrollButtons from "./components/FloatingScrollButtons";
import { Toaster } from "./components/Toaster";
import PaymentPage from "./components/PaymentPage";

import AuthCallbackPage from './pages/AuthCallbackPage';
import { ArtistSelectionModal } from './components/ArtistSelectionModal';
import MyArtist from './pages/MyArtist';
import SongDetailsModal from './components/SongDetailsModal';
import AudioPlayer from './components/AudioPlayer';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const AdminPanel = lazy(() => import("./pages/AdminPanel"));

const RequireAdmin = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-gray-400 font-bold p-8">
        Acceso Denegado. Se requiere rol de Administrador.
      </div>
    );
  }
  return children;
};

const withLazy = (Component) => (props) => (
  <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-[#c193ff] animate-pulse font-bold">Cargando módulo...</div>}>
    <Component {...props} />
  </Suspense>
);

const AdminPanelLazy = withLazy(AdminPanel);


function Dashboard() {
  const location = useLocation();
  const [selectedCountry, setSelectedCountry] = useState('0');
  const [selectedGenre, setSelectedGenre] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPlatform, setSelectedPlatform] = useState('spotify');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedSongPlatform, setSelectedSongPlatform] = useState(null);
  const [selectedArtistReport, setSelectedArtistReport] = useState(null);
  const [selectedArtistContext, setSelectedArtistContext] = useState(null);
  const [activeView, setActiveView] = useState("Charts");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('0');
  const [selectedPlaylistType, setSelectedPlaylistType] = useState('0');
  const [selectedCRG, setSelectedCRG] = useState('C');

  const [selectedSong, setSelectedSong] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [countriesList, setCountriesList] = useState([]);
  const [genresList, setGenresList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [playlistTypesList, setPlaylistTypesList] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Comparison States
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [songForComparison, setSongForComparison] = useState({ s1: null, s2: null });

  // Reset comparison on view change
  useEffect(() => {
    setComparisonMode(false);
    setSelectedSongs([]);
    setShowCompareModal(false);
  }, [activeView]);
  const { user, logout, updateUser } = useAuth();
  const [showArtistSelection, setShowArtistSelection] = useState(false);
  const navigate = useNavigate();

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
  }, [user, navigate, location.pathname]);

  useEffect(() => {
    if (searchParams.get('payment') === 'true') {
      setIsPaymentModalOpen(true);
    } else {
      setIsPaymentModalOpen(false);
    }

    if (searchParams.get('login') === 'true') {
      setIsLoginModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('login');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  const handleArtistSelected = async (artistId, artistName) => {
    try {
      if (user?.email) {
        localStorage.setItem(`artistId_${user.email}`, artistId);
        localStorage.setItem(`artistName_${user.email}`, artistName);
      }
      updateUser({ allowedArtistId: artistId, allowedArtistName: artistName });
      setShowArtistSelection(false);
      navigate('/');
    } catch (error) {
      console.error("Error setting artist:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const [countriesData, playlistTypesData] = await Promise.all([
        getCountries(),
        getPlaylistType()
      ]);
      setCountriesList(countriesData);
      setPlaylistTypesList(playlistTypesData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFormatsAndCities = async () => {
      // If we switched to HeavyHitters, reset to its defaults immediately
      if (activeView === 'HeavyHitters' && selectedCountry === '0') {
        setSelectedCountry(1);
        setSelectedGenre(0);
        setSelectedCity('All');
        return; // This loop will run again with selectedCountry=1
      }

      if (activeView === 'CuratorPicks' || activeView === 'TiktokerPicks') {
        if (selectedCountry !== '0') setSelectedCountry('0');
        if (selectedGenre === 'All') setSelectedGenre(0);
      }

      // Use Country 0 (Global/All) for Format fetching if in CuratorPicks or TiktokerPicks
      const targetCountry = (activeView === 'CuratorPicks' || activeView === 'TiktokerPicks') ? 0 : selectedCountry;

      if (targetCountry !== null) {
        const [formatsData, citiesData] = await Promise.all([
          activeView === 'Artists' ? getFormatsByCountryArtist(targetCountry) : getFormatsByCountry(targetCountry),
          getCitiesByCountry(targetCountry)
        ]);
        setGenresList(formatsData);
        setCitiesList(citiesData);

        // Auto-select General (id 0) for genre on non-genre-focused views if we just arrived
        if (activeView === 'Platforms' || activeView === 'Artists') {
          const firstRealGenre = formatsData.find(g => g.id !== 0 && String(g.id) !== '0');
          setSelectedGenre(firstRealGenre ? firstRealGenre.id : (formatsData[0]?.id || 0));
        } else if (activeView !== 'CuratorPicks' && activeView !== 'TiktokerPicks') {
          setSelectedGenre(targetCountry !== '0' ? 0 : 'All'); // Always default to General (id=0) for Charts and DigitalHitsForRadio
        }
      } else {
        setGenresList([]);
        setCitiesList([]);
        if (activeView !== 'HeavyHitters' && activeView !== 'CuratorPicks' && activeView !== 'TiktokerPicks') setSelectedGenre('0');
      }
      if (activeView !== 'CuratorPicks' && activeView !== 'TiktokerPicks') setSelectedCity('0');  // Reset city on country change
    };
    fetchFormatsAndCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, activeView]);

  // Handle activeView switching to Platforms, shift off genre 0 if necessary
  useEffect(() => {
    if (activeView === 'Platforms') {
      if (selectedGenre === 0 || selectedGenre === 'All' || String(selectedGenre) === '0') {
        if (genresList && genresList.length > 0) {
          const firstRealGenre = genresList.find(g => g.id !== 0 && String(g.id) !== '0');
          if (firstRealGenre) setSelectedGenre(firstRealGenre.id);
        }
      }
    }
  }, [activeView, genresList, selectedGenre]);

  useEffect(() => {
    // AbortController cancels any in-flight request when filters change before it resolves.
    // This prevents stale data from a slow request overwriting a faster newer one.
    const controller = new AbortController();
    const { signal } = controller;

    const fetchChartData = async () => {
      if (activeView === 'HeavyHitters') {
        if (selectedCountry === 'All' || selectedGenre === 'All') {
          setSelectedCountry(1);
          setSelectedGenre(0);
          setSelectedCity('All');
          return;
        }
        setIsLoading(true);
        const data = await getDebutSongs(selectedGenre, selectedCountry);
        if (!signal.aborted) { setSongs(data); setIsLoading(false); }
      } else if (activeView === 'CuratorPicks') {
        setIsLoading(true);
        const data = await getCuratorPics(selectedGenre, selectedPlaylistType);
        if (!signal.aborted) { setSongs(data); setIsLoading(false); }
      } else if (activeView === 'TiktokerPicks') {
        setIsLoading(true);
        const data = await getTiktokPics(selectedGenre);
        if (!signal.aborted) { setSongs(data); setIsLoading(false); }
      } else if (activeView === 'DigitalHitsForRadio') {
        setIsLoading(true);
        const data = await getChartDigitalHitsRadio(selectedGenre, selectedCountry, selectedCity);
        if (!signal.aborted) { setSongs(data); setIsLoading(false); }
      } else if (activeView === 'Charts') {
        setIsLoading(true);
        const data = await getChartDigital(selectedGenre, selectedCountry, selectedCity, selectedCRG);
        if (!signal.aborted) { setSongs(data); setIsLoading(false); }
      }
    };

    fetchChartData();
    // Cleanup: abort the pending request when the effect re-runs
    return () => controller.abort();
  }, [selectedCountry, selectedGenre, selectedCity, selectedPlaylistType, selectedCRG, activeView]);

  // Comparison Handlers
  const handleToggleComparisonMode = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setComparisonMode(!comparisonMode);
    if (comparisonMode) {
      setSelectedSongs([]);
    }
  };

  const handleSongSelect = (song) => {
    const isSelected = selectedSongs.some(s => s.cs_song === song.cs_song);

    if (isSelected) {
      setSelectedSongs(selectedSongs.filter(s => s.cs_song !== song.cs_song));
    } else {
      if (selectedSongs.length < 2) {
        setSelectedSongs([...selectedSongs, song]);
      }
    }
  };

  const handleStartComparison = () => {
    if (selectedSongs.length === 2) {
      setSongForComparison({ s1: selectedSongs[0], s2: selectedSongs[1] });
      setShowCompareModal(true);
    }
  };

  const handleClearComparison = () => {
    setSelectedSongs([]);
  };

  const handleRemoveSong = (csSong) => {
    setSelectedSongs(selectedSongs.filter(s => s.cs_song !== csSong));
  };

  const isAllowedForArtist = (item) => {
    if (user?.role !== 'ARTIST') return true;
    const allowedId = String(user.allowedArtistId);
    const normalizeStr = (str) => String(str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const allowedName = normalizeStr(user.allowedArtistName);

    // Check if it's a song or an artist item
    const itemId = String(item.spotifyartistid || item.spotifyid || item.cs_song || item.id);
    const itemArtists = normalizeStr(item.artists || item.name || '');

    if (itemId === allowedId || (allowedName && itemArtists.includes(allowedName))) {
      return true;
    }
    return false;
  };

  const showRestrictedToast = async () => {
    const { toast } = await import('./hooks/use-toast');
    toast({
      title: "🔒 Acceso Restringido",
      description: "Acceso restringido, este artista no pertenece a tu selección actual.",
      className: "bg-red-500/10 border-red-500/50 text-white backdrop-blur-md rounded-xl",
    });
  };

  return (
    <>
      <div className="app-container">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeView={activeView}
          setActiveView={setActiveView}
          onLoginClick={() => setIsLoginModalOpen(true)}
        />
        <main className="main-content">
          <Header
            countries={countriesList}
            genres={genresList}
            cities={citiesList}
            playlistTypes={playlistTypesList}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            activeView={activeView}
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            selectedPlaylistType={selectedPlaylistType}
            setSelectedPlaylistType={setSelectedPlaylistType}
            selectedCRG={selectedCRG}
            setSelectedCRG={setSelectedCRG}
            onToggleSidebar={() => setIsSidebarOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            user={user}
            onLoginClick={() => setIsLoginModalOpen(true)}
            onLogoutClick={logout}
          />

          <Routes>
            <Route path="/" element={
              <>
                <div className="filter-header" style={{ justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
                  <div className="filter-controls">
                    {/* Comparison Toggle Button */}
                    {['Charts', 'HeavyHitters', 'CuratorPicks', 'TiktokerPicks', 'DigitalHitsForRadio'].includes(activeView) && (
                      <button
                        className={`btn-toggle-compare ${comparisonMode ? 'active' : ''}`}
                        onClick={handleToggleComparisonMode}
                        title="Modo Comparación"
                      >
                        <BarChart3 size={18} />
                        <span>{comparisonMode ? 'Cerrar Comparar' : 'Comparar'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {activeView === 'Charts' && (
                  <SongChart
                    songs={songs}
                    isLoading={isLoading}
                    comparisonMode={comparisonMode}
                    onSongSelect={handleSongSelect}
                    selectedSongs={selectedSongs}
                    onArtistClick={(artist) => {
                      if (!user) { setIsLoginModalOpen(true); return; }
                      if (!isAllowedForArtist(artist)) { showRestrictedToast(); return; }
                      setSelectedArtist({ ...artist, countryId: selectedCountry === '0' ? 0 : selectedCountry });
                    }}
                    onSongClick={(song) => {
                      if (!user) { setIsLoginModalOpen(true); return; }
                      if (!isAllowedForArtist(song)) { showRestrictedToast(); return; }
                      setSelectedArtist({
                        id: song.spotifyartistid || song.cs_song,
                        spotifyid: song.spotifyartistid || song.cs_song,
                        name: song.artists,
                        imageUrl: (song.spotifyid && song.spotifyid.startsWith('http') ? song.spotifyid : null) || song.avatar || song.url,
                        monthlyListeners: song.spotify_streams_total || 0,
                        followers: song.audience_total || 0,
                        artist: song.artists,
                        img: (song.spotifyid && song.spotifyid.startsWith('http') ? song.spotifyid : null) || song.url || song.avatar || '/logo.png',
                        songName: song.song,
                        cs_song: song.cs_song,
                        initialTab: 'detalles_cancion'
                      });
                    }}
                    onLoginClick={() => setIsLoginModalOpen(true)}
                  />
                )}

                {activeView === 'DigitalHitsForRadio' && (
                  <SongChart
                    songs={songs}
                    isLoading={isLoading}
                    comparisonMode={comparisonMode}
                    onSongSelect={handleSongSelect}
                    selectedSongs={selectedSongs}
                    onArtistClick={(artist) => {
                      if (!user) { setIsLoginModalOpen(true); return; }
                      if (!isAllowedForArtist(artist)) { showRestrictedToast(); return; }
                      setSelectedArtist({ ...artist, countryId: selectedCountry === '0' ? 0 : selectedCountry });
                    }}
                    onSongClick={(song) => {
                      if (!user) { setIsLoginModalOpen(true); return; }
                      if (!isAllowedForArtist(song)) { showRestrictedToast(); return; }
                      setSelectedArtist({
                        id: song.spotifyartistid || song.cs_song,
                        spotifyid: song.spotifyartistid || song.cs_song,
                        name: song.artists,
                        imageUrl: (song.spotifyid && song.spotifyid.startsWith('http') ? song.spotifyid : null) || song.avatar || song.url,
                        monthlyListeners: song.spotify_streams_total || 0,
                        followers: song.audience_total || 0,
                        artist: song.artists,
                        img: (song.spotifyid && song.spotifyid.startsWith('http') ? song.spotifyid : null) || song.url || song.avatar || '/logo.png',
                        songName: song.song,
                        cs_song: song.cs_song,
                        initialTab: 'detalles_cancion'
                      });
                    }}
                    onLoginClick={() => setIsLoginModalOpen(true)}
                  />
                )}

                {activeView === 'Platforms' && (
                  <TopPlatformsChart
                    selectedCountry={selectedCountry}
                    selectedGenre={selectedGenre}
                    selectedPlatform={selectedPlatform}
                    onSongClick={(song) => {
                      if (!user) { setIsLoginModalOpen(true); return; }
                      if (!isAllowedForArtist(song)) { showRestrictedToast(); return; }
                      setSelectedSongPlatform(song);
                    }}
                  />
                )}

                {activeView === 'Artists' && (
                  <TopArtistsChart
                    selectedCountry={selectedCountry}
                    selectedGenre={selectedGenre}
                    onArtistClick={(artist) => {
                      if (!user) { setIsLoginModalOpen(true); return; }
                      if (!isAllowedForArtist(artist)) { showRestrictedToast(); return; }
                      setSelectedArtistReport(artist);
                    }}
                  />
                )}

                {activeView === 'HeavyHitters' && (
                  <HeavyHittersChart
                    songs={songs}
                    isLoading={isLoading}
                    comparisonMode={comparisonMode}
                    onSongSelect={handleSongSelect}
                    selectedSongs={selectedSongs}
                    onSongClick={(song) => {
                      if (!user) { setIsLoginModalOpen(true); return; }
                      if (!isAllowedForArtist(song)) { showRestrictedToast(); return; }
                      setSelectedSongPlatform(song);
                    }}
                  />
                )}

                {activeView === 'CuratorPicks' && (
                  <CuratorPicksChart
                    songs={songs}
                    isLoading={isLoading}
                    comparisonMode={comparisonMode}
                    onSongSelect={handleSongSelect}
                    selectedSongs={selectedSongs}
                    onSongClick={(song) => {
                      if (!user) { setIsLoginModalOpen(true); return; }
                      if (!isAllowedForArtist(song)) { showRestrictedToast(); return; }
                      setSelectedSongPlatform(song);
                    }}
                  />
                )}

                {activeView === 'TiktokerPicks' && (
                  <TiktokerPicksChart
                    songs={songs}
                    isLoading={isLoading}
                    comparisonMode={comparisonMode}
                    onSongSelect={handleSongSelect}
                    selectedSongs={selectedSongs}
                    onSongClick={(song) => {
                      if (!user) { setIsLoginModalOpen(true); return; }
                      if (!isAllowedForArtist(song)) { showRestrictedToast(); return; }
                      setSelectedSongPlatform(song);
                    }}
                  />
                )}

                <FloatingScrollButtons />
              </>
            } />

            <Route path="/my-artist" element={<MyArtist onSongClick={setSelectedSong} />} />
            <Route path="/admin" element={<RequireAdmin><AdminPanelLazy /></RequireAdmin>} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </main>
      </div>

      {/* MODALES GLOBALES */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onArtistClick={(artist) => {
          if (!user) {
            setIsLoginModalOpen(true);
            return;
          }
          if (!isAllowedForArtist(artist)) {
            showRestrictedToast();
            return;
          }
          setSelectedArtist({ ...artist, countryId: 0 });
        }}
        onSongClick={(song) => {
          if (!user) {
            setIsLoginModalOpen(true);
            return;
          }
          if (!isAllowedForArtist(song)) {
            showRestrictedToast();
            return;
          }
          setSelectedSongPlatform(song);
        }}
        onContextClick={(artist) => {
          if (!user) {
            setIsLoginModalOpen(true);
            return;
          }
          if (!isAllowedForArtist(artist)) {
            showRestrictedToast();
            return;
          }
          setSelectedArtistContext(artist);
        }}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />

      {selectedArtistContext && user && (
        <ArtistContextModal
          artist={selectedArtistContext}
          onClose={() => setSelectedArtistContext(null)}
        />
      )}

      {selectedArtist && user && (
        <ArtistDetailsModal
          artist={selectedArtist}
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
          onClose={() => setSelectedArtist(null)}
        />
      )}

      {selectedSongPlatform && (
        <PlatformsDetailsModal
          song={selectedSongPlatform}
          countries={countriesList}
          onClose={() => setSelectedSongPlatform(null)}
        />
      )}

      {selectedArtistReport && (
        <TopArtistReportModal
          artist={selectedArtistReport}
          countries={countriesList}
          onClose={() => setSelectedArtistReport(null)}
        />
      )}

      <ComparisonBar
        selectedSongs={selectedSongs}
        onCompare={handleStartComparison}
        onClear={handleClearComparison}
        onRemoveSong={handleRemoveSong}
        isActive={comparisonMode}
      />

      {showCompareModal && (
        <SongCompareModal
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          song1={songForComparison.s1}
          song2={songForComparison.s2}
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
          <div style={{ width: '100%', maxWidth: '700px', margin: 'auto' }}>
            <LoginForm onClose={() => setIsLoginModalOpen(false)} />
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div
          className="flex-center"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, padding: '1rem', overflowY: 'auto' }}
          onClick={(e) => e.target === e.currentTarget && setIsPaymentModalOpen(false)}
        >
          <div style={{ width: '100%', maxWidth: '1200px', margin: 'auto' }}>
            <PaymentPage onClose={() => {
              setIsPaymentModalOpen(false);
              // Remove the query param from URL
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('payment');
              setSearchParams(newParams);
            }} />
          </div>
        </div>
      )}

      <ArtistSelectionModal
        isOpen={showArtistSelection}
        onArtistSelected={handleArtistSelected}
      />

      <AudioPlayer />
      <Toaster />
    </>
  );
}

export default function App() {
  const location = useLocation();
  if (location.pathname === '/campaign') {
    return <CampaignPage />;
  }
  if (location.pathname === '/payment') {
    return <PaymentPage />;
  }
  if (location.pathname === '/forgot-password') {
    return <ForgotPassword />;
  }
  if (location.pathname === '/reset-password') {
    return <ResetPassword />;
  }
  return <Dashboard />;
}
