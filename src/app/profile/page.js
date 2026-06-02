"use client";

import Profile from
  "../../components/Profile.js";

import {
  useAuth
} from "../../context/AuthContext.js";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <p>
        Please log in.
      </p>
    );
  }

  return (
    <main
      style={{
        padding: "2rem",
      }}
    >
      <h1>Profile</h1>

      <Profile user={user} />
    </main>
  );
}