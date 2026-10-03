import StairliftLocationPage from "@/components/StairliftLocationPage";
import { WARRANTY_TIME } from "@/lib/constants/warranty";

export default function StairliftsHamiltonPage() {
  return (
    <StairliftLocationPage
      city="Hamilton"
      metaTitle="Stairlifts in Hamilton, ON | Medtrion"
      metaDescription={`Buy or rent a stairlift in Hamilton. Free in-home assessment, expert installation & ${WARRANTY_TIME} warranty. Trusted by GTA homeowners — call Medtrion today.`}
      pageTitle="Stairlifts & Mobility Equipment in Hamilton, Ontario"
    />
  );
}
