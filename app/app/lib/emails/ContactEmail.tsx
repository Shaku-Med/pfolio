import type { CSSProperties } from "react";

export type ContactEmailProps = {
  name: string;
  email: string;
  message: string;
};

export function ContactEmail({ name, email, message }: ContactEmailProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`New message from ${name}`}</title>
      </head>
      <body style={main}>
        <div style={preview}>New message from {name} via your portfolio</div>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={container}>
          <tbody>
            <tr>
              <td style={topBar} />
            </tr>
            <tr>
              <td style={content}>
                <h1 style={title}>Contact form submission</h1>
                <p style={meta}>From your portfolio</p>

                <p style={label}>Name</p>
                <p style={value}>{name}</p>

                <p style={label}>Email</p>
                <p style={value}>
                  <a href={`mailto:${email}`} style={link}>
                    {email}
                  </a>
                </p>

                <p style={label}>Message</p>
                <p style={messageText}>{message}</p>
              </td>
            </tr>
            <tr>
              <td style={footer}>
                <p style={footerText}>Portfolio contact form</p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

const main: CSSProperties = {
  margin: 0,
  padding: 0,
  width: "100%",
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  fontSize: "16px",
  color: "#111111",
};

const preview: CSSProperties = {
  display: "none",
  overflow: "hidden",
  maxHeight: 0,
  opacity: 0,
};

const container: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const topBar: CSSProperties = {
  height: "4px",
  backgroundColor: "#111111",
  fontSize: 0,
  lineHeight: 0,
};

const content: CSSProperties = {
  padding: "40px 24px 48px",
};

const title: CSSProperties = {
  margin: "0 0 4px",
  fontSize: "22px",
  fontWeight: 600,
  color: "#111111",
  letterSpacing: "-0.01em",
};

const meta: CSSProperties = {
  margin: "0 0 32px",
  fontSize: "14px",
  color: "#666666",
};

const label: CSSProperties = {
  margin: "0 0 6px",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#666666",
};

const value: CSSProperties = {
  margin: "0 0 24px",
  fontSize: "16px",
  lineHeight: 1.5,
  color: "#111111",
};

const link: CSSProperties = {
  color: "#111111",
  textDecoration: "underline",
};

const messageText: CSSProperties = {
  margin: 0,
  fontSize: "16px",
  lineHeight: 1.6,
  color: "#333333",
  whiteSpace: "pre-wrap",
};

const footer: CSSProperties = {
  padding: "24px 24px 32px",
  borderTop: "1px solid #eeeeee",
};

const footerText: CSSProperties = {
  margin: 0,
  fontSize: "12px",
  color: "#888888",
};
