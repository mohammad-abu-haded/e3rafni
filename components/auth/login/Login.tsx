import styles from "./login.module.css";
import LoginForm from "./LoginForm";
import Link from "next/link";

const Login = () => (
  <main className={styles["auth-page"]}>
    <div className={styles["ambient"]} aria-hidden="true" />

    <section className={styles["auth-card"]}>
      <div className={styles["brand-mark"]} aria-hidden="true">
        اعرفني
      </div>

      <header className={styles["heading"]}>
        <span className={styles["eyebrow"]}>اعرفني · مساحة تجمع الأصدقاء</span>
        <h1>مرحباً بك مجدداً</h1>
        <p>أدخل بياناتك للمتابعة إلى حسابك في اعرفني</p>
      </header>

      <LoginForm />

      <p className={styles["switch-prompt"]}>
        ليس لديك حساب؟ <Link href="/signup">أنشئ حساباً جديداً</Link>
      </p>
    </section>
  </main>
);

export default Login;
