export function Icon({ name, size = 22, filled = false, weight = 500, color, style }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        lineHeight: 1,
        color,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
        userSelect: "none",
        ...style,
      }}
    >
      {name}
    </span>
  );
}
