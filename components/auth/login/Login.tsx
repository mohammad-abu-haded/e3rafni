import styles from "./login.module.css";
import LoginForm from "./LoginForm";
import Link from 'next/link';
const Login = () => {
  return (
    <div className={styles.card}>
        <h2>مرحباً بك مجدداً</h2>
        <p>أدخل بياناتك للمتابعة إلى حسابك في اعرفني</p>
        <LoginForm />
        <span>ليس لديك حساب؟ <Link href={'/signup'}>أنشئ حساباً جديداً</Link></span>
    </div>
  )
}

export default Login