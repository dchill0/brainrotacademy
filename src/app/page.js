"use client";

import Link from "next/link";

import AuthButtons from
  "../components/AuthButtons";

import MiniGame from
  "../components/MiniGame";

import MainTabs from
  "../components/MainTabs";

import {
  useAuth
} from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <main
      style={{
        padding: "2rem",
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        Brainrot Academy
      </h1>

      {user ? (
        <Link href="/profile">
          <button>
            Profile
          </button>
        </Link>
      ) : (
        <AuthButtons />
      )}

      <hr />

      <MiniGame
        user={user}
      />

      <hr />

      <MainTabs
        user={user}
      />
    </main>
  );
}