import StairliftLocationPage from "@/components/StairliftLocationPage";
import { WARRANTY_TIME } from "@/lib/constants/warranty";

export default function StairliftsMiltonPage() {
  return (
    <StairliftLocationPage
      city="Milton"
      metaTitle="Stairlifts in Milton, ON | Medtrion"
      metaDescription={`Buy or rent a stairlift in Milton. Free in-home assessment, expert installation & ${WARRANTY_TIME} warranty. Trusted by GTA homeowners — call Medtrion today.`}
      pageTitle="Stairlifts & Mobility Equipment in Milton, Ontario"
    />
  );
}
