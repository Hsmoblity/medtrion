import { NextApiRequest, NextApiResponse } from 'next';
import { shouldEnableMockData } from '../../lib/utils/environment-validation';

// Mock GraphQL endpoint for development only
// This endpoint is automatically disabled in production environments

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use centralized environment validation
  if (!shouldEnableMockData()) {
    return res.status(404).json({ 
      error: 'Mock GraphQL endpoint disabled',
      message: 'Mock endpoints are only available in development mode. Please configure live GraphQL endpoints via environment variables.',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, variables } = req.body;

    // Mock responses based on query
    let data = {};

    if (query.includes('GetModelWithCategories')) {
      // Mock model with categories response
      data = {
        product: {
          id: '1',
          databaseId: 1,
          name: variables.slug === 'acorn-stairlifts-acorn-180-curved-stairlift' ? 'Acorn 180 Curved Stairlift' : 'Test Model',
          slug: variables.slug,
          title: variables.slug === 'acorn-stairlifts-acorn-180-curved-stairlift' ? 'Acorn 180 Curved Stairlift' : 'Test Model',
          description: 'A premium mobility solution designed for comfort and safety.',
          shortDescription: 'Premium mobility solution with advanced features.',
          price: 15000,
          regularPrice: '15000',
          salePrice: null,
          sku: 'AS-180-CURVED',
          image: {
            sourceUrl: '/acorn-stairlifts-home-banner-new.png',
            altText: 'Acorn Stairlift'
          },
          productPictures: [
            {
              fields: {
                file: {
                  url: '/acorn-stairlifts-home-banner-new.png'
                }
              }
            }
          ],
          configuratorCategories: [
            {
              id: 'safety',
              name: 'Safety Features',
              slug: 'safety',
              description: 'Essential safety options for your mobility solution',
              icon: '🛡️',
              required: true,
              multiSelect: true,
              minSelections: 1,
              maxSelections: 5,
              options: [
                {
                  id: 'safety-1',
                  databaseId: 101,
                  name: 'Safety Rail',
                  title: 'Safety Rail',
                  description: 'Additional safety rail for enhanced security',
                  shortDescription: 'Enhanced safety rail',
                  price: 500,
                  regularPrice: '500',
                  salePrice: null,
                  sku: 'SAFETY-RAIL-001',
                  image: {
                    sourceUrl: '/safety-rail.jpg',
                    altText: 'Safety Rail'
                  },
                  optionType: 'SAFETY',
                  compatibilityRules: [],
                  installationRequired: true,
                  financingAvailable: true,
                  safetyRating: 'A+',
                  adaCompliant: true,
                  weightCapacity: null
                },
                {
                  id: 'safety-2',
                  databaseId: 102,
                  name: 'Emergency Stop',
                  title: 'Emergency Stop Button',
                  description: 'Emergency stop functionality for immediate halt',
                  shortDescription: 'Emergency stop button',
                  price: 200,
                  regularPrice: '200',
                  salePrice: null,
                  sku: 'EMERGENCY-STOP-001',
                  image: {
                    sourceUrl: '/emergency-stop.jpg',
                    altText: 'Emergency Stop Button'
                  },
                  optionType: 'SAFETY',
                  compatibilityRules: [],
                  installationRequired: false,
                  financingAvailable: true,
                  safetyRating: 'A+',
                  adaCompliant: true,
                  weightCapacity: null
                }
              ],
              compatibilityRules: [],
              helpText: 'Select at least one safety feature to ensure your mobility solution meets safety standards.'
            },
            {
              id: 'comfort',
              name: 'Comfort Options',
              slug: 'comfort',
              description: 'Enhance comfort and usability',
              icon: '🪑',
              required: false,
              multiSelect: true,
              minSelections: 0,
              maxSelections: 3,
              options: [
                {
                  id: 'comfort-1',
                  databaseId: 201,
                  name: 'Premium Seat',
                  title: 'Premium Comfort Seat',
                  description: 'Enhanced comfort seat with memory foam',
                  shortDescription: 'Premium comfort seat',
                  price: 800,
                  regularPrice: '800',
                  salePrice: null,
                  sku: 'PREMIUM-SEAT-001',
                  image: {
                    sourceUrl: '/premium-seat.jpg',
                    altText: 'Premium Seat'
                  },
                  optionType: 'COMFORT',
                  compatibilityRules: [],
                  installationRequired: true,
                  financingAvailable: true,
                  safetyRating: null,
                  adaCompliant: true,
                  weightCapacity: null
                },
                {
                  id: 'comfort-2',
                  databaseId: 202,
                  name: 'Remote Control',
                  title: 'Wireless Remote Control',
                  description: 'Wireless remote control for easy operation',
                  shortDescription: 'Wireless remote control',
                  price: 150,
                  regularPrice: '150',
                  salePrice: null,
                  sku: 'REMOTE-CONTROL-001',
                  image: {
                    sourceUrl: '/remote-control.jpg',
                    altText: 'Remote Control'
                  },
                  optionType: 'COMFORT',
                  compatibilityRules: [],
                  installationRequired: false,
                  financingAvailable: true,
                  safetyRating: null,
                  adaCompliant: true,
                  weightCapacity: null
                }
              ],
              compatibilityRules: [],
              helpText: 'Optional comfort features to personalize your experience.'
            },
            {
              id: 'installation',
              name: 'Installation Services',
              slug: 'installation',
              description: 'Professional installation and setup',
              icon: '🔧',
              required: true,
              multiSelect: false,
              minSelections: 1,
              maxSelections: 1,
              options: [
                {
                  id: 'installation-1',
                  databaseId: 301,
                  name: 'Professional Installation',
                  title: 'Professional Installation Service',
                  description: 'Complete professional installation with warranty',
                  shortDescription: 'Professional installation',
                  price: 1200,
                  regularPrice: '1200',
                  salePrice: null,
                  sku: 'PROF-INSTALL-001',
                  image: {
                    sourceUrl: '/installation.jpg',
                    altText: 'Professional Installation'
                  },
                  optionType: 'INSTALLATION',
                  compatibilityRules: [],
                  installationRequired: false,
                  financingAvailable: true,
                  safetyRating: null,
                  adaCompliant: true,
                  weightCapacity: null
                }
              ],
              compatibilityRules: [],
              helpText: 'Professional installation is required for safety and warranty compliance.'
            },
            {
              id: 'accessories',
              name: 'Accessories',
              slug: 'accessories',
              description: 'Additional accessories and add-ons',
              icon: '🎁',
              required: false,
              multiSelect: true,
              minSelections: 0,
              maxSelections: 10,
              options: [
                {
                  id: 'accessory-1',
                  databaseId: 401,
                  name: 'Battery Backup',
                  title: 'Battery Backup System',
                  description: 'Backup battery system for power outages',
                  shortDescription: 'Battery backup system',
                  price: 600,
                  regularPrice: '600',
                  salePrice: null,
                  sku: 'BATTERY-BACKUP-001',
                  image: {
                    sourceUrl: '/battery-backup.jpg',
                    altText: 'Battery Backup'
                  },
                  optionType: 'ACCESSORY',
                  compatibilityRules: [],
                  installationRequired: true,
                  financingAvailable: true,
                  safetyRating: null,
                  adaCompliant: true,
                  weightCapacity: null
                }
              ],
              compatibilityRules: [],
              helpText: 'Optional accessories to enhance your mobility solution.'
            }
          ],
          compatibilityRules: [],
          installationRequired: true,
          financingAvailable: true,
          insuranceCoverage: ['Medicare', 'Private Insurance'],
          safetyRating: 'A+',
          adaCompliant: true,
          weightCapacity: 300
        }
      };
    } else if (query.includes('AddConfigurationToCart')) {
      // Mock add to cart response
      data = {
        addConfigurationToCart: {
          cart: {
            contents: {
              nodes: [
                {
                  key: 'config_' + Date.now(),
                  product: {
                    node: {
                      id: '1',
                      databaseId: 1,
                      name: 'Configured Model',
                      price: 15000,
                      image: {
                        sourceUrl: '/acorn-stairlifts-home-banner-new.png'
                      }
                    }
                  },
                  quantity: 1,
                  total: 15000,
                  extraData: [
                    {
                      key: 'configuration',
                      value: JSON.stringify(variables.input)
                    }
                  ]
                }
              ]
            },
            total: 15000,
            subtotal: 15000,
            totalTax: 0
          },
          errors: []
        }
      };
    } else if (query.includes('CheckCompatibility')) {
      // Mock compatibility check response
      data = {
        checkCompatibility: {
          issues: []
        }
      };
    } else if (query.includes('CalculateFinancing')) {
      // Mock financing calculation response
      data = {
        calculateFinancing: {
          options: [
            {
              id: 'financing-1',
              name: 'Standard Financing',
              description: 'Standard financing option',
              monthlyPayment: 299,
              termMonths: 60,
              interestRate: 5.9,
              totalCost: 17940,
              downPayment: 0,
              requiresPreApproval: false,
              eligibility: {
                minCreditScore: 650,
                maxDebtToIncomeRatio: 0.4,
                employmentRequirements: 'Stable employment for 2+ years'
              }
            }
          ]
        }
      };
    } else if (query.includes('EstimateInsurance')) {
      // Mock insurance estimation response
      data = {
        estimateInsurance: {
          estimatedCoverage: 12000,
          coveragePercentage: 80,
          requirements: {
            documentation: 'Medical necessity letter required',
            preApproval: 'Pre-approval recommended',
            medicalNecessity: 'Doctor\'s prescription required'
          },
          providers: [
            {
              name: 'Medicare',
              coverageType: 'Durable Medical Equipment',
              estimatedCoverage: 12000,
              contactInfo: '1-800-MEDICARE'
            }
          ]
        }
      };
    }

    res.status(200).json({ data });
  } catch (error) {
    console.error('GraphQL API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}