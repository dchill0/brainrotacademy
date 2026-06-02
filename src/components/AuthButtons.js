"use client";

import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";

import {
  auth,
  googleProvider
} from "../firebase";

export default function AuthButtons() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function signup() {
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
  }

  async function login() {
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  }

  async function googleLogin() {
    await signInWithPopup(
      auth,
      googleProvider
    );
  }

  return (
    <div>
      <h2>Login / Signup</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br />

      {/* <button onClick={signup}>
        Sign Up
      </button>

      <button onClick={login}>
        Login
      </button>

      <button onClick={googleLogin}>
        Google Login
      </button> */}
    </div>
  );
}