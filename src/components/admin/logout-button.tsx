"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }
  return (
    <Button variant="ghost" className="rounded-xl" onClick={logout} type="button">
      <LogOut className="h-4 w-4" />
      خروج
    </Button>
  );
}
