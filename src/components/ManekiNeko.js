import { C } from "../constants";

export function ManekiNeko({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <ellipse cx="32" cy="56" rx="20" ry="4" fill={C.ink} opacity="0.08" />
      <path
        d="M14 30c0-9 8-16 18-16s18 7 18 16v14c0 4-3 7-7 7H21c-4 0-7-3-7-7V30z"
        fill={C.hoja}
      />
      <path
        d="M22 36c0-6 5-10 10-10s10 4 10 10v8c0 2-2 4-4 4H26c-2 0-4-2-4-4v-8z"
        fill={C.mentaSoft}
      />
      <path d="M18 16l-3-7 9 4z" fill={C.hoja} />
      <path d="M46 16l3-7-9 4z" fill={C.hoja} />
      <path d="M20 13l-1.5-3.5 4.5 2z" fill={C.coral} />
      <path d="M44 13l1.5-3.5-4.5 2z" fill={C.coral} />
      <path
        d="M48 28c4 0 7 3 7 7s-3 7-7 7"
        fill={C.hoja}
        stroke={C.hoja}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="30" r="2.5" fill={C.esmeralda} />
      <rect x="22" y="42" width="20" height="4" rx="2" fill={C.coral} />
      <circle cx="32" cy="46" r="2" fill={C.esmeralda} />
      <circle cx="25" cy="30" r="2" fill={C.ink} />
      <circle cx="39" cy="30" r="2" fill={C.ink} />
      <path
        d="M30 35q2 1.5 4 0"
        stroke={C.ink}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="18" y1="32" x2="22" y2="32.5" stroke={C.ink} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="18" y1="34" x2="22" y2="34" stroke={C.ink} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="42" y1="32.5" x2="46" y2="32" stroke={C.ink} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="42" y1="34" x2="46" y2="34" stroke={C.ink} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}
