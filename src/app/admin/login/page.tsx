import { AdminGate } from "@/components/admin/admin-gate";

export default function AdminLoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <AdminGate />
      </div>
    </div>
  );
}
