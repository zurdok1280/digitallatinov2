import React, { useState, useMemo, useEffect } from 'react';
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedGenre, selectedCity, selectedPlaylistType, activeView]);

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
        {activeView === 'Charts' && (
          <SongChart 
            songs={songs} 
            isLoading={isLoading}
            onArtistClick={(artist) => setSelectedArtist({ ...artist, countryId: selectedCountry === '0' ? 0 : selectedCountry })}
          />
        )}

        {activeView === 'DigitalHitsForRadio' && (
          <SongChart 
            songs={songs} 
            isLoading={isLoading}
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
            onSongClick={(song) => setSelectedSongPlatform(song)}
          />
        )}

        {activeView === 'CuratorPicks' && (
          <CuratorPicksChart
            songs={songs}
            isLoading={isLoading}
            onSongClick={(song) => setSelectedSongPlatform(song)}
          />
        )}

        {activeView === 'TiktokerPicks' && (
          <TiktokerPicksChart
            songs={songs}
            isLoading={isLoading}
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

        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          onArtistClick={(artist) => setSelectedArtist({ ...artist, countryId: 0 })} 
        />
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
