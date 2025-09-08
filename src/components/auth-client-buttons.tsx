"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignInWithGithubButton() {
  const handleClick = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return (
    <button
      onClick={handleClick}
      className="bg-gray-800 text-white px-4 py-2 rounded-md"
    >
      Sign in with Github
    </button>
  );
}

export function SignOutButton() {
  const router = useRouter();

  const handleClick = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-500 text-white px-4 py-2 rounded-md"
    >
      Sign Out
    </button>
  );
}
