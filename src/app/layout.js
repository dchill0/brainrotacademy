import ClientProviders from "../components/ClientProviders";

import "./globals.css"

export const metadata = {
  title: "Mastery Platform",
};

export default function RootLayout({
  children,
}) {
  return (
    <html>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}