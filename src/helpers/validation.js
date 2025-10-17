import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router";

export const currency = (value) => {
	return value && value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&, ");
};

const AutoLogout = ({ logoutTime }) => {
	const [cookies, setCookie, removeCookie] = useCookies(["ctshkano"]);
	const navigate = useNavigate();
	let timeoutId;

	useEffect(() => {
		const resetTimeout = () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			const id = setTimeout(() => {
				removeCookie("ctshkano", { path: "/" });
				localStorage.removeItem("ctshToken");
				navigate("/auth/login");
			}, logoutTime);

			timeoutId = id;
		};

		const events = [
			"mousedown",
			"mousemove",
			"keypress",
			"scroll",
			"touchstart"
		];

		const resetTimeoutHandler = () => {
			resetTimeout();
		};

		events.forEach((event) => {
			window.addEventListener(event, resetTimeoutHandler);
		});

		resetTimeout();

		return () => {
			events.forEach((event) => {
				window.removeEventListener(event, resetTimeoutHandler);
			});

			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [timeoutId]);

	return null;
};

export default AutoLogout;
