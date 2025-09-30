import { GraphQLClient } from 'graphql-request';
import https from 'https';

const WP_GRAPHQL_URL = 'https://cms.hsmobility.ca/graphql';

// Disable SSL certificate verification
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const client = new GraphQLClient(WP_GRAPHQL_URL, {
  headers: {
    'User-Agent': 'NextJS/1.0'
  },
  agent: httpsAgent
});

const GET_OPTION_PRODUCTS_BY_IDS = `
  query GetOptionProductsByIds($ids: [Int]) {
    products(where: { include: $ids, typeIn: [VARIABLE] }) {
      nodes {
        id
        databaseId
        name
        slug
        __typename
        description
        shortDescription
        productSpecifications
        type
        relatedOptions
        variableType
        image { sourceUrl }
        galleryImages(first: 10) { 
          nodes { 
            sourceUrl 
            altText 
          } 
        }
        ... on VariableProduct {
          price 
          regularPrice 
          salePrice 
          sku
          attributes {
            nodes {
              name
              label
              options
            }
          }
          variations(first: 50) {
            nodes {
              id
              databaseId
              name
              sku
              price
              regularPrice
              salePrice
              image { sourceUrl }
              attributes { 
                nodes { 
                  id 
                  name 
                  value 
                } 
              }
            }
          }
        }
      }
    }
  }
`;

console.log('Testing fetchOptionProductsByIds logic with IDs [1865, 1948]...\n');

async function debugFetchOptionProductsByIds() {
  const relatedOptionIds = [1865, 1948];
  
  console.log('1. Input validation:');
  console.log('relatedOptionIds:', relatedOptionIds);
  
  if (!relatedOptionIds || relatedOptionIds.length === 0) {
    console.log('❌ No related option IDs provided, would return empty array');
    return;
  }

  const numericIds = relatedOptionIds.map(id => Number(id)).filter(n => !isNaN(n));
  console.log('numericIds after conversion:', numericIds);
  
  if (numericIds.length === 0) {
    console.log('❌ No valid numeric IDs found, would return empty array');
    return;
  }

  console.log('\n2. Making GraphQL request...');
  console.log('Query: GET_OPTION_PRODUCTS_BY_IDS');
  console.log('Variables: { ids:', numericIds, '}');

  try {
    const data = await client.request(GET_OPTION_PRODUCTS_BY_IDS, { ids: numericIds });
    const nodes = data.products.nodes || [];
    
    console.log('\n3. GraphQL response:');
    console.log('Raw response nodes count:', nodes.length);
    console.log('Raw response nodes:', JSON.stringify(nodes, null, 2));
    
    if (nodes.length === 0) {
      console.log('❌ No option products found for IDs:', numericIds);
      return;
    }

    console.log('\n4. Mapping to ConfigurableProductSchema format...');
    const optionProducts = nodes.map((node, index) => {
      console.log(`Mapping node ${index + 1}:`, node.name, '(ID:', node.databaseId, ')');
      
      // Extract price information
      let price = 0;
      let regularPrice = 0;
      let salePrice = null;
      
      if (node.price) {
        price = parseFloat(node.price.replace(/[^0-9.-]/g, ''));
        console.log('  - Parsed price:', price, 'from:', node.price);
      }
      
      if (node.regularPrice) {
        regularPrice = parseFloat(node.regularPrice.replace(/[^0-9.-]/g, ''));
        console.log('  - Parsed regularPrice:', regularPrice, 'from:', node.regularPrice);
      } else {
        regularPrice = price;
      }
      
      if (node.salePrice) {
        salePrice = parseFloat(node.salePrice.replace(/[^0-9.-]/g, ''));
        console.log('  - Parsed salePrice:', salePrice, 'from:', node.salePrice);
      }

      // Normalize attributes
      const globalAttrs = node.globalAttributes?.nodes || [];
      const localAttrs = node.attributes?.nodes || [];
      console.log('  - Global attributes count:', globalAttrs.length);
      console.log('  - Local attributes count:', localAttrs.length);

      const mapped = {
        id: node.id,
        databaseId: node.databaseId,
        slug: node.slug,
        name: node.name,
        productSpecifications: node.productSpecifications,
        description: node.description,
        type: node.type,
        relatedOptions: node.relatedOptions || [],
        variableType: node.variableType,
        attributes: [...globalAttrs, ...localAttrs].map((attr) => ({
          label: attr.label,
          options: attr.terms?.nodes?.map((term) => ({
            name: term.name,
            slug: term.slug || term.name?.toLowerCase().replace(/\s+/g, '-')
          })) || []
        })),
        variations: (node.variations?.nodes || []).map((variation) => ({
          id: variation.id,
          databaseId: variation.databaseId,
          name: variation.name,
          price: variation.price ? parseFloat(variation.price.replace(/[^0-9.-]/g, '')) : 0,
          regularPrice: variation.regularPrice ? parseFloat(variation.regularPrice.replace(/[^0-9.-]/g, '')) : 0,
          salePrice: variation.salePrice ? parseFloat(variation.salePrice.replace(/[^0-9.-]/g, '')) : null,
          attributes: (variation.attributes?.nodes || []).map((attr) => ({
            label: attr.label,
            value: attr.value
          }))
        }))
      };
      
      console.log('  - Mapped attributes count:', mapped.attributes.length);
      console.log('  - Mapped variations count:', mapped.variations.length);
      
      return mapped;
    });

    console.log('\n5. Final result:');
    console.log('Successfully mapped', optionProducts.length, 'option products');
    console.log('Final products:', optionProducts.map(p => ({ 
      id: p.id, 
      databaseId: p.databaseId, 
      name: p.name, 
      type: p.type,
      variableType: p.variableType,
      attributesCount: p.attributes.length,
      variationsCount: p.variations.length
    })));

    return optionProducts;

  } catch (error) {
    console.error('❌ GraphQL request failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response errors:', error.response.errors);
    }
    throw error;
  }
}

// Run the debug function
debugFetchOptionProductsByIds().catch(console.error);