import { redirect } from "next/navigation";

const Home = () => {
  redirect("/rooms");
};

export default Home;