import { useContext, useState } from "react";
import { CartProduct } from "lib/interfaces";
import Image from "next/image";
import CartItemsContext from "contexts/cartItemsContext";
import Types from "reducers/cart/types";
import { normalizeImageUrl } from '../../../lib/utils/image'
// import urlFor from "lib/sanity/urlFor";

interface ItemProps {
  product: CartProduct;
}

const Item: React.FC<ItemProps> = ({ product }) => {
  const { dispatch } = useContext(CartItemsContext);
  const { slug, productPictures, title, price, quantity } = product;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAttributes, setEditAttributes] = useState<{ [k: string]: string }>({});
  const [optionsState, setOptionsState] = useState<Array<{ name: string; type?: string; priceModifier?: number; selected?: boolean; quantity?: number; value?: string }>>([]);

  const removeWholeProduct = () => {
    dispatch({
      type: Types.removeWholeProduct,
      payload: { cartItemId: String(product.cartItemId ?? `ci_fallback_${product.slug}`) }
    });
  };

  const removeSingleItem = () => {
    dispatch({
      type: Types.removeSingleItem,
      payload: { cartItemId: String(product.cartItemId ?? `ci_fallback_${product.slug}`) }
    });
  };

  const addSingleItem = () => {
    // increment quantity of this specific cart item
    dispatch({
      type: Types.addToCart,
      payload: { ...product, cartItemId: String(product.cartItemId ?? `ci_fallback_${product.slug}`) }
    });
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
    // initialize optionsState from product.options snapshot
    setOptionsState((product.options && Array.isArray(product.options)) ? product.options.map((o: any) => ({ ...o })) : []);
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
    dispatch({ type: Types.updateCartItem, payload: { cartItemId: String(product.cartItemId ?? `ci_fallback_${product.slug}`), changes: { variationId, options: optionsState } } });
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
      next[idx].selected = !next[idx].selected;
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
    <div>
      <div className="flex flex-row mb-3 justify-between">
        <div className="w-4/5 flex flex-row">
          <Image
            src={getSafeImage()}
            width={64}
            height={64}
            className="clickable-img h-auto"
            quality={100}
            alt={title}
          />
          <span className="text-lg ml-4 text-black">{title}</span>
        </div>
        <div className="w-1/5">
          <span className="text-lg text-black">
            ${price * Number(quantity)}
          </span>
        </div>
      </div>
      {/* Show chosen variation / attributes */}
      {product.variationId && (
        <div className="mb-2 text-sm text-gray-700">Selected: {product.variationId}</div>
      )}
      <div className="flex flex-row">
        <button
          onClick={removeWholeProduct}
          className="border border-gray-500 p-1 border-solid w-9 h-9 flex flex-row justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="black"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <input
          type="text"
          className="border border-gray-500 p-1 border-solid bg-transparent ml-2 outline-none text-black flex-1 h-9 pl-3"
          value={quantity}
          disabled
        />
        <button
          className="border border-gray-500 p-1 border-solid w-9 h-9 flex flex-row justify-center items-center text-black font-black text-2xl"
          onClick={removeSingleItem}
        >
          -
        </button>
        <button
          className="border border-gray-500 p-1 border-solid w-9 h-9 flex flex-row justify-center items-center text-black font-black text-2xl"
          onClick={addSingleItem}
        >
          +
        </button>
        <button onClick={openEditModal} className="ml-2 px-3 py-1 border rounded">Edit</button>
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
                <p className="text-sm text-gray-600">No variations available</p>
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
                            type="checkbox"
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
                    <button onClick={saveEdits} disabled={!allSelected} className={`px-4 py-2 text-white rounded ${allSelected ? 'bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}>
                      Save
                    </button>
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
