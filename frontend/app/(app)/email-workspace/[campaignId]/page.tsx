import { EmailWorkspaceUI } from "@/components/email-workspace/email-workspace-ui";
import { PageHeader } from "@/components/layout/page-header";
import { getMockContacts } from "@/lib/mock-contacts";

interface PageProps {
  params: { campaignId: string };
}

/**
 * Deep-link variant of the workspace. The campaignId in the URL acts as a
 * company hint — we pre-select the first contact at that company so users
 * arriving from a campaign or intelligence page land on a useful starting
 * point.
 */
export default function EmailWorkspaceForCampaignPage({ params }: PageProps) {
  const { campaignId } = params;
  const contacts = getMockContacts();
  const firstContact = contacts.find((c) => c.company_id === campaignId);

  return (
    <>
      <PageHeader
        title="Email Workspace"
        subtitle={
          firstContact
            ? `Pre-selected ${firstContact.company_name}. Switch contact on the left to draft for someone else.`
            : "Pick a contact to draft and personalize a 3-step outreach sequence."
        }
      />
      <EmailWorkspaceUI initialContactId={firstContact?.id} />
    </>
  );
}
