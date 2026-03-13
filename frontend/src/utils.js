export function genSpark() {
  const d = [];
  let v = 5 + Math.random() * 15;
  for (let i = 0; i < 8; i++) {
    v = Math.max(0, v + (Math.random() - 0.45) * 8);
    d.push(Math.round(v));
  }
  return d;
}

export function fmt(n) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : n;
}

export function ago(d) {
  if (!d) return "\u2014";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function langColor(l) {
  return (
    {
      Python: "#3572A5",
      JavaScript: "#F1E05A",
      TypeScript: "#3178C6",
      Rust: "#DEA584",
      Go: "#00ADD8",
      Java: "#B07219",
    }[l] || "#A8A29E"
  );
}
