import { apiSlice } from "../services/apiSlice";

// Type definitions for API responses
interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number | null;
  quantity: number;
}

interface CartResponse {
  items: CartItem[];
  quantity: number;
}

interface AddToCartArgs {
  product_id: number;
  variant_id?: number | null;
  quantity: number;
}

interface AddToCartResponse {
  message: string;
  cart_item_id: number;
}

// Define API Endpoints
const CART_ENDPOINTS = {
  GET_CART: "/v1/order/quantity/",
  ADD_TO_CART: "/v1/order/add-to-cart/",
};

// Inject cart endpoints into the API slice
const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch Cart Items
    getCart: builder.query<CartResponse, void>({
      query: () => ({
        url: CART_ENDPOINTS.GET_CART,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [{ type: "Cart" }]
          : [], // Prevents unnecessary re-fetching
    }),
    // Add to Cart Mutation
    addToCart: builder.mutation<AddToCartResponse, AddToCartArgs>({
      query: ({ product_id, variant_id, quantity }) => ({
        url: CART_ENDPOINTS.ADD_TO_CART,
        method: "POST",
        body: { product_id, variant_id, quantity },
      }),
      invalidatesTags: ["Cart"], // Forces cart re-fetch on change
    }),
    syncGuestCart: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/v1/order/sync-guest-cart/',
        method: 'POST',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

// Export hooks for components
export const { useGetCartQuery, useAddToCartMutation, useSyncGuestCartMutation } = cartApiSlice;
