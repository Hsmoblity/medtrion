module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Prevent inline GraphQL queries - all queries should be centralized
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="gql"]',
        message: 'Inline GraphQL queries are not allowed. Import queries from src/lib/graphql/queries.ts instead.',
      },
      {
        selector: 'VariableDeclarator[id.name=/.*QUERY.*/][init.type="TaggedTemplateExpression"]',
        message: 'Inline GraphQL queries are not allowed. Import queries from src/lib/graphql/queries.ts instead.',
      },
      {
        selector: 'VariableDeclarator[id.name=/.*MUTATION.*/][init.type="TaggedTemplateExpression"]',
        message: 'Inline GraphQL mutations are not allowed. Import mutations from src/lib/graphql/queries.ts instead.',
      },
    ],
  },
};