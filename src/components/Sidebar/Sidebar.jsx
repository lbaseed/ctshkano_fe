import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import NotificationDropdown from "../../components/Dropdowns/NotificationDropdown";
import UserDropdown from "../Dropdowns/UserDropdown";
import Features from "../../Features";
import { useCookies } from "react-cookie";

export default function Sidebar() {
	const [collapseShow, setCollapseShow] = useState("hidden");
	// const [collapsSchoolConfig, setCollapsSchoolConfig] = useState(false);
	const [cookies, setCookie, removeCookie] = useCookies(["ctshkano"]);

	const user = cookies?.ctshkano?.user;

	return (
		<>
			<nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-white flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
				<div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
					{/* Toggler */}
					<button
						className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
						type="button"
						onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}>
						<i className="fas fa-bars"></i>
					</button>
					{/* Brand */}
					<Link
						className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
						to="/admin/dashboard">
						CTSHA KANO
					</Link>
					{/* User */}
					<ul className="md:hidden items-center flex flex-wrap list-none">
						<li className="inline-block relative">
							<NotificationDropdown />
						</li>
						<li className="inline-block relative">
							<UserDropdown />
						</li>
					</ul>
					{/* Collapse */}
					<div
						className={
							"md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
							collapseShow
						}>
						{/* Collapse header */}
						<div className="md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
							<div className="flex flex-wrap">
								<div className="w-6/12">
									<Link
										className="md:block text-left md:pb-2 text-blueGray-600 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0"
										to="/admin/dashboard">
										LUIS
									</Link>
								</div>
								<div className="w-6/12 flex justify-end">
									<button
										type="button"
										className="cursor-pointer text-black opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
										onClick={() => setCollapseShow("hidden")}>
										<i className="fas fa-times"></i>
									</button>
								</div>
							</div>
						</div>
						{/* Form */}
						<form className="mt-6 mb-4 md:hidden">
							<div className="mb-3 pt-0">
								<input
									type="text"
									placeholder="Search"
									className="px-3 py-2 h-12 border border-solid  border-blueGray-500 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-base leading-snug shadow-none outline-none focus:outline-none w-full font-normal"
								/>
							</div>
						</form>

						{/* Divider */}
						<hr className="my-4 md:min-w-full" />
						{/* Heading */}
						<h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
							Main Navigation
						</h6>

						{/* Navigation */}
						<ul className="md:flex-col md:min-w-full flex flex-col list-none">
							{user.clrs === "SUPER_ADMIN" &&
								Features?.super_admin?.map((feature) => (
									<li className="items-center" key={feature.title}>
										<span className={feature.className}>
											{feature.icon}
											{feature.title}
										</span>
										<ul>
											{feature.routes.map((item) => (
												<li className="items-center" key={item.name}>
													<NavLink
														onClick={() => setCollapseShow("hidden")}
														className={({ isActive }) =>
															isActive
																? "bg-blueGray-200 block p-2 rounded "
																: "" +
																  " rounded p-2 text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
														}
														to={"/admin" + item.path}>
														{item.icon}
														{item.name}
													</NavLink>
												</li>
											))}
										</ul>
									</li>
								))}

							{user.clrs === "ADMIN" &&
								Features?.admin?.map((feature) => (
									<li className="items-center" key={feature.title}>
										<span className={feature.className}>
											{feature.icon}
											{feature.title}
										</span>
										<ul>
											{feature.routes.map((item) => (
												<li className="items-center" key={item.name}>
													<NavLink
														onClick={() => setCollapseShow("hidden")}
														className={({ isActive }) =>
															isActive
																? "bg-blueGray-200 block p-2 rounded "
																: "" +
																  " rounded p-2 text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
														}
														to={"/admin" + item.path}>
														{item.icon}
														{item.name}
													</NavLink>
												</li>
											))}
										</ul>
									</li>
								))}
							{user.clrs === "EXECUTIVE" &&
								Features?.executive?.map((feature) => (
									<li className="items-center" key={feature.title}>
										<span className={feature.className}>
											{feature.icon}
											{feature.title}
										</span>
										<ul>
											{feature.routes.map((item) => (
												<li className="items-center" key={item.name}>
													<NavLink
														onClick={() => setCollapseShow("hidden")}
														className={({ isActive }) =>
															isActive
																? "bg-blueGray-200 block p-2 rounded "
																: "" +
																  " rounded p-2 text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
														}
														to={"/admin" + item.path}>
														{item.icon}
														{item.name}
													</NavLink>
												</li>
											))}
										</ul>
									</li>
								))}
							{user.clrs === "staff" &&
								Features?.staff?.map((feature) => (
									<li className="items-center" key={feature.title}>
										<span className={feature.className}>
											{feature.icon}
											{feature.title}
										</span>
										<ul>
											{feature.routes.map((item) => (
												<li className="items-center" key={item.name}>
													<NavLink
														onClick={() => setCollapseShow("hidden")}
														className={({ isActive }) =>
															isActive
																? "bg-blueGray-200 block p-2 rounded "
																: "" +
																  " rounded p-2 text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
														}
														to={"/admin" + item.path}>
														{item.icon}
														{item.name}
													</NavLink>
												</li>
											))}
										</ul>
									</li>
								))}
						</ul>

						{/* Divider */}
						<hr className="my-4 md:min-w-full" />
						{/* Heading */}
						<h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline">
							User Management
						</h6>
						{/* Navigation */}

						<ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
							<li className="items-center">
								<NavLink
									onClick={() => setCollapseShow("hidden")}
									className={({ isActive }) =>
										isActive
											? "bg-blueGray-200 block p-2 rounded"
											: "" +
											  " rounded p-2 text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
									}
									to="/admin/profile">
									<i className="fas fa-user-circle text-blueGray-400 mr-2 text-sm"></i>{" "}
									My Profile
								</NavLink>
							</li>

							<li className="items-center">
								<NavLink
									onClick={() => setCollapseShow("hidden")}
									className={({ isActive }) =>
										isActive
											? "bg-blueGray-200 block p-2 rounded "
											: "" +
											  " rounded p-2 text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
									}
									to="/admin/logout">
									<i className="fas fa-solid fa-arrow-right-from-bracket text-blueGray-400 mr-2 text-sm"></i>{" "}
									Logout
								</NavLink>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		</>
	);
}
