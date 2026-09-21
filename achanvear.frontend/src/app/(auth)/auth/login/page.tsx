// Redirect from /auth/login to /login for backwards compatibility
import { redirect } from "next/navigation";

export default function AuthLoginRedirectPage() {
  redirect("/login");
}
