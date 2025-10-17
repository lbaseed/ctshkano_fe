import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import registerBG from "../assets/img/ctsh_bg.jpg";
import FooterSmall from "../components/Footers/FooterSmall";

// views

import Login from "../views/auth/Login";
import Register from "../views/auth/Register";
import ResetPassword from "../views/auth/ResetPassword";
import { useCookies } from "react-cookie";
import Reset from "../views/auth/Reset";
import Navbar from "../components/Navbars/AuthNavbar";

export function Auth() {
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const navigate = useNavigate();

	useEffect(() => {
		// if (cookies?.luis?.access_token) navigate("/admin/dashboard");
	}, []);

	return (
		<>
			{/* use auth Navbar for links back to main website */}
			{/* <Navbar transparent /> */}
			<main>
				<section className="relative w-full h-full py-40 min-h-screen">
					<div
						className="absolute top-0 w-full h-full bg-blueGray-800 bg-no-repeat bg-cover bg-center"
						style={{
							backgroundImage: "url(" + registerBG + ")"
						}}></div>
					{/* Overlay for better text readability */}
					<div className="absolute top-0 w-full h-full bg-grey bg-opacity-40"></div>

					<Routes>
						<Route path="/auth/*" element={<Navigate to="/auth/login" />} />
						<Route path="/login" exact element={<Login />} />
						{/* <Route path="/register" exact element={<Register />} /> */}
						<Route path="/reset-password" exact element={<ResetPassword />} />
						<Route path="/reset-password/reset" exact element={<Reset />} />
					</Routes>
					<FooterSmall absolute />
				</section>
			</main>
		</>
	);
}

export default Auth;
