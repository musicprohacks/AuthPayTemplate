import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { auth, enabledProviders } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <SiteHeader
        user={
          session
            ? { name: session.user.name, email: session.user.email, image: session.user.image }
            : null
        }
        providers={enabledProviders}
      />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Hello{session ? `, ${session.user.name || session.user.email}` : " world"}
          {" "}
          <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
            👋
          </span>
        </h1>
        <p className="max-w-md text-lg text-zinc-400">
          {session
            ? "You're signed in. This is a minimal template — build on top of it."
            : "A minimal auth starter template. Sign in with Google or an email link to get started."}
        </p>
      </main>
    </>
  );
}
