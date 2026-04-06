const API_BASE_URL = 'https://backend.digital-latino.com/api';

/**
 * Fetches the list of countries from the API.
 * Returns an array of objects: { id: number, description: string }
 */
export const getCountries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/report/getCountries`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error fetching countries:", error);
    return [];
  }
};

/**
 * Fetches formats for a specified country.
 * Returns an array of objects: { id: number, description: string }
 */
export const getFormatsByCountry = async (country) => {
  try {
    const response = await fetch(`${API_BASE_URL}/report/getFormatbyCountry/${encodeURIComponent(country)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error fetching formats for ${country}:`, error);
    return [];
  }
};

/**
 * Fetches cities for a specified country and CRG type 'C'.
 * Returns an array of objects: { id: number, city_name: string }
 */
export const getCitiesByCountry = async (countryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/report/getCities/${encodeURIComponent(countryId)}/C`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error fetching cities for ${countryId}:`, error);
    return [];
  }
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
    return data;
  } catch (error) {
    console.error("API Error fetching chart:", error);
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

export const getSongsArtistBySpotifyId = async (spotifyId, type = 0) => {
  if (!spotifyId) return { data: [] };
  try {
    const response = await fetch(`${API_BASE_URL}/report/getSongsArtistBySpotifyId/${encodeURIComponent(spotifyId)}/${type}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    // Wrap to match expected { data: [] } response format in user code
    return Array.isArray(data) ? { data } : (data.data ? data : { data: [] });
  } catch (error) {
    console.error("API Error fetching songs by artist:", error);
    return { data: [] };
  }
};

export const getSongById = async (id) => {
  if (!id) return { data: {} };
  try {
    const response = await fetch(`${API_BASE_URL}/report/getSongById/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("API Error fetching song by id:", error);
    return { data: {} };
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
    // Only log actual unexpected errors, not 404
    return { data: {} };
  }
};

export const digitalLatinoApi = {
  getSongsArtistBySpotifyId,
  getSongById,
  getSongBySpotifyId,
  getArtistData
};
