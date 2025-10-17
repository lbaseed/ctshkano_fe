import CreateTrader from "./views/admin/createTrader/CreateTrader";
import Trader from "./views/admin/createTrader/Trader";
import Dashboard from "./views/admin/Dashboard";
import Location from "./views/admin/Location/Location";
import Trade from "./views/admin/Trade/Trade";
import ViewTraders from "./views/admin/ViewTraders/ViewTraders";
import EmpowermentSchemes from "./views/admin/EmpowermentScheme/EmpowermentSchemes";
import EmpowermentSchemeForm from "./views/admin/EmpowermentScheme/EmpowermentSchemeForm";
import AddTraderToScheme from "./views/admin/EmpowermentScheme/AddTraderToScheme";

export const Features = {
	super_admin: [
		{
			title: "General Settings",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "Home",
					path: "/dashboard",
					icon: <i className="fas fa-home text-blueGray-400 mr-2 text-sm"></i>,
					element: <Dashboard />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Create Trade",
					path: "/create-trade",
					icon: (
						<i className="fas fa-object-group text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <Trade />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Create Location",
					path: "/create-location",
					icon: (
						<i className="fas fa-object-group text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <Location />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				}
			]
		},
		{
			title: "Trader",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "Enroll Trader",
					path: "/create-trader",
					icon: (
						<i className="fas fa-database text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <CreateTrader />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "View Traders",
					path: "/view-traders",
					icon: (
						<i className="fas fa-shopping-basket text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <ViewTraders />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Search Trader",
					path: "/trader",
					icon: (
						<i className="fas fa-cart-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <Trader />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				}
			]
		},
		{
			title: "Empowerment Schemes",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "View Schemes",
					path: "/empowerment-schemes",
					icon: (
						<i className="fas fa-hand-holding-heart text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <EmpowermentSchemes />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Create Scheme",
					path: "/empowerment-schemes/create",
					icon: (
						<i className="fas fa-plus-circle text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <EmpowermentSchemeForm />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Edit Scheme",
					path: "/empowerment-schemes/:uuid/edit",
					icon: <i className="fas fa-edit text-blueGray-400 mr-2 text-sm"></i>,
					element: <EmpowermentSchemeForm />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: "hidden"
				},
				{
					name: "View Scheme Details",
					path: "/empowerment-schemes/:uuid",
					icon: <i className="fas fa-eye text-blueGray-400 mr-2 text-sm"></i>,
					element: <EmpowermentSchemes />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: "hidden"
				},
				{
					name: "Add Trader to Scheme",
					path: "/empowerment-schemes/add-trader",
					icon: (
						<i className="fas fa-user-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <AddTraderToScheme />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Add Trader to Specific Scheme",
					path: "/empowerment-schemes/:uuid/add-trader",
					icon: (
						<i className="fas fa-user-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <AddTraderToScheme />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: "hidden"
				}
			]
		}
	],
	admin: [
		{
			title: "General Settings",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "Home",
					path: "/dashboard",
					icon: <i className="fas fa-home text-blueGray-400 mr-2 text-sm"></i>,
					element: <Dashboard />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Create Trade",
					path: "/create-trade",
					icon: (
						<i className="fas fa-object-group text-blueGray-400 mr-2 text-sm"></i>
					),
					element: null,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				}
			]
		},
		{
			title: "Trader",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "Enroll Trader",
					path: "/create-trader",
					icon: (
						<i className="fas fa-database text-blueGray-400 mr-2 text-sm"></i>
					),
					element: null,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "View Traders",
					path: "/view-traders",
					icon: (
						<i className="fas fa-shopping-basket text-blueGray-400 mr-2 text-sm"></i>
					),
					element: null,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Search Trader",
					path: "/trader",
					icon: (
						<i className="fas fa-cart-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: null,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				}
			]
		},
		{
			title: "Empowerment Schemes",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "View Schemes",
					path: "/empowerment-schemes",
					icon: (
						<i className="fas fa-hand-holding-heart text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <EmpowermentSchemes />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Create Scheme",
					path: "/empowerment-schemes/create",
					icon: (
						<i className="fas fa-plus-circle text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <EmpowermentSchemeForm />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Edit Scheme",
					path: "/empowerment-schemes/:uuid/edit",
					icon: <i className="fas fa-edit text-blueGray-400 mr-2 text-sm"></i>,
					element: <EmpowermentSchemeForm />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: "hidden"
				},
				{
					name: "View Scheme Details",
					path: "/empowerment-schemes/:uuid",
					icon: <i className="fas fa-eye text-blueGray-400 mr-2 text-sm"></i>,
					element: <EmpowermentSchemes />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: "hidden"
				},
				{
					name: "Add Trader to Scheme",
					path: "/empowerment-schemes/add-trader",
					icon: (
						<i className="fas fa-user-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <AddTraderToScheme />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Add Trader to Specific Scheme",
					path: "/empowerment-schemes/:uuid/add-trader",
					icon: (
						<i className="fas fa-user-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <AddTraderToScheme />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: "hidden"
				}
			]
		}
	],
	executive: [
		{
			title: "General Settings",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "Home",
					path: "/dashboard",
					icon: <i className="fas fa-home text-blueGray-400 mr-2 text-sm"></i>,
					element: <Dashboard />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				}
			]
		},
		{
			title: "Trader",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "View Traders",
					path: "/view-traders",
					icon: (
						<i className="fas fa-shopping-basket text-blueGray-400 mr-2 text-sm"></i>
					),
					element: null,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Search Trader",
					path: "/trader",
					icon: (
						<i className="fas fa-cart-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: null,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				}
			]
		}
	],
	staff: [
		{
			title: "General Settings",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "Home",
					path: "/dashboard",
					icon: <i className="fas fa-home text-blueGray-400 mr-2 text-sm"></i>,
					element: null,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				}
			]
		},
		{
			title: "Trader",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "Enroll Trader",
					path: "/create-trader",
					icon: (
						<i className="fas fa-database text-blueGray-400 mr-2 text-sm"></i>
					),
					element: null,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "View Traders",
					path: "/view-traders",
					icon: (
						<i className="fas fa-shopping-basket text-blueGray-400 mr-2 text-sm"></i>
					),
					element: null,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				},
				{
					name: "Search Trader",
					path: "/trader",
					icon: (
						<i className="fas fa-cart-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: null,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					status: ""
				}
			]
		}
	]
};

export default Features;
