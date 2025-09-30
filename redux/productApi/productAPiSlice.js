import { apiSlice } from '../services/apiSlice';


const productsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getProduct: builder.query({
			query: ({ sku, slug }) => `/products/${slug}/${sku}/`,
		}),
		getProducts: builder.query({
			query: () => `/products/`, // Fetch all products
		}),
	}),
});

export const { useGetProductQuery, useGetProductsQuery } = productsApiSlice;
