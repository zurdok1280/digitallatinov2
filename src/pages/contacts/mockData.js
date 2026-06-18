// mockData.js — Static mock data for Contacts Directory
// Preserves existing flat social structure (Agents 3/4 pending API)

const COUNTRIES = ["México", "Colombia", "España", "Argentina", "Chile", "Peru", "Venezuela"];
const LANGUAGES = ["Español", "English", "Português"];
const CRM_STATUSES = ["nuevo", "contactado", "respondio", "negociando", "confirmado", "descartado"];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateContacts = (type, count) => {
  return Array.from({ length: count }, (_, i) => {
    const id = i + 1;
    const status = rand(CRM_STATUSES);
    const isContacted = !["nuevo"].includes(status);
    const name = type === "curators" ? `Curator ${id}` : `TikToker ${id}`;
    const handle = `@${type === "curators" ? "curator" : "tiktoker"}_${id}`;

    return {
      id,
      type,
      name,
      handle,
      metric: type === "curators"
        ? `${randInt(1, 20)} Playlists`
        : `${randInt(10, 950)}K Followers`,
      email: `${type}${id}@example.com`,
      phone: `+52 55 ${randInt(1000, 9999)} ${randInt(1000, 9999)}`,
      instagram: {
        handle: `@ig_${type}_${id}`,
        url: `https://instagram.com/ig_${type}_${id}`,
      },
      facebook: {
        handle: `FB ${name}`,
        url: `https://facebook.com/fb_${type}_${id}`,
      },
      tiktok: {
        handle: `@tk_${type}_${id}`,
        url: `https://tiktok.com/@tk_${type}_${id}`,
      },
      youtube: {
        handle: `Channel ${id}`,
        url: `https://youtube.com/c/channel_${type}_${id}`,
      },
      country: rand(COUNTRIES),
      language: rand(LANGUAGES),
      status,
      lastContact: isContacted ? `2026-06-${String(randInt(1, 18)).padStart(2, "0")}` : null,
      notes: isContacted ? "Primer contacto realizado. Pendiente de respuesta." : "",
    };
  });
};

export const INITIAL_CURATORS  = generateContacts("curators",  10);
export const INITIAL_TIKTOKERS = generateContacts("tiktokers", 10);

export const CRM_STATUS_LABELS = {
  nuevo:       "Nuevo",
  contactado:  "Contactado",
  respondio:   "Respondió",
  negociando:  "Negociando",
  confirmado:  "Confirmado",
  descartado:  "Descartado",
};

export const EMPTY_CONTACT = {
  name: "", handle: "", metric: "", email: "", phone: "",
  instagram: { handle: "", url: "" },
  facebook:  { handle: "", url: "" },
  tiktok:    { handle: "", url: "" },
  youtube:   { handle: "", url: "" },
  country: "", language: "", status: "nuevo", lastContact: "", notes: "",
};
