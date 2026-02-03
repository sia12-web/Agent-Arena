import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
