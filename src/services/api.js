const API_BASE_URL = 'https://backend.digital-latino.com/api';

// ─── In-Memory Request Cache ────────────────────────────────────────────────
// Caches responses for static/rarely-changing endpoints (countries, genres, cities).
// TTL = 5 minutes — safe for a dashboard session. Does NOT cache report data.
const _cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

const withCache = async (key, fetcher) => {
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data;
  const data = await fetcher();
  // Only cache successful (non-empty) responses
  if (data !== null && data !== undefined && !(Array.isArray(data) && data.length === 0)) {
    _cache.set(key, { data, ts: Date.now() });
  }
  return data;
};
// ────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the list of countries from the API.
 * Returns an array of objects: { id: number, description: string }
 */
export const getCountries = async () => {
  return withCache('countries', async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/report/getCountries`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (error) {
      console.error("API Error fetching countries:", error);
      return [];
    }
  });
};

export const getFormatsByCountry = async (country) => {
  return withCache(`formats_${country}`, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/report/getFormatbyCountry/${encodeURIComponent(country)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (error) {
      console.error(`API Error fetching formats for ${country}:`, error);
      return [];
    }
  });
};

export const getCitiesByCountry = async (countryId) => {
  return withCache(`cities_${countryId}`, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/report/getCities/${encodeURIComponent(countryId)}/C`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (error) {
      console.error(`API Error fetching cities for ${countryId}:`, error);
      return [];
    }
  });
};

/**
 * Fetches the digital chart list based on dynamic filters.
 */
export const getChartDigital = async (genreId, countryId, cityId) => {
  const gId = genreId === 'All' ? 0 : genreId;
  const cId = countryId === 'All' ? 0 : countryId;
  const ctyId = cityId === 'All' ? 0 : cityId;

  try {
    const response = await fetch(`${API_BASE_URL}/report/getChartDigital/${gId}/${cId}/C/${ctyId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching chart:", error);
    return [];
  }
};

/**
 * Fetches the digital chart list specifically for Digital Hits for Radio (radiooff=1).
 */
export const getChartDigitalHitsRadio = async (genreId, countryId, cityId) => {
  const gId = genreId === 'All' ? 0 : genreId;
  const cId = countryId === 'All' ? 0 : countryId;
  const ctyId = cityId === 'All' ? 0 : cityId;

  try {
    const response = await fetch(`${API_BASE_URL}/report/getChartDigital/${gId}/${cId}/C/${ctyId}?radiooff=1`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching radio chart:", error);
    return [];
  }
};

/**
 * Fetches artists and songs from Spotify
 */
export const searchSpotify = async (query) => {
  if (!query) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/report/getSearchSpotify?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error searching spotify:", error);
    return { artists: [], tracks: [] };
  }
};

/**
 * Fetches expanded details for a specific artist by Spotify ID
 */
export const getArtistData = async (spotifyId) => {
  if (!spotifyId) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/report/getDataArtist/${encodeURIComponent(spotifyId)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching artist data:", error);
    return null;
  }
};

/**
 * Fetches geographical audience data for plotting on maps
 */
export const getMapData = async (countryId, spotifyId) => {
  if (!spotifyId) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/report/getDataArtistCountry/${countryId}/${encodeURIComponent(spotifyId)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching map data:", error);
    return [];
  }
};

/**
 * Fetches available playlist types (Editorial, Personalized, etc)
 */
export const getPlaylistTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/report/getPlaylistType`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching playlist types:", error);
    return [];
  }
};

/**
 * Fetches relevant playlists for the given artist and playlist type
 */
export const getArtistPlaylists = async (spotifyId, playlistType = 0) => {
  if (!spotifyId) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/report/getArtistPlaylistRelated/${encodeURIComponent(spotifyId)}/${playlistType}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching artist playlists:", error);
    return [];
  }
};

/**
 * Fetches relevant TikTok influencers interacting with the artist
 */
export const getArtistTiktokers = async (spotifyId) => {
  if (!spotifyId) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/report/getArtistTiktokersRelated/${encodeURIComponent(spotifyId)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching artist tiktokers:", error);
    return [];
  }
};

/**
 * Fetches radio gap opportunities for artist relative to similar artists
 */
export const getArtistRadioRelated = async (spotifyId, countryId = 0) => {
  if (!spotifyId) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/report/getArtistRadioRelated/${encodeURIComponent(spotifyId)}/${countryId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching radio gaps:", error);
    return [];
  }
};

/**
 * Fetches the neural graph nodes and edges for similar audience clusters
 */
export const getArtistGraph = async (spotifyId) => {
  if (!spotifyId) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/report/getArtistRelatedGraph/${encodeURIComponent(spotifyId)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching artist graph:", error);
    return null;
  }
};

/**
 * Fetches platform-specific detailed data for a given song across Spotify, TikTok, etc.
 */
export const getSongPlatformData = async (csSong, formatId = 0, countryId = 0) => {
  if (!csSong) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/report/getSongDigital/${csSong}/${formatId}/${countryId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching song platform data:", error);
    return null;
  }
};

/**
 * Fetches geographical city data for a song to plot on a map
 */
export const getCityDataForSong = async (csSong, countryId = 0) => {
  if (!csSong) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/report/getCityData/${csSong}/${countryId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching song city data:", error);
    return [];
  }
};

/**
 * Fetches the list of playlists where the song is included, by playlist type.
 */
export const getSongTopPlaylists = async (csSong, typePlaylist = 0) => {
  if (!csSong) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/report/getTopPlaylists/${csSong}/${typePlaylist}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching song top playlists:", error);
    return [];
  }
};

/**
 * Fetches the trending top platforms list
 */
export const getTrendingTopPlatforms = async (platform, formatId = 0, countryId = 0) => {
  const pId = platform || 'spotify';
  const fId = formatId === 'All' ? 0 : formatId;
  const cId = countryId === 'All' ? 0 : countryId;
  
  try {
    const response = await fetch(`${API_BASE_URL}/report/getTopPlatform/${encodeURIComponent(pId)}/${fId}/${cId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    // Many endpoints return { data: [...] }, ensure we return an array
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching top platforms:", error);
    return [];
  }
};

/**
 * Fetches the trending top artists list
 */
export const getTrendingTopArtists = async (formatId = 0, countryId = 0, cityId = 0) => {
  const fId = formatId === 'All' ? 0 : formatId;
  const cId = countryId === 'All' ? 0 : countryId;
  const ctyId = cityId === 'All' ? 0 : cityId;
  
  try {
    const response = await fetch(`${API_BASE_URL}/report/getTopArtist/${fId}/${cId}/${ctyId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching top artists:", error);
    return [];
  }
};

/**
 * Fetches formats specifically for artists in a given country
 */
export const getFormatsByCountryArtist = async (countryId) => {
  if (!countryId || countryId === 'All') return [];
  return withCache(`formats_artist_${countryId}`, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/report/getFormatbyCountryArtist/${encodeURIComponent(countryId)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (error) {
      console.error(`API Error fetching artist formats for ${countryId}:`, error);
      return [];
    }
  });
};
/**
 * Fetches the list of top songs for an artist by Spotify ID and country ID
 */
export const getSongsArtistBySpotifyId = async (spotifyId, countryId = 1) => {
  if (!spotifyId) return [];
  const cId = countryId === 'All' ? 1 : countryId;
  try {
    const response = await fetch(`${API_BASE_URL}/report/getSongsArtist/${encodeURIComponent(spotifyId)}/${cId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching artist songs:", error);
    return [];
  }
};

/**
 * Fetches basic song info (name, label, artist) by internal cs_song ID.
 * Mirrors the legacy getSongById used in expandRowArtist.tsx.
 */
export const getSongById = async (csSong) => {
  if (!csSong) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/report/getSongbyId/${csSong}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error fetching song details for ${csSong}:`, error);
    return null;
  }
};

/**
 * Fetches the trending debut songs (Heavy Hitters)
 */
export const getDebutSongs = async (formatId = 0, countryId = 0) => {
  const fId = formatId === 'All' ? 0 : formatId;
  const cId = countryId === 'All' ? 0 : countryId;
  
  try {
    const response = await fetch(`${API_BASE_URL}/report/getTrendingDebut/${fId}/${cId}/C/0`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching debut songs:", error);
    return [];
  }
};

/**
 * Fetches the curator picks
 */
export const getCuratorPics = async (formatId = 0, typeId = 0) => {
  const fId = formatId === 'All' ? 0 : formatId;
  const tId = typeId === 'All' ? 0 : typeId;

  try {
    const response = await fetch(`${API_BASE_URL}/report/getCuratorPics/${fId}/${tId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching curator pics:", error);
    return [];
  }
};

/**
 * Fetches the available playlist types for curator picks
 */
export const getPlaylistType = async () => {
  return withCache('playlist_types', async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/report/getPlaylistType`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (error) {
      console.error("API Error fetching playlist types:", error);
      return [];
    }
  });
};

/**
 * Fetches the Tiktok picks
 */
export const getTiktokPics = async (formatId = 0) => {
  const fId = formatId === 'All' ? 0 : formatId;

  try {
    const response = await fetch(`${API_BASE_URL}/report/getTiktokPics/${fId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching tiktok pics:", error);
    return [];
  }
};

/**
 * Fetches comparative data for two songs (Charts/Cities).
 */
export const getVsSongs = async (csSong1, csSong2) => {
  if (!csSong1 || !csSong2) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/report/getVsSong/${csSong1}/${csSong2}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching vs songs:", error);
    return [];
  }
};

/**
 * Fetches comparative playlist data for two songs.
 */
export const getVsSongPlaylists = async (csSong1, csSong2) => {
  if (!csSong1 || !csSong2) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/report/getVsSongPlaylists/${csSong1}/${csSong2}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching vs song playlists:", error);
    return [];
  }
};

/**
 * Fetches comparative TikTok data for two songs.
 */
export const getVsSongTiktoks = async (csSong1, csSong2) => {
  if (!csSong1 || !csSong2) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/report/getVsSongTiktoks/${csSong1}/${csSong2}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching vs song tiktoks:", error);
    return [];
  }
};

export const getSongBySpotifyId = async (id) => {
  if (!id) return { data: {} };
  try {
    const response = await fetch(`${API_BASE_URL}/report/getSongBySpotifyId/${id}`);
    if (response.status === 404) return { data: {} };
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return { data };
  } catch (error) {
    return { data: {} };
  }
};

export const digitalLatinoApi = {
  getSongsArtistBySpotifyId,
  getSongById,
  getSongBySpotifyId,
  getArtistData
};


