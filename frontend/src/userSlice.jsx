import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        email: "",
        password: "",
        currentUser: null
    },

    reducers: {
        registerUser: (state, values) => {
            state.email = values.payload.email;
            state.password = values.payload.password;
            currentUser = values.payload;
        },
        loginUser: (state, values) => {
            currentUser = values.payload;
        },
        logoutUser: (state) => {
            currentUser = null;
        }
    }

});

export const {registerUser, loginUser, logoutUser} = userSlice.actions;
export default userSlice.reducer;