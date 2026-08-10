/**
 * Testimonials data for homepage
 * This will be replaced with Contentful CMS integration
 */

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  product: string;
  image?: string;
  verified: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Margaret Thompson',
    location: 'Manchester, UK',
    rating: 5,
    text: 'The Acorn stairlift has transformed my life. I can now access my entire home safely and independently. The installation team was professional and the service has been excellent.',
    product: 'Acorn 180 Curved Stairlift',
    image: '/face1.jpg',
    verified: true
  },
  {
    id: '2',
    name: 'Robert Williams',
    location: 'Oakville, Ontario',
    rating: 5,
    text: 'After my stroke, I thought I would have to move house. The stairlift gave me back my independence and allowed me to stay in my family home.',
    product: 'Acorn 130 Straight Stairlift',
    image: '/face2.jpg',
    verified: true
  },
  {
    id: '3',
    name: 'Sarah Mitchell',
    location: 'Oakville, Ontario',
    rating: 5,
    text: 'The outdoor stairlift is fantastic. I can now enjoy my garden again without worrying about the steps. The weather protection works perfectly.',
    product: 'Acorn Outdoor Stairlift',
    image: '/face3.jpg',
    verified: true
  },
  {
    id: '4',
    name: 'David Brown',
    location: 'Oakville, Ontario',
    rating: 5,
    text: 'Excellent service from start to finish. The consultation was thorough, installation was quick, and the after-sales support has been outstanding.',
    product: 'Acorn 180 Curved Stairlift',
    verified: true
  },
  {
    id: '5',
    name: 'Linda Davis',
    location: 'Oakville, Ontario',
    rating: 5,
    text: 'I was nervous about getting a stairlift, but the team made everything so easy. The stairlift is quiet, comfortable, and has given me peace of mind.',
    product: 'Acorn 130 Straight Stairlift',
    verified: true
  },
  {
    id: '6',
    name: 'Michael Wilson',
    location: 'Oakville, Ontario',
    rating: 5,
    text: 'The stairlift has been a game-changer for my mobility. I can now visit friends upstairs and feel confident moving around my home.',
    product: 'Acorn 180 Curved Stairlift',
    verified: true
  }
];
