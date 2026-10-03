import StairliftLocationPage from "@/components/StairliftLocationPage";
import { WARRANTY_TIME } from "@/lib/constants/warranty";

export default function StairliftsBurlingtonPage() {
  return (
    <StairliftLocationPage
      city="Burlington"
      metaTitle="Stairlifts in Burlington, ON | Medtrion"
      metaDescription={`Buy or rent a stairlift in Burlington. Free in-home assessment, expert installation & ${WARRANTY_TIME} warranty. Trusted by GTA homeowners — call Medtrion today.`}
      pageTitle="Stairlifts & Mobility Equipment in Burlington, Ontario"
    />
  );
}
