import MatchHistory from "@/components/UserMatchHistory/UserMatchHistory";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "سجل المباريات",
  description: "اطلع على مبارياتك السابقة وتحليلها.",
};

const page = () => {
  return <MatchHistory />;
};

export default page;
