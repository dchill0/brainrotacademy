"use client";

import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  signOut
} from "firebase/auth";

import {
  auth,
  googleProvider
} from "../firebase";

import Link from "next/link";

export default function AuthButtons({ user }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(null);

  async function handleSubmit() {
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        await sendEmailVerification(user);
        await signOut(auth);
        alert(
          "Sign up successful! A verification email has been sent to your inbox. " +
          "If you don't see it, please check your spam or junk folder"
        );
      }

      if (mode === "login") {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        if (!user.emailVerified) {
          await signOut(auth);
          alert(
            "A verification email has already been sent to your inbox. " +
            "If you don't see it, please check your spam or junk folder"
          );
        }
      }

      setMode(null);
      setEmail("");
      setPassword("");
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  async function googleLogin() {
    try {
      await signInWithPopup(
        auth,
        googleProvider
      );
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  if (user && user.emailVerified) {
    return (
      <Link href="/profile">
        <button>Profile</button>
      </Link>
    );
  }

  return (
    <div style={{ position: "relative", display: "flex", gap: "0.5rem" }}>
      <button
        onClick={() => setMode(mode === "signup" ? null : "signup")}
        className={mode === "signup" ? "selected" : ""}
      >
        Signup
      </button>

      <button
        onClick={() => setMode(mode === "login" ? null : "login")}
        className={mode === "login" ? "selected" : ""}
      >
        Login
      </button>

      <button onClick={googleLogin}>
        Google Login
      </button>

      {mode && (
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleSubmit}>
            {mode === "signup" ? "Signup »" : "Login »"}
          </button>
        </div>
      )}
    </div>
  );
}