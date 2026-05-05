import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Users,
  Music,
  Radio,
  Activity,
  SquarePlay,
  Headphones,
  TrendingUp,
  Heart,
  Map,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  MapPin,
  Trophy,
  BarChart2,
  Play,
  Pause,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import NeuronalGraph from "./NeuronalGraph";
import SunburstGraph from "./SunburstGraph";
import ArtistMap from "./ArtistMap";
import CitiesGapMap from "./CitiesGapMap";
import {
  getArtistData,
  getMapData,
  getPlaylistTypes,
  getArtistPlaylists,
  getArtistTiktokers,
  getArtistRadioRelated,
  getArtistGraph,
  getSongsArtistBySpotifyId,
  getArtistSongs,
  getSongPlatformData,
  getSongHistoricalStreamsWeek,
  getSongById,
  getCitiesGapData,
  setLogSong,
} from "../services/api";
import SearchableSelect from "./SearchableSelect";
import RecommendationsModal, {
  RecommendationsBanner,
} from "./RecommendationsModal";
import ArtistContextModal from "./ArtistContextModal";
import { useAuth } from "../hooks/useAuth";
import { useAudioPreview } from "../hooks/useAudioPreview.jsx";

// ── Platform definitions for the song metrics panel ──────────────────────────
const SONG_PLATFORMS = [
  {
    key: "spotify",
    name: "Spotify",
    logo: "/logos/spotify-icon.png",
    accentColor: "#1DB954",
    rankKey: "rk_spotify",
    fields: [
      { key: "spotify_streams_total", label: "Tw Streams" },
      { key: "spotify_popularity_current", label: "Popularidad" },
      { key: "spotify_playlists_current", label: "Playlists Actuales" },
      { key: "spotify_playlists_reach_current", label: "Reach Actual" },
      { key: "spotify_playlists_reach_total", label: "Historical Reach" },
      { key: "spotify_charts_total", label: "Charts Total" },
    ],
  },
  {
    key: "youtube",
    name: "YouTube",
    logo: "/logos/youtube-icon.svg",
    accentColor: "#FF0000",
    rankKey: "rk_youtube",
    fields: [
      { key: "youtube_video_views_total", label: "Views Totales" },
      { key: "youtube_video_likes_total", label: "Likes Totales" },
      { key: "youtube_shorts_total", label: "Shorts Total" },
      { key: "youtube_short_views_total", label: "Short Views" },
      {
        key: "youtube_engagement_rate_total",
        label: "Engagement Rate",
        isRate: true,
      },
    ],
  },
  {
    key: "tiktok",
    name: "TikTok",
    logo: "/logos/tiktok-icon.png",
    accentColor: "#ff0050",
    rankKey: "rk_tiktok",
    fields: [
      { key: "tiktok_videos_total", label: "Videos Total" },
      { key: "tiktok_views_total", label: "Views Total" },
      { key: "tiktok_likes_total", label: "Likes Total" },
      { key: "tiktok_shares_total", label: "Shares Total" },
      {
        key: "tiktok_engagement_rate_total",
        label: "Engagement Rate",
        isRate: true,
      },
    ],
  },
  {
    key: "radio",
    name: "Radio",
    icon: Radio,
    accentColor: "#FF9800",
    rankKey: "rk_radio",
    fields: [
      { key: "radio_spins_total", label: "Spins Total" },
      { key: "radio_score", label: "Score" },
      { key: "radio_tw_stations", label: "No. de emisoras" },
      { key: "radio_audience_total", label: "Reach Total" },
      { key: "radio_tw_audience", label: "Reach TW" },
      { key: "radio_tw_spins", label: "Spins TW" },
    ],
  },
  {
    key: "shazam",
    name: "Shazam",
    logo: "/logos/shazam-icon.svg",
    accentColor: "#0A88FF",
    rankKey: "rk_shazam",
    fields: [
      { key: "shazam_shazams_total", label: "Shazams Total" },
      { key: "shazam_charts_current", label: "Charts Actuales" },
      { key: "shazam_charts_total", label: "Charts Total" },
    ],
  },
  {
    key: "deezer",
    name: "Deezer",
    logo: "/logos/deezer-icon.png",
    accentColor: "#A238FF",
    rankKey: "rk_deezer",
    fields: [
      { key: "deezer_popularity_current", label: "Popularidad" },
      { key: "deezer_playlists_current", label: "Playlists Actuales" },
      { key: "deezer_playlists_total", label: "Playlists Total" },
      { key: "deezer_charts_current", label: "Charts Actuales" },
      { key: "deezer_charts_total", label: "Charts Total" },
    ],
  },
  {
    key: "apple",
    name: "Apple Music",
    logo: "/logos/applemusic-icon.png",
    accentColor: "#fc3c44",
    rankKey: "rk_apple",
    fields: [
      { key: "apple_playlists_current", label: "Playlists Actuales" },
      { key: "apple_playlists_total", label: "Playlists Total" },
      { key: "apple_charts_currents", label: "Charts Actuales" },
      { key: "apple_charts_total", label: "Charts Total" },
    ],
  },
  {
    key: "amazon",
    name: "Amazon Music",
    logo: "/logos/amazonmusic-icon.svg",
    accentColor: "#00A8E1",
    rankKey: "rk_amazon",
    fields: [
      { key: "amazon_playlists_current", label: "Playlists Actuales" },
      { key: "amazon_paylists_total", label: "Playlists Total" },
      { key: "amazon_charts_current", label: "Charts Actuales" },
      { key: "amazon_charts_total", label: "Charts Total" },
    ],
  },
  {
    key: "soundcloud",
    name: "SoundCloud",
    logo: "/logos/soundcloud-icon.svg",
    accentColor: "#FF5500",
    rankKey: "rk_soundcloud",
    fields: [
      { key: "soundcloud_streams_total", label: "Streams Total" },
      { key: "soundcloud_favorites_total", label: "Favoritos Total" },
      { key: "soundcloud_reposts_total", label: "Reposts Total" },
      {
        key: "soundcloud_engagement_rate_total",
        label: "Engagement Rate",
        isRate: true,
      },
    ],
  },
  {
    key: "tidal",
    name: "Tidal",
    logo: "/logos/tidal-icon.png",
    accentColor: "#00FFFF",
    rankKey: "rk_tidal",
    fields: [
      { key: "tidal_popularity_current", label: "Popularidad" },
      { key: "tidal_playlists_current", label: "Playlists Actuales" },
      { key: "tidal_playlists_total", label: "Playlists Total" },
    ],
  },
];

const fmtPlatVal = (val, isRate) => {
  if (val === null || val === undefined || isNaN(Number(val))) return "N/A";
  const n = Number(val);
  if (isRate) return (n * 100).toFixed(1) + "%";
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return Math.round(n).toLocaleString();
};

const formatNumber = (num) => {
  if (!num) return "0";
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (n >= 1000000000) return (n / 1000000000).toFixed(0) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(0) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return Math.round(n).toLocaleString();
};

const getPlaylistColor = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("editorial")) return "#1DB954";
  if (t.includes("personalized") || t.includes("algori"))
    return "var(--accent-primary)";
  if (t.includes("chart") || t.includes("top")) return "#ffb700";
  if (t.includes("user") || t.includes("listener")) return "#ff0050";
  return "var(--text-muted)";
};

const InstagramIcon = ({ size = 16, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 16, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const ArtistDetailsModal = ({ artist, countries = [], onClose, isModal = true, setUnavailableItem }) => {
  const { user } = useAuth();
  const { currentlyPlaying, handlePlayPreview } = useAudioPreview();
  const [activeTab, setActiveTab] = useState(artist?.initialTab || "mapa");
  const [artistData, setArtistData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mapData, setMapData] = useState([]);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [selectedMapCountry, setSelectedMapCountry] = useState(0);

  const [playlistTypes, setPlaylistTypes] = useState([
    { name: "Todos", id: 0 },
  ]);
  const [selectedPlaylistType, setSelectedPlaylistType] = useState(0);
  const [playlistsData, setPlaylistsData] = useState([]);
  const [isPlaylistsLoading, setIsPlaylistsLoading] = useState(false);

  const [tiktokersData, setTiktokersData] = useState([]);
  const [isTiktokersLoading, setIsTiktokersLoading] = useState(false);

  const [radioData, setRadioData] = useState([]);
  const [isRadioLoading, setIsRadioLoading] = useState(false);
  const [selectedRadioCountry, setSelectedRadioCountry] = useState(
    artist?.countryId ?? 1,
  );

  const [topSongsData, setTopSongsData] = useState([]);
  const [isTopSongsLoading, setIsTopSongsLoading] = useState(false);

  const [citiesGapData, setCitiesGapData] = useState([]);
  const [isCitiesGapLoading, setIsCitiesGapLoading] = useState(false);
  const [selectedCitiesGapCountry, setSelectedCitiesGapCountry] = useState(
    artist?.countryId ?? 1,
  );

  // ── Song details tab state ────────────────────────────────────────────────
  const [selectedPlatformKey, setSelectedPlatformKey] = useState("spotify");
  const [songPlatformData, setSongPlatformData] = useState(null);
  const [isSongPlatformLoading, setIsSongPlatformLoading] = useState(false);
  const [songHistoricalData, setSongHistoricalData] = useState([]);
  const [isSongHistoricalLoading, setIsSongHistoricalLoading] = useState(false);
  const [isHistoricalChronological, setIsHistoricalChronological] =
    useState(true);

  const [similarArtists, setSimilarArtists] = useState([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showTopArtistReport, setShowTopArtistReport] = useState(false);
  const scrollRef = useRef(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    if (isModal) {
      // Bloquear el scroll de la página de fondo
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;
    const fetchArtist = async () => {
      setIsLoading(true);
      const data = await getArtistData(artist.id);
      if (isMounted) {
        // Handle null / undefined
        if (!data) {
          setIsLoading(false);
          setLogSong({ userid: user?.id, spotifyid: artist.id, isartist: true });
          if (setUnavailableItem) setUnavailableItem(artist);
          if (onClose) onClose();
          return;
        }

        // Enforce object extraction if array is returned
        const artistObject = Array.isArray(data)
          ? data[0]
          : data?.data?.[0] || data;

        // Handle empty array, empty object, undefined extracted value, or error response
        const isEmpty =
          !artistObject ||
          (Array.isArray(artistObject) && artistObject.length === 0) ||
          (typeof artistObject === 'object' && Object.keys(artistObject).length === 0) ||
          artistObject.error;

        if (isEmpty) {
          setIsLoading(false);
          setLogSong({ userid: user?.id, spotifyid: artist.id, isartist: true });
          if (setUnavailableItem) setUnavailableItem(artist);
          if (onClose) onClose();
          return;
        }

        setArtistData(artistObject);
        setIsLoading(false);
      }
    };
    if (artist?.id) {
      fetchArtist();
    }
    return () => {
      isMounted = false;
    };
  }, [artist]);

  useEffect(() => {
    let isMounted = true;
    const fetchSimilar = async () => {
      setIsSimilarLoading(true);
      const data = await getArtistGraph(artist.id);
      if (isMounted && data && data.nodes) {
        // Enforce level 1 nodes as Similar Artists
        const level1 = data.nodes.filter(
          (n) => n.node_type === "level1" || n.level === 1,
        );
        // Sort by listeners as metric of relevance
        setSimilarArtists(
          level1.sort((a, b) => b.monthly_listeners - a.monthly_listeners),
        );
      }
      if (isMounted) setIsSimilarLoading(false);
    };
    if (artist?.id) fetchSimilar();
    return () => {
      isMounted = false;
    };
  }, [artist]);

  useEffect(() => {
    let isMounted = true;
    const fetchMap = async () => {
      setIsMapLoading(true);
      const data = await getMapData(selectedMapCountry, artist.id);
      if (isMounted) {
        setMapData(data);
        setIsMapLoading(false);
      }
    };
    if (artist?.id) {
      fetchMap();
    }
    return () => {
      isMounted = false;
    };
  }, [artist, selectedMapCountry]);

  useEffect(() => {
    let isMounted = true;
    const fetchTypes = async () => {
      const types = await getPlaylistTypes();
      if (isMounted && types.length > 0) {
        setPlaylistTypes(types);
      }
    };
    fetchTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchPlaylists = async () => {
      setIsPlaylistsLoading(true);
      const data = await getArtistPlaylists(artist.id, selectedPlaylistType);
      if (isMounted) {
        setPlaylistsData(data);
        setIsPlaylistsLoading(false);
      }
    };
    if (artist?.id) {
      fetchPlaylists();
    }
    return () => {
      isMounted = false;
    };
  }, [artist, selectedPlaylistType]);

  useEffect(() => {
    let isMounted = true;
    const fetchTopSongs = async () => {
      setIsTopSongsLoading(true);
      // Usamos el nuevo endpoint getArtistSongs que devuelve el top 5 optimizado
      const data = await getArtistSongs(artist.spotifyid || artist.id);

      if (isMounted) {
        setTopSongsData(data || []);
        setIsTopSongsLoading(false);
      }
    };
    if (activeTab === "detalles_cancion" && topSongsData.length === 0) {
      fetchTopSongs();
    }
    return () => {
      isMounted = false;
    };
  }, [artist, activeTab, topSongsData.length]);

  // Fetch platform data + historical streams when the song details tab opens
  useEffect(() => {
    let isMounted = true;
    const csSong = artist?.cs_song || artist?.csSong;
    if (activeTab !== "detalles_cancion" || !csSong) return;

    const fetchSongMetrics = async () => {
      // Platform data
      setIsSongPlatformLoading(true);
      const pd = await getSongPlatformData(csSong, 0, 0);
      if (isMounted) {
        // API returns array or object
        setSongPlatformData(Array.isArray(pd) ? pd[0] : pd);
        setIsSongPlatformLoading(false);
      }

      // Historical streams
      setIsSongHistoricalLoading(true);
      const hist = await getSongHistoricalStreamsWeek(csSong, 0, 0);
      if (isMounted) {
        setSongHistoricalData(Array.isArray(hist) ? [...hist].reverse() : []);
        setIsSongHistoricalLoading(false);
      }
    };

    if (!songPlatformData) fetchSongMetrics();
    return () => {
      isMounted = false;
    };
  }, [activeTab, artist]);

  useEffect(() => {
    let isMounted = true;
    const fetchTiktokers = async () => {
      setIsTiktokersLoading(true);
      const data = await getArtistTiktokers(artist.id);
      if (isMounted) {
        setTiktokersData(data);
        setIsTiktokersLoading(false);
      }
    };
    if (artist?.id) {
      fetchTiktokers();
    }
    return () => {
      isMounted = false;
    };
  }, [artist]);

  useEffect(() => {
    let isMounted = true;
    const fetchRadio = async () => {
      setIsRadioLoading(true);
      const data = await getArtistRadioRelated(artist.id, selectedRadioCountry);
      if (isMounted) {
        setRadioData(data);
        setIsRadioLoading(false);
      }
    };
    if (artist?.id) {
      fetchRadio();
    }
    return () => {
      isMounted = false;
    };
  }, [artist, selectedRadioCountry]);

  useEffect(() => {
    let isMounted = true;
    const fetchCitiesGap = async () => {
      setIsCitiesGapLoading(true);
      const data = await getCitiesGapData(selectedCitiesGapCountry, artist.id);
      if (isMounted) {
        setCitiesGapData(data);
        setIsCitiesGapLoading(false);
      }
    };
    if (artist?.id) {
      fetchCitiesGap();
    }
    return () => {
      isMounted = false;
    };
  }, [artist, selectedCitiesGapCountry]);

  if (!artist) return null;

  const containerStyle = isModal ? {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    zIndex: 1000,
    padding: "2rem",
    backdropFilter: "blur(8px)",
  } : {
    width: "100%",
    padding: "0",
  };

  const modalContainerStyle = isModal ? {
    width: "100%",
    maxWidth: "min(1200px, 95vw)",
    maxHeight: "92vh",
    overflowY: "auto",
    background: "var(--bg-dark)",
    display: "flex",
    flexDirection: "column",
  } : {
    width: "100%",
    background: "var(--bg-dark)",
    display: "flex",
    flexDirection: "column",
    borderRadius: "2rem",
    overflow: "hidden",
  };

  return (
    <div
      className={isModal ? "flex-center modal-overlay-padding" : ""}
      style={containerStyle}
    >
      <div
        className={isModal ? "glass-panel animate-fade-in modal-container" : "glass-panel animate-fade-in"}
        style={modalContainerStyle}
      >
        {/* Header */}
        <div
          className="modal-hero-header"
          style={{ position: "relative", height: "200px", width: "100%" }}
        >
          <img
            src={artist.imageUrl}
            alt={artist.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, var(--bg-dark), transparent)",
            }}
          />
          {isModal && onClose && (
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(0,0,0,0.5)",
                padding: "0.5rem",
                borderRadius: "50%",
                color: "white",
              }}
            >
              <X size={24} />
            </button>
          )}

          <div
            className="modal-hero-info"
            style={{
              position: "absolute",
              bottom: "1.5rem",
              left: "2rem",
              display: "flex",
              alignItems: "flex-end",
              gap: "1.5rem",
            }}
          >
            <img
              className="modal-hero-avatar"
              src={artist.imageUrl}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "3px solid var(--accent-primary)",
                objectFit: "cover",
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <h1
                  className="modal-hero-title"
                  style={{
                    fontSize: "3rem",
                    fontWeight: 800,
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {artist.name}
                </h1>
                <button
                  onClick={() => setShowTopArtistReport(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "linear-gradient(135deg, #8a88ff 0%, #ff3366 100%)",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "20px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    height: "fit-content",
                    boxShadow: "0 4px 15px rgba(255, 51, 102, 0.4)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 51, 102, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 51, 102, 0.4)";
                  }}
                >
                  <Activity size={16} color="white" /> Resumen IA
                </button>
              </div>
              <p
                className="modal-hero-monthly"
                style={{
                  color: "var(--accent-primary)",
                  fontWeight: 600,
                  marginTop: "0.5rem",
                }}
              >
                <Users
                  size={16}
                  style={{
                    display: "inline",
                    marginRight: "5px",
                    verticalAlign: "text-bottom",
                  }}
                />
                {formatNumber(artistData?.monthly_listeners)} Monthly Listeners
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          ref={tabsRef}
          className="custom-scrollbar modal-tab-bar"
          style={{
            display: "flex",
            borderBottom: "1px solid var(--glass-border)",
            padding: "0 2rem",
            gap: "2rem",
            overflowX: "auto",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            background: "var(--bg-dark)",
            zIndex: 100,
          }}
        >
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
          `}</style>
          {[
            { id: "mapa", label: "Mapa", icon: Map },
            ...(artist?.songName
              ? [
                {
                  id: "detalles_cancion",
                  label: `Alcance de ${artist.songName}`,
                  icon: Music,
                },
              ]
              : []),
            { id: "playlists", label: "Playlists Recomendadas", icon: Music },
            { id: "tiktok", label: "TikTokers", icon: Users },
            { id: "overview", label: "Panorama", icon: Activity },
            { id: "radio", label: "Emisoras Gap", icon: Radio },
            { id: "ciudades", label: "Ciudades", icon: MapPin },
            { id: "neuronal", label: "Grafo Neuronal", icon: Activity },
            { id: "sunburst", label: "Grafo v2 (Sunburst)", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "1.5rem 0",
                color:
                  activeTab === tab.id
                    ? "var(--text-main)"
                    : "var(--text-muted)",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid var(--accent-primary)"
                    : "2px solid transparent",
                fontWeight: activeTab === tab.id ? 600 : 400,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="modal-content-area"
          style={{ padding: "2rem", flex: 1 }}
        >
          {activeTab === "overview" && (
            <div
              className="grid-base stats-grid-responsive"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {isLoading ? (
                <div
                  className="flex-center"
                  style={{
                    width: "100%",
                    padding: "3rem",
                    flexDirection: "column",
                    gridColumn: "1 / -1",
                  }}
                >
                  <Loader2
                    className="loading-spinner"
                    size={32}
                    color="var(--accent-primary)"
                  />
                  <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
                    Cargando inteligencia y estadísticas...
                  </p>
                </div>
              ) : artistData?.monthly_listeners &&
                artistData?.monthly_listeners > 0 ? (
                <>
                  <div
                    className="glass-panel animate-fade-in"
                    style={{
                      padding: "1.5rem",
                      background: "rgba(29, 185, 84, 0.05)",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Headphones size={16} color="#1DB954" /> Mensuales Spotify
                    </h3>
                    <p
                      className="text-gradient"
                      style={{ fontSize: "1.8rem", fontWeight: 800 }}
                    >
                      {formatNumber(
                        artistData?.monthly_listeners ||
                        artist.monthlyListeners,
                      )}
                    </p>
                  </div>

                  <div
                    className="glass-panel animate-fade-in"
                    style={{
                      padding: "1.5rem",
                      background: "rgba(255, 0, 80, 0.05)",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <SquarePlay size={16} color="#ff0050" /> TikTok Views
                    </h3>
                    <p
                      className="text-gradient-secondary"
                      style={{ fontSize: "1.8rem", fontWeight: 800 }}
                    >
                      {formatNumber(artistData?.views_total_tiktok || 0)}
                    </p>
                  </div>

                  <div
                    className="glass-panel animate-fade-in"
                    style={{
                      padding: "1.5rem",
                      background: "rgba(255, 0, 0, 0.05)",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <SquarePlay size={16} color="#FF0000" /> YouTube Vistas
                    </h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                      {formatNumber(artistData?.video_views_total_youtube || 0)}
                    </p>
                  </div>

                  <div
                    className="glass-panel animate-fade-in"
                    style={{
                      padding: "1.5rem",
                      background: "rgba(225, 48, 108, 0.05)",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <InstagramIcon size={16} color="#E1306C" /> Seguidores IG
                    </h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                      {formatNumber(artistData?.followers_total_instagram || 0)}
                    </p>
                  </div>

                  <div
                    className="glass-panel animate-fade-in"
                    style={{
                      padding: "1.5rem",
                      background: "rgba(24, 119, 242, 0.05)",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <FacebookIcon size={16} color="#1877F2" /> Seguidores FB
                    </h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                      {formatNumber(artistData?.followers_total_facebook || 0)}
                    </p>
                  </div>

                  <div
                    className="glass-panel animate-fade-in"
                    style={{ padding: "1.5rem" }}
                  >
                    <h3
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <TrendingUp size={16} color="var(--accent-primary)" />{" "}
                      Streams Totales
                    </h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                      {formatNumber(artistData?.streams_total || 0)}
                    </p>
                  </div>

                  <div
                    className="glass-panel animate-fade-in"
                    style={{ padding: "1.5rem" }}
                  >
                    <h3
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Music size={16} color="var(--accent-tertiary)" />{" "}
                      Playlist Reach
                    </h3>
                    <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                      {formatNumber(artistData?.playlist_reach || 0)}
                    </p>
                  </div>

                  <div
                    className="glass-panel animate-fade-in"
                    style={{ padding: "1.5rem" }}
                  >
                    <h3
                      style={{
                        color: "var(--text-muted)",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Heart size={16} color="#ffb700" /> Popularidad
                    </h3>
                    <p
                      className="text-gradient"
                      style={{ fontSize: "1.8rem", fontWeight: 800 }}
                    >
                      {artistData?.popularity || 0}/100
                    </p>
                  </div>
                </>
              ) : (
                <div
                  className="flex-center"
                  style={{
                    gridColumn: "1 / -1",
                    height: "300px",
                    flexDirection: "column",
                    textAlign: "center",
                    gap: "1rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <Activity size={48} style={{ opacity: 0.2 }} />
                  <div>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        color: "var(--text-main)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Información no disponible
                    </h3>
                    <p
                      style={{
                        maxWidth: "400px",
                        margin: "0 auto",
                        fontSize: "0.9rem",
                      }}
                    >
                      La información de métricas completas para este artista no
                      está disponible en este momento. La estamos recopilando,
                      por favor regresa más tarde.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "detalles_cancion" && (
            <div
              className="animate-fade-in"
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              {/* ── Platform Metrics Panel ────────────────────────────────── */}
              <div>
                {/* Section Title */}
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "1rem",
                  }}
                >
                  <TrendingUp size={18} color="var(--accent-primary)" />{" "}
                  Estadísticas por Plataformas
                </h3>

                {/* Platform Pills — flex-wrap so they form at most 2 rows */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginBottom: "1.2rem",
                  }}
                >
                  {SONG_PLATFORMS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPlatformKey(p.key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        padding: "0.4rem 0.85rem",
                        borderRadius: "999px",
                        border:
                          selectedPlatformKey === p.key
                            ? `2px solid ${p.accentColor}`
                            : "2px solid rgba(255,255,255,0.08)",
                        background:
                          selectedPlatformKey === p.key
                            ? `${p.accentColor}22`
                            : "rgba(255,255,255,0.03)",
                        color:
                          selectedPlatformKey === p.key
                            ? p.accentColor
                            : "var(--text-muted)",
                        fontWeight: selectedPlatformKey === p.key ? 700 : 400,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.icon ? (
                        <p.icon
                          size={16}
                          color={
                            selectedPlatformKey === p.key
                              ? p.accentColor
                              : "gray"
                          }
                          style={{
                            filter:
                              selectedPlatformKey !== p.key
                                ? "opacity(0.6)"
                                : "none",
                          }}
                        />
                      ) : (
                        <img
                          src={p.logo}
                          alt={p.name}
                          style={{
                            width: 16,
                            height: 16,
                            objectFit: "contain",
                            borderRadius: 3,
                            filter:
                              selectedPlatformKey !== p.key
                                ? "grayscale(60%) opacity(0.6)"
                                : "none",
                          }}
                        />
                      )}
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Active Platform Header */}
                {(() => {
                  const activePlat = SONG_PLATFORMS.find(
                    (p) => p.key === selectedPlatformKey,
                  );
                  const rankVal = songPlatformData
                    ? songPlatformData[activePlat.rankKey]
                    : null;
                  return (
                    <div
                      className="glass-panel"
                      style={{
                        padding: "1.5rem",
                        borderTop: `3px solid ${activePlat.accentColor}`,
                        background: `linear-gradient(135deg, ${activePlat.accentColor}0d 0%, rgba(0,0,0,0) 60%)`,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Watermark glow */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-30px",
                          right: "-30px",
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          background: `radial-gradient(circle, ${activePlat.accentColor}33 0%, transparent 70%)`,
                          pointerEvents: "none",
                        }}
                      />

                      {/* Header row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "1.2rem",
                          flexWrap: "wrap",
                          gap: "0.8rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 14,
                              background: "rgba(255,255,255,0.06)",
                              border: `1px solid ${activePlat.accentColor}44`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            {activePlat.icon ? (
                              <activePlat.icon
                                size={32}
                                color={activePlat.accentColor}
                              />
                            ) : (
                              <img
                                src={activePlat.logo}
                                alt={activePlat.name}
                                style={{
                                  width: 32,
                                  height: 32,
                                  objectFit: "contain",
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "1.2rem",
                                fontWeight: 800,
                                color: "var(--text-main)",
                              }}
                            >
                              {activePlat.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                                marginTop: "0.1rem",
                              }}
                            >
                              Métricas de la canción
                            </div>
                          </div>
                        </div>

                        {rankVal > 0 && (
                          <div
                            style={{
                              background: `${activePlat.accentColor}22`,
                              border: `1px solid ${activePlat.accentColor}55`,
                              borderRadius: 12,
                              padding: "0.4rem 1rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                          >
                            <Trophy size={14} color={activePlat.accentColor} />
                            <span
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: activePlat.accentColor,
                              }}
                            >
                              Rank #{fmtPlatVal(rankVal, false)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Metrics Grid */}
                      {isSongPlatformLoading ? (
                        <div className="flex-center" style={{ height: 120 }}>
                          <Loader2
                            className="loading-spinner"
                            size={28}
                            color={activePlat.accentColor}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(150px, 1fr))",
                            gap: "0.8rem",
                          }}
                        >
                          {activePlat.fields.map((field) => {
                            const rawVal = songPlatformData
                              ? songPlatformData[field.key]
                              : null;
                            const formatted =
                              rawVal !== null && rawVal !== undefined
                                ? fmtPlatVal(rawVal, field.isRate)
                                : "N/A";
                            const hasData = rawVal && Number(rawVal) > 0;
                            return (
                              <div
                                key={field.key}
                                style={{
                                  background: "rgba(255,255,255,0.04)",
                                  border: "1px solid rgba(255,255,255,0.07)",
                                  borderRadius: 12,
                                  padding: "0.9rem 1rem",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.3rem",
                                  transition: "all 0.2s",
                                  cursor: "default",
                                  borderLeft: hasData
                                    ? `3px solid ${activePlat.accentColor}`
                                    : "3px solid rgba(255,255,255,0.06)",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(255,255,255,0.07)";
                                  e.currentTarget.style.transform =
                                    "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(255,255,255,0.04)";
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                  }}
                                >
                                  {field.label}
                                </div>
                                <div
                                  style={{
                                    fontSize: "1.5rem",
                                    fontWeight: 900,
                                    color: hasData
                                      ? "var(--text-main)"
                                      : "rgba(255,255,255,0.2)",
                                    lineHeight: 1.1,
                                  }}
                                >
                                  {formatted}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* No data message */}
                      {!isSongPlatformLoading &&
                        songPlatformData &&
                        activePlat.fields.every(
                          (f) =>
                            !songPlatformData[f.key] ||
                            Number(songPlatformData[f.key]) === 0,
                        ) && (
                          <div
                            style={{
                              textAlign: "center",
                              color: "var(--text-muted)",
                              padding: "2rem",
                              fontSize: "0.9rem",
                              fontStyle: "italic",
                            }}
                          >
                            No hay datos disponibles para {activePlat.name}
                          </div>
                        )}
                    </div>
                  );
                })()}
              </div>

              {/* ── Spotify Historical Streams Chart ──────────────────────── */}
              {selectedPlatformKey === "spotify" && (
                <div
                  className="glass-panel"
                  style={{
                    padding: "1.5rem",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1.2rem",
                    }}
                  >
                    <h3
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        margin: 0,
                        fontSize: "1rem",
                      }}
                    >
                      <BarChart2 size={18} color="#1DB954" /> Rendimiento en
                      Spotify
                    </h3>
                    {songHistoricalData.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.8rem",
                          alignItems: "center",
                        }}
                      >
                        <button
                          onClick={() =>
                            setIsHistoricalChronological(
                              !isHistoricalChronological,
                            )
                          }
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "20px",
                            padding: "0.25rem 0.8rem",
                            color: "var(--text-main)",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.1)")
                          }
                          onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.05)")
                          }
                        >
                          <TrendingUp
                            size={12}
                            color={
                              isHistoricalChronological
                                ? "var(--text-muted)"
                                : "var(--accent-primary)"
                            }
                          />
                          {isHistoricalChronological
                            ? "Cronológico"
                            : "Menor a Mayor"}
                        </button>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#1DB954",
                            background: "#1DB95415",
                            padding: "0.2rem 0.7rem",
                            borderRadius: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <BarChart2 size={11} /> {songHistoricalData.length}{" "}
                          semanas de historial
                        </div>
                      </div>
                    )}
                  </div>
                  {isSongHistoricalLoading ? (
                    <div className="flex-center" style={{ height: 180 }}>
                      <Loader2
                        className="loading-spinner"
                        size={28}
                        color="#1DB954"
                      />
                    </div>
                  ) : songHistoricalData.length === 0 ? (
                    <div
                      className="flex-center"
                      style={{
                        height: 120,
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <BarChart2 size={32} style={{ opacity: 0.2 }} />
                      Sin historial de streams disponible
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={(isHistoricalChronological
                            ? songHistoricalData
                            : [...songHistoricalData].sort(
                              (a, b) =>
                                (a.spotify_streams || 0) -
                                (b.spotify_streams || 0),
                            )
                          ).map((d) => ({
                            name: d.date_week?.slice(5),
                            val: d.spotify_streams,
                          }))}
                          margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="songTabGrad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#1DB954"
                                stopOpacity={0.35}
                              />
                              <stop
                                offset="95%"
                                stopColor="#1DB954"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="rgba(255,255,255,0.04)"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#555", fontSize: 10 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#555", fontSize: 10 }}
                            tickFormatter={(v) => v.toLocaleString()}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#111",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 8,
                              fontSize: "0.8rem",
                            }}
                            itemStyle={{ color: "#1DB954" }}
                            formatter={(v) => [v.toLocaleString(), "Streams"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="val"
                            stroke="#1DB954"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#songTabGrad)"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Lista de Recomendación Top 5 */}
              <div>
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <Trophy size={20} color="#ffb700" /> Top 5 Canciones
                </h3>

                {isTopSongsLoading ? (
                  <div className="flex-center" style={{ height: "200px" }}>
                    <Loader2
                      className="loading-spinner"
                      size={32}
                      color="var(--accent-primary)"
                    />
                  </div>
                ) : topSongsData.length === 0 ? (
                  <div
                    className="flex-center"
                    style={{ height: "100px", color: "var(--text-muted)" }}
                  >
                    No hay canciones top disponibles
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {topSongsData.slice(0, 5).map((song, i) => (
                      <div
                        key={i}
                        className="glass-panel"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1.5rem",
                          padding: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            color: "var(--text-muted)",
                          }}
                        >
                          {i + 1}
                        </div>

                        <div style={{ position: "relative", width: "60px", height: "60px", flexShrink: 0 }}>
                          <img
                            src={
                              song.image_url ||
                              song.avatar ||
                              artist.imageUrl ||
                              "/logo.png"
                            }
                            alt={song.title || song.song}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            className="play-overlay"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePlayPreview(
                                song.id,
                                `https://audios.monitorlatino.com/Iam/${song.id}.mp3`,
                                {
                                  title: song.title || song.song,
                                  artist: artist.name,
                                  image: song.image_url || song.avatar || artist.imageUrl || "/logo.png"
                                }
                              );
                            }}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: currentlyPlaying === song.id ? 1 : 0,
                              transition: 'opacity 0.2s',
                              cursor: 'pointer',
                              borderRadius: '8px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                            onMouseLeave={(e) => { if (currentlyPlaying !== song.id) e.currentTarget.style.opacity = 0; }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                background: "rgba(0,0,0,0.7)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                transition: "transform 0.2s"
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                            >
                              {currentlyPlaying === song.id ? (
                                <Pause size={14} />
                              ) : (
                                <Play size={14} style={{ marginLeft: "2px" }} />
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: "1.1rem",
                              color: "var(--text-main)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {song.title || song.song}
                          </h4>
                          {song.score !== undefined && (
                            <div
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: "var(--accent-primary)",
                                marginTop: "0.2rem",
                              }}
                            >
                              Score: {Number(song.score).toFixed(1)}
                            </div>
                          )}
                          <p
                            style={{
                              margin: "0.2rem 0 0 0",
                              color: "var(--text-muted)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {song.label || ""}
                          </p>
                          {song.release_date && (
                            <p
                              style={{
                                margin: "0.2rem 0 0 0",
                                color: "var(--text-dim)",
                                fontSize: "0.75rem",
                              }}
                            >
                              Fecha: {song.release_date}
                            </p>
                          )}
                        </div>

                        <div style={{ marginLeft: "auto" }}>
                          <button
                            className="btn-primary"
                            style={{
                              padding: "0.5rem 1.5rem",
                              borderRadius: "20px",
                              background:
                                song.spotifyid && user
                                  ? "linear-gradient(to right, var(--accent-primary), var(--accent-secondary))"
                                  : "rgba(255,255,255,0.06)",
                              border: "none",
                              color:
                                song.spotifyid && user
                                  ? "white"
                                  : "var(--text-dim)",
                              fontWeight: 600,
                              cursor: song.spotifyid
                                ? "pointer"
                                : "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              opacity: song.spotifyid ? 1 : 0.45,
                              transition: "transform 0.15s, opacity 0.2s",
                            }}
                            onClick={() => {
                              if (!song.spotifyid) return;
                              if (!user) {
                                // Require login — same pattern as legacy searchArtist.tsx
                                import("../hooks/use-toast").then(
                                  ({ toast }) => {
                                    toast({
                                      title: "🔒 Inicia sesión",
                                      description:
                                        "Necesitas una cuenta para acceder a las campañas de promoción.",
                                    });
                                  },
                                );
                                return;
                              }
                              // Build URL with full song metadata — same as legacy handleSearchResultSelect
                              const params = new URLSearchParams({
                                spotifyId: song.spotifyid,
                              });
                              if (song.artists || artist?.name)
                                params.set(
                                  "artist",
                                  song.artists || artist.name,
                                );
                              if (song.title || song.song)
                                params.set("track", song.title || song.song);
                              if (song.image_url || song.avatar)
                                params.set(
                                  "coverUrl",
                                  song.image_url || song.avatar,
                                );
                              window.open(
                                `/campaign?${params.toString()}`,
                                "_blank",
                              );
                            }}
                            onMouseEnter={(e) => {
                              if (song.spotifyid && user)
                                e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                            title={
                              !song.spotifyid
                                ? "Sin Spotify ID"
                                : !user
                                  ? "Inicia sesión para ver campaña"
                                  : "Ver Campaña"
                            }
                            disabled={!song.spotifyid}
                          >
                            <Activity size={16} />
                            {user ? "Ver Campaña" : "🔒 Campaña"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendations Banner — at the end of Detalles de Cancion tab */}
              <RecommendationsBanner
                songName={artist?.songName}
                csSong={artist?.cs_song || artist?.csSong}
                spotifyId={artist?.spotifyid}
                onOpen={() => setShowRecommendations(true)}
              />
            </div>
          )}

          {/* Similar Artists Carousel Section */}
          {activeTab === "overview" && !isLoading && (
            <div
              style={{
                marginTop: "0rem",
                paddingBottom: "2rem",
                animation: "fadeIn 0.5s ease-out",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "1.2rem",
                    margin: 0,
                  }}
                >
                  <CircleUser size={24} color="var(--text-main)" /> Similar
                  Artists
                </h3>

                {/* Custom Navigation Arrows */}
                <div style={{ display: "flex", gap: "0.8rem" }}>
                  <button
                    onClick={() =>
                      scrollRef.current?.scrollBy({
                        left: -300,
                        behavior: "smooth",
                      })
                    }
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "2px solid var(--glass-border)",
                      background: "transparent",
                      color: "var(--text-main)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--accent-primary)";
                      e.currentTarget.style.color = "var(--accent-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--glass-border)";
                      e.currentTarget.style.color = "var(--text-main)";
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      scrollRef.current?.scrollBy({
                        left: 300,
                        behavior: "smooth",
                      })
                    }
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "2px solid var(--glass-border)",
                      background: "transparent",
                      color: "var(--text-main)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--accent-primary)";
                      e.currentTarget.style.color = "var(--accent-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--glass-border)";
                      e.currentTarget.style.color = "var(--text-main)";
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {isSimilarLoading ? (
                <div className="flex-center" style={{ height: "250px" }}>
                  <Loader2
                    className="loading-spinner"
                    size={32}
                    color="var(--accent-primary)"
                  />
                </div>
              ) : similarArtists.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No se encontraron artistas similares.
                </div>
              ) : (
                <div
                  ref={scrollRef}
                  style={{
                    display: "flex",
                    gap: "1.2rem",
                    overflowX: "auto",
                    paddingBottom: "1rem",
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none", // IE
                  }}
                  className="no-scrollbar"
                >
                  <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

                  {similarArtists.map((sim, i) => {
                    // Deterministic mock variables tailored to the artist label
                    const abstractHue = (sim.label.charCodeAt(0) * 15) % 360;
                    const countries = [
                      "🇲🇽 México",
                      "🇨🇴 Colombia",
                      "🇵🇷 Puerto Rico",
                      "🇦🇷 Argentina",
                      "🇪🇸 España",
                    ];
                    const genres = [
                      "Reggaeton",
                      "Trap Latino",
                      "Pop Latino",
                      "Urbano",
                      "Regional",
                    ];
                    const cty = countries[sim.label.length % countries.length];
                    const gen =
                      genres[
                      sim.label.charCodeAt(sim.label.length - 1) %
                      genres.length
                      ];

                    return (
                      <div
                        key={i}
                        style={{
                          minWidth: "200px",
                          height: "80px",
                          borderRadius: "16px",
                          position: "relative",
                          overflow: "hidden",
                          flexShrink: 0,
                          cursor: "pointer",
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                          // Abstract beautiful gradient background as placeholder since API lacks images
                          background: `linear-gradient(135deg, hsl(${abstractHue}, 60%, 20%), hsl(${(abstractHue + 60) % 360}, 40%, 10%))`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-6px)";
                          e.currentTarget.style.boxShadow =
                            "0 12px 24px rgba(0,0,0,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* Inner Dark Gradient Overlay to map text visibility reliably */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.95) 100%)",
                          }}
                        />

                        <div
                          style={{
                            position: "absolute",
                            bottom: "1.5rem",
                            left: "1.5rem",
                            right: "1.5rem",
                            textAlign: "center",
                          }}
                        >
                          <h4
                            style={{
                              margin: "0 0 0.4rem 0",
                              fontSize: "1.2rem",
                              fontWeight: 800,
                              color: "#fff",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {sim.label}
                          </h4>
                          {/*<div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {cty} |
                            <br />
                            <span style={{ color: 'var(--text-dim)' }}>{gen}</span>
                          </div>*/}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "mapa" && (
            <div className="animate-fade-in">
              {/* 1. Mapa o cargador en la parte superior */}
              {isMapLoading ? (
                <div
                  className="flex-center"
                  style={{
                    height: "400px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "16px",
                    border: "1px solid var(--glass-border)",
                    marginBottom: "2rem",
                  }}
                >
                  <Loader2
                    className="loading-spinner"
                    size={32}
                    color="var(--accent-primary)"
                  />
                </div>
              ) : (
                <div style={{ marginBottom: "2rem" }}>
                  <ArtistMap data={mapData} />
                </div>
              )}

              {/* 2. Título, descripción y selector en el medio */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "2rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Map size={20} color="var(--accent-primary)" /> Distribución
                    Geográfica de Audiencia
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    minWidth: "200px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Filtrar por país:
                  </span>
                  <SearchableSelect
                    options={[
                      { value: "0", label: "Global (Todos)" },
                      ...countries.map((c) => ({
                        value: String(c.id),
                        label: c.country_name,
                      })),
                    ]}
                    value={String(selectedMapCountry)}
                    onChange={(val) => setSelectedMapCountry(val)}
                    placeholder="Global (Todos)"
                  />
                </div>
              </div>

              {/* 3. Top 10 Ciudades en la parte inferior */}
              {!isMapLoading && (
                <div style={{ marginTop: "1rem" }}>
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      marginBottom: "1.2rem",
                      fontSize: "1.1rem",
                      color: "var(--text-main)",
                    }}
                  >
                    <Trophy size={18} color="#ffb700" /> Top 10 Ciudades de
                    Consumo
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {[...mapData]
                      .sort((a, b) => b.current_listeners - a.current_listeners)
                      .slice(0, 10)
                      .map((city, idx) => (
                        <div
                          key={idx}
                          className="glass-panel-interactive animate-fade-in"
                          style={{
                            padding: "1rem",
                            position: "relative",
                            borderLeft:
                              idx < 3
                                ? `3px solid ${idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : "#CD7F32"}`
                                : "1px solid var(--glass-border)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.4rem",
                            animationDelay: `${idx * 0.05}s`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: 900,
                                color:
                                  idx < 3
                                    ? idx === 0
                                      ? "#FFD700"
                                      : idx === 1
                                        ? "#C0C0C0"
                                        : "#CD7F32"
                                    : "var(--text-dim)",
                              }}
                            >
                              #{idx + 1}
                            </span>
                            <MapPin
                              size={12}
                              color="var(--text-dim)"
                              opacity={0.5}
                            />
                          </div>
                          <h5
                            style={{
                              margin: 0,
                              fontSize: "0.9rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {city.city_name}
                          </h5>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "var(--accent-primary)",
                            }}
                          >
                            {formatNumber(city.current_listeners)}{" "}
                            <span
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 400,
                                color: "var(--text-muted)",
                              }}
                            >
                              oyentes
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "playlists" && (
            <div className="animate-fade-in">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Music size={20} color="var(--accent-tertiary)" /> Playlists
                    Relevantes
                  </h3>
                  {playlistsData.length > 0 ? (
                    (() => {
                      const allArtists = playlistsData
                        .flatMap((pl) =>
                          pl.related_artists_names
                            ? pl.related_artists_names
                              .split(",")
                              .map((s) => s.trim())
                            : [],
                        )
                        .filter(Boolean);
                      const uniqueArtists = [...new Set(allArtists)];
                      const topArtists = uniqueArtists.slice(0, 8).join(", ");
                      return (
                        <p
                          style={{
                            color: "var(--text-muted)",
                            marginTop: "0.5rem",
                            fontSize: "0.85rem",
                            maxWidth: "600px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={uniqueArtists.join(", ")}
                        >
                          Artistas relacionados:{" "}
                          <span style={{ color: "var(--text-main)" }}>
                            {topArtists}
                            {uniqueArtists.length > 8 ? "..." : ""}
                          </span>
                        </p>
                      );
                    })()
                  ) : (
                    <p
                      style={{
                        color: "var(--text-muted)",
                        marginTop: "0.5rem",
                      }}
                    >
                      Apariciones en listas de curación Editorial, Personalized
                      o Chart.
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    minWidth: "180px",
                  }}
                >
                  <span
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    Tipo:
                  </span>
                  <SearchableSelect
                    options={playlistTypes.map((t) => ({
                      value: String(t.id),
                      label: t.name,
                    }))}
                    value={String(selectedPlaylistType)}
                    onChange={(val) => setSelectedPlaylistType(val)}
                    searchable={false}
                    placeholder="Tipo de Playlist"
                  />
                </div>
              </div>

              {isPlaylistsLoading ? (
                <div className="flex-center" style={{ height: "300px" }}>
                  <Loader2
                    className="loading-spinner"
                    size={32}
                    color="var(--accent-primary)"
                  />
                </div>
              ) : playlistsData.length === 0 ? (
                <div
                  className="flex-center"
                  style={{ height: "200px", color: "var(--text-muted)" }}
                >
                  No hay playlists disponibles para este filtro.
                </div>
              ) : (
                <div
                  className="grid-base"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {playlistsData.map((pl, i) => {
                    const artistsList = pl.related_artists_names
                      ? pl.related_artists_names
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                      : [];
                    const top5 = artistsList.slice(0, 5).join(", ");
                    const hasMore = artistsList.length > 5;
                    const typeColor = getPlaylistColor(pl.type_name);

                    return (
                      <div
                        key={i}
                        className="glass-panel"
                        style={{
                          padding: "1rem",
                          display: "flex",
                          gap: "1rem",
                          alignItems: "center",
                          borderLeft: `4px solid ${typeColor}`,
                        }}
                      >
                        <img
                          src={pl.artwork || "/logo.png"}
                          alt={pl.playlist_name}
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                          >
                            <h4
                              style={{
                                margin: 0,
                                fontSize: "1rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: "var(--text-main)",
                              }}
                            >
                              {pl.playlist_name}
                            </h4>
                            {pl.external_url && (
                              <a
                                href={pl.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "var(--accent-primary)",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                title="Abrir en Spotify"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                          <p
                            style={{
                              color: "var(--text-muted)",
                              fontSize: "0.8rem",
                              margin: "0.2rem 0",
                            }}
                          >
                            {pl.owner_name} • {pl.type_name}
                          </p>

                          {artistsList.length > 0 && (
                            <p
                              style={{
                                color: "var(--text-dim)",
                                fontSize: "0.75rem",
                                margin: "0.3rem 0",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={pl.related_artists_names}
                            >
                              <span style={{ color: "var(--text-main)" }}>
                                Con:
                              </span>{" "}
                              {top5}
                              {hasMore ? "..." : ""}
                            </p>
                          )}

                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              fontSize: "0.75rem",
                              color: "var(--text-dim)",
                              marginTop: "0.4rem",
                            }}
                          >
                            <span>
                              Followers:{" "}
                              <strong style={{ color: "var(--text-main)" }}>
                                {formatNumber(pl.followers_count)}
                              </strong>
                            </span>
                            <span>
                              Ranking:{" "}
                              <strong style={{ color: "var(--text-main)" }}>
                                #{pl.current_position || pl.rk}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "tiktok" && (
            <div className="animate-fade-in">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Users size={20} color="#ff0050" /> Influencers de TikTok
                  </h3>
                  <p
                    style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}
                  >
                    Ranking de creadores usando sonidos o interactuando con este
                    artista.
                  </p>
                </div>
              </div>

              {isTiktokersLoading ? (
                <div className="flex-center" style={{ height: "300px" }}>
                  <Loader2
                    className="loading-spinner"
                    size={32}
                    color="#ff0050"
                  />
                </div>
              ) : tiktokersData.length === 0 ? (
                <div
                  className="flex-center"
                  style={{ height: "200px", color: "var(--text-muted)" }}
                >
                  No se encontraron TikTokers relacionados.
                </div>
              ) : (
                <div
                  className="grid-base"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {tiktokersData.map((tk, i) => (
                    <div
                      key={i}
                      className="glass-panel"
                      style={{
                        padding: "1.2rem",
                        borderLeft: "3px solid #ff0050",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.8rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.2rem",
                          }}
                        >
                          <h4
                            style={{
                              margin: 0,
                              fontSize: "1.1rem",
                              color: "var(--text-main)",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                          >
                            {tk.user_name}
                            <a
                              href={`https://www.tiktok.com/@${tk.user_handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#ff0050",
                                display: "flex",
                                alignItems: "center",
                              }}
                              title="Ir a TikTok"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </h4>
                          <p
                            style={{
                              color: "var(--text-muted)",
                              fontSize: "0.85rem",
                              margin: "0",
                            }}
                          >
                            @{tk.user_handle}
                          </p>
                        </div>
                        <div
                          style={{
                            background: "rgba(255, 0, 80, 0.1)",
                            color: "#ff0050",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                          }}
                        >
                          #{tk.rk}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "0.6rem",
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          background: "rgba(0,0,0,0.15)",
                          padding: "0.8rem",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Followers
                          </span>
                          <strong
                            style={{
                              color: "var(--text-main)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatNumber(tk.tiktok_user_followers)}
                          </strong>
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Vistas
                          </span>
                          <strong
                            style={{
                              color: "var(--text-main)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatNumber(tk.total_views_related)}
                          </strong>
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Likes
                          </span>
                          <strong
                            style={{
                              color: "var(--text-main)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatNumber(tk.total_likes_related)}
                          </strong>
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Videos
                          </span>
                          <strong
                            style={{
                              color: "var(--text-main)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatNumber(tk.total_videos_related)}
                          </strong>
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Shares
                          </span>
                          <strong
                            style={{
                              color: "var(--text-main)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatNumber(tk.total_shares_related)}
                          </strong>
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Comments
                          </span>
                          <strong
                            style={{
                              color: "var(--text-main)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatNumber(tk.total_comments_related)}
                          </strong>
                        </div>
                      </div>

                      {tk.related_artists_names && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-dim)",
                            paddingTop: "0.5rem",
                            borderTop: "1px solid var(--glass-border)",
                          }}
                        >
                          <span style={{ color: "var(--text-main)" }}>
                            Asociado a:
                          </span>{" "}
                          {tk.related_artists_names}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "radio" && (
            <div className="animate-fade-in">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Radio size={20} color="#ffb700" /> Oportunidades en Radio
                  </h3>
                  <p
                    style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}
                  >
                    Emisoras que tocan artistas de tu cluster pero muestran un
                    gap de audiencia para ti.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    Filtrar por país:
                  </span>
                  <select
                    value={selectedRadioCountry}
                    onChange={(e) => setSelectedRadioCountry(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--text-main)",
                      border: "1px solid var(--glass-border)",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "var(--radius-sm)",
                      outline: "none",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value={0}>Global (Todos)</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.country_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isRadioLoading ? (
                <div className="flex-center" style={{ height: "300px" }}>
                  <Loader2
                    className="loading-spinner"
                    size={32}
                    color="#ffb700"
                  />
                </div>
              ) : radioData.length === 0 ? (
                <div
                  className="flex-center"
                  style={{ height: "200px", color: "var(--text-muted)" }}
                >
                  No se encontraron gaps de radio para este artista.
                </div>
              ) : (
                <div
                  className="grid-base"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {radioData.map((rg, i) => (
                    <div
                      key={i}
                      className="glass-panel"
                      style={{
                        padding: "1.2rem",
                        borderLeft: "3px solid #ffb700",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.8rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.8rem",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={`https://smart.monitorlatino.com/logos_estaciones/${rg.stream_id}.png`}
                            alt={rg.station_name}
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "6px",
                              objectFit: "contain",
                              background: "rgba(255,255,255,0.05)",
                              padding: "4px",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.2rem",
                            }}
                          >
                            <h4
                              style={{
                                margin: 0,
                                fontSize: "1rem",
                                color: "var(--text-main)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                              }}
                            >
                              <Radio size={14} color="#ffb700" />{" "}
                              {rg.station_name}
                            </h4>
                            <p
                              style={{
                                color: "var(--text-muted)",
                                fontSize: "0.85rem",
                                margin: "0",
                              }}
                            >
                              {rg.market || "Mercado No Asignado"}
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            background: "rgba(255, 183, 0, 0.1)",
                            color: "#ffb700",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                          }}
                        >
                          #{rg.rk}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "0.6rem",
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          background: "rgba(0,0,0,0.15)",
                          padding: "0.8rem",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Spins Gap
                          </span>
                          <strong
                            style={{
                              color: "var(--text-main)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatNumber(rg.spins_gap)}
                          </strong>
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Audience Gap
                          </span>
                          <strong
                            style={{
                              color: "var(--text-main)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatNumber(rg.audience_gap)}
                          </strong>
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Artistas Clust. (Spins)
                          </span>
                          <strong
                            style={{
                              color: "var(--text-main)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {formatNumber(rg.related_spins)}
                          </strong>
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Oportunidad (Ratio)
                          </span>
                          <strong
                            style={{
                              color: "var(--text-main)",
                              fontSize: "0.95rem",
                            }}
                          >
                            {rg.opportunity_ratio
                              ? rg.opportunity_ratio.toFixed(2)
                              : 0}
                            x
                          </strong>
                        </div>
                      </div>

                      {rg.related_artists_names && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-dim)",
                            paddingTop: "0.5rem",
                            borderTop: "1px solid var(--glass-border)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={rg.related_artists_names}
                        >
                          <span style={{ color: "var(--text-main)" }}>
                            Tocan a:
                          </span>{" "}
                          {rg.related_artists_names}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "ciudades" && (
            <div className="animate-fade-in">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <MapPin size={20} color="#ffb700" /> Oportunidades por
                    Ciudad
                  </h3>
                  <p
                    style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}
                  >
                    Ciudades con mayor oportunidad de crecimiento basadas en
                    artistas de tu cluster.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    Filtrar por país:
                  </span>
                  <select
                    value={selectedCitiesGapCountry}
                    onChange={(e) =>
                      setSelectedCitiesGapCountry(e.target.value)
                    }
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--text-main)",
                      border: "1px solid var(--glass-border)",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "var(--radius-sm)",
                      outline: "none",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value={0}>Global (Todos)</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.country_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isCitiesGapLoading ? (
                <div className="flex-center" style={{ height: "300px" }}>
                  <Loader2
                    className="loading-spinner"
                    size={32}
                    color="#ffb700"
                  />
                </div>
              ) : citiesGapData.length === 0 ? (
                <div
                  className="flex-center"
                  style={{ height: "200px", color: "var(--text-muted)" }}
                >
                  No se encontraron gaps de ciudades para este artista.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                  }}
                >
                  <CitiesGapMap data={citiesGapData} />

                  <div>
                    <h4
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        marginBottom: "1.2rem",
                        fontSize: "1.1rem",
                        color: "var(--text-main)",
                      }}
                    >
                      <Trophy size={18} color="#ffb700" /> Ciudades Gap Top 15
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {[...citiesGapData]
                        .sort(
                          (a, b) => b.opportunity_score - a.opportunity_score,
                        )
                        .slice(0, 15)
                        .map((city, idx) => {
                          const isPriority = city.priority_level === "priority";
                          const isMissing =
                            city.recommendation_type === "missing";
                          const isUnder =
                            city.recommendation_type === "underperforming";
                          const dotColor = isPriority
                            ? "#ff0055"
                            : isMissing
                              ? "#ffb700"
                              : isUnder
                                ? "#00f0ff"
                                : "#a29bfe";
                          const label = isPriority
                            ? "Priority"
                            : isMissing
                              ? "Missing"
                              : "Underperforming";

                          return (
                            <div
                              key={idx}
                              className="glass-panel"
                              style={{
                                padding: "1.2rem",
                                borderLeft: `3px solid ${dotColor}`,
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
                              >
                                <div>
                                  <h4
                                    style={{
                                      margin: 0,
                                      fontSize: "1.1rem",
                                      color: "var(--text-main)",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.4rem",
                                    }}
                                  >
                                    {city.city_name}{" "}
                                    <span
                                      style={{
                                        fontSize: "0.8rem",
                                        color: "var(--text-muted)",
                                      }}
                                    >
                                      {city.country_code}
                                    </span>
                                  </h4>
                                  <div
                                    style={{
                                      background: `${dotColor}22`,
                                      color: dotColor,
                                      padding: "0.2rem 0.6rem",
                                      borderRadius: "12px",
                                      fontSize: "0.7rem",
                                      fontWeight: "bold",
                                      display: "inline-block",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {label}
                                  </div>
                                </div>
                                <span
                                  style={{
                                    fontSize: "1.2rem",
                                    fontWeight: 900,
                                    color: "rgba(255,255,255,0.1)",
                                  }}
                                >
                                  #{idx + 1}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "0.5rem",
                                  marginTop: "1rem",
                                  background: "rgba(0,0,0,0.2)",
                                  padding: "0.8rem",
                                  borderRadius: "8px",
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.65rem",
                                      color: "var(--text-muted)",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Tus Listeners
                                  </div>
                                  <div
                                    style={{
                                      color: "white",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {Math.round(
                                      city.main_current_listeners,
                                    ).toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.65rem",
                                      color: "var(--text-muted)",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Prom. Similares
                                  </div>
                                  <div
                                    style={{
                                      color: "var(--accent-primary)",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {Math.round(
                                      city.related_avg_current_listeners,
                                    ).toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.65rem",
                                      color: "var(--text-muted)",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Gap Total
                                  </div>
                                  <div
                                    style={{
                                      color: dotColor,
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {Math.round(
                                      city.listeners_gap_vs_avg_related,
                                    ).toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.65rem",
                                      color: "var(--text-muted)",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    Score
                                  </div>
                                  <div
                                    style={{
                                      color: "#c084fc",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {Math.round(
                                      city.opportunity_score,
                                    ).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {city.related_artists_names && (
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-dim)",
                                    marginTop: "0.8rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={city.related_artists_names}
                                >
                                  <span style={{ color: "var(--text-muted)" }}>
                                    Destacan:
                                  </span>{" "}
                                  {city.related_artists_names}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "neuronal" && (
            <div>
              <h3 style={{ marginBottom: "1rem" }}>
                Comparativa de Audiencias (Cluster)
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                Los nodos representan la magnitud de la audiencia compartida y
                conexiones artísticas.
              </p>
              <NeuronalGraph artistId={artist.id} />
            </div>
          )}

          {activeTab === "sunburst" && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: "1rem" }}>
                Jerarquía Auditiva (Sunburst)
              </h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                Explora ramificaciones de descubrimiento radial proporcional al
                volumen masivo de Listeners.
              </p>
              <SunburstGraph artistId={artist.id} />
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Modal — renders on top of this modal */}
      <RecommendationsModal
        isOpen={showRecommendations}
        onClose={() => setShowRecommendations(false)}
        songName={artist?.songName}
        songImage={artist?.imageUrl || artist?.img || artist?.avatar}
        csSong={artist?.cs_song || artist?.csSong}
        spotifyId={artist?.spotifyid}
      />

      {/* Top Artist Report Modal */}
      {showTopArtistReport && (
        <ArtistContextModal
          artist={{
            ...artist,
            name: artist.name,
            image_url: artist.imageUrl,
            spotify_id: artist.spotifyid || artist.id,
          }}
          onClose={() => setShowTopArtistReport(false)}
        />
      )}
    </div>
  );
};

export default ArtistDetailsModal;
