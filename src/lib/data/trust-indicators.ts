/**
 * Trust indicators data for homepage
 * This will be replaced with Contentful CMS integration
 */

export interface TrustIndicator {
  icon: string; // Icon name from react-icons
  title: string;
  description: string;
  highlight: string;
  value?: string;
}

export const trustIndicators: TrustIndicator[] = [
  {
    icon: "FaShieldAlt",
    title: "5-Year Warranty",
    description: "Comprehensive coverage for peace of mind",
    highlight: "Included",
    value: "5 years"
  },
  {
    icon: "FaUsers",
    title: "Expert Installation",
    description: "Professional installation by certified technicians",
    highlight: "Free",
    value: "1000+"
  },
  {
    icon: "FaHeadset",
    title: "24/7 Support",
    description: "Round-the-clock customer support",
    highlight: "Always Available",
    value: "24/7"
  },
  {
    icon: "FaAward",
    title: "Industry Leader",
    description: "Trusted by thousands of customers",
    highlight: "Since 2010",
    value: "13+ years"
  },
  {
    icon: "FaTruck",
    title: "Free Delivery",
    description: "Complimentary delivery and setup",
    highlight: "No Hidden Fees",
    value: "Free"
  },
  {
    icon: "FaHeart",
    title: "Customer Satisfaction",
    description: "Rated excellent by our customers",
    highlight: "4.9/5 Stars",
    value: "98%"
  }
];
