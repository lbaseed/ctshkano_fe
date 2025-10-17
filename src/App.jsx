import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/styles/tailwind.css";

// layouts

import Admin from "./layouts/Admin";
import Auth from "./layouts/Auth";

// views without layouts

import Landing from "./views/Landing";
import Profile from "./views/Profile";
import Index from "./views/Index";

import ContextProvider from "./context/ContextProvider";

const App = () => {
	return (
		<BrowserRouter>
			<ContextProvider>
				<Routes>
					{/* add routes with layouts */}
					<Route path="/*" exact element={<Navigate to="/auth/login" />} />
					<Route path="/admin/*" element={<Admin />} />
					<Route path="/auth/*" element={<Auth />} />
					{/* add routes without layouts */}
					<Route path="/landing" exact element={<Landing />} />
					<Route path="/profile" exact element={<Profile />} />
				</Routes>
			</ContextProvider>
		</BrowserRouter>
	);
};

export default App;
