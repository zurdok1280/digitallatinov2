const fs = require('fs');
let content = fs.readFileSync('src/services/api.js', 'utf8');

const replacement = `const mapCuratorToContact = (c) => ({
  id: c.contactId,
  type: 'curators',
  name: c.displayName || '',
  handle: c.email ? \`@\${c.email.split('@')[0]}\` : '',
  metric: c.playlists ? \`\${c.playlists.length} Playlist\${c.playlists.length !== 1 ? 's' : ''}\` : '0 Playlists',
  email: c.email || '',
  phone: c.phone || '',
  country: c.country || '',
  language: c.language || '',
  status: c.contactStatus || 'nuevo',
  lastContact: null,
  notes: '',
  instagram: {
    handle: c.instagramUser || '',
    url: c.instagramUrl || '',
  },
  facebook: { handle: '', url: '' },
  tiktok: {
    handle: c.tiktokUser || '',
    url: c.tiktokUrl || '',
  },
  youtube: { handle: '', url: c.youtubeUrl || '' },
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
  metric: t.followersCount ? \`\${(t.followersCount / 1000).toFixed(0)}K Followers\` : '—',
  email: t.email || '',
  phone: t.phone || '',
  country: t.country || '',
  language: t.language || '',
  status: t.contactStatus || 'nuevo',
  lastContact: null,
  notes: '',
  instagram: {
    handle: t.instagramUser || '',
    url: t.instagramUrl || '',
  },
  facebook: { handle: '', url: '' },
  tiktok: {
    handle: t.tiktokUser || t.userHandle || '',
    url: t.tiktokUrl || '',
  },
  youtube: { handle: '', url: t.youtubeUrl || '' },
});`;

content = content.replace(/const mapCuratorToContact = \([\s\S]*?\}\);\s*\/\*\*[\s\S]*?\*\/\s*const mapTikTokerToContact = \([\s\S]*?\}\);/g, replacement);
// If it was botched and mapTikTokerToContact is missing:
content = content.replace(/const mapCuratorToContact = \([\s\S]*?\}\);(?![\s\S]*?const mapTikTokerToContact)/g, replacement);

fs.writeFileSync('src/services/api.js', content);
