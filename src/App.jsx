import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SongChart from './components/SongChart';
import ArtistDetailsModal from './components/ArtistDetailsModal';
import SearchModal from './components/SearchModal';
import { getCountries, getFormatsByCountry, getCitiesByCountry, getChartDigital } from './services/api';

function App() {
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedArtist, setSelectedArtist] = useState(null);
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
        />
        
        <SongChart 
          songs={songs} 
          isLoading={isLoading}
          onArtistClick={(artist) => setSelectedArtist({ ...artist, countryId: selectedCountry === 'All' ? 0 : selectedCountry })}
        />

        {selectedArtist && (
          <ArtistDetailsModal 
            artist={selectedArtist} 
            countries={countriesList}
            onClose={() => setSelectedArtist(null)} 
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
