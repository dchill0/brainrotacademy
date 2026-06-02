import {
  AuthProvider
} from "../context/AuthContext";

export const metadata = {
  title: "Mastery Platform",
};

export default function RootLayout({
  children,
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}