import { auth, signOut } from "@/auth";
import { Dashboard } from "./components/Dashboard";
import { LoginPage } from "./components/LoginPage";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Disponibilité des bureaux</h1>
        <div className="flex items-center gap-4">
          {session.user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-600">{session.user?.name}</span>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Dashboard />
      </main>
    </div>
  );
}
