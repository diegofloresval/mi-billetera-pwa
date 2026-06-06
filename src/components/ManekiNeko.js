export function ManekiNeko({ size = 24, style }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      <img
        src={`${process.env.PUBLIC_URL}/ahorro.png`}
        alt=""
        width={size}
        height={size}
        style={{
          display: "block",
          objectFit: "contain",
          transform: "scale(1.85)",
          transformOrigin: "center 58%",
        }}
        draggable={false}
      />
    </span>
  );
}
