import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm text-gray-500 hover:underline"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
