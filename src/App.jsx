import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SongChart from './components/SongChart';
import ArtistDetailsModal from './components/ArtistDetailsModal';
import PlatformsDetailsModal from './components/PlatformsDetailsModal';
import SearchModal from './components/SearchModal';
import TopPlatformsChart from './components/TopPlatformsChart';
import { getCountries, getFormatsByCountry, getCitiesByCountry, getChartDigital, getFormatsByCountryArtist } from './services/api';
import TopArtistsChart from './components/TopArtistsChart';
import TopArtistReportModal from './components/TopArtistReportModal';

function App() {
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('spotify');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedSongPlatform, setSelectedSongPlatform] = useState(null);
  const [selectedArtistReport, setSelectedArtistReport] = useState(null);
  const [activeView, setActiveView] = useState('Charts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [countriesList, setCountriesList] = useState([]);
  const [genresList, setGenresList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
          activeView === 'Artists' ? getFormatsByCountryArtist(selectedCountry) : getFormatsByCountry(selectedCountry),
          getCitiesByCountry(selectedCountry)
        ]);
        setGenresList(formatsData);
        setCitiesList(citiesData);
        // Special rule for platforms/artists: cannot be 0 (General) if it's the only one
        if (activeView === 'Platforms' || activeView === 'Artists') {
          const firstRealGenre = formatsData.find(g => g.id !== 0 && String(g.id) !== '0');
          setSelectedGenre(firstRealGenre ? firstRealGenre.id : (formatsData[0]?.id || 0));
        } else {
          setSelectedGenre(selectedCountry !== 'All' ? 0 : 'All'); // Always default to General (id=0) for Charts
        }
      } else {
        setGenresList([]);
        setCitiesList([]);
        setSelectedGenre('All');
      }
      setSelectedCity('All');  // Reset city on country change
    };
    fetchFormatsAndCities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

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
    const fetchChart = async () => {
      setIsLoading(true);
      const data = await getChartDigital(selectedGenre, selectedCountry, selectedCity);
      setSongs(data);
      setIsLoading(false);
    };
    fetchChart();
  }, [selectedCountry, selectedGenre, selectedCity]);

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activeView={activeView} setActiveView={setActiveView} />
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
          activeView={activeView}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
        {activeView === 'Charts' && (
          <SongChart 
            songs={songs} 
            isLoading={isLoading}
            onArtistClick={(artist) => setSelectedArtist({ ...artist, countryId: selectedCountry === 'All' ? 0 : selectedCountry })}
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

export default App;
