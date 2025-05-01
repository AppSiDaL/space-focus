import { LoginForm } from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text">Space Focus</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to your account to continue your space journey
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
