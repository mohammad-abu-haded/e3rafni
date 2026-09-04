import { cookies } from "next/headers";
import UserProfile from "./UserProfile";
import Navigation from "./Navigation";
import { verifyToken } from "@/utils/auth";
import styles from './Header.module.css'; 
const Header = async () => {
  const token = (await cookies()).get("token")?.value;
  let name = "";

  if (token) {
    try {
      name = (await verifyToken(token))?.name || '';
    } catch (error) {
      
    }
  }
  return (
    <div className={styles['header']}>
        <h2>اعرفني</h2>
        <Navigation />
        <UserProfile name={name}/>
    </div>
  );
};

export default Header;
