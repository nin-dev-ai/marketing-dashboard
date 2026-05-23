import { EmailWorkspaceUI } from "@/components/email-workspace/email-workspace-ui";
import { PageHeader } from "@/components/layout/page-header";

export default function EmailWorkspacePage() {
  return (
    <>
      <PageHeader
        title="Email Workspace"
        subtitle="Pick a contact to draft and personalize a 3-step outreach sequence."
      />
      <EmailWorkspaceUI />
    </>
  );
}
