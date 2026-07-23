import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/session";

export default async function Home() {
  redirect((await isSignedIn()) ? "/projects" : "/login");
}
