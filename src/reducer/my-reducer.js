import { LOADING, LOGIN_USER, LOGOUT_USER } from "./reducer-types";

const myReducer = (state, action) => {
	switch (action.type) {
		case LOGIN_USER:
			// add token to browser cookies

			return {
				...state,
				me: {
					...state.me,
					token: action.payload.token,
					userId: action.payload.userId,
				},
				business: {},
				isLoggedIn: true,
			};
		case LOGOUT_USER:
			localStorage.setItem("luisToken", null);
			return {
				...state,
				me: {
					...state.me,
					token: null,
					userId: null,
				},
				isLoggedIn: false,
			};
		case LOADING:
			return {
				...state,
				loading: action.payload
			}
		default:
			throw new Error("No case found");
	}
};

export default myReducer;
