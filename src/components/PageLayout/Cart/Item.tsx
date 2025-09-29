import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { CartProduct } from "lib/interfaces";
import Image from "next/image";
import { normalizeImageUrl } from '../../../lib/utils/image'
import { fetchRelatedProductsByIds } from 'lib/woocommerce';
import { useCartStore, useEditStatus } from "stores/cartStore";
import { useSession } from '../../../contexts/SessionContext';
import { PrimaryButton } from 'components/ui';
// import urlFor from "lib/sanity/urlFor";

interface ItemProps {
  product: CartProduct;
}

const Item: React.FC<ItemProps> = ({ product }) => {
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const setEditStatus = useCartStore(state => state.setEditStatus);
  const router = useRouter();
  const { startEditSession, addNotification } = useSession();
  const cartItemId = String(product.cartItemId ?? `ci_fallback_${product.slug}`);
  const editStatus = useEditStatus(cartItemId);
  
  const { slug, productPictures, title, price, quantity } = product;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAttributes, setEditAttributes] = useState<{ [k: string]: string }>({});
  const [isStartingEdit, setIsStartingEdit] = useState(false);
  
  type OptionItem = { name: string; type?: string; priceModifier?: number; selected?: boolean; quantity?: number; value?: string; radioGroup?: string; parentId?: number | string };
  const [optionsState, setOptionsState] = useState<OptionItem[]>([]);

  const removeWholeProduct = () => {
    if (product.cartItemId) {
      removeFromCart(product.cartItemId);
    }
  };

  const removeSingleItem = () => {
    if (product.cartItemId) {
      const currentQuantity = product.quantity || 1;
      updateQuantity(product.cartItemId, currentQuantity - 1);
    }
  };

  const addSingleItem = () => {
    // increment quantity of this specific cart item
    if (product.cartItemId) {
      const currentQuantity = product.quantity || 1;
      updateQuantity(product.cartItemId, currentQuantity + 1);
    }
  };

  const openEditModal = () => {
    // initialize editAttributes from current variation
    const pre: { [k: string]: string } = {};
    if (product.variationId && product.variations && Array.isArray(product.variations)) {
      const match = product.variations.find((v: any) => String(v.databaseId ?? v.id) === String(product.variationId));
      if (match && match.attributes) {
        for (const a of match.attributes) {
          pre[a.name] = a.value;
        }
      }
    }
    setEditAttributes(pre);
    // initialize optionsState from product.options snapshot if present
    const existingOptions = (product.options && Array.isArray(product.options)) ? product.options.map((o: any) => ({ ...o })) : [];
    if (existingOptions.length > 0) {
      setOptionsState(existingOptions);
      setShowEditModal(true);
      return;
    }

    // Otherwise, lazy-load related products and build option entries
    (async () => {
      try {
        const relatedIds = product._related_options || [];
        if (!relatedIds || relatedIds.length === 0) {
          setOptionsState([]);
          setShowEditModal(true);
          return;
        }
        const related = await fetchRelatedProductsByIds(relatedIds);
        const built: OptionItem[] = [];
        const parsePrice = (p: any) => {
          if (typeof p === 'number') return p;
          if (!p) return 0;
          if (typeof p === 'string') {
            const n = parseFloat(String(p).replace(/[^0-9.\-]+/g, ''));
            return isNaN(n) ? 0 : n;
          }
          return 0;
        }

        for (const rp of related) {
          if (!rp) continue;
          // Simple product: single checkbox option
          if (!rp.variations || rp.variations.length === 0) {
            built.push({ name: rp.name, type: 'checkbox', selected: false, quantity: 0, value: String(rp.databaseId), parentId: rp.databaseId });
          } else {
            // Variable: create per-variation entries (checkbox or radio depending on soldIndividually)
            const group = true ? `rg_${rp.databaseId}` : null;
            for (const v of rp.variations) {
              const labelParts: string[] = [];
              if (v.attributes && Array.isArray(v.attributes)) {
                for (const a of v.attributes) labelParts.push(`${a.name}: ${a.value}`);
              }
              const label = labelParts.length > 0 ? `${rp.name} — ${labelParts.join(', ')}` : `${rp.name}`;
              const entry: OptionItem = { name: label, type: group ? 'radio' : 'checkbox', selected: false, quantity: 0, value: String(v.databaseId), parentId: rp.databaseId };
              if (group) entry.radioGroup = group;
              built.push(entry);
            }
          }
        }

        setOptionsState(built);
      } catch (e) {
        setOptionsState([]);
      } finally {
        setShowEditModal(true);
      }
    })();
    setShowEditModal(true);
  };

  const saveEdits = () => {
    // find matching variation if possible
    let variationId = product.variationId || null;
    if (product.variations && Object.keys(editAttributes).length > 0) {
      const match = product.variations.find((v: any) => {
        if (!v.attributes) return false;
        for (const k of Object.keys(editAttributes)) {
          const attr = v.attributes.find((a: any) => a.name === k);
          if (!attr || attr.value !== editAttributes[k]) return false;
        }
        return true;
      });
      if (match) variationId = String(match.databaseId ?? match.id);
    }
    // Persist edits to the cart item (attach options to parent item)
    if (product.cartItemId) {
      const updateCartItem = useCartStore.getState().updateCartItem;
      updateCartItem(String(product.cartItemId), { variationId, options: optionsState });
    }

    setShowEditModal(false);
  };

  const getSafeImage = () =>
    normalizeImageUrl(productPictures?.[0]?.fields?.file?.url || product.featuredImage)

  // build attribute groups from product variations for use in modal and validation
  const attributeGroups: { [k: string]: Set<string> } = {};
  if (product.variations && Array.isArray(product.variations)) {
    for (const v of product.variations) {
      if (!v.attributes) continue;
      for (const a of v.attributes) {
        if (!attributeGroups[a.name]) attributeGroups[a.name] = new Set();
        attributeGroups[a.name].add(a.value);
      }
    }
  }

  const toggleOptionSelected = (idx: number) => {
    setOptionsState(prev => {
      const next = prev.map((p) => ({ ...p }));
      const item = next[idx];
      if (item && item.radioGroup) {
        // Deselect others in same group, select this one
        for (let i = 0; i < next.length; i++) {
          if (next[i].radioGroup === item.radioGroup) next[i].selected = false;
        }
        item.selected = true;
        if (typeof item.quantity === 'undefined' || item.quantity === 0) item.quantity = 1;
      } else {
        item.selected = !item.selected;
        if (item.selected && (typeof item.quantity === 'undefined' || item.quantity === 0)) item.quantity = 1;
      }
      return next;
    });
  };

  const setOptionQuantity = (idx: number, q: number) => {
    setOptionsState(prev => {
      const next = prev.map((p) => ({ ...p }));
      next[idx].quantity = q;
      return next;
    });
  };

  return (
    <div className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
      {/* Product Header with Edit Button */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {/* Product Title with View More Link */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {slug ? (
              <a
                href={`/product/${slug}`}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/product/${slug}`);
                }}
              >
                View More →
              </a>
            ) : (
              <span className="text-sm text-gray-400 font-medium">
                Product details unavailable
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">SKU: {slug}</p>
        </div>
        <button
          onClick={async () => {
            if (isStartingEdit || editStatus === 'editing') return;

            try {
              setIsStartingEdit(true);
              setEditStatus(cartItemId, 'editing');

              // Extract current selected option IDs from the cart item
              const originalSelectedOptionIds = (product.options || [])
                .filter(opt => opt.selected)
                .map(opt => opt.value || '')
                .filter(Boolean);

              // Start edit session
              const session = await startEditSession(
                cartItemId,
                product.slug,
                originalSelectedOptionIds
              );

              if (session) {
                // Navigate to configurator with edit session
                router.push(`/product/${product.slug}/configure?edit=true&cartItemId=${encodeURIComponent(cartItemId)}&sessionId=${encodeURIComponent(session.id)}`);
              } else {
                // Failed to create session - show error and reset
                setEditStatus(cartItemId, 'idle');
                addNotification({
                  type: 'error',
                  message: 'Unable to start edit session. Please try again.'
                });
              }
            } catch (error) {
              console.error('Failed to start edit session:', error);
              setEditStatus(cartItemId, 'idle');
              addNotification({
                type: 'error',
                message: 'An error occurred while starting the edit session.'
              });
            } finally {
              setIsStartingEdit(false);
            }
          }}
          disabled={isStartingEdit || editStatus === 'editing'}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md ${
            isStartingEdit || editStatus === 'editing'
              ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 cursor-pointer'
          }`}
          aria-label={`Edit configuration for ${title}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {isStartingEdit ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            )}
          </svg>
          {isStartingEdit ? 'Starting...' : editStatus === 'editing' ? 'Currently editing' : 'Edit'}
        </button>
      </div>

      {/* Product Content */}
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <Image
            src={getSafeImage()}
            width={120}
            height={120}
            className="rounded-lg object-cover border border-gray-200"
            quality={100}
            alt={title}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Selected Variation */}
          {product.variationId && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Configuration: {product.variationId}
              </span>
            </div>
          )}

          {/* Options */}
          {product.options && Array.isArray(product.options) && product.options.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Included Options</h4>
              <div className="space-y-2">
                {product.options.map((opt: any, idx: number) => (
                  <div key={String(opt.name || idx)} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {opt.name || opt.title || opt.value}
                      </p>
                      {opt.sku && (
                        <p className="text-xs text-gray-500">SKU: {opt.sku}</p>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 ml-4">
                      {typeof opt.price === 'number' ? `$${Number(opt.price).toFixed(2)}` : (opt.price ? `$${Number(opt.price).toFixed(2)}` : 'Included')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Price Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={removeSingleItem}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-l-md"
                  aria-label="Decrease quantity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-4 py-2 text-center min-w-[3rem] font-medium border-x border-gray-300">{quantity}</span>
                <button
                  onClick={addSingleItem}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-r-md"
                  aria-label="Increase quantity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Price per item</div>
              <div className="text-lg font-semibold text-gray-900">
                ${(() => {
                  const base = typeof price === 'number' ? price : Number(price || 0);
                  let opts = 0;
                  if (product.options && Array.isArray(product.options) && product.options.length > 0) {
                    for (const o0 of product.options) {
                      const o: any = o0;
                      const op = Number(o.price || o.priceModifier || 0) || 0;
                      const oq = Number(o.quantity || 1) || 1;
                      opts += op * oq;
                    }
                  }
                  return (Number(base || 0) + opts).toFixed(2);
                })()}
              </div>
              <div className="text-sm text-gray-600">
                Total: ${(() => {
                  const base = typeof price === 'number' ? price : Number(price || 0);
                  let opts = 0;
                  if (product.options && Array.isArray(product.options) && product.options.length > 0) {
                    for (const o0 of product.options) {
                      const o: any = o0;
                      const op = Number(o.price || o.priceModifier || 0) || 0;
                      const oq = Number(o.quantity || 1) || 1;
                      opts += op * oq;
                    }
                  }
                  const configuredPerUnit = Number(base || 0) + opts;
                  return (configuredPerUnit * Number(quantity || 1)).toFixed(2);
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <div className="flex-shrink-0">
          <button
            onClick={removeWholeProduct}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={`Remove ${title} from cart`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded p-6">
            <h3 className="text-lg font-semibold">Edit selection</h3>
            <div className="mt-4">
              {Object.keys(attributeGroups).length > 0 ? (
                Object.keys(attributeGroups).map((k) => (
                  <div key={k} className="mb-3">
                    <p className="font-medium">{k}</p>
                    <div className="flex gap-2 mt-2">
                      {Array.from(attributeGroups[k]).map((val) => (
                        <button
                          key={val}
                          onClick={() => setEditAttributes(prev => ({ ...prev, [k]: val }))}
                          className={`px-2 py-1 border rounded ${editAttributes[k] === val ? 'bg-gray-200' : ''}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // If there are add-on options, don't show the parent "No variations available" message
                (optionsState && optionsState.length > 0) ? null : (
                  <p className="text-sm text-gray-600">No variations available</p>
                )
              )}

              {/* Product-level options (addons) */}
              {optionsState && optionsState.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium">Options</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {optionsState.map((opt, idx) => (
                      <div key={opt.name + idx} className="flex items-center gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type={opt.type === 'radio' ? 'radio' : 'checkbox'}
                            name={opt.type === 'radio' ? (opt.radioGroup || `rg_${idx}`) : undefined}
                            checked={!!opt.selected}
                            onChange={() => toggleOptionSelected(idx)}
                          />
                          <span>{opt.name}{opt.priceModifier ? ` (+$${opt.priceModifier})` : ''}</span>
                        </label>
                        {typeof opt.quantity !== 'undefined' && (
                          <input
                            type="number"
                            className="w-20 border rounded p-1"
                            value={opt.quantity ?? 1}
                            min={0}
                            onChange={(e) => setOptionQuantity(idx, Math.max(0, Number(e.target.value)))}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              {
                (() => {
                  const requiredCount = Object.keys(attributeGroups).length;
                  const selectedCount = Object.keys(editAttributes).filter(k => !!editAttributes[k]).length;
                  const allSelected = requiredCount === selectedCount;
                  return (
                    <PrimaryButton 
                      size="sm"
                      onClick={saveEdits} 
                      disabled={!allSelected}
                    >
                      Save
                    </PrimaryButton>
                  );
                })()
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Item;
