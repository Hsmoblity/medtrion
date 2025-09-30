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

// Check what these specific product IDs are
const GET_PRODUCTS_BY_IDS = `
  query GetProductsByIds($ids: [Int]!) {
    products(where: { include: $ids }) {
      nodes {
        id
        databaseId
        name
        type
        __typename
        slug
      }
    }
  }
`;

const GET_OPTION_PRODUCTS = `
  query GetOptionProducts($ids: [Int]!) {
    products(where: { include: $ids, type: VARIABLE }) {
      nodes {
        id
        databaseId
        name
        type
        __typename
        slug
      }
    }
  }
`;

console.log('Testing specific product IDs [1865, 1948]...\n');

try {
  // Check what these products are (any type)
  console.log('1. Checking what products 1865 and 1948 are (any type):');
  const anyTypeResult = await client.request(GET_PRODUCTS_BY_IDS, {
    ids: [1865, 1948]
  });
  console.log('Any type result:', JSON.stringify(anyTypeResult, null, 2));

  // Check if they are VARIABLE products
  console.log('\n2. Checking if products 1865 and 1948 are VARIABLE type:');
  const variableTypeResult = await client.request(GET_OPTION_PRODUCTS, {
    ids: [1865, 1948]
  });
  console.log('VARIABLE type result:', JSON.stringify(variableTypeResult, null, 2));

} catch (error) {
  console.error('Error:', error);
}