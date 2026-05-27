/**
 * Utilidades de SEO y enrutamiento para mapear filtros de la base de datos a slugs legibles de URL.
 * Aquí puedes cambiar o renombrar manualmente los nombres y slugs de las vistas y filtros.
 */

// Función estándar para normalizar texto a slugs de URL (ej. "Música Pop" -> "musica-pop")
export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos y tildes
    .replace(/[^a-z0-9]+/g, '-')     // Reemplaza caracteres no alfanuméricos por guiones
    .replace(/(^-|-$)+/g, '');       // Remueve guiones al inicio y al final
};

// ─── 1. MAPAS DE VISTAS (activeView) ─────────────────────────────────────────
// Aquí puedes renombrar los slugs que aparecerán en la URL para cada sección
export const VIEW_TO_SLUG = {
  'Charts': 'charts',
  'DigitalHitsForRadio': 'hits-radio',
  'Platforms': 'plataformas',
  'Artists': 'artistas',
  'HeavyHitters': 'heavy-hitters',
  'CuratorPicks': 'curator-picks',
  'TiktokerPicks': 'tiktoker-picks',
};

// Mapeo inverso para resolver la vista interna desde el slug de la URL
export const VIEW_SLUG_MAP = {
  'charts': 'Charts',
  'hits-radio': 'DigitalHitsForRadio',
  'plataformas': 'Platforms',
  'artistas': 'Artists',
  'heavy-hitters': 'HeavyHitters',
  'curator-picks': 'CuratorPicks',
  'tiktoker-picks': 'TiktokerPicks',
};

// ─── 2. CONFIGURACIONES DE PERSONALIZACIÓN MANUAL ───────────────────────────
// Si deseas renombrar un filtro específico de manera manual para mejorar el SEO,
// agrégalo a los siguientes diccionarios usando su ID numérico como llave.
//
// Ejemplo: 1: 'charts-de-colombia'
export const CUSTOM_COUNTRY_SLUGS = {
  // Agrega tus modificaciones manuales aquí:
  // [id_del_pais]: 'slug-seo-deseado',
};

// Ejemplo: 10: 'pop-urbano-y-reggaeton'
export const CUSTOM_GENRE_SLUGS = {
  // Agrega tus modificaciones manuales aquí:
  // [id_del_genero]: 'slug-seo-deseado',
};

// Ejemplo: 152: 'cdmx'
export const CUSTOM_CITY_SLUGS = {
  // Agrega tus modificaciones manuales aquí:
  // [id_de_la_ciudad]: 'slug-seo-deseado',
};


// ─── 3. MÉTODOS DE CONVERSIÓN DE ID A SLUG ───────────────────────────────────

export const getCountrySlug = (countryId, countriesList = []) => {
  const cleanId = String(countryId);
  if (cleanId === '0' || cleanId === 'All') return 'global';

  // Buscar si hay personalización manual por ID
  if (CUSTOM_COUNTRY_SLUGS[cleanId]) {
    return CUSTOM_COUNTRY_SLUGS[cleanId];
  }

  // Buscar en la lista de la API y slugificar el nombre
  const country = countriesList.find(c => String(c.id) === cleanId);
  return country ? slugify(country.country_name) : 'global';
};

export const getGenreSlug = (genreId, genresList = []) => {
  const cleanId = String(genreId);
  if (cleanId === '0' || cleanId === 'All') return 'todos';

  if (CUSTOM_GENRE_SLUGS[cleanId]) {
    return CUSTOM_GENRE_SLUGS[cleanId];
  }

  const genre = genresList.find(g => String(g.id) === cleanId);
  return genre ? slugify(genre.format) : 'todos';
};

export const getCitySlug = (cityId, citiesList = []) => {
  const cleanId = String(cityId);
  if (cleanId === '0' || cleanId === 'All') return 'todas';

  if (CUSTOM_CITY_SLUGS[cleanId]) {
    return CUSTOM_CITY_SLUGS[cleanId];
  }

  const city = citiesList.find(c => String(c.id) === cleanId);
  return city ? slugify(city.city_name) : 'todas';
};


// ─── 4. MÉTODOS DE CONVERSIÓN DE SLUG A ID ───────────────────────────────────

export const getCountryIdFromSlug = (slug, countriesList = []) => {
  if (!slug || slug === 'global') return '0';

  // Buscar primero en la personalización manual
  const customId = Object.keys(CUSTOM_COUNTRY_SLUGS).find(
    key => CUSTOM_COUNTRY_SLUGS[key] === slug
  );
  if (customId) return customId;

  // Buscar en la lista dinámica de la API
  const country = countriesList.find(c => slugify(c.country_name) === slug);
  return country ? String(country.id) : undefined;
};

export const getGenreIdFromSlug = (slug, genresList = []) => {
  if (!slug || slug === 'todos') return '0';

  const customId = Object.keys(CUSTOM_GENRE_SLUGS).find(
    key => CUSTOM_GENRE_SLUGS[key] === slug
  );
  if (customId) return customId;

  const genre = genresList.find(g => slugify(g.format) === slug);
  return genre ? String(genre.id) : undefined;
};

export const getCityIdFromSlug = (slug, citiesList = []) => {
  if (!slug || slug === 'todas') return '0';

  const customId = Object.keys(CUSTOM_CITY_SLUGS).find(
    key => CUSTOM_CITY_SLUGS[key] === slug
  );
  if (customId) return customId;

  const city = citiesList.find(c => slugify(c.city_name) === slug);
  return city ? String(city.id) : undefined;
};
