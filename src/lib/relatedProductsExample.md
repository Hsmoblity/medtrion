Frontend (lazy) load example:

# Related Products Usage Examples

- Call `fetchProductsByIds` from a client component when opening the add-on modal. Example (React):

```jsx
import { fetchProductsByIds } from 'lib/woocommerce';

function SomeComponent() {
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    fetchProductsByIds(relatedIds, { format: 'display' }).then(data => { if (mounted) setItems(data); }).catch(() => {});
    return () => setMounted(false);
  }, [relatedIds]);

  return (
    <div>
      {/* Render items here */}
    </div>
  );
}
```

Server example (Next.js page or API route):

```javascript
import { fetchProductsByIds } from 'lib/woocommerce';

export async function getServerSideProps(context) {
  const relatedIds = [/* some ids from your data source */];
  const relatedProducts = await fetchProductsByIds(relatedIds, { format: 'display' });
  
  return { props: { relatedProducts } };
}
```

- `fetchProductsByIds` with `{ format: 'display' }` already normalizes variations and images into a light shape suitable for rendering in the add-on UI.

Notes:
- `fetchRelatedProductsByIds` already normalizes variations and images into a light shape suitable for rendering in the add-on UI.
- If WPGraphQL is unavailable, the helper returns an empty array; ensure your UI handles that case gracefully.
- For large numbers of IDs, consider batching or server-side caching.
