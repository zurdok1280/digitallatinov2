export default function ToggleSwitch({ checked, onChange, labelOff, labelOn }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        display: "flex", alignItems: "center", gap: "0.6rem",
        background: "transparent", border: "none", cursor: "pointer",
        color: checked ? "var(--text-main)" : "var(--text-muted)",
        fontSize: "0.82rem", padding: "0.4rem 0",
        transition: "color 0.2s"
      }}
    >
      <span>{checked ? labelOn : labelOff}</span>
      {/* Pill */}
      <div style={{
        width: 40, height: 22, borderRadius: 11, flexShrink: 0,
        background: checked ? "var(--accent, #8a88ff)" : "rgba(255,255,255,0.1)",
        border: "1px solid var(--glass-border)", position: "relative",
        transition: "background 0.25s"
      }}>
        {/* Thumb */}
        <div style={{
          position: "absolute", top: 2,
          left: checked ? 20 : 2,
          width: 16, height: 16, borderRadius: "50%",
          background: "white", transition: "left 0.25s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)"
        }} />
      </div>
    </button>
  );
}
