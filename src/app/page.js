// "use client";

// import Link from "next/link";

// import AuthButtons from
//   "../components/AuthButtons.js";

// import MiniGame from
//   "../components/Minigame.js";

// import {
//   useAuth
// } from "../context/AuthContext.js";

// export default function Home() {
//   const { user } = useAuth();

//   return (
//     <main
//       style={{
//         padding: "2rem",
//       }}
//     >
//       <h1>
//         Mastery Platform
//       </h1>

//       {user ? (
//         <Link href="/profile">
//           Profile
//         </Link>
//       ) : (
//         <AuthButtons />
//       )}

//       <hr />

//       <MiniGame
//         user={user}
//       />
//     </main>
//   );
// }

export default function Home() {
  return <h1>PAGE WORKS</h1>;
}