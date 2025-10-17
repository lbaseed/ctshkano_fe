import { Link } from "react-router-dom";
import githubSvg from "../../assets/img/github.svg";
import googleSvg from "../../assets/img/google.svg";
import context from "../../context/context";
import { useContext, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import { useMutation } from "@apollo/client";
import { FORGOT_PASSWORD } from "../../gql/mutations/mutations";
import { LOADING } from "../../reducer/reducer-types";

const ResetPassword = () => {
	const { state, dispatch } = useContext(context);
	const [email, setEmail] = useState("");

	const [performSendLink, { loading, error }] = useMutation(FORGOT_PASSWORD);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (email.length < 3) return toast.error("Enter email please");

		try {
			dispatch({ type: LOADING, payload: true });

			const result = await performSendLink({ variables: { email } });

			if (result?.data?.forgotPassword) {
				toast.success(result?.data?.forgotPassword?.message);
			} else {
				toast.error("Operation Failed");
			}
			dispatch({ type: LOADING, payload: false });
			setEmail("");
		} catch (error) {
			dispatch({ type: LOADING, payload: false });
			toast.error("Sending Link Failed" + error);
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
											Email
										</label>
										<input
											type="email"
											className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
											placeholder="Email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>

									<div className="text-center mt-6">
										<button
											className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
											type="submit">
											Send Reset Link
										</button>
									</div>
								</form>
							</div>
						</div>
						<div className="flex flex-wrap mt-6 relative">
							<div className="w-1/2">
								<Link to="/auth/login" className="text-blueGray-200">
									<small>Sign in to your account</small>
								</Link>
							</div>

							<div className="w-1/2 text-right">
								<Link to="/auth/register" className="text-blueGray-200">
									<small>Create New Account</small>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ResetPassword;
