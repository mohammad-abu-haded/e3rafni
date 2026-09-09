import Header from "@/components/Header/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{paddingTop: "65px"}}>
      <Header />
      <main>{children}</main>
    </div>
  );
}