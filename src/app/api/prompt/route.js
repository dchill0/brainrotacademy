import OpenAI from "openai";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "brainrotacademy-8d820",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

const DAILY_CREDITS = 3;

export async function POST(req) {
  try {
    const { prompt, idToken } = await req.json();

    if (!prompt) {
      return Response.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    if (!idToken) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const emailVerified = decoded.email_verified;
    const isAdmin = decoded.admin === true;

    if (!emailVerified && !isAdmin) {
      return Response.json(
        { error: "Email not verified" },
        { status: 403 }
      );
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const today = new Date().toISOString().split("T")[0];
    let data = userSnap.exists ? userSnap.data() : null;

    if (!data || data.lastClickDate !== today) {
      await userRef.set(
        { creditsUsed: 0, lastClickDate: today },
        { merge: true }
      );
      data = { creditsUsed: 0, lastClickDate: today };
    }

    if (!isAdmin && data.creditsUsed >= DAILY_CREDITS) {
      return Response.json(
        { error: "Daily limit reached" },
        { status: 429 }
      )
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 250,
    });

    const message = completion.choices[0].message.content;

    if (!isAdmin) {
      await userRef.set(
        {
          creditsUsed: admin.firestore.FieldValue.increment(1),
          lastClickDate: today,
        },
        { merge: true }
      );
      data.creditsUsed++;
    }

    return Response.json({ message, creditsUsed: data.creditsUsed });
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}