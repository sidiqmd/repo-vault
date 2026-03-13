import { useTheme } from "../../ThemeContext";

export default function Spark({ data, w = 48, h = 14 }) {
  const T = useTheme();
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const len = Math.max(data.length - 1, 1);
  const pts = data
    .map((v, i) => `${(i / len) * w},${h - (v / max) * h}`)
    .join(" ");
  const t = data[data.length - 1] - data[0];
  const c = t > 2 ? T.sparkUp : t < -2 ? T.sparkDown : T.sparkFlat;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
