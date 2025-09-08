import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  SignInWithGithubButton,
  SignOutButton,
} from "@/components/auth-client-buttons";

export async function AuthButtons() {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p>{session.user.email}</p>
        <SignOutButton />
      </div>
    );
  }

  return <SignInWithGithubButton />;
}
