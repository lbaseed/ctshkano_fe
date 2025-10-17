import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
// components

import AdminNavbar from "../components/Navbars/AdminNavbar";
import Sidebar from "../components/Sidebar/Sidebar";
import FooterAdmin from "../components/Footers/FooterAdmin";

// views

import Dashboard from "../views/admin/Dashboard";
import Features from "../Features";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import Profile from "../views/Profile";
import AutoLogout from "../helpers/validation";
import { useQuery } from "@apollo/client";
import Trader from "../views/admin/createTrader/Trader";

const Admin = () => {
	const [cookies, setCookie, removeCookie] = useCookies(["ctshkano"]);
	// const { data, loading } = useQuery(null);
	const navigate = useNavigate();

	// useEffect(() => {
	// 	let nowDt = new Date();
	// 	if (cookies?.ctshkano?.access_token) {
	// 		const decoded = jwtDecode(cookies.ctshkano.access_token);

	// 		if (nowDt.getTime() > decoded.exp * 1000) {
	// 			removeCookie("ctshkano", { path: "/" });
	// 			localStorage.removeItem("ctshToken");
	// 			navigate("/auth/login", { replace: true });
	// 			handleLogout();
	// 		}
	// 	} else {
	// 		navigate("/auth/login", { replace: true });
	// 	}
	// }, []);

	const user = cookies?.ctshkano?.user;

	const handleLogout = () => {
		removeCookie("ctshkano", { path: "/" });
		localStorage.removeItem("ctshToken");
		navigate("/auth/login");
	};

	useEffect(() => {
		if (!cookies.ctshkano) navigate("/auth/login");
	}, []);

	return (
		<>
			{/* <AutoLogout logoutTime={15 * 60 * 1000} /> */}
			<Sidebar />
			<div className="relative md:ml-64 bg-blueGray-100">
				<AdminNavbar />

				<div className="px-4 md:px-10 mx-auto w-full">
					<Routes>
						<Route path="/dashboard" exact element={<Dashboard />} />
						<Route path="/profile" exact element={<Profile />} />
						<Route path="/trader" exact element={<Trader />} />

						{user.clrs === "SUPER_ADMIN" &&
							Features?.super_admin?.map(({ routes }) =>
								routes.map(({ path, element }) => (
									<Route path={path} element={element} />
								))
							)}
						{user.clrs === "ADMIN" &&
							Features?.admin?.map(({ routes }) =>
								routes.map(({ path, element }) => (
									<Route path={path} element={element} />
								))
							)}
						{user.clrs === "EXECUTIVE" &&
							Features?.executive?.map(({ routes }) =>
								routes.map(({ path, element }) => (
									<Route path={path} element={element} />
								))
							)}
						{user.clrs === "STAFF" &&
							Features?.staff?.map(({ routes }) =>
								routes.map(({ path, element }) => (
									<Route path={path} element={element} />
								))
							)}

						<Route path="/*" element={<Navigate to={"/admin/dashboard"} />} />
						<Route path="/logout" exact Component={handleLogout} />
					</Routes>

					{/* <FooterAdmin /> */}
				</div>
			</div>
		</>
	);
};

export default Admin;
