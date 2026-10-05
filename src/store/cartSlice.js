import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: [],
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCartItems(state, action) {
            state.cartItems = action.payload;
        },
        setCartLoading(state, action) {
            state.loading = action.payload;
        },
        setCartError(state, action) {
            state.error = action.payload;
        },
    },
});

export const { setCartItems, setCartLoading, setCartError } = cartSlice.actions;
export default cartSlice.reducer;