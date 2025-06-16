import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      {children}
    </>
  )
}