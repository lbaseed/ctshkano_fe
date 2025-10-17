import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../../gql/mutations/mutations";
import { useCookies } from "react-cookie";
import Loading from "../../components/Loading/Loading";
import context from "../../context/context";
import { ToastContainer, toast } from "react-toastify";
import { LOADING } from "../../reducer/reducer-types";

const Login = () => {
	const { state, dispatch } = useContext(context);
	const navigate = useNavigate();
	const [showModal, setShowModal] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [loginUser, { loading, error }] = useMutation(LOGIN_USER);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (email.length > 0 && password.length > 0) {
			try {
				dispatch({ type: LOADING, payload: true });

				const result = await loginUser({
					variables: { email, password }
				});
				localStorage.setItem("ctshToken", result.data.login.access_token);

				let expires = new Date();
				expires.setTime(
					expires.getTime() + result.data.login.expires_in * 1000
				);

				setCookie("ctshkano", result?.data?.login, {
					path: "/",
					expires,
					SameSite: "None"
				});
				dispatch({ type: LOADING, payload: false });

				navigate("/admin/dashboard");

				// window.location.reload();
			} catch (err) {
				dispatch({ type: LOADING, payload: false });
				toast.error("Login Failed");
			}
		} else {
			toast.error("Fill all fields please");
		}
	};
	return (
		<>
			<ToastContainer />
			{state.loading && <Loading />}
			<div className="container mx-auto px-4 h-full relative z-10">
				<div className="flex content-center items-center justify-center h-full">
					<div className="w-full lg:w-5/12 xl:w-4/12 px-4">
						<div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-2xl rounded-lg bg-white border-0 backdrop-blur-sm">
							<div className="rounded-t mb-0 px-6 py-6">
								<div className="text-center mb-3">
									<h3 className="text-blueGray-700 text-2xl font-bold mb-2">
										Welcome Back
									</h3>
									<p className="text-blueGray-500 text-sm">
										Sign in to your CTSH Kano Account
									</p>
								</div>

								<hr className="mt-6 border-b-1 border-blueGray-300" />
							</div>
							<div className="flex-auto px-4 lg:px-10 py-10 pt-0">
								<form onSubmit={handleSubmit}>
									<div className="relative w-full mb-4">
										<label
											className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
											htmlFor="email-input">
											Email
										</label>
										<input
											id="email-input"
											type="email"
											className="border-0 px-4 py-4 placeholder-blueGray-300 text-blueGray-600 bg-gray-50 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-full ease-linear transition-all duration-200"
											placeholder="Enter your email address"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>

									<div className="relative w-full mb-6">
										<label
											className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
											htmlFor="password-input">
											Password
										</label>
										<input
											id="password-input"
											type="password"
											className="border-0 px-4 py-4 placeholder-blueGray-300 text-blueGray-600 bg-gray-50 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white w-full ease-linear transition-all duration-200"
											placeholder="Enter your password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
									</div>
									<div className="mb-6">
										<label className="inline-flex items-center cursor-pointer">
											<input
												id="customCheckLogin"
												type="checkbox"
												className="form-checkbox border-2 border-gray-300 rounded text-blue-500 w-5 h-5 ease-linear transition-all duration-150 focus:ring-2 focus:ring-blue-500"
											/>
											<span className="ml-3 text-sm font-medium text-blueGray-600">
												Remember me
											</span>
										</label>
									</div>

									<div className="text-center">
										<button
											className="w-full bg-black-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
											type="submit">
											Sign In
										</button>
									</div>
								</form>
							</div>
						</div>
						<div className="flex flex-wrap mt-8 relative z-10">
							<div className="w-1/2">
								<Link
									to="/auth/reset-password"
									className="text-white hover:text-blue-200 transition-colors duration-200">
									<small className="text-sm font-medium">
										Forgot Password?
									</small>
								</Link>
							</div>
							<div className="w-1/2 text-right">
								<Link
									to="/auth/register"
									className="text-white hover:text-blue-200 transition-colors duration-200">
									<small className="text-sm font-medium">
										Create new account
									</small>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
