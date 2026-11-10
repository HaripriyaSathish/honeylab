import { isAdmin } from "@/lib/auth";
import { getContentStrict } from "@/lib/content";
import LoginForm from "@/components/admin/LoginForm";
import AdminPanel from "@/components/admin/AdminPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Honey Lab", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm />;

  let content = null;
  let dbError = null;
  try {
    content = await getContentStrict();
  } catch (err) {
    dbError = err.message;
  }

  if (dbError) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <h1 className="font-serif text-3xl font-bold">Database connection failed</h1>
        <p className="mt-4 rounded-xl bg-red-50 p-4 font-mono text-sm text-red-700">{dbError}</p>
        <p className="mt-4 text-sm">
          Check <code>DB_HOST</code>, <code>DB_USER</code> and <code>DB_PASSWORD</code> in <code>.env.local</code> (same login you use in MySQL
          Workbench), then restart <code>npm run dev</code>.
        </p>
      </div>
    );
  }

  return <AdminPanel initial={content} />;
}
