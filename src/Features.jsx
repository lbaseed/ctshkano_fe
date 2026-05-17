import CreateTrader from "./views/admin/createTrader/CreateTrader";
import Trader from "./views/admin/createTrader/Trader";
import Dashboard from "./views/admin/Dashboard";
import Location from "./views/admin/Location/Location";
import Trade from "./views/admin/Trade/Trade";
import ViewTraders from "./views/admin/ViewTraders/ViewTraders";
import EmpowermentSchemes from "./views/admin/EmpowermentScheme/EmpowermentSchemes";
import EmpowermentSchemeForm from "./views/admin/EmpowermentScheme/EmpowermentSchemeForm";
import EmpowermentSchemeDetail from "./views/admin/EmpowermentScheme/EmpowermentSchemeDetail";
import ViewScheme from "./views/admin/EmpowermentScheme/ViewScheme";
import SchemeApplicationsManagement from "./views/admin/EmpowermentScheme/SchemeApplicationsManagement";
import UserManagement from "./views/admin/UserManagement/UserManagement";
import LgaManagement from "./views/admin/LgaManagement/LgaManagement";
import TradeLocationManagement from "./views/admin/TradeLocation/TradeLocationManagement";
import Profile from "./views/Profile";
import FixTradeLocation from "./views/admin/Fix/FixTradeLocation";
import SchemeViewerDashboard from "./views/admin/EmpowermentScheme/SchemeViewerDashboard";

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
					visible: true
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
					visible: true
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
					visible: true
				},
				{
					name: "Manage LGAs",
					path: "/lga-management",
					icon: (
						<i className="fas fa-map-marked-alt text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <LgaManagement />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
				},
				{
					name: "Manage Trade Locations",
					path: "/trade-locations",
					icon: (
						<i className="fas fa-map-pin text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <TradeLocationManagement />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
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
					visible: true
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
					visible: true
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
					visible: true
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
					name: "Create Scheme",
					path: "/empowerment-schemes/create",
					icon: (
						<i className="fas fa-plus-circle text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <EmpowermentSchemeForm />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
				},
				{
					name: "View Schemes",
					path: "/empowerment-schemes",
					icon: (
						<i className="fas fa-hand-holding-heart text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <EmpowermentSchemes />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
				},
				{
					name: "Edit Scheme",
					path: "/empowerment-schemes/:uuid/edit",
					icon: <i className="fas fa-edit text-blueGray-400 mr-2 text-sm"></i>,
					element: <EmpowermentSchemeForm />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: false
				},
				{
					name: "View Scheme Details",
					path: "/empowerment-schemes/:uuid",
					icon: <i className="fas fa-eye text-blueGray-400 mr-2 text-sm"></i>,
					element: <EmpowermentSchemeDetail />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: false
				},
				{
					name: "View Scheme",
					path: "/empowerment-schemes/view-scheme",
					icon: (
						<i className="fas fa-user-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <ViewScheme />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
				},
				{
					name: "View Scheme (with UUID)",
					path: "/empowerment-schemes/view-scheme/:uuid",
					icon: (
						<i className="fas fa-user-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <ViewScheme />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: false
				},
				{
					name: "Manage Applications",
					path: "/empowerment-schemes/:uuid/applications",
					icon: (
						<i className="fas fa-clipboard-list text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <SchemeApplicationsManagement />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: false
				}
			]
		},
		{
			title: "User Management",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "Manage Users",
					path: "/user-management",
					icon: <i className="fas fa-users text-blueGray-400 mr-2 text-sm"></i>,
					element: <UserManagement />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
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
					visible: true
				},
				{
					name: "Profile",
					path: "/profile",
					icon: <i className="fas fa-user text-blueGray-400 mr-2 text-sm"></i>,
					element: <Profile />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
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
					visible: true
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
					visible: true
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
					visible: true
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
					visible: true
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
					name: "Create Scheme",
					path: "/empowerment-schemes/create",
					icon: (
						<i className="fas fa-plus-circle text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <EmpowermentSchemeForm />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
				},
				{
					name: "View Schemes",
					path: "/empowerment-schemes",
					icon: (
						<i className="fas fa-hand-holding-heart text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <EmpowermentSchemes />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
				},
				{
					name: "Edit Scheme",
					path: "/empowerment-schemes/:uuid/edit",
					icon: <i className="fas fa-edit text-blueGray-400 mr-2 text-sm"></i>,
					element: <EmpowermentSchemeForm />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: false
				},
				{
					name: "View Scheme Details",
					path: "/empowerment-schemes/:uuid",
					icon: <i className="fas fa-eye text-blueGray-400 mr-2 text-sm"></i>,
					element: <EmpowermentSchemeDetail />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: false
				},
				{
					name: "Add Trader to Scheme",
					path: "/empowerment-schemes/scheme",
					icon: (
						<i className="fas fa-user-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <ViewScheme />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: false
				},
				{
					name: "Add Trader to Scheme (with UUID)",
					path: "/empowerment-schemes/scheme/:uuid",
					icon: (
						<i className="fas fa-user-plus text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <ViewScheme />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: false
				},
				{
					name: "Manage Applications",
					path: "/empowerment-schemes/:uuid/applications",
					icon: (
						<i className="fas fa-clipboard-list text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <SchemeApplicationsManagement />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: false
				}
			]
		},
		{
			title: "User Management",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "Manage Users",
					path: "/user-management",
					icon: <i className="fas fa-users text-blueGray-400 mr-2 text-sm"></i>,
					element: <UserManagement />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
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
					visible: true
				},
				{
					name: "Profile",
					path: "/profile",
					icon: <i className="fas fa-user text-blueGray-400 mr-2 text-sm"></i>,
					element: <Profile />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
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
					element: <ViewTraders />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
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
					visible: true
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
					element: <Dashboard />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
				},
				{
					name: "Profile",
					path: "/profile",
					icon: <i className="fas fa-user text-blueGray-400 mr-2 text-sm"></i>,
					element: <Profile />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
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
					visible: true
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
					visible: true
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
					visible: true
				}
			]
		}
	],
	scheme_viewer: [
		{
			title: "Empowerment Schemes",
			path: "",
			className:
				"text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block  transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
			icon: "",
			routes: [
				{
					name: "Schemes Dashboard",
					path: "/scheme-viewer",
					icon: (
						<i className="fas fa-hand-holding-heart text-blueGray-400 mr-2 text-sm"></i>
					),
					element: <SchemeViewerDashboard />,
					className:
						"flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
					visible: true
				}
			]
		}
	]
};

export default Features;
