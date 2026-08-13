/**
 * Product-specific content (FAQ, Specifications, Overview)
 * Map product slugs to their detailed content
 */

export interface ProductSpecification {
  label: string
  value: string | number
}

export interface ProductFAQItem {
  question: string
  answer: string
}

export interface ProductFeatureTab {
  id: string
  title: string
  description: string
}

export interface ProductContent {
  overview?: string
  featureTabs?: ProductFeatureTab[]
  faq?: ProductFAQItem[]
  specifications?: ProductSpecification[]
}

export const PRODUCT_CONTENT: Record<string, ProductContent> = {
  // Golden Cloud PR515SME With Twilight
  'golden-cloud-pr515sme-with-twilight': {
    overview: `The Golden Cloud PR515SME With Twilight combines advanced positioning technology with supportive comfort for a more personalized seating experience. PowerPillow™ and power lumbar support let you adjust key areas for added comfort, while MaxiComfort Cloud™ positioning provides a wide range of recline positions.

Twilight Technology adds another level of positioning by helping you achieve Zero Gravity and TV positions. With a 400 lb weight capacity, full chaise seating, battery backup, and optional heat and massage, this Golden Cloud PR515SME With Twilight is designed for comfortable everyday use.`,
    featureTabs: [
      {
        id: 'positioning',
        title: 'Advanced Positioning',
        description: 'The MaxiComfort Cloud™ system offers infinite positioning options, while Twilight Technology helps create Zero Gravity and TV positions for a more comfortable way to sit, relax, and recline.'
      },
      {
        id: 'power-support',
        title: 'Power Support',
        description: 'PowerPillow™ and power lumbar support let you adjust your head and lower-back support independently. The result is a Luxury power lift recliner with Twilight Tech designed around your preferred seating position.'
      },
      {
        id: 'comfort',
        title: 'Built For Everyday Comfort',
        description: 'With a 23.5-inch seat width, 18.5-inch seat depth, full chaise seating, and battery backup. The chair combines practical features with the comfort expected from Golden Cloud lift chairs.'
      }
    ],
    faq: [
      {
        question: 'What Is The Golden Cloud With Twilight?',
        answer: 'The Golden Cloud with Twilight is a power lift recliner that combines Golden\'s MaxiComfort Cloud™ positioning with Twilight Technology. It provides multiple reclining positions, including Zero Gravity and TV positions.'
      },
      {
        question: 'Who Is The Golden Cloud With Twilight Lift Chair Designed For?',
        answer: 'The chair is designed for users between approximately 5\'1" and 5\'6" and supports up to 400 lb. Its lift and recline functions can make it a practical seating option for people who need additional assistance getting into or out of a chair.'
      },
      {
        question: 'What Makes This Different From A Standard Power Lift Recliner?',
        answer: 'Unlike a basic power lift recliner, this model combines infinite MaxiComfort positioning with Twilight Technology, PowerPillow™, and power lumbar support. It also includes a chaise seat and battery backup as standard features.'
      },
      {
        question: 'Can I Buy a Golden Cloud Lift Recliner Online?',
        answer: 'Yes. If you\'re planning to buy a golden cloud lift recliner online, check the product configuration, available options, sizing, shipping details, and warranty coverage before completing your purchase.'
      },
      {
        question: 'Does The Chair Include Heat And Massage?',
        answer: 'Heat and massage are available as optional features. A footrest extension is also available as an option.'
      },
      {
        question: 'What Warranty Comes With The Chair?',
        answer: 'The chair includes lifetime coverage for the chair frame, lift frame, and recline mechanisms. It also includes three years of coverage for electrical parts and mechanical labor, plus one year of electrical labor coverage.'
      }
    ],
    specifications: [
      { label: 'Recline Positions', value: 'Infinite (MaxiComfort)' },
      { label: 'Back Type', value: 'Biscuit' },
      { label: 'Weight Capacity', value: '400 lb' },
      { label: 'Chaise Seat', value: 'Yes' },
      { label: 'Min. Recommended Height', value: '5\' 1"' },
      { label: 'Max. Recommended Height', value: '5\' 6"' },
      { label: 'Overall Height', value: '44"' },
      { label: 'Overall Width', value: '35.5"' },
      { label: 'Floor to Top of Seat', value: '20"' },
      { label: 'Seat Depth', value: '18.5"' },
      { label: 'Seat Width', value: '23.5"' },
      { label: 'Seat to Top of Back', value: '28"' },
      { label: 'Seat to Top of Arm', value: '8"' },
      { label: 'Distance Required from Wall Reclined', value: '23"' },
      { label: 'Battery Backup', value: 'Yes' },
      { label: 'Head Rest Cover Included', value: 'Yes' },
      { label: 'Arm Covers Included', value: 'No' },
      { label: 'Left Hand Control Available', value: 'No' },
      { label: 'Heat & Massage Option Available', value: 'Yes' },
      { label: 'Foot Rest Extension Option Available', value: 'Yes' },
      { label: 'Fire Retardant (California Specifications; bulletin 117)', value: 'Yes' },
      { label: 'Warranty', value: 'Lifetime Chair Frame, Lift Frame, and Recline Mechanisms, 3-Year Electrical Parts, 3-Year Mechanical Labor, 1-Year Electrical Labor' },
      { label: 'Straight Lift', value: 'No' }
    ]
  },
  
  // Add more products here as needed
  // Example format:
//   'new-product-slug': {
//   overview: 'Description...',
//   featureTabs: [
//     { 
//       id: 'feature-1',
//       title: 'Feature Title',
//       description: 'Feature description'
//     },
//     // ... more tabs
//   ],
//   faq: [...],
//   specifications: [...]
// }
}

/**
 * Get product content by slug
 */
export function getProductContent(slug: string): ProductContent | undefined {
  return PRODUCT_CONTENT[slug]
}
