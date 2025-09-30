/**
 * Problem-solution data for homepage
 * This will be replaced with Contentful CMS integration
 */

export interface ProblemSolution {
  problem: string;
  solution: string;
  products: string[];
  icon: string; // Icon name from react-icons
  description: string;
}

export const problemsSolutions: ProblemSolution[] = [
  {
    problem: "Difficulty climbing stairs",
    solution: "Stairlifts for safe, comfortable access",
    products: ["Acorn 180", "Acorn 130", "Acorn Outdoor"],
    icon: "FaStairs",
    description: "Regain independence with our range of stairlifts designed for any staircase configuration."
  },
  {
    problem: "Limited mobility indoors",
    solution: "Mobility aids for independence",
    products: ["Walking Aids", "Wheelchairs", "Mobility Scooters"],
    icon: "FaWheelchair",
    description: "Move freely around your home with our comprehensive range of indoor mobility solutions."
  },
  {
    problem: "Safety concerns",
    solution: "Safety equipment and monitoring",
    products: ["Safety Rails", "Alert Systems", "Fall Prevention"],
    icon: "FaShieldAlt",
    description: "Stay safe and secure with our advanced safety equipment and monitoring systems."
  },
  {
    problem: "Outdoor accessibility",
    solution: "Outdoor mobility solutions",
    products: ["Outdoor Stairlifts", "Ramps", "Pathway Solutions"],
    icon: "FaTree",
    description: "Enjoy your outdoor spaces with our weather-resistant mobility solutions."
  },
  {
    problem: "Caregiver support",
    solution: "Support equipment and training",
    products: ["Transfer Aids", "Training Programs", "Support Equipment"],
    icon: "FaHandsHelping",
    description: "Support your caregivers with specialized equipment and comprehensive training programs."
  },
  {
    problem: "Emergency situations",
    solution: "Emergency response systems",
    products: ["Alert Pendants", "Emergency Systems", "24/7 Monitoring"],
    icon: "FaExclamationTriangle",
    description: "Get help when you need it most with our reliable emergency response systems."
  }
];
