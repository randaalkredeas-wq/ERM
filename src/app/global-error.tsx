"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          background: "#0e0a1f",
          color: "#ede9fe",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            A critical error occurred
          </h1>
          <p
            style={{
              marginTop: "0.5rem",
              color: "#9b93b8",
              fontSize: "0.875rem",
            }}
          >
            The application failed to load. Please try again.
          </p>
        </div>
        <button
          onClick={reset}
          style={{
            background: "#a78bfa",
            color: "#1e1338",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.625rem 1.25rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
