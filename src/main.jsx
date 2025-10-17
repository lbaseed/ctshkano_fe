import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { CookiesProvider } from "react-cookie";

import { ApolloLink } from "@apollo/client/link/core";
import { setContext } from "@apollo/client/link/context";
// import { createHttpLink } from "@apollo/client/link/http";
import { PrimeReactProvider } from "primereact/api";
import Tailwind from "primereact/passthrough/tailwind";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "react-toastify/dist/ReactToastify.css";
import "antd/dist/reset.css"; // Ant Design CSS reset

const httpLink = createUploadLink({
	uri: import.meta.env.VITE_API_KEY
});

const authLink = setContext((_, { headers }) => {
	const token = localStorage.getItem("ctshToken");
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : ""
		}
	};
});

const link = ApolloLink.from([authLink, httpLink]);

const client = new ApolloClient({
	link: link,
	cache: new InMemoryCache()
});

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<CookiesProvider>
			<ApolloProvider client={client}>
				<App />
			</ApolloProvider>
		</CookiesProvider>
	</React.StrictMode>
);
