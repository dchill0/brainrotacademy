"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import { signOut } from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../firebase";

export default function Profile({
  user,
}) {
  const [points, setPoints] =
    useState(0);

  useEffect(() => {
    async function load() {
      const ref = doc(
        db,
        "users",
        user.uid
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {
        setPoints(
          snap.data()
            .masteryPoints || 0
        );
      }
    }

    load();
  }, [user]);

  return (
    <div>
      <p>Email: {user.email}</p>

      <p>
        Mastery Points: {points}
      </p>

      <Link href="/">
        <button>
          Back
        </button>
      </Link>

      <Link href="/">
        <button
          onClick={() =>
            signOut(auth)
          }
        >
          Logout
        </button>
      </Link>
    </div>
  );
}