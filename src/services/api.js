import { slugify } from '../utils/seoFilters.js';

// ─── Backend URLs ─────────────────────────────────────────────────────────────
// AcrData: serves all /report/* endpoints (charts, artists, playlists, tiktokers…)
// ⚠️  Switch between production and local for development:
const API_BASE_URL = 'https://backend.digital-latino.com/api';   // ← PRODUCCIÓN
// const API_BASE_URL = 'http://localhost:8084/api';              // ← LOCAL AcrData

// Login-DigitalLatino: serves /auth /contacts /admin /users /subscriptions /payment
// ⚠️  Switch between production and local for development:
const LOGIN_API_BASE_URL = 'https://security.digital-latino.com/api'; // ← PRODUCCIÓN
// const LOGIN_API_BASE_URL = 'http://localhost:8085/api';                // ← LOCAL
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
};

// ─── In-Memory Request Cache ────────────────────────────────────────────────
// Caches responses for static/rarely-changing endpoints (countries, genres, cities).
// TTL = 5 minutes — safe for a dashboard session. Does NOT cache report data.
const _cache = new Map();
const _inflight = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

const withCache = async (key, fetcher) => {
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data;

  if (_inflight.has(key)) {
    return _inflight.get(key);
  }

  const promise = fetcher().then(data => {
    // Only cache successful (non-empty) responses
    if (data !== null && data !== undefined && !(Array.isArray(data) && data.length === 0)) {
      _cache.set(key, { data, ts: Date.now() });
    }
    _inflight.delete(key);
    return data;
  }).catch(error => {
    _inflight.delete(key);
    throw error;
  });

  _inflight.set(key, promise);
  return promise;
};
// ────────────────────────────────────────────────────────────────────────────

/**
 * Fallback utilitario para asegurar que ninguna respuesta traiga canciones duplicadas
 * ya que si esto llega a Componentes React puede renderizar elementos duplicados.
 */
const deduplicateSongs = (songs) => {
  if (!Array.isArray(songs)) return [];
  const seen = new Set();
  return songs.filter(song => {
    // Tomamos como ID prioritario cs_song o spotifyid, si no existe, usamos rk
    const primaryId = song.cs_song || song.spotifyid;
    const key = primaryId ? `id_${primaryId}` : `rk_${song.rk || Math.random()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Fetches the list of countries from the API.
 * Returns an array of objects: { id: number, description: string }
 */
export const getCountries = async () => {
  return withCache('countries', async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/report/getCountries`);
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
      const response = await authFetch(`${API_BASE_URL}/report/getFormatbyCountry/${encodeURIComponent(country)}`);
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
      const response = await authFetch(`${API_BASE_URL}/report/getCities/${encodeURIComponent(countryId)}/C`);
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
export const getChartDigital = async (genreId, countryId, cityId, crg = 'C') => {
  const gId = genreId === 'All' ? 0 : genreId;
  const cId = countryId === 'All' ? 0 : countryId;
  const ctyId = cityId === 'All' ? 0 : cityId;

  try {
    const response = await authFetch(`${API_BASE_URL}/report/getChartDigital/${gId}/${cId}/${crg}/${ctyId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const rawArray = Array.isArray(data) ? data : (data?.data || []);
    return deduplicateSongs(rawArray);
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
    const response = await authFetch(`${API_BASE_URL}/report/getChartDigital/${gId}/${cId}/C/${ctyId}?radiooff=1`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const rawArray = Array.isArray(data) ? data : (data?.data || []);
    return deduplicateSongs(rawArray);
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
    const response = await authFetch(`${API_BASE_URL}/report/getSearchSpotify?query=${encodeURIComponent(query)}`);
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
  return withCache(`artist_data_${spotifyId}`, async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/report/getDataArtist/${encodeURIComponent(spotifyId)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error fetching artist data:", error);
      return null;
    }
  });
};

/**
 * Fetches geographical audience data for plotting on maps
 */
export const getMapData = async (countryId, spotifyId) => {
  if (!spotifyId) return [];
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getDataArtistCountry/${countryId}/${encodeURIComponent(spotifyId)}`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getPlaylistType`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getArtistPlaylistRelated/${encodeURIComponent(spotifyId)}/${playlistType}`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getArtistTiktokersRelated/${encodeURIComponent(spotifyId)}`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getArtistRadioRelated/${encodeURIComponent(spotifyId)}/${countryId}`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getArtistRelatedGraphv2/${encodeURIComponent(spotifyId)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching artist graph:", error);
    return null;
  }
};

/**
 * Fetches opportunities in cities comparing artist current listeners vs related artists average
 */
export const getCitiesGapData = async (countryId, spotifyId) => {
  if (!spotifyId) return [];
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getDataArtistCountryRelated/${countryId}/${encodeURIComponent(spotifyId)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching cities gap data:", error);
    return [];
  }
};

/**
 * Fetches platform-specific detailed data for a given song across Spotify, TikTok, etc.
 */
export const getSongPlatformData = async (csSong, formatId = 0, countryId = 0) => {
  if (!csSong) return null;
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getSongDigital/${csSong}/${formatId}/${countryId}`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getCityData/${csSong}/${countryId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching song city data:", error);
    return [];
  }
};

/**
 * Fetches radio market audience data for a song by country.
 * @param {number|string} csSong - The cs_song identifier.
 * @param {number|string} countryId - 0 = global, or specific country ID.
 * @returns {Promise<Array<{market:string, audience:number, spins:number, rank:number}>>}
 */
export const getTopMarketRadio = async (csSong, countryId = 0) => {
  if (!csSong) return [];
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getTopMarketRadio/${csSong}/${countryId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching top market radio:", error);
    return [];
  }
};

/**
 * Fetches the list of playlists where the song is included, by playlist type.
 */
export const getSongTopPlaylists = async (csSong, typePlaylist = 0) => {
  if (!csSong) return [];
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getTopPlaylists/${csSong}/${typePlaylist}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching song top playlists:", error);
    return [];
  }
};

/**
 * Fetches the trending TikTok influencers for a specific song.
 */
export const getSongTopTiktokers = async (csSong) => {
  if (!csSong) return [];
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getTopTiktok/${encodeURIComponent(csSong)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching song top tiktokers:", error);
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
    const response = await authFetch(`${API_BASE_URL}/report/getTopPlatform/${encodeURIComponent(pId)}/${fId}/${cId}`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getTopArtist/${fId}/${cId}/${ctyId}`);
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
      const response = await authFetch(`${API_BASE_URL}/report/getFormatbyCountryArtist/${encodeURIComponent(countryId)}`);
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
 * Fetches the list of songs for an artist by Spotify ID using the getArtistSongs endpoint
 */
export const getArtistSongs = async (spotifyId) => {
  if (!spotifyId) return [];
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getArtistSongs/${encodeURIComponent(spotifyId)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("API Error fetching artist songs:", error);
    return [];
  }
};

/**
 * Fetches the list of top songs for an artist by Spotify ID and country ID
 */
export const getSongsArtistBySpotifyId = async (spotifyId, countryId = 1) => {
  if (!spotifyId) return [];
  const cId = countryId === 'All' ? 1 : countryId;
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getSongsArtist/${encodeURIComponent(spotifyId)}/${cId}`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getSongbyId/${csSong}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error fetching song details for ${csSong}:`, error);
    return null;
  }
};

/**
 * Fetches the historical streams for a given song by its internal cs_song ID.
 */
export const getSongHistoricalStreams = async (csSong) => {
  if (!csSong) return [];
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getSongHistoricalStreams/${csSong}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error(`API Error fetching song historical streams for ${csSong}:`, error);
    return [];
  }
};

/**
 * Fetches the weekly historical streams for a given song.
 */
export const getSongHistoricalStreamsWeek = async (csSong, countryId = 0, formatId = 0) => {
  if (!csSong) return [];
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getSongHistoricalStreamsWeek/${csSong}/${countryId}/${formatId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error(`API Error fetching song weekly streams for ${csSong}:`, error);
    return [];
  }
};

/**
 * Fetches the trending debut songs (Heavy Hitters)
 */
export const getDebutSongs = async (formatId = 0, countryId = 0) => {
  const fId = formatId === 'All' ? 0 : formatId;
  const cId = countryId === 'All' ? 0 : countryId;

  try {
    const response = await authFetch(`${API_BASE_URL}/report/getTrendingDebut/${fId}/${cId}/C/0`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const rawArray = Array.isArray(data) ? data : (data?.data || []);
    return deduplicateSongs(rawArray);
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
    const response = await authFetch(`${API_BASE_URL}/report/getCuratorPics/${fId}/${tId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const rawArray = Array.isArray(data) ? data : (data?.data || []);
    return deduplicateSongs(rawArray);
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
      const response = await authFetch(`${API_BASE_URL}/report/getPlaylistType`);
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

    const response = await authFetch(`${API_BASE_URL}/report/getTiktokPics/${fId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const rawArray = Array.isArray(data) ? data : (data?.data || []);
    return deduplicateSongs(rawArray);
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
    const response = await authFetch(`${API_BASE_URL}/report/getVsSong/${csSong1}/${csSong2}`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getVsSongPlaylists/${csSong1}/${csSong2}`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getVsSongTiktoks/${csSong1}/${csSong2}`);
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
    const response = await authFetch(`${API_BASE_URL}/report/getSongBySpotifyId/${id}`);
    if (response.status === 404) return { data: {} };
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return { data };
  } catch (error) {
    return { data: {} };
  }
};

/**
 * Fetches the context report for a specific artist by Spotify ID
 */
export const getArtistContext = async (spotifyId) => {
  if (!spotifyId) return null;
  return withCache(`artist_context_${spotifyId}`, async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/report/getArtistContext/${encodeURIComponent(spotifyId)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error fetching artist context:", error);
      return null;
    }
  });
};

/**
 * Fetches the 90-day context phases report for a specific artist by Spotify ID
 */
export const getArtistContextPhases = async (spotifyId) => {
  if (!spotifyId) return null;
  return withCache(`artist_context_phases_${spotifyId}`, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/report/getArtistContextPhases/${encodeURIComponent(spotifyId)}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error fetching artist context phases:", error);
      return null;
    }
  });
};

/**
 * Registra una búsqueda de canción o artista que no se encontró en la base de datos (Bad Path).
 * Implementa protección contra spam usando sessionStorage.
 */
export const setLogSong = async ({ userid, spotifyid, isartist }) => {
  // 1. Verificar prevención de spam en sessionStorage
  const cacheKey = `logged_missing_${spotifyid}`;
  if (sessionStorage.getItem(cacheKey)) {
    console.log("Ya se registró esta solicitud en la sesión actual.");
    return { status: 'already_logged' };
  }

  try {
    const response = await authFetch(`${API_BASE_URL}/report/setLogSong`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid, spotifyid, isartist })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 2. Guardar en cache para evitar spam en esta sesión
    sessionStorage.setItem(cacheKey, 'true');

    // Leer como texto primero porque el backend puede devolver "ok" en lugar de un JSON válido
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { status: text };
    }
  } catch (error) {
    console.error("Error en setLogSong:", error);
    return null;
  }
};

export const digitalLatinoApi = {
  getSongsArtistBySpotifyId,
  getArtistSongs,
  getSongById,
  getSongBySpotifyId,
  getArtistData,
  getArtistContext,
  getArtistContextPhases,
  setLogSong
};


// ─── Contacts API ────────────────────────────────────────────────────────────
// Uses Login-DigitalLatino backend (local:8085 in dev, production URL in prod)
const CONTACTS_API_BASE_URL = LOGIN_API_BASE_URL;

// Adapters: translate the flat Java DTO → nested frontend Contact shape

/**
 * Formats a date string or array from the backend into YYYY-MM-DD for <input type="date">
 */
const formatDateForInput = (dateVal) => {
  if (!dateVal) return '';
  if (Array.isArray(dateVal)) {
    const y = dateVal[0];
    const m = String(dateVal[1]).padStart(2, '0');
    const d = String(dateVal[2]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(dateVal).split('T')[0].split(' ')[0];
};

/**
 * Converts a CuratorResponse (Java DTO) to the internal Contact object.
 * Missing fields (facebook, notes, lastContact) are filled with empty strings.
 */
const mapCuratorToContact = (c) => ({
  id: c.contactId,
  type: 'curators',
  name: c.displayName || '',
  handle: c.email ? `@${c.email.split('@')[0]}` : '',
  metric: c.playlists ? `${c.playlists.length} Playlist${c.playlists.length !== 1 ? 's' : ''}` : '0 Playlists',
  email: c.email || '',
  phone: c.phone || '',
  country: c.country || '',
  language: c.language || '',
  status: c.contactStatus || 'nuevo',
  lastContact: formatDateForInput(c.lastContactDate),
  notes: c.notes || '',
  instagram: {
    handle: c.instagramUser || '',
    url: c.instagramUrl || '',
  },
  facebook: { handle: c.facebookUser || '', url: c.facebookUrl || '' },
  x: { handle: c.xUser || '', url: c.xUrl || '' },
  priceUsd: c.priceUsd || '',
  tiktok: {
    handle: c.tiktokUser || '',
    url: c.tiktokUrl || '',
  },
  youtube: { handle: c.youtubeUser || '', url: c.youtubeUrl || '' },
  playlists: c.playlists || [],
});

/**
 * Converts a TikTokerResponse (Java DTO) to the internal Contact object.
 */
const mapTikTokerToContact = (t) => ({
  id: t.contactId,
  type: 'tiktokers',
  name: t.displayName || '',
  handle: t.userHandle || t.userName || '',
  metric: t.followersCount ? `${(t.followersCount / 1000).toFixed(0)}K Followers` : '—',
  email: t.email || '',
  phone: t.phone || '',
  country: t.country || '',
  language: t.language || '',
  status: t.contactStatus || 'nuevo',
  lastContact: formatDateForInput(t.lastContactDate),
  notes: t.notes || '',
  instagram: {
    handle: t.instagramUser || '',
    url: t.instagramUrl || '',
  },
  facebook: { handle: t.facebookUser || '', url: t.facebookUrl || '' },
  x: { handle: t.xUser || '', url: t.xUrl || '' },
  priceUsd: t.priceUsd || '',
  tiktok: {
    handle: t.tiktokUser || t.userHandle || '',
    url: t.tiktokUrl || '',
  },
  youtube: { handle: t.youtubeUser || '', url: t.youtubeUrl || '' },
});

/**
 * Fetch all curators from the backend.
 * Returns an array of Contact-shaped objects.
 */
export const getContactsCurators = async () => {
  try {
    const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/curators`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const raw = Array.isArray(data) ? data : (data?.data || []);
    return raw.map(mapCuratorToContact);
  } catch (error) {
    console.error('API Error fetching curators:', error);
    return [];
  }
};

/**
 * Fetch all tiktokers from the backend.
 * Returns an array of Contact-shaped objects.
 */
export const getContactsTiktokers = async () => {
  try {
    const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/tiktokers`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const raw = Array.isArray(data) ? data : (data?.data || []);
    return raw.map(mapTikTokerToContact);
  } catch (error) {
    console.error('API Error fetching tiktokers:', error);
    return [];
  }
};

/**
 * Fetch all assigned tiktoker handles from the backend.
 * Returns a Set of strings (handles).
 */
export const getAssignedTiktokerHandles = async () => {
  try {
    const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/tiktokers/assigned-handles`);
    if (!response.ok) return new Set();
    const data = await response.json();
    return new Set(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('API Error fetching assigned handles:', error);
    return new Set();
  }
};

/**
 * Creates a new curator via POST /api/contacts/curators.
 * @param {object} contact - Internal Contact object
 */
export const createCurator = async (contact) => {
  const body = {
    displayName: contact.name,
    email: contact.email,
    phone: contact.phone,
    country: contact.country,
    language: contact.language,
    instagramUser: contact.instagram?.handle || '',
    instagramUrl: contact.instagram?.url || '',
    tiktokUser: contact.tiktok?.handle || '',
    tiktokUrl: contact.tiktok?.url || '',
    youtubeUrl: contact.youtube?.url || '',
    youtubeUser: contact.youtube?.handle || '',
    facebookUser: contact.facebook?.handle || '',
    facebookUrl: contact.facebook?.url || '',
    xUser: contact.x?.handle || '',
    xUrl: contact.x?.url || '',
    priceUsd: contact.priceUsd ? parseFloat(contact.priceUsd) : null,
    notes: contact.notes || '',
    lastContactDate: contact.lastContact || '',
    contactStatus: contact.status || 'nuevo',
    playlists: [],
  };
  const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/curators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * Creates a new tiktoker via POST /api/contacts/tiktokers.
 * @param {object} contact - Internal Contact object
 */
export const createTiktoker = async (contact) => {
  const followersRaw = contact.metric ? parseInt(contact.metric.replace(/[^0-9]/g, '')) * 1000 : 0;
  const body = {
    displayName: contact.name,
    email: contact.email,
    phone: contact.phone,
    country: contact.country,
    language: contact.language,
    tiktokUser: contact.tiktok?.handle || '',
    tiktokUrl: contact.tiktok?.url || '',
    instagramUser: contact.instagram?.handle || '',
    instagramUrl: contact.instagram?.url || '',
    youtubeUrl: contact.youtube?.url || '',
    youtubeUser: contact.youtube?.handle || '',
    facebookUser: contact.facebook?.handle || '',
    facebookUrl: contact.facebook?.url || '',
    xUser: contact.x?.handle || '',
    xUrl: contact.x?.url || '',
    priceUsd: contact.priceUsd ? parseFloat(contact.priceUsd) : null,
    notes: contact.notes || '',
    lastContactDate: contact.lastContact || '',
    contactStatus: contact.status || 'nuevo',
    followersCount: isNaN(followersRaw) ? 0 : followersRaw,
    userName: contact.name,
    userHandle: contact.handle,
  };
  const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/tiktokers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * Updates a curator via PUT /api/contacts/curators/{id}.
 * @param {number} id - The contact ID
 * @param {object} contact - Updated Contact object
 */
export const updateCurator = async (id, contact) => {
  const body = {
    displayName: contact.name,
    email: contact.email,
    phone: contact.phone,
    country: contact.country,
    language: contact.language,
    instagramUser: contact.instagram?.handle || '',
    instagramUrl: contact.instagram?.url || '',
    tiktokUser: contact.tiktok?.handle || '',
    tiktokUrl: contact.tiktok?.url || '',
    youtubeUrl: contact.youtube?.url || '',
    youtubeUser: contact.youtube?.handle || '',
    facebookUser: contact.facebook?.handle || '',
    facebookUrl: contact.facebook?.url || '',
    xUser: contact.x?.handle || '',
    xUrl: contact.x?.url || '',
    priceUsd: contact.priceUsd ? parseFloat(contact.priceUsd) : null,
    notes: contact.notes || '',
    lastContactDate: contact.lastContact || '',
    contactStatus: contact.status || 'nuevo',
  };
  const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/curators/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * Updates a tiktoker via PUT /api/contacts/tiktokers/{id}.
 * @param {number} id - The contact ID
 * @param {object} contact - Updated Contact object
 */
export const updateTiktoker = async (id, contact) => {
  const followersRaw = contact.metric ? parseInt(contact.metric.replace(/[^0-9]/g, '')) * 1000 : 0;
  const body = {
    displayName: contact.name,
    email: contact.email,
    phone: contact.phone,
    country: contact.country,
    language: contact.language,
    tiktokUser: contact.tiktok?.handle || '',
    tiktokUrl: contact.tiktok?.url || '',
    instagramUser: contact.instagram?.handle || '',
    instagramUrl: contact.instagram?.url || '',
    youtubeUrl: contact.youtube?.url || '',
    youtubeUser: contact.youtube?.handle || '',
    facebookUser: contact.facebook?.handle || '',
    facebookUrl: contact.facebook?.url || '',
    xUser: contact.x?.handle || '',
    xUrl: contact.x?.url || '',
    priceUsd: contact.priceUsd ? parseFloat(contact.priceUsd) : null,
    notes: contact.notes || '',
    lastContactDate: contact.lastContact || '',
    contactStatus: contact.status || 'nuevo',
    followersCount: isNaN(followersRaw) ? 0 : followersRaw,
    userName: contact.name,
    userHandle: contact.handle,
  };
  const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/tiktokers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletes a curator via DELETE /api/contacts/curators/{id}.
 */
export const deleteCurator = async (id) => {
  const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/curators/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response;
};

/**
 * Deletes a tiktoker via DELETE /api/contacts/tiktokers/{id}.
 */
export const deleteTiktoker = async (id) => {
  const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/tiktokers/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response;
};

/** GET curadores asignados a una playlist por su spotify_id */
export const getCuratorsForPlaylist = async (spotifyId) => {
  const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/playlists/${encodeURIComponent(spotifyId)}/curators`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/** PUT actualizar curadores de una playlist por su spotify_id */
export const updatePlaylistCurators = async (spotifyId, playlistName, curatorIds) => {
  const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/playlists/${encodeURIComponent(spotifyId)}/curators`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlistName, curatorIds }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/** GET curadores asignados a un tiktoker por su user_handle */
export const getCuratorsForTiktoker = async (userHandle) => {
  const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/tiktokers/by-handle/${encodeURIComponent(userHandle)}/curators`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/** PUT actualizar curadores de un tiktoker por su user_handle */
export const updateTiktokerCurators = async (userHandle, userName, curatorIds) => {
  const response = await authFetch(`${CONTACTS_API_BASE_URL}/contacts/tiktokers/by-handle/${encodeURIComponent(userHandle)}/curators`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName, curatorIds }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// ─── Report: Playlists & TikTokers ranking ────────────────────────────────────

/**
 * GET /api/report/getPlaylistData/{type}/{offset}/{page_size}
 * type=0 → todas; offset=inicio; pageSize=cantidad a traer.
 * Returns: { offset, page_size, total_records, playlists: [...] }
 */
export const getPlaylistData = async (type = 0, offset = 0, pageSize = 100) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getPlaylistData/${type}/${offset}/${pageSize}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data)) return { playlists: data, total_records: data.length };
    return { playlists: data?.playlists || [], total_records: data?.total_records ?? 0 };
  } catch (error) {
    console.error('API Error fetching playlist data:', error);
    return { playlists: [], total_records: 0 };
  }
};

/**
 * GET /api/report/getTiktokData/{genre}/{offset}/{page_size}
 * genre=0 → todos; offset=inicio; pageSize=cantidad a traer.
 * Returns: { offset, page_size, total_records, tiktok_users: [...] }
 */
export const getTiktokData = async (genre = 0, offset = 0, pageSize = 300) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getTiktokData/${genre}/${offset}/${pageSize}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data)) return { tiktok_users: data, total_records: data.length };
    return { tiktok_users: data?.tiktok_users || [], total_records: data?.total_records ?? 0 };
  } catch (error) {
    console.error('API Error fetching tiktok data:', error);
    return { tiktok_users: [], total_records: 0 };
  }
};

/**
 * Busca playlists por nombre o propietario (server-side, paginado).
 * Usa AbortController para cancelar peticiones stale al escribir rápido.
 * Returns: { playlists: [...], total_records: N } | null si la petición fue cancelada
 */
export const searchPlaylists = async (query, type = 0, offset = 0, pageSize = 50, signal) => {
  if (!query || query.trim().length < 2) return { playlists: [], total_records: 0 };
  try {
    const params = new URLSearchParams({ query: query.trim(), type, offset, pageSize });
    const response = await authFetch(`${API_BASE_URL}/report/searchPlaylist?${params}`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { playlists: data?.playlists || [], total_records: data?.total_records ?? 0 };
  } catch (err) {
    if (err.name === 'AbortError') return null;
    console.error('searchPlaylists error:', err);
    return { playlists: [], total_records: 0 };
  }
};

/**
 * Busca TikTokers por nombre o handle (server-side, paginado).
 * Returns: { tiktok_users: [...], total_records: N } | null si fue cancelada
 */
export const searchTiktokUsers = async (query, genre = 0, offset = 0, pageSize = 50, signal) => {
  if (!query || query.trim().length < 2) return { tiktok_users: [], total_records: 0 };
  try {
    const params = new URLSearchParams({ query: query.trim(), genre, offset, pageSize });
    const response = await authFetch(`${API_BASE_URL}/report/searchTiktokUser?${params}`, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { tiktok_users: data?.tiktok_users || [], total_records: data?.total_records ?? 0 };
  } catch (err) {
    if (err.name === 'AbortError') return null;
    console.error('searchTiktokUsers error:', err);
    return { tiktok_users: [], total_records: 0 };
  }
};

// ─── Format Digital (Géneros) CRUD ──────────────────────────────────────────

const FORMAT_DIGITAL_BASE = `${API_BASE_URL}/formatDigital`;
const FORMAT_DIGITAL_ALT_BASE = `${LOGIN_API_BASE_URL}/formatDigital`;

async function fetchFormatDigitalEndpoint(pathPrimary, pathSecondary, options = {}) {
  try {
    let res = await authFetch(`${FORMAT_DIGITAL_BASE}${pathPrimary}`, options);
    if (res.status === 404 && pathSecondary) {
      res = await authFetch(`${FORMAT_DIGITAL_BASE}${pathSecondary}`, options);
    }
    if (res.status === 404) {
      try {
        let altRes = await authFetch(`${FORMAT_DIGITAL_ALT_BASE}${pathPrimary}`, options);
        if (altRes.status === 404 && pathSecondary) {
          altRes = await authFetch(`${FORMAT_DIGITAL_ALT_BASE}${pathSecondary}`, options);
        }
        if (altRes.ok) return altRes;
      } catch (_) { }
    }
    return res;
  } catch (err) {
    let altRes = await authFetch(`${FORMAT_DIGITAL_ALT_BASE}${pathPrimary}`, options);
    if (altRes.status === 404 && pathSecondary) {
      altRes = await authFetch(`${FORMAT_DIGITAL_ALT_BASE}${pathSecondary}`, options);
    }
    return altRes;
  }
}

/**
 * GET /api/formatDigital/getAll
 */
export const getFormatosDigitales = async () => {
  try {
    const res = await fetchFormatDigitalEndpoint('/getAll', '');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error('API Error fetching formatDigital list:', error);
    throw error;
  }
};

/**
 * GET /api/formatDigital/getById/{id}
 */
export const getFormatoDigitalById = async (id) => {
  try {
    const res = await fetchFormatDigitalEndpoint(`/getById/${id}`, `/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`API Error fetching formatDigital ${id}:`, error);
    throw error;
  }
};

/**
 * POST /api/formatDigital/create
 */
export const createFormatoDigital = async (payload) => {
  const bodyData = typeof payload === 'string'
    ? { digitalformat: payload }
    : {
      ...(payload.id ? { id: Number(payload.id) } : {}),
      digitalformat: payload.digitalformat || payload.format || payload.nombre || payload.name || '',
      meta_title: payload.meta_title ?? payload.metaTitle ?? null,
      metaTitle: payload.meta_title ?? payload.metaTitle ?? null,
      meta_description: payload.meta_description ?? payload.metaDescription ?? null,
      metaDescription: payload.meta_description ?? payload.metaDescription ?? null,
      meta_keywords: payload.meta_keywords ?? payload.metaKeywords ?? null,
      metaKeywords: payload.meta_keywords ?? payload.metaKeywords ?? null
    };

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData)
  };
  const res = await fetchFormatDigitalEndpoint('/create', '', options);
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `HTTP error! status: ${res.status}`);
  }
  return await res.json().catch(() => ({ success: true }));
};

/**
 * PUT /api/formatDigital/update/{id}
 */
export const updateFormatoDigital = async (id, payload) => {
  const bodyData = typeof payload === 'string'
    ? { id: Number(id), digitalformat: payload }
    : {
      id: Number(id),
      digitalformat: payload.digitalformat || payload.format || payload.nombre || payload.name || '',
      meta_title: payload.meta_title ?? payload.metaTitle ?? null,
      metaTitle: payload.meta_title ?? payload.metaTitle ?? null,
      meta_description: payload.meta_description ?? payload.metaDescription ?? null,
      metaDescription: payload.meta_description ?? payload.metaDescription ?? null,
      meta_keywords: payload.meta_keywords ?? payload.metaKeywords ?? null,
      metaKeywords: payload.meta_keywords ?? payload.metaKeywords ?? null
    };

  const options = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData)
  };
  const res = await fetchFormatDigitalEndpoint(`/update/${id}`, `/${id}`, options);
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `HTTP error! status: ${res.status}`);
  }
  return await res.json().catch(() => ({ success: true }));
};

/**
 * DELETE /api/formatDigital/delete/{id}
 */
export const deleteFormatoDigital = async (id) => {
  const options = { method: 'DELETE' };
  const res = await fetchFormatDigitalEndpoint(`/delete/${id}`, `/${id}`, options);
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `HTTP error! status: ${res.status}`);
  }
  return await res.json().catch(() => ({ success: true }));
};

// ─── Format Digital Genre (Relación Formato - Género) ──────────────────────────

const FORMAT_DIGITAL_GENRE_BASE = `${API_BASE_URL}/formatDigitalGenre`;
const FORMAT_DIGITAL_GENRE_ALT_BASE = `${LOGIN_API_BASE_URL}/formatDigitalGenre`;

async function fetchFormatDigitalGenreEndpoint(pathPrimary, options = {}) {
  try {
    let res = await authFetch(`${FORMAT_DIGITAL_GENRE_BASE}${pathPrimary}`, options);
    if (res.status === 404) {
      try {
        let altRes = await authFetch(`${FORMAT_DIGITAL_GENRE_ALT_BASE}${pathPrimary}`, options);
        if (altRes.ok) return altRes;
      } catch (_) { }
    }
    return res;
  } catch (err) {
    return await authFetch(`${FORMAT_DIGITAL_GENRE_ALT_BASE}${pathPrimary}`, options);
  }
}

/**
 * GET /api/formatDigitalGenre/genres/available
 */
export const getAvailableGenres = async () => {
  try {
    const res = await fetchFormatDigitalGenreEndpoint('/genres/available');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error('API Error fetching available genres:', error);
    return [];
  }
};

/**
 * GET /api/formatDigitalGenre/byFormat/{fkFormat}
 */
export const getGenresByFormat = async (fkFormat) => {
  try {
    const res = await fetchFormatDigitalGenreEndpoint(`/byFormat/${fkFormat}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error(`API Error fetching genres by format ${fkFormat}:`, error);
    return [];
  }
};

/**
 * POST /api/formatDigitalGenre/assign/{fkFormat}/{fkGenre}
 */
export const assignGenreToFormat = async (fkFormat, fkGenre) => {
  const options = { method: 'POST' };
  const res = await fetchFormatDigitalGenreEndpoint(`/assign/${fkFormat}/${fkGenre}`, options);
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `HTTP error! status: ${res.status}`);
  }
  return await res.json().catch(() => ({ success: true }));
};

/**
 * DELETE /api/formatDigitalGenre/delete/{fkFormat}/{fkGenre}
 */
export const deleteGenreFromFormat = async (fkFormat, fkGenre) => {
  const options = { method: 'DELETE' };
  const res = await fetchFormatDigitalGenreEndpoint(`/delete/${fkFormat}/${fkGenre}`, options);
  if (!res.ok && res.status !== 204) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `HTTP error! status: ${res.status}`);
  }
  return { success: true };
};

/**
 * GET /api/report/getChartCancionesNombreFormatoDigital?nombreFormatoDigital={formatName}&country={country}&top={top}
 */
export const getChartByFormatoDigitalName = async (nombreFormatoDigital, country = 0, top = 100) => {
  try {
    let targetFormatName = nombreFormatoDigital;
    let catalogMeta = null;

    try {
      const formatsList = await getFormatosDigitales();
      if (Array.isArray(formatsList) && formatsList.length > 0) {
        const targetSlug = slugify(nombreFormatoDigital);
        const matched = formatsList.find(f => {
          const name = f.format || f.digitalformat || f.name || '';
          return slugify(name) === targetSlug || name.toLowerCase() === nombreFormatoDigital.toLowerCase();
        });
        if (matched) {
          targetFormatName = matched.format || matched.digitalformat || matched.name || nombreFormatoDigital;
          catalogMeta = matched;
        }
      }
    } catch (e) {
      console.warn('Could not resolve formato digital slug from catalog:', e);
    }

    const params = new URLSearchParams({
      nombreFormatoDigital: targetFormatName,
      country: String(country),
      top: String(top)
    });
    const response = await authFetch(`${API_BASE_URL}/report/getChartCancionesNombreFormatoDigital?${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    const rawResults = Array.isArray(data) ? data : (data?.results || data?.data || []);
    const metadata = {
      chart_name: catalogMeta?.format || catalogMeta?.digitalformat || targetFormatName,
      meta_title: catalogMeta?.meta_title || data?.metadata?.meta_title || targetFormatName,
      meta_description: catalogMeta?.meta_description || data?.metadata?.meta_description || '',
      meta_keywords: catalogMeta?.meta_keywords || data?.metadata?.meta_keywords || '',
      ...data?.metadata,
    };

    const songs = deduplicateSongs(rawResults.map(s => ({
      ...s,
      rk: s.posicion ?? s.rk ?? 1,
      rk_lw: s.posicion_anterior ?? s.rk_lw,
      img: s.avatar || s.img || s.image_url,
    })));

    return {
      metadata,
      results: songs
    };
  } catch (error) {
    console.error(`API Error fetching chart for format digital ${nombreFormatoDigital}:`, error);
    return {
      metadata: { meta_title: nombreFormatoDigital, meta_description: '', meta_keywords: '' },
      results: []
    };
  }
};

/**
 * GET /api/report/getLabelMarketShareDigitalVideo?format={format}&country={country}&crg={crg}&genre={genre}&city={city}&noradio={noradio}&top={top}
 */
export const getLabelMarketShareDigitalVideo = async ({
  format = 0,
  country = 0,
  crg = 'C',
  genre = 0,
  city = 0,
  noradio = 0,
  top = 500
} = {}) => {
  try {
    const params = new URLSearchParams({
      format: String(format ?? 0),
      country: String(country ?? 0),
      crg: String(crg ?? 'C'),
      genre: String(genre ?? 0),
      city: String(city ?? 0),
      noradio: String(noradio ?? 0),
      top: String(top ?? 500)
    });
    const response = await authFetch(`${API_BASE_URL}/report/getLabelMarketShareDigitalVideo?${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || data?.results || []);
  } catch (error) {
    console.error('API Error fetching label market share digital video:', error);
    return [];
  }
};


// ─── Song Timeline ──────────────────────────────────────────────────────────
/**
 * Fetches the unified event timeline for a given cs_song.
 * GET /api/report/getSongTimeline/{csSong}
 */
export const getSongTimeline = async (csSong) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/report/getSongTimeline/${csSong}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error('API Error fetching song timeline:', error);
    return [];
  }
};
