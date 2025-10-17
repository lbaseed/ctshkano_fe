import { Link, useLocation, useNavigate } from "react-router-dom";
import context from "../../context/context";
import { useContext, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import { useMutation } from "@apollo/client";
import { UPDATE_FORGOT_PASSWORD } from "../../gql/mutations/mutations";
import { LOADING } from "../../reducer/reducer-types";

const Reset = () => {
	const { state, dispatch } = useContext(context);
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const location = useLocation();
	const navigate = useNavigate();
	const queryParams = new URLSearchParams(location.search);
	const email = queryParams.get("email");
	const token = queryParams.get("token");

	const [performResetAction, { loading, error }] = useMutation(
		UPDATE_FORGOT_PASSWORD
	);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!newPassword || !confirmNewPassword)
			return toast.error("Fill all fields please");

		try {
			dispatch({ type: LOADING, payload: true });

			const result = await performResetAction({
				variables: {
					password: newPassword,
					password_confirmation: confirmNewPassword,
					email,
					token,
				},
			});

			if (result?.data?.updateForgottenPassword) {
				toast.success(
					result?.data?.updateForgottenPassword?.message + " You can now Login"
				);
				navigate("/auth/login");
			} else {
				toast.error("Operation Failed");
			}
			dispatch({ type: LOADING, payload: false });
		} catch (error) {
			dispatch({ type: LOADING, payload: false });
			toast.error("Password reset Failed" + error);
		}
	};

	return (
		<>
			<ToastContainer />
			{state.loading && <Loading />}
			<div className="container mx-auto px-4 h-full">
				<div className="flex content-center items-center justify-center h-full">
					<div className="w-full lg:w-6/12 px-4">
						<div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
							<div className="rounded-t mb-0 px-6 py-6">
								<div className="text-center mb-3">
									<h6 className="text-blueGray-500 text-sm font-bold">
										Reset your password
									</h6>
								</div>
								<hr className="mt-6 border-b-1 border-blueGray-300" />
							</div>
							<div className="flex-auto px-4 lg:px-10 py-10 pt-0">
								<form onSubmit={handleSubmit}>
									<div className="relative w-full mb-3">
										<label
											className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
											htmlFor="grid-password">
											New Password
										</label>
										<input
											type="password"
											className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
											placeholder="New Password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
										/>
									</div>

									<div className="relative w-full mb-3">
										<label
											className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
											htmlFor="grid-password">
											Confirm New Password
										</label>
										<input
											type="password"
											className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
											placeholder="Confirm Password"
											value={confirmNewPassword}
											onChange={(e) => setConfirmNewPassword(e.target.value)}
										/>
									</div>

									<div className="text-center mt-6">
										<button
											className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
											type="submit">
											Change Password
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Reset;
