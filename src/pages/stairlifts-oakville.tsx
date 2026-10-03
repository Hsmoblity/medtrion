import StairliftLocationPage from "@/components/StairliftLocationPage";
import { WARRANTY_TIME } from "@/lib/constants/warranty";

export default function StairliftsOakvillePage() {
  return (
    <StairliftLocationPage
      city="Oakville"
      metaTitle="Stairlifts in Oakville, ON | Medtrion"
      metaDescription={`Buy or rent a stairlift in Oakville. Free in-home assessment, expert installation & ${WARRANTY_TIME} warranty. Trusted by GTA homeowners — call Medtrion today.`}
    />
  );
}
