/**
 * Step 13 – Collaboration Admin Panel (SAFE, ISOLATED).
 * DO NOT modify app/research/steps/step-1 through step-6.
 * No patient data – ONLY author metadata. Redirects to admin panel.
 */

import { redirect } from "next/navigation";

export default function Step13Page() {
  redirect("/admin/collaboration");
}
