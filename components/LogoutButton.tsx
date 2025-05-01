"use client";

import { logout } from "@/lib/auth/login";
import { LogOutIcon } from "lucide-react";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:text-gray-900"
      >
        <LogOutIcon className="h-4 w-4" />
        Logout
      </button>
    </form>
  );
}
