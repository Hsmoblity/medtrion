Frontend (lazy) load example:

- Call `fetchRelatedProductsByIds` from a client component when opening the add-on modal. Example (React):

```ts
import { useState } from 'react';
import { fetchRelatedProductsByIds } from 'lib/woocommerce';

function AddOnModal({ relatedIds }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    let mounted = true;
    fetchRelatedProductsByIds(relatedIds).then(data => { if (mounted) setItems(data); }).catch(() => {});
    return () => { mounted = false; };
  }, [relatedIds]);

  if (!items) return <div>Loading...</div>;
  return <AddOnList items={items} />;
}
```

Server-side load example (recommended when you want SEO/SSR):

- In `getServerSideProps` or `getStaticProps` fetch the related products by `databaseId` before rendering the page.

```ts
export async function getServerSideProps(context) {
  const product = await getProductBySlug(context.params.slug);
  const relatedIds = product._related_options || [];
  const relatedProducts = await fetchRelatedProductsByIds(relatedIds);
  return { props: { product, relatedProducts } };
}
```

Notes:
- `fetchRelatedProductsByIds` already normalizes variations and images into a light shape suitable for rendering in the add-on UI.
- If WPGraphQL is unavailable, the helper returns an empty array; ensure your UI handles that case gracefully.
- For large numbers of IDs, consider batching or server-side caching.
