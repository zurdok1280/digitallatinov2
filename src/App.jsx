import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SongChart from './components/SongChart';
import ArtistDetailsModal from './components/ArtistDetailsModal';
import PlatformsDetailsModal from './components/PlatformsDetailsModal';
import SearchModal from './components/SearchModal';
import TopPlatformsChart from './components/TopPlatformsChart';
import { getCountries, getFormatsByCountry, getCitiesByCountry, getChartDigital, getFormatsByCountryArtist, getDebutSongs, getCuratorPics, getPlaylistType, getTiktokPics, getChartDigitalHitsRadio } from './services/api';
import TopArtistsChart from './components/TopArtistsChart';
import TopArtistReportModal from './components/TopArtistReportModal';
import HeavyHittersChart from './components/HeavyHittersChart';
import CuratorPicksChart from './components/CuratorPicksChart';
import TiktokerPicksChart from './components/TiktokerPicksChart';
import CampaignPage from './components/CampaignPage';
import ComparisonBar from './components/ComparisonBar';
import SongCompareModal from './components/SongCompareModal';
import FloatingScrollButtons from './components/FloatingScrollButtons';


function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState('0');
  const [selectedGenre, setSelectedGenre] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPlatform, setSelectedPlatform] = useState('spotify');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedSongPlatform, setSelectedSongPlatform] = useState(null);
  const [selectedArtistReport, setSelectedArtistReport] = useState(null);
  const [activeView, setActiveView] = useState('Charts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('0');
  const [selectedPlaylistType, setSelectedPlaylistType] = useState('0');
  
  const [countriesList, setCountriesList] = useState([]);
  const [genresList, setGenresList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [playlistTypesList, setPlaylistTypesList] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
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

      // Use Country 1 (Default USA/Global) for Format fetching if in CuratorPicks or TiktokerPicks
      const targetCountry = (activeView === 'CuratorPicks' || activeView === 'TiktokerPicks') ? 1 : selectedCountry;

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
        const data = await getChartDigital(selectedGenre, selectedCountry, selectedCity);
        if (!signal.aborted) { setSongs(data); setIsLoading(false); }
      }
    };

    fetchChartData();
    // Cleanup: abort the pending request when the effect re-runs
    return () => controller.abort();
  }, [selectedCountry, selectedGenre, selectedCity, selectedPlaylistType, activeView]);

  // Comparison Handlers
  const handleToggleComparisonMode = () => {
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

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activeView={activeView} setActiveView={setActiveView} />
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
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <div className="filter-header" style={{ justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
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
            onArtistClick={(artist) => setSelectedArtist({ ...artist, countryId: selectedCountry === '0' ? 0 : selectedCountry })}
          />
        )}

        {activeView === 'DigitalHitsForRadio' && (
          <SongChart 
            songs={songs} 
            isLoading={isLoading}
            comparisonMode={comparisonMode}
            onSongSelect={handleSongSelect}
            selectedSongs={selectedSongs}
            onArtistClick={(artist) => setSelectedArtist({ ...artist, countryId: selectedCountry === '0' ? 0 : selectedCountry })}
          />
        )}

        {activeView === 'Platforms' && (
          <TopPlatformsChart
            selectedCountry={selectedCountry}
            selectedGenre={selectedGenre}
            selectedPlatform={selectedPlatform}
            onSongClick={(song) => setSelectedSongPlatform(song)}
          />
        )}

        {activeView === 'Artists' && (
          <TopArtistsChart
            selectedCountry={selectedCountry}
            selectedGenre={selectedGenre}
            onArtistClick={(artist) => setSelectedArtistReport(artist)}
          />
        )}

        {activeView === 'HeavyHitters' && (
          <HeavyHittersChart
            songs={songs}
            isLoading={isLoading}
            comparisonMode={comparisonMode}
            onSongSelect={handleSongSelect}
            selectedSongs={selectedSongs}
            onSongClick={(song) => setSelectedSongPlatform(song)}
          />
        )}

        {activeView === 'CuratorPicks' && (
          <CuratorPicksChart
            songs={songs}
            isLoading={isLoading}
            comparisonMode={comparisonMode}
            onSongSelect={handleSongSelect}
            selectedSongs={selectedSongs}
            onSongClick={(song) => setSelectedSongPlatform(song)}
          />
        )}

        {activeView === 'TiktokerPicks' && (
          <TiktokerPicksChart
            songs={songs}
            isLoading={isLoading}
            comparisonMode={comparisonMode}
            onSongSelect={handleSongSelect}
            selectedSongs={selectedSongs}
            onSongClick={(song) => setSelectedSongPlatform(song)}
          />
        )}

        {selectedArtist && (
          <ArtistDetailsModal 
            artist={selectedArtist} 
            countries={countriesList}
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

        {/* Comparison Components */}
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

        <style>{`
          .btn-toggle-compare {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            margin-right: 0.5rem;
          }

          .btn-toggle-compare:hover {
            background: rgba(138, 136, 255, 0.1);
            border-color: var(--accent-primary);
          }

          .btn-toggle-compare.active {
            background: var(--accent-primary);
            border-color: var(--accent-primary);
            box-shadow: 0 0 15px rgba(138, 136, 255, 0.3);
          }

          @media (max-width: 600px) {
            .btn-toggle-compare span { display: none; }
            .btn-toggle-compare { padding: 0.5rem; }
          }
        `}</style>

        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          onArtistClick={(artist) => setSelectedArtist({ ...artist, countryId: 0 })} 
        />
        <FloatingScrollButtons />
      </main>
    </div>
  );
}

export default function App() {
  if (window.location.pathname === '/campaign') {
    return <CampaignPage />;
  }
  return <Dashboard />;
}
