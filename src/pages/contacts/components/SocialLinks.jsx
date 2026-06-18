import React from "react";

const PLATFORM_LABELS = {
  instagram: "IG",
  facebook: "FB",
  tiktok: "TK",
  youtube: "YT",
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
            >
              {PLATFORM_LABELS[platform]}
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
          <div key={platform} className="contacts-drawer-field">
            <span className="contacts-drawer-field-label" style={{ textTransform: "capitalize" }}>
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
