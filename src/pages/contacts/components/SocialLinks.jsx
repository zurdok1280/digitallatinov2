import React from "react";

const PLATFORM_ICONS = {
  instagram: "/logos/instagram-icon.svg",
  facebook: "/logos/facebook-icon.svg",
  tiktok: "/logos/tiktok-icon.png",
  youtube: "/logos/youtube-icon.svg",
};

const SocialLinks = ({ contact, variant = "icons" }) => {
  const platforms = ["instagram", "facebook", "tiktok", "youtube"];

  if (variant === "icons") {
    // Compact icon row for the table
    return (
      <div className="social-links-row">
        {platforms.map((platform) => {
          const social = contact[platform];
          if (!social?.url) return null;
          return (
            <a
              key={platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`social-link-icon social-link-icon--${platform}`}
              title={social.handle || platform}
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img src={PLATFORM_ICONS[platform]} alt={platform} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            </a>
          );
        })}
      </div>
    );
  }

  // Full list for the Drawer
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {platforms.map((platform) => {
        const social = contact[platform];
        if (!social?.url && !social?.handle) return null;
        return (
          <div key={platform} className="contacts-drawer-field" style={{ alignItems: "center" }}>
            <span className="contacts-drawer-field-label" style={{ textTransform: "capitalize", display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <img src={PLATFORM_ICONS[platform]} alt={platform} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
              {platform}
            </span>
            <div className="contacts-drawer-field-value">
              {social?.url ? (
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#38bdf8", textDecoration: "none", fontSize: "0.85rem" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {social.handle || social.url}
                </a>
              ) : (
                <span style={{ color: "#6b7280" }}>{social.handle || "—"}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SocialLinks;
