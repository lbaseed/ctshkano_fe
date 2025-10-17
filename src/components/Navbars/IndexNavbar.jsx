/*eslint-disable*/
import React from "react";
import { Link, NavLink } from "react-router-dom";
// components

import IndexDropdown from "../../components/Dropdowns/IndexDropdown";

const Navbar = (props) => {
	const [navbarOpen, setNavbarOpen] = React.useState(false);
	return (
		<>
			<nav className="top-0 fixed z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg bg-white shadow">
				<div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
					<div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
						<Link
							to="/"
							className="text-blueGray-700 text-sm font-bold leading-relaxed inline-block lg:hidden py-2 whitespace-nowrap uppercase">
							LUIS
						</Link>
						<button
							className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
							type="button"
							onClick={() => setNavbarOpen(!navbarOpen)}>
							<i className="fas fa-bars"></i>
						</button>
					</div>
					<div>
						<ul className="lg:flex lg:flex-row hidden list-none lg:mx-auto">
							<li>
								<NavLink
									className={({ isActive }) =>
										isActive
											? "bg-blueGray-200 block p-2 rounded "
											: "" +
											  "text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-4 py-2 whitespace-nowrap uppercase"
									}
									to="/">
									Home
								</NavLink>
							</li>
							<li>
								<NavLink
									className={({ isActive }) =>
										isActive
											? "bg-blueGray-200 block p-2 rounded "
											: "" +
											  "text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-4 py-2 whitespace-nowrap uppercase"
									}
									to="/about">
									About
								</NavLink>
							</li>
							<li>
								<NavLink
									className={({ isActive }) =>
										isActive
											? "bg-blueGray-200 block p-2 rounded "
											: "" +
											  "text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-4 py-2 whitespace-nowrap uppercase"
									}
									to="/contact">
									Contact Us
								</NavLink>
							</li>
							<li>
								<NavLink
									className={({ isActive }) =>
										isActive
											? "bg-blueGray-200 block p-2 rounded "
											: "" +
											  "text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-4 py-2 whitespace-nowrap uppercase"
									}
									to="/blog">
									Blog
								</NavLink>
							</li>
							<li>
								<NavLink
									className={({ isActive }) =>
										isActive
											? "bg-blueGray-200 block p-2 rounded "
											: "" +
											  "text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-4 py-2 whitespace-nowrap uppercase"
									}
									to="/price">
									Price
								</NavLink>
							</li>
						</ul>
					</div>
					<div
						className={
							"lg:flex flex-grow items-center bg-white lg:bg-opacity-0 lg:shadow-none" +
							(navbarOpen ? " block" : " hidden")
						}
						id="example-navbar-warning">
						<ul
							onClick={() => setNavbarOpen(!navbarOpen)}
							className="flex flex-col lg:flex-row list-none lg:ml-auto">
							<NavLink
								className={({ isActive }) =>
									isActive
										? "bg-blueGray-200 block p-2 rounded font-bold px-3 mx-4 lg:hidden"
										: "" +
										  "text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-4 py-2 whitespace-nowrap uppercase px-3"
								}
								to="/">
								<li className="lg:hidden">Home</li>
							</NavLink>
							<NavLink
								className={({ isActive }) =>
									isActive
										? "bg-blueGray-200 block p-2 rounded font-bold px-3 mx-4 lg:hidden"
										: "" +
										  "text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-4 py-2 whitespace-nowrap uppercase px-3"
								}
								to="/about">
								<li className="lg:hidden">About</li>
							</NavLink>
							<NavLink
								className={({ isActive }) =>
									isActive
										? "bg-blueGray-200 block p-2 rounded font-bold px- mx-4 lg:hidden"
										: "" +
										  "text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-4 py-2 whitespace-nowrap uppercase px-3"
								}
								to="/contact">
								<li className="lg:hidden">Contact Us</li>
							</NavLink>
							<NavLink
								className={({ isActive }) =>
									isActive
										? "bg-blueGray-200 block p-2 rounded font-bold px- mx-4 lg:hidden"
										: "" +
										  "text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-4 py-2 whitespace-nowrap uppercase px-3"
								}
								to="/blog">
								<li className="lg:hidden">Blog</li>
							</NavLink>
							<NavLink
								className={({ isActive }) =>
									isActive
										? "bg-blueGray-200 block p-2 rounded font-bold px- mx-4 lg:hidden"
										: "" +
										  "text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-4 py-2 whitespace-nowrap uppercase px-3"
								}
								to="/price">
								<li className="lg:hidden">Price</li>
							</NavLink>
							<NavLink
								className={
									"text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-2 py-2 whitespace-nowrap uppercase px-3"
								}
								to="/auth/login">
								<li>Login</li>
							</NavLink>
							<NavLink
								className={
									"text-blueGray-700 text-sm font-bold leading-relaxed inline-block mx-2 py-2 whitespace-nowrap uppercase px-3"
								}
								to="/auth/register">
								<li>Register</li>
							</NavLink>
							<li className="flex items-center">
								<Link
									className="hover:text-blueGray-500 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
									to="#"
									target="_blank">
									<i className="text-blueGray-400 fab fa-facebook text-lg leading-lg " />
									<span className="lg:hidden inline-block ml-2">Facebook</span>
								</Link>
							</li>

							<li className="flex items-center">
								<Link
									className="hover:text-blueGray-500 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
									to="#"
									target="_blank">
									<i className="text-blueGray-400 fab fa-x text-lg leading-lg " />
									<span className="lg:hidden inline-block ml-2">Tweet</span>
								</Link>
							</li>

							<li className="flex items-center">
								<Link
									className="hover:text-blueGray-500 text-blueGray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
									to="#"
									target="_blank">
									<i className="text-blueGray-400 fab fa-instagram text-lg leading-lg " />
									<span className="lg:hidden inline-block ml-2">Instagram</span>
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		</>
	);
};

export default Navbar;
