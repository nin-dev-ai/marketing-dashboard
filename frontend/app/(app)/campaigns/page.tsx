import { redirect } from "next/navigation";

export default function CampaignsIndex() {
  // No list yet — drop into the Core42 campaign detail for the demo.
  redirect("/campaigns/core42");
}
