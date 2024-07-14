import { redirect } from 'next/navigation'
export default async function NotFound() {
  redirect(`../`)
  return (
    <div className="rdir fixed top-0 left-0 w-full h-full flex items-center justify-center p-2 text-center text-8xl font-bold">
      <div className="Rd_m">
        Redirecting...
      </div>
   </div>
  )
}