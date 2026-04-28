import { css } from "@emotion/react";

// Configuración base para conexiones API
const API_CONFIG = {
  baseURL: "https://backend.digital-latino.com/api/",
  //baseURL: 'http://localhost:8084/api/',
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Tipos para la API de Digital Latino
export interface Country {
  id: number;
  country?: string;
  country_name: string;
  description?: string;
}
// --- INTERFACES PARA EL ADMIN ---
export interface AdminUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  active: boolean;
  createdAtUtc: string;
}

// --- LLAMADAS API DEL ADMIN ---
export const adminApi = {
  // Obtener todos los usuarios
  getAllUsers: (): Promise<ApiResponse<AdminUser[]>> =>
    api.get<AdminUser[]>("admin/users"),

  // Cambiar rol
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUserRole: (id: number, role: string): Promise<ApiResponse<any>> =>
    api.put(`admin/users/${id}/role`, { role }),

  // Eliminar usuario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteUser: (id: number): Promise<ApiResponse<any>> =>
    api.delete(`admin/users/${id}`),
};
export interface Format {
  id: number;
  format: string;
}

export interface City {
  id: number;
  city_name: string;
  country_code: string;
}

export interface TrendingSong {
  id: number;
  rank: string;
  artist: string;
  song: string;
  monthly_listeners?: number;
  followers_total?: number;
  popularity?: number;
  streams_total?: number;
  playlists?: number;
  playlist_reach?: number;
  followers_total_instagram?: number;
  followers_total_tiktok?: number;
  videos_views_total_youtube?: number;
  followers_total_facebook?: number;
  followers_total_twitter?: number;
  spotify_streams?: number;
  img?: string;
  spotifyid?: string;
}

export interface Song {
  cs_song: number;
  spotify_streams_total: number;
  tiktok_views_total: number;
  youtube_video_views_total: number;
  youtube_short_views_total: number;
  shazams_total: number;
  soundcloud_stream_total: number;
  pan_streams: number;
  audience_total: number;
  spins_total: number;
  score: number;
  rk_total: number;
  tw_spins: number;
  tw_aud: number;
  rk: number;
  spotify_streams: number;
  entid: number;
  length_sec: number;
  song: string;
  label: string;
  artists: string;
  crg: string;
  avatar: string;
  url: string;
  spotifyid: string;
  spotifyartistid?: string;
  movement?: string;
  lw_score?: number;
}
//Interface para Ids de canciones
export interface idSongs {
  csSong: string;
  spotify_id: string;
}
// Tipos básicos para las respuestas
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
// interfaces para entradas de top plataforms
export interface TopTrendingPlatforms {
  rk: string;
  song: string;
  artists?: string;
  label: string;
  data_res: number;
  cs_song: number;
  img: string;
  spotifyartistid?: string;
}

// interfaces para entradas de Debut Songs
export interface DebutSongs {
  cs_song: number;
  song: string;
  artists: string;
  label: string;
  tw_score: number;
  lw_score: number;
  dif_score: number;
  rk_trending: number;
  crg: string;
  img: string;
  spotifyartistid?: string;
}

// interfaces para entradas de top artists
export interface TopTrendingArtist {
  rk: string;
  artist: string;
  monthly_listeners: number;
  followers_total: number;
  popularity: number;
  streams_total: number;
  playlists: number;
  playlist_reach: number;
  followers_total_instagram: number;
  followers_total_tiktok: number;
  videos_views_total_youtube: number;
  followers_total_facebook: number;
  followers_total_twitter: number;
  spotify_streams?: number;
  img?: string;
  spotifyid?: string;
}

//Interface Contry para buttonSongInfo/boxElementsDisplay
export interface CityDataForSong {
  audience?: number;
  cityid?: number;
  citylat?: number;
  citylng?: number;
  cityname?: string;
  listeners?: number;
  rnk?: number;
  spins?: number;
  sts?: number;

  countryname?: string;
  countryId: number;
  csSong: number;
  country_code?: string;
  streams?: number;
}

//Interface SongInfo para buttonSongInfo/boxDisplayInfoPlatform.tsx
export interface SongInfoPlatform {
  rk: number;
  song: string;
  artists: string;
  label: string;
  score: number;
  cs_song: number;
  spotify_streams_total: number;
  spotify_popularity_current: number;
  spotify_playlists_current: number;
  spotify_playlists_reach_current: number;
  spotify_playlists_reach_total: number;
  spotify_charts_total: number;
  apple_playlists_current: number;
  apple_playlists_total: number;
  apple_charts_currents: number;
  apple_charts_total: number;
  amazon_playlists_current: number;
  amazon_paylists_total: number;
  amazon_charts_current: number;
  amazon_charts_total: number;
  deezer_popularity_current: number;
  deezer_playlists_current: number;
  deezer_playlists_total: number;
  deezer_playlist_reach_current: number;
  deezer_playlist_reach_total: number;
  deezer_charts_current: number;
  deezer_charts_total: number;
  tiktok_videos_total: number;
  tiktok_views_total: number;
  tiktok_likes_total: number;
  tiktok_shares_total: number;
  tiktok_comments_total: number;
  tiktok_engagement_rate_total: number;
  youtube_videos_total: number;
  youtube_video_views_total: number;
  youtube_video_likes_total: number;
  youtube_video_comments_total: number;
  youtube_shorts_total: number;
  youtube_short_views_total: number;
  youtube_short_likes_total: number;
  youtube_short_comments_total: number;
  youtube_engagement_rate_total: number;
  shazam_shazams_total: number;
  shazam_charts_current: number;
  shazam_charts_total: number;
  tidal_popularity_current: number;
  tidal_playlists_current: number;
  tidal_playlists_total: number;
  soundcloud_streams_total: number;
  soundcloud_favorites_total: number;
  soundcloud_reposts_total: number;
  soundcloud_engagement_rate_total: number;
  rk_spotify: number;
  rk_tiktok: number;
  rk_youtube: number;
  rk_shorts: number;
  rk_shazam: number;
  rk_soundcloud: number;
  rk_pandora: number;
  pan_streams: number;
}

// Interface para manejar info de la canción por cs_song
export interface SongBasicInfo {
  id?: string;
  avatar?: string;
  background?: string;
  title?: string;
  artist?: string;
  label?: string;
  url?: string;
  rk?: number;
  score?: number;
  song?: string;
}
// Interface para manejar info de radio (Countries & Markets con Spins)
export interface SpinData {
  country?: string;
  market?: string;
  spins: number;
  rank: number;
  audience: number;
  sts: number;
}
//Interface para manejar info de TopPlaylists
export interface TopPlaylists {
  rank: number;
  spotify_id: string;
  playlist_name: string;
  owner_name: string;
  artwork: string;
  external_url: string;
  current_position: number;
  top_position: number;
  followers: number;
  type_name: string;
}
//Interface para manejar info de usos en Tiktok
export interface TikTokUse {
  rk: number;
  video_id: string;
  views_total: number;
  likes_total: number;
  comments_total: number;
  shares_total: number;
  tiktok_user_followers: number;
  username: string;
  user_handle: string;
}
//Interface para manejar info de Recomendaciones (recomendations.tsx)
export interface Recommendation {
  id: number;
  artist: string;
  followers_total_facebook: number;
  followers_total_instagram: number;
  followers_total_tiktok: number;
  followers_total_twitter: number;
  subscribers_total_youtube: number;
  playlist_reach: number;
  video_total_youtube: number;
  monthly_listeners: number;
  video_views_total_youtube: number;
  video_reach_total_youtube: number;
  engagement_rate_tiktok: number;
  spotify_playlist_reach_current: number;
  tiktok_engagement_rate_total: number;
}
// Interfaces para la respuesta de búsqueda en Spotify API SpotifySearchResult, SpotifyArtist y SpotifyTrackResult
export interface SpotifySearchResult {
  query: string;
  artists_count: number;
  tracks_count: number;
  artists: SpotifyArtist[];
  tracks: SpotifyTrackResult[];
}

export interface SpotifyArtist {
  type: string;
  artist_name: string;
  spotify_id: string;
  followers: number;
  genres: string[];
  image_url: string;
  url: string;
}

export interface SpotifyTrackResult {
  duration_ms?: number;
  my_song_id?: number;
  tocadas?: number;
  artist_name: string;
  spotify_id: string;
  image_url: string;
  exist_in_db?: boolean;
  match_type?: string;
  song_name: string;
  type: string;
  url: string;
}
export interface SpotifyArtistResult {
  id: string;
  name: string;
  image_url: string;
  genres?: string[];
  followers?: number;
  popularity?: number;
}

export interface SpotifySearchResponse {
  tracks: SpotifyTrackResult[];
  artists: SpotifyArtistResult[];
}
//
export interface SongsArtistBySpotifyId {
  score: number;
  cs_song: number;
  fk_artist: number;
  release_date: string;
  image_url: string;
  fk_track: number;
  spotifyid: string;
  isrc: string;
  spotify_streams: number;
}
// Interface para datos de artista by SpotifyId
export interface DataArtist {
  Id?: number;
  fk_artist?: number;
  playlist_reach?: number;
  popularity?: number;
  followers_total?: number;
  streams_total?: number;
  playlists?: number;
  monthly_listeners?: number;
  videos_total_tiktok?: number;
  followers_total_tiktok?: number;
  likes_total_tiktok?: number;
  comments_total_tiktok?: number;
  shares_total_tiktok?: number;
  views_total_tiktok?: number;
  engagement_rate_tiktok?: number;
  subscribers_total_youtube?: number;
  videos_total_youtube?: number;
  video_views_total_youtube?: number;
  video_likes_total_youtube?: number;
  shorts_total_youtube?: number;
  short_views_total_youtube?: number;
  engagement_rate_youtube?: number;
  followers_total_twitter?: number;
  followers_total_facebook?: number;
  followers_total_instagram?: number;
}
// Interface para datos de artista by SpotifyId y CountryId
export interface DataArtistCountry {
  current_listeners: number;
  city_name: string;
  peak_listeners: number;
  part: number;
  rk: number;
  city_lng: number;
  city_lat: number;
}
//interface para post de tablas de cancniones y artistas que no tienen datos:
export interface SetLogSongRequest {
  userid: number;
  spotifyid: string;
  isartist: boolean;
}
// Interface para la respuesta de setLogSong
export interface SetLogSongResponse {
  success?: boolean;
  message?: string;
  logId?: number;
  timestamp?: string;
  text?: string;
  [key: string]: any;
}
//Interface para datos comparativos de dos canciones o artistas
export interface VsSongData {
  country_code: string;
  city_name: string;
  first_score: number;
  second_streams: number;
  dif_streams: number;
  first_streams: number;
  second_score: number;
}
//VsSongPlaylistsData
export interface VsSongPlaylistsData {
  first_top_position: number;
  playlist_name: string;
  external_url: string;
  owner_name: string;
  first_current_position: number;
  first_added_at: string;
  followers_count: number;
  playlist_type: string;
  second_current_position: number;
  second_added_at: string;
  second_top_position: number;
}
//VsSongPlaylistsData
export interface VsSongTiktoksData {
  first_comments_total: number;
  first_likes_total: number;
  first_shares_total: number;
  sum_views_videos: number;
  user_name: string;
  user_handle: string;
  second_no_videos: number;
  second_shares_total: number;
  second_likes_total: number;
  tiktok_user_followers: number;
  first_views_total: number;
  second_views_total: number;
  first_no_videos: number;
  second_comments_total: number;
}
// Interface para canción seleccionada para comparar
export interface SelectedSong {
  cs_song: number;
  spotifyid: string;
  song: string;
  artists: string;
  label: string;
  avatar?: string;
  rk: number;
  score: number;
}
//Intwerface para Curator Pics
export interface CuratorPicsData {
  song: string;
  cs_song: number;
  sum_followers: number;
  artists: string;
  image_url: string;
  avg_position: number;
  rk: number;
  label: string;
}
// Interface para tipos de playlist en Curator Pics
export interface PlaylistTypeData {
  name: string;
  id: number;
}
// Interface para datos de Tiktok Pics
export interface TiktokPicsData {
  song: string;
  shares_total: number;
  cs_song: number;
  artists: string;
  image_url: string;
  views_total: number;
  comments_total: number;
  rk: number;
  no_videos: number;
  likes_total: number;
  label: string;
}
// Interface para datos de Artist Playlist Related
export interface ArtistPlaylistRelatedData {
  playlist_name: string;
  external_url: string;
  top_position: number;
  type_name: string;
  related_artists_names: string;
  owner_name: string;
  spotify_id: string;
  followers_count: number;
  current_position: number;
  rk: number;
  artwork: string;
}
//
export interface ArtistTiktokersRelatedData {
  total_views_related: number;
  related_artists_names: string;
  user_name: string;
  total_shares_related: number;
  user_handle: string;
  rk: number;
  total_comments_related: number;
  tiktok_user_followers: number;
  total_likes_related: number;
  total_videos_related: number;
}
export interface ArtistRadioRelatedData {
  station_name: string;
  related_songs: number;
  related_audience: number;
  main_spins: number;
  main_audience: number;
  spins_gap: number;
  market: string;
  related_spins: number;
  related_artists_names: string;
  stream_id: number;
  opportunity_ratio: number;
  related_artists_count: number;
  rk: number;
  main_songs: number;
  audience_gap: number;
}
//
export interface ArtistRelatedGraphData {
  id: string;
  label: string;
  level: number; //0 = artista principal - 	1 = artistas similares directos -	2 = artistas relacionados a los similares
  group: string;
  parent_id: number;
  value: number;
  monthly_listeners: number;
  artist_score: number;
  node_type: string; //tipo (root, level1, level2)
}
export interface ArtistRelatedGraphResponse {
  success: boolean;
  artist_id?: number;
  root_artist?: {
    label: string;
    monthly_listeners: number;
    followers_total: number;
    popularity: number;
    artist_score: number;
  };
  nodes: ArtistRelatedGraphData[];
  edges: Array<{
    source: string | number;
    target: string | number;
    edge_level: number;
    group: number;
  }>;
}

// Clase principal para manejar las conexiones API
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL?: string, headers?: Record<string, string>) {
    this.baseURL = baseURL || API_CONFIG.baseURL;
    this.defaultHeaders = { ...API_CONFIG.headers, ...headers };
  }

  // Método privado para construir headers
  private buildHeaders(
    customHeaders?: Record<string, string>,
  ): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...customHeaders,
    };
  }

  // Método privado para manejar respuestas
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const responseText = await response.text();

    let data: any;
    let isJson = false;

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(responseText);
        isJson = true;
      } catch (e) {
        data = { message: responseText };
      }
    } else {
      data = { message: responseText };
    }

    if (!response.ok) {
      const errorMessage = isJson
        ? data.message || `Error ${response.status}: ${response.statusText}`
        : responseText || `Error ${response.status}: ${response.statusText}`;

      throw {
        message: errorMessage,
        status: response.status,
        code: data.code,
        response: data,
      } as ApiError;
    }

    return {
      data,
      status: response.status,
      success: true,
      message: data.message || (isJson ? undefined : responseText),
    };
  }

  // Método GET
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.buildHeaders(headers),
    });

    return this.handleResponse<T>(response);
  }

  // Método POST
  async post<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // Método PUT
  async put<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // Método DELETE
  async delete<T = any>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: this.buildHeaders(headers),
    });

    return this.handleResponse<T>(response);
  }

  // Método para establecer token de autenticación
  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Método para remover token de autenticación
  removeAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }

  // Método para cambiar la URL base
  setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
  }
}

// Instancia por defecto del cliente API
export const apiClient = new ApiClient();

// Funciones de conveniencia para uso directo
export const api = {
  get: <T = any>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, string>,
  ) => apiClient.get<T>(endpoint, params, headers),

  post: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
  ) => apiClient.post<T>(endpoint, data, headers),

  put: <T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
  ) => apiClient.put<T>(endpoint, data, headers),

  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiClient.delete<T>(endpoint, headers),
};

// Funciones específicas para Digital Latino API
export const digitalLatinoApi = {
  // Obtener lista de países
  getCountries: (): Promise<ApiResponse<Country[]>> =>
    api.get<Country[]>("report/getCountries"),

  // Obtener formatos por país
  getFormatsByCountry: (countryId: number): Promise<ApiResponse<Format[]>> =>
    api.get<Format[]>(`report/getFormatbyCountry/${countryId}`),

  // Obtener ciudades por país (CRG siempre es "C")
  getCitiesByCountry: (countryId: number): Promise<ApiResponse<City[]>> =>
    api.get<City[]>(`report/getCities/${countryId}/C`),

  getChartDigital: (
    formatId: number,
    countryId: number,
    CRG: string,
    city: number,
  ): Promise<ApiResponse<Song[]>> =>
    api.get<Song[]>(
      `report/getChartDigital/${formatId}/${countryId}/${CRG}/${city}`,
    ),

  // Obtener Trending Top Songs
  getTrendingTopSongs: (
    rk: string,
    artist: string,
    monthly_listeners: number,
    format: string,
    country: string,
  ): Promise<ApiResponse<TrendingSong[]>> =>
    api.get<TrendingSong[]>(`report/getTrendingSongs/${format}/${country}`),

  // Obtener Trending Top Platfomrs trendingPlatforms
  getTrendingTopPlatforms: (
    platform: string,
    format: number,
    country: string,
  ): Promise<ApiResponse<TopTrendingPlatforms[]>> =>
    api.get<TopTrendingPlatforms[]>(
      `report/getTopPlatform/${platform}/${format}/${country}`,
    ),

  // Obtener Trending Top Artists
  getTrendingTopArtists: (
    format: string,
    country: string,
    cityId: number,
  ): Promise<ApiResponse<TrendingSong[]>> =>
    api.get<TrendingSong[]>(
      `report/getTopArtist/${format}/${country}/${cityId}`,
    ),

  // Obtener Trending Debut Songs  debutSongs
  getDebutSongs: (
    format: number,
    country: number,
    CRG: string,
    city: number,
  ): Promise<ApiResponse<DebutSongs[]>> =>
    api.get<DebutSongs[]>(
      `report/getTrendingDebut/${format}/${country}/${CRG}/${city}`,
    ),
  //Contry para buttonSongInfo/boxElementsDisplay
  getCityData: (
    csSong: number,
    countryId: number,
  ): Promise<ApiResponse<CityDataForSong[]>> =>
    api.get<CityDataForSong[]>(`report/getCityData/${csSong}/${countryId}`),
  // Obtener información de la canción por plataforma
  getSongPlatformData: (
    csSong: number,
    formatId: number,
    countryId: number,
  ): Promise<ApiResponse<SongInfoPlatform[]>> =>
    api.get<SongInfoPlatform[]>(
      `report/getSongDigital/${csSong}/${formatId}/${countryId}`,
    ),
  // Obtener información básica de la canción por cs_song
  getSongById: (csSong: number): Promise<ApiResponse<SongBasicInfo>> =>
    api.get<SongBasicInfo>(`report/getSongbyId/${csSong}`),
  // Obtener información básica de la canción por cs_song y countryId
  getRankSongByIdCountry: (
    csSong: number,
    countryId: number,
  ): Promise<ApiResponse<SongBasicInfo>> =>
    api.get<SongBasicInfo>(`report/getSongbyId/${csSong}/${countryId}`),
  // Obtener top países de radio por canción
  getTopRadioCountries: (csSong: number): Promise<ApiResponse<SpinData[]>> =>
    api.get<SpinData[]>(`report/getTopRadioCountries/${csSong}`),
  // Obtener top mercados de radio por cs_song y país
  getTopMarketRadio: (
    csSong: number,
    countryId: number,
  ): Promise<ApiResponse<SpinData[]>> =>
    api.get<SpinData[]>(`report/getTopMarketRadio/${csSong}/${countryId}`),
  //Obtener playlists por cs_song y tipo de playlist
  getTopPlaylists: (
    csSong: number,
    typePlaylist: number,
  ): Promise<ApiResponse<TopPlaylists[]>> =>
    api.get<TopPlaylists[]>(`report/getTopPlaylists/${csSong}/${typePlaylist}`),
  //Obtener usos en Tiktok por cs_song
  getTikTokUses: (csSong: number): Promise<ApiResponse<TikTokUse[]>> =>
    api.get<TikTokUse[]>(`report/getTopTiktok/${csSong}`),
  // Obtener recomendaciones de artistas por cs_song
  getArtistRecommendations: (
    csSong: number,
  ): Promise<ApiResponse<Recommendation[]>> =>
    api.get<Recommendation[]>(`report/getRecommendations/${csSong}`),
  //Obtener csSong a partir de spotifyId
  getSongBySpotifyId: (spotifyId: string): Promise<ApiResponse<idSongs>> =>
    api.get<idSongs>(`report/getcssong?spotifyid=${spotifyId}`),
  //Obtener spotifyId a partir de csSong (el de arriba pero al reves)
  getIdSongByCsSong: (csSong: string): Promise<ApiResponse<idSongs>> =>
    api.get<idSongs>(`report/getSpotifyId?cs_song=${csSong}`),
  // Buscar en Spotify API
  getSearchSpotify: (
    query: string,
  ): Promise<ApiResponse<SpotifySearchResult>> =>
    api.get<SpotifySearchResult>(
      `report/getSearchSpotify?query=${encodeURIComponent(query)}`,
    ),
  //Obtener lista top canciones por medio del SpotifyId del artista y countryId
  getSongsArtistBySpotifyId: (
    spotifyId: string,
    countryId: number,
  ): Promise<ApiResponse<SongsArtistBySpotifyId[]>> =>
    api.get<SongsArtistBySpotifyId[]>(
      `report/getSongsArtist/${spotifyId}/${countryId}`,
    ),
  // Obtener datos digitales de un artista por medio del SpotifyId
  getDataArtist: (spotifyId: string): Promise<ApiResponse<DataArtist>> =>
    api.get<DataArtist>(`report/getDataArtist/${spotifyId}`),
  // Obtener datos digitales de un artista por medio del SpotifyId
  getDataArtistCountry: (
    countryId: number,
    spotifyId: string,
  ): Promise<ApiResponse<DataArtistCountry>> =>
    api.get<DataArtistCountry>(
      `report/getDataArtistCountry/${countryId}/${spotifyId}`,
    ),
  // Registrar log de canción o artista
  setLogSong: (
    data: SetLogSongRequest,
  ): Promise<ApiResponse<SetLogSongResponse>> =>
    api.post<SetLogSongResponse>("report/setLogSong", data),
  //Obtener ultima acrualización de datos dd-mm-yyyy
  getLastUpdate: (): Promise<ApiResponse<{ message: string }>> =>
    api.get<{ message: string }>("report/getLastUpdate"),
  //Obtener datos comparativos de dos artistas
  getVsSongs: (
    csSong1: number,
    csSong2: number,
  ): Promise<ApiResponse<VsSongData[]>> =>
    api.get<VsSongData[]>(`report/getVsSong/${csSong1}/${csSong2}`),
  //Obtener comparativos para pestana vsPlaylist
  //api/report/getVsSongPlaylists/cs_song1/cs_song2
  getVsSongPlaylists: (
    csSong1: number,
    csSong2: number,
  ): Promise<ApiResponse<VsSongPlaylistsData[]>> =>
    api.get<VsSongPlaylistsData[]>(
      `report/getVsSongPlaylists/${csSong1}/${csSong2}`,
    ),
  //Obtener comparativos para pestana vsPlaylist
  //api/report/getVsSongTiktoks/cs_song1/cs_song2
  getVsSongTiktoks: (
    csSong1: number,
    csSong2: number,
  ): Promise<ApiResponse<VsSongTiktoksData[]>> =>
    api.get<VsSongTiktoksData[]>(
      `report/getVsSongTiktoks/${csSong1}/${csSong2}`,
    ),
  //Obtener datos de curator pics con formato y tipo de playlist
  getCuratorPics: (
    formatId: number,
    type: number,
  ): Promise<ApiResponse<CuratorPicsData[]>> =>
    api.get<CuratorPicsData[]>(`report/getCuratorPics/${formatId}/${type}`),
  //Obtener los tipos de playlist disponibles para curator pics
  getPlaylistType: (): Promise<ApiResponse<PlaylistTypeData[]>> =>
    api.get<PlaylistTypeData[]>(`report/getPlaylistType`),
  ///report/getTiktokPics/{formatId}
  getTiktokPics: (formatId: number): Promise<ApiResponse<TiktokPicsData[]>> =>
    api.get<TiktokPicsData[]>(`report/getTiktokPics/${formatId}`),
  // Obtener formatos por país
  getFormatsByCountryArtist: (
    countryId: number,
  ): Promise<ApiResponse<Format[]>> =>
    api.get<Format[]>(`report/getFormatbyCountryArtist/${countryId}`),
  // Obtener datos de Chart Digital Hits for Radio, muy similar al de weeklyTopSong //getChartDigital/{format}/{country}/{CRG}/{city}?radiooff=1
  getChartDigitalHitsRadio: (
    formatId: number,
    countryId: number,
    CRG: string,
    city: number,
  ): Promise<ApiResponse<Song[]>> =>
    api.get<Song[]>(
      `report/getChartDigital/${formatId}/${countryId}/${CRG}/${city}?radiooff=1`,
    ),
  //        Artist Recomendations
  // Playlist relacionadas por artista
  getArtistPlaylistRelated: (
    spotifyid: string,
    typePlaylist: number,
  ): Promise<ApiResponse<ArtistPlaylistRelatedData[]>> =>
    api.get<ArtistPlaylistRelatedData[]>(
      `report/getArtistPlaylistRelated/${spotifyid}/${typePlaylist}`,
    ),
  // TikTokers relacionados por artista
  getArtistTiktokersRelated: (
    spotifyid: string,
  ): Promise<ApiResponse<ArtistTiktokersRelatedData[]>> =>
    api.get<ArtistTiktokersRelatedData[]>(
      `report/getArtistTiktokersRelated/${spotifyid}`,
    ),
  // Radio relacionadas por artista y país
  getArtistRadioRelated: (
    spotifyid: string,
    countryId: number,
  ): Promise<ApiResponse<getArtistRadioRelatedData[]>> =>
    api.get<getArtistRadioRelatedData[]>(
      `report/getArtistRadioRelated/${spotifyid}/${countryId}`,
    ),
  // Red de artistas similares
  getArtistRelatedGraph: (
    spotifyid: string,
  ): Promise<ApiResponse<ArtistRelatedGraphResponse>> =>
    api.get<ArtistRelatedGraphResponse>(
      `report/getArtistRelatedGraph/${spotifyid}`,
    ),
};

// Ejemplo de uso:
/*
// GET request
const users = await api.get('/users', { page: 1, limit: 10 });

// POST request
const newUser = await api.post('/users', { 
  name: 'Juan Pérez', 
  email: 'juan@ejemplo.com' 
});

// Con autenticación
apiClient.setAuthToken('tu-jwt-token-aqui');
const protectedData = await api.get('/protected-endpoint');

// Manejo de errores
try {
  const result = await api.get('/endpoint');
  console.log(result.data);
} catch (error) {
  console.error('Error API:', error.message);
}

// Usar la API de Digital Latino
const countries = await digitalLatinoApi.getCountries();
*/
