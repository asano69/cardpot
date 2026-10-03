import { Md2sb } from "@/features/md2sb";

// Thin route wrapper, like ApiDocs: lives under AppShell/AuthGate, so it
// reuses the same PocketBase session.
export default function Md2sbPage() {
  return <Md2sb />;
}
