"use client";

import AuthButtons from
  "../components/AuthButtons";

import MiniGame from
  "../components/MiniGame";

import MainTabs from
  "../components/MainTabs";

import {
  useAuth
} from "../context/AuthContext";

import {
  useUI
} from "../context/UIContext";

import { useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const { UIState, setUIState } = useUI();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main style={{ padding: 0, margin: 0 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.5rem 2rem",
          backgroundColor: "#222",
          color: "#fff",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div>
          <AuthButtons user={user} />
        </div>
        <h1 style={{ margin: 0 }}>Brainrot Academy (WIP)</h1>
      </header>

      <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <MiniGame user={user} />

        <MainTabs 
          user={user}
          UIState = {UIState}
          setUIState = {setUIState}
        />
      </div>
    </main>
  );
}