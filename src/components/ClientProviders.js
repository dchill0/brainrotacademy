"use client";

import { AuthProvider } from "../context/AuthContext";

import { UIProvider } from "../context/UIContext";

export default function ClientProviders({ children }) {
  return <AuthProvider><UIProvider>{children}</UIProvider></AuthProvider>;
}