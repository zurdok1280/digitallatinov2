const fs = require('fs');
let c = fs.readFileSync('src/services/api.js', 'utf8');

// Find the index of "export const createCurator"
const splitIdx = c.indexOf('export const createCurator');
if (splitIdx !== -1) {
    c = c.substring(0, splitIdx);
}

const replacement = `export const createCurator = async (contact) => {
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
    playlists: [],
  };
  const response = await authFetch(\`\${API_BASE_URL}/contacts/curators\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
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
    followersCount: isNaN(followersRaw) ? 0 : followersRaw,
    userName: contact.name,
    userHandle: contact.handle,
  };
  const response = await authFetch(\`\${API_BASE_URL}/contacts/tiktokers\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
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
    playlists: contact.playlists || [],
  };
  const response = await authFetch(\`\${API_BASE_URL}/contacts/curators/\${id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
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
    followersCount: isNaN(followersRaw) ? 0 : followersRaw,
    userName: contact.name,
    userHandle: contact.handle,
  };
  const response = await authFetch(\`\${API_BASE_URL}/contacts/tiktokers/\${id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
  return response.json();
};
// ─────────────────────────────────────────────────────────────────────────────
`;

fs.writeFileSync('src/services/api.js', c + replacement);
