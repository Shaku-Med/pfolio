import { cookies } from "next/headers";
import { AdminProvider } from "./AdminContext/AdminContext";
import IsAuth from "./Auth/IsAuth";
import Login from "./Auth/Login/Login";
import Check from "../contact/[id]/Quick/Check";
import Script from "next/script";

export default async function AdminLayout({
  children,
  admin_topbar,
  admin_footer
}: {
  children: React.ReactNode;
  admin_topbar: React.ReactNode;
  admin_footer: React.ReactNode;
}) {

  let c = await cookies()
  let id = c.get(`id`)?.value
  if (!id) {
    return (
      <Check/>
    )
  }

  let isAuth: any = await IsAuth(true)
  if (!isAuth) {
    return (
      <Login/>
    )
  }

  return (
    <>
      <AdminProvider>
        {admin_topbar}
        {children}
        {admin_footer}
        <Script>
          {
            `
              if(typeof window !== 'undefined') {
                 window.localStorage.setItem('c_usr', '${isAuth?.user_id}')
              }
            `
          }
        </Script>
      </AdminProvider>
    </>
  )
}