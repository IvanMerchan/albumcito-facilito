import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import AuthForm from "@/app/components/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Inicia sesión</h1>
      <p className="text-base text-gray-600">
        Accede para ver tu panel de álbumes.
      </p>
      <AuthForm mode="login" action={loginAction} />
      <p className="text-sm text-gray-600">
        ¿Todavía no tienes cuenta?{" "}
        <Link href="/signup" className="hover:underline">
          Crea una cuenta
        </Link>
      </p>
    </main>
  );
}
