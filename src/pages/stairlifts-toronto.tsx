import StairliftLocationPage from "@/components/StairliftLocationPage";
import { WARRANTY_TIME } from "@/lib/constants/warranty";

export default function StairliftsTorontoPage() {
  return (
    <StairliftLocationPage
      city="Toronto"
      metaTitle="Stairlifts in Toronto, ON | Medtrion"
      metaDescription={`Buy or rent a stairlift in Toronto. Free in-home assessment, expert installation & ${WARRANTY_TIME} warranty. Trusted by GTA homeowners — call Medtrion today.`}
      pageTitle="Stairlifts & Mobility Equipment in Toronto, Ontario"
    />
  );
}
