import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  totalQuantity: number;
  hydrated: boolean;
}

const initialState: CartState = {
  totalQuantity: 0,
  hydrated: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartFromServer(state, action: PayloadAction<number>) {
      state.totalQuantity = action.payload;
      state.hydrated = true;
    },
  },
});

export const { setCartFromServer } = cartSlice.actions;
export default cartSlice.reducer;
