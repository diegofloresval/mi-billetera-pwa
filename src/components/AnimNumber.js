import { useState, useEffect, useRef } from "react";
import { fmt } from "../helpers";

export function AnimNumber({ value, style }) {
  const [disp, setDisp] = useState(value);
  const dispRef = useRef(value);
  const rafRef = useRef(null);
  useEffect(() => {
    const s = dispRef.current, e = value, dur = 700, t0 = performance.now();
    const step = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      const next = Math.round(s + (e - s) * (1 - Math.pow(1 - t, 4)));
      dispRef.current = next;
      setDisp(next);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [value]);
  return <span style={style}>{fmt(disp)}</span>;
}
