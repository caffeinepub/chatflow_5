import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const btnStyle: React.CSSProperties = {
  background: "oklch(0.52 0.22 240)",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  padding: "12px 32px",
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
  width: "100%",
  transition: "opacity 0.15s",
};

function setOpacity(e: React.SyntheticEvent<HTMLButtonElement>, val: string) {
  e.currentTarget.style.opacity = val;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ChatFlow ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            padding: "24px",
          }}
          data-ocid="error_boundary.panel"
        >
          <div
            style={{
              background: "#111111",
              border: "1px solid #222222",
              borderRadius: "16px",
              padding: "40px 32px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "oklch(0.52 0.22 240)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: "28px",
              }}
            >
              💬
            </div>

            <h1
              style={{
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: 700,
                margin: "0 0 8px",
              }}
            >
              ChatFlow
            </h1>

            <p
              style={{
                color: "#888888",
                fontSize: "14px",
                margin: "0 0 28px",
                lineHeight: 1.6,
              }}
            >
              Something went wrong. Tap reload to recover.
            </p>

            {this.state.error?.message && (
              <div
                style={{
                  background: "#1a0a0a",
                  border: "1px solid #3a1a1a",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "24px",
                  textAlign: "left",
                }}
                data-ocid="error_boundary.error_state"
              >
                <code
                  style={{
                    color: "#ff6b6b",
                    fontSize: "12px",
                    wordBreak: "break-all",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              type="button"
              onClick={() => window.location.reload()}
              style={btnStyle}
              onMouseOver={(e) => setOpacity(e, "0.85")}
              onFocus={(e) => setOpacity(e, "0.85")}
              onMouseOut={(e) => setOpacity(e, "1")}
              onBlur={(e) => setOpacity(e, "1")}
              data-ocid="error_boundary.primary_button"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
