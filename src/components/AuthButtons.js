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

export default function AuthButtons() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function signup() {
    try {
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
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  async function login() {
    try {
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

      <button onClick={signup}>
        Sign Up
      </button>

      <button onClick={login}>
        Login
      </button>

      <button onClick={googleLogin}>
        Google Login
      </button>
    </div>
  );
}