export const COUNTRIES = ['México', 'USA', 'Colombia', 'Dominicana'];
export const GENRES = ['Reggaeton', 'Regional Mexicano', 'Pop', 'Trap', 'Salsa', 'Bachata'];

const ARTISTS = {
  1: { id: 1, name: 'Bad Bunny', imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb9e2b109b32af2e99edae4de5', monthlyListeners: 65000000, followers: 80000000 },
  2: { id: 2, name: 'Peso Pluma', imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebfc9d2abc85b6f4bef77f82dc', monthlyListeners: 50000000, followers: 20000000 },
  3: { id: 3, name: 'Karol G', imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebf1110e54d6af801ad47a61d1', monthlyListeners: 48000000, followers: 45000000 },
  4: { id: 4, name: 'Feid', imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebc1fbf29f52fbed1fa017e82b', monthlyListeners: 42000000, followers: 15000000 },
  5: { id: 5, name: 'Shakira', imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb66bb4f81014cccefcbc4f25b', monthlyListeners: 60000000, followers: 75000000 },
  6: { id: 6, name: 'Grupo Frontera', imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb4f3aa79685a210787e9c3e9a', monthlyListeners: 35000000, followers: 8000000 },
  7: { id: 7, name: 'Rauw Alejandro', imageUrl: 'https://i.scdn.co/image/ab6761610000e5ebed66d9c6ca10ee802875c7b3', monthlyListeners: 39000000, followers: 18000000 },
};

// Nodes for the Neuronal graph
export const GRAPH_NODES = [
  ...Object.values(ARTISTS).map(a => ({ id: a.id, name: a.name, val: Math.max(10, a.monthlyListeners / 1000000), img: a.imageUrl, group: 1 })),
  // Add some secondary nodes for connection
  { id: 101, name: 'J Balvin', val: 35, img: 'https://i.scdn.co/image/ab6761610000e5eb1d2ea4394c8b6d8122ce22ab', group: 2 },
  { id: 102, name: 'Aventura', val: 28, img: 'https://i.scdn.co/image/ab6761610000e5eb3e85fe3cdad2d61314d79da9', group: 2 },
  { id: 103, name: 'Natanael Cano', val: 25, img: 'https://i.scdn.co/image/ab6761610000e5eba08092a43cfad0ee2ba8ef66', group: 2 },
];

export const GRAPH_LINKS = [
  { source: 1, target: 7, value: 8 },
  { source: 1, target: 3, value: 5 },
  { source: 1, target: 101, value: 4 },
  { source: 2, target: 6, value: 9 },
  { source: 2, target: 103, value: 7 },
  { source: 3, target: 4, value: 8 },
  { source: 3, target: 5, value: 6 },
  { source: 5, target: 101, value: 3 },
  { source: 6, target: 103, value: 4 },
];

// Calculated dummy scores (Spotify*1 + YouTube*0.8 + Shazam*0.5 + Apple*0.7)
export const SONGS = [
  { id: 101, title: 'MONACO', artist: ARTISTS[1], country: 'México', genre: 'Trap', spotify: 120, youtube: 95, shazam: 10, apple: 80 },
  { id: 102, title: 'ELLA BAILA SOLA', artist: ARTISTS[2], country: 'México', genre: 'Regional Mexicano', spotify: 150, youtube: 130, shazam: 15, apple: 90 },
  { id: 103, title: 'PROVENZA', artist: ARTISTS[3], country: 'Colombia', genre: 'Reggaeton', spotify: 90, youtube: 110, shazam: 8, apple: 70 },
  { id: 104, title: 'LUNA', artist: ARTISTS[4], country: 'Colombia', genre: 'Reggaeton', spotify: 110, youtube: 80, shazam: 12, apple: 85 },
  { id: 105, title: 'un x100to', artist: ARTISTS[6], country: 'USA', genre: 'Regional Mexicano', spotify: 140, youtube: 150, shazam: 20, apple: 95 },
  { id: 106, title: 'TQG', artist: ARTISTS[3], country: 'Dominicana', genre: 'Reggaeton', spotify: 130, youtube: 160, shazam: 18, apple: 100 },
  { id: 107, title: 'PERRO NEGRO', artist: ARTISTS[1], country: 'Colombia', genre: 'Reggaeton', spotify: 125, youtube: 85, shazam: 14, apple: 88 },
  { id: 108, title: 'Acróstico', artist: ARTISTS[5], country: 'USA', genre: 'Pop', spotify: 70, youtube: 120, shazam: 5, apple: 60 },
  { id: 109, title: 'Tulum', artist: ARTISTS[2], country: 'México', genre: 'Regional Mexicano', spotify: 115, youtube: 90, shazam: 11, apple: 75 },
];

export const ARTIST_DETAILS = {
  1: {
    recommendedPlaylists: ['Mansión Reggaetón', 'Viva Latino', 'Trap Land'],
    tiktokers: ['@charlidamelio (3M uses)', '@domelipa (1.5M uses)'],
    radioGaps: ['Los 40 México (Plays: J Balvin, not Bad Bunny)', 'Mega 97.9 NY (Plays: Anuel, not Bad Bunny)'],
  },
  2: {
    recommendedPlaylists: ['Corridos Perrones', 'Regional Mexicano', 'La Reina'],
    tiktokers: ['@elrodcontreras (2M uses)', '@montpantoja (1M uses)'],
    radioGaps: ['La KeBuena (Plays: Natanael Cano, not Peso Pluma)', 'Radio Lazer (Plays: Eslabon Armado)'],
  },
  // Default values for others
  default: {
    recommendedPlaylists: ['Latino Hits', 'Viral 50', 'Pop Latino'],
    tiktokers: ['@tiktok_star1 (500k uses)', '@dancer_pro (200k uses)'],
    radioGaps: [
      'Exa FM 104.9',
      'Los 40 Colombia',
      'La Mega PR'
    ],
    expandedStats: {
      "likes_total_tiktok":4576104006, "streams_total":13849002173, "videos_total_youtube":563, "followers_total_instagram":4512, "playlists":39154, "views_total_tiktok":56343731366, "short_views_total_youtube":4283898491, "followers_total_tiktok":32980035, "shares_total_tiktok":146319406, "followers_total_twitter":0, "comments_total_tiktok":31869389, "shorts_total_youtube":37351, "fk_artist":42, "video_views_total_youtube":6837086028, "monthly_listeners":32564513, "playlist_reach":336631431, "popularity":81, "video_likes_total_youtube":51589548, "engagement_rate_tiktok":8.4, "Id":568, "followers_total":9474831, "subscribers_total_youtube":12124273, "followers_total_facebook":0, "videos_total_tiktok":7670279
    },
    mapData: [
      {"city_lat":34.054909,"current_listeners":227525,"city_name":"Los Angeles","peak_listeners":301678,"rk":1,"city_lng":-118.24265},
      {"city_lat":40.712776,"current_listeners":190974,"city_name":"New York","peak_listeners":310933,"rk":2,"city_lng":-74.005974},
      {"city_lat":41.878113,"current_listeners":171066,"city_name":"Chicago","peak_listeners":226052,"rk":3,"city_lng":-87.629799},
      {"city_lat":40.650101,"current_listeners":146655,"city_name":"Brooklyn","peak_listeners":227840,"rk":4,"city_lng":-73.9496},
      {"city_lat":25.761681,"current_listeners":145798,"city_name":"Miami","peak_listeners":185326,"rk":5,"city_lng":-80.191788},
      {"city_lat":29.760427,"current_listeners":144538,"city_name":"Houston","peak_listeners":183578,"rk":6,"city_lng":-95.369804},
      {"city_lat":32.776665,"current_listeners":136713,"city_name":"Dallas","peak_listeners":170074,"rk":7,"city_lng":-96.796989}
    ]
  }
};

export const getArtistDetails = (id) => ARTIST_DETAILS[id] || ARTIST_DETAILS.default;
