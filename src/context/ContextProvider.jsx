import { useReducer } from "react";
import myReducer from "../reducer/my-reducer";
import Context from "./context";

export const initialState = {
	me: {},
	business: null,
	isLoggedIn: false,
	loading: false,
};

const ContextProvider = ({ children }) => {
	const [state, dispatch] = useReducer(myReducer, initialState);
	return (
		<Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
	);
};

export default ContextProvider;
