import styles from "./page.module.css";

export default function Home() {
  return (
    <div>
      <a href="/api/auth/google">
        <button>Sign Up with Google</button>
      </a>
    </div>
  );
}
