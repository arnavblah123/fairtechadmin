"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24, textAlign: "center" }}>
        <h2>Fairtech Owner could not load</h2>
        <p style={{ color: "#475569" }}>{error.digest ? `Reference ${error.digest}. ` : ""}Reload, or open /api/health to see what is wrong.</p>
        <button onClick={() => reset()} style={{ padding: "8px 16px", borderRadius: 8, background: "#0f172a", color: "#fff", border: 0 }}>
          Reload
        </button>
      </body>
    </html>
  );
}
