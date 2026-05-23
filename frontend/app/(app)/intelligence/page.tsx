import { redirect } from "next/navigation";

export default function IntelligenceIndex() {
  // No company selected — drop the user on the Core42 demo intelligence.
  redirect("/intelligence/core42");
}
