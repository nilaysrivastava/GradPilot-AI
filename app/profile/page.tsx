import { AppShell } from "@/components/layout/app-shell";
import { ProfileWizard } from "@/components/profile/profile-wizard";

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileWizard />
    </AppShell>
  );
}