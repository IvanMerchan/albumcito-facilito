import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import AuthForm from "@/app/components/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Crea tu cuenta</h1>
      <p className="text-base text-gray-600">
        Empieza a controlar tus álbumes de estampas.
      </p>
      <AuthForm mode="signup" action={signupAction} />
      <p className="text-sm text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="hover:underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
