import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export type ContactEmailProps = {
  name: string;
  email: string;
  message: string;
};

export function ContactEmail({ name, email, message }: ContactEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New message from {name} via your portfolio</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={topBar} />
          <Section style={content}>
            <Heading style={title}>Contact form submission</Heading>
            <Text style={meta}>From your portfolio</Text>

            <Text style={label}>Name</Text>
            <Text style={value}>{name}</Text>

            <Text style={label}>Email</Text>
            <Link href={`mailto:${email}`} style={link}>
              {email}
            </Link>

            <Text style={label}>Message</Text>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>Portfolio contact form</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  margin: 0,
  padding: 0,
  width: "100%",
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  fontSize: "16px",
  color: "#111111",
};

const container: React.CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  padding: 0,
};

const topBar: React.CSSProperties = {
  width: "100%",
  height: "4px",
  backgroundColor: "#111111",
  margin: 0,
  padding: 0,
};

const content: React.CSSProperties = {
  width: "100%",
  padding: "40px 24px 48px",
  maxWidth: "100%",
};

const title: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: "22px",
  fontWeight: 600,
  color: "#111111",
  letterSpacing: "-0.01em",
};

const meta: React.CSSProperties = {
  margin: "0 0 32px",
  fontSize: "14px",
  color: "#666666",
};

const label: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  color: "#666666",
};

const value: React.CSSProperties = {
  margin: "0 0 24px",
  fontSize: "16px",
  lineHeight: 1.5,
  color: "#111111",
};

const link: React.CSSProperties = {
  display: "inline-block",
  margin: "0 0 24px",
  fontSize: "16px",
  color: "#111111",
  textDecoration: "underline",
};

const messageText: React.CSSProperties = {
  margin: 0,
  fontSize: "16px",
  lineHeight: 1.6,
  color: "#333333",
  whiteSpace: "pre-wrap" as const,
};

const footer: React.CSSProperties = {
  width: "100%",
  padding: "24px 24px 32px",
  borderTop: "1px solid #eeeeee",
};

const footerText: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  color: "#888888",
};
