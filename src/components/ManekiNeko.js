export function ManekiNeko({ size = 24, variant, style }) {
  const v = variant || (size <= 32 ? "icon" : size <= 96 ? "mid" : "hero");
  const src =
    v === "hero" ? "/maneki-hero.png" : v === "mid" ? "/maneki.png" : "/maneki-icon.png";
  return (
    <img
      src={`${process.env.PUBLIC_URL}${src}`}
      alt=""
      width={size}
      height={size}
      style={{ display: "block", objectFit: "contain", flexShrink: 0, ...style }}
      draggable={false}
    />
  );
}
