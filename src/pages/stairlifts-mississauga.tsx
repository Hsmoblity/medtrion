import StairliftLocationPage from "@/components/StairliftLocationPage";
import { WARRANTY_TIME } from "@/lib/constants/warranty";

export default function StairliftsMississaugaPage() {
  return (
    <StairliftLocationPage
      city="Mississauga"
      metaTitle="Stairlifts in Mississauga, ON | Medtrion"
      metaDescription={`Buy or rent a stairlift in Mississauga. Free in-home assessment, expert installation & ${WARRANTY_TIME} warranty. Trusted by GTA homeowners — call Medtrion today.`}
      pageTitle="Stairlifts & Mobility Equipment in Mississauga, Ontario"
    />
  );
}
