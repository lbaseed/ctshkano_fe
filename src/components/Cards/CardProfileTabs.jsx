import { useMutation } from "@apollo/client";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { CHANGE_PASSWORD } from "../../gql/mutations/mutations";
import { LOADING } from "../../reducer/reducer-types";
import context from "../../context/context";

const CardProfileTabs = ({ user, staff }) => {
	const [openTab, setOpenTab] = React.useState(1);
	const { state, dispatch } = useContext(context);

	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");

	const [performChangePassword] = useMutation(CHANGE_PASSWORD);

	const handleChangePassword = async () => {
		if (!oldPassword || !newPassword || !confirmNewPassword)
			return toast.error("fill all fields please");

		if (newPassword?.length < 8)
			return toast.error("Minimum of 8 characters is required");

		if (newPassword !== confirmNewPassword)
			return toast.error("New and confirm password mismatched");

		const variables = {
			oldPassword,
			newPassword,
			confirmNewPassword,
		};

		try {
			dispatch({ type: LOADING, payload: true });
			const result = await performChangePassword({ variables });

			if (result?.data?.updatePassword?.status === "PASSWORD_UPDATED") {
				toast.success(result?.data?.updatePassword?.message);
				setOldPassword("");
				setNewPassword("");
				setConfirmNewPassword("");
			}
			dispatch({ type: LOADING, payload: false });
		} catch (error) {
			toast.error("Error Changing password, use correct credentials please");
			dispatch({ type: LOADING, payload: false });
		}
	};
	return (
		<>
			<div className="flex flex-wrap">
				<div className="w-full">
					<ul
						className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row"
						role="tablist">
						<li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
							<a
								className={
									"text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
									(openTab === 1
										? "text-white bg-emerald-500"
										: "text-emerald-600 bg-white")
								}
								onClick={(e) => {
									e.preventDefault();
									setOpenTab(1);
								}}
								data-toggle="tab"
								href="#link1"
								role="tablist">
								<i className="fas fa-space-shuttle text-base mr-1"></i>
								Profile
							</a>
						</li>
						<li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
							<a
								className={
									"text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
									(openTab === 2
										? "text-white bg-emerald-500"
										: "text-emerald-600 bg-white")
								}
								onClick={(e) => {
									e.preventDefault();
									setOpenTab(2);
								}}
								data-toggle="tab"
								href="#link2"
								role="tablist">
								<i className="fas fa-key text-base mr-1"></i>
								Change Password
							</a>
						</li>
						<li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
							<a
								className={
									"text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
									(openTab === 3
										? "text-white bg-emerald-500"
										: "text-emerald-600 bg-white")
								}
								onClick={(e) => {
									e.preventDefault();
									setOpenTab(3);
								}}
								data-toggle="tab"
								href="#link2"
								role="tablist">
								<i className="fa fa-user text-base mr-1"></i>
								Staff
							</a>
						</li>
					</ul>
					<div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6">
						<div className="px-4 py-5 flex-auto">
							<div className="tab-content tab-space">
								<div className={openTab === 1 ? "block" : "hidden"} id="link1">
									<div className="text-center">
										<h3 className="text-4xl font-semibold leading-normal text-blueGray-700 mb-2">
											{user?.name}
										</h3>
										<div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-semi-bold">
											<i className="fas fa-envelope mr-2 text-lg text-blueGray-400"></i>{" "}
											{user?.email}
										</div>
										<div className="mb-2 text-blueGray-400 mt-2">
											<i className="fas fa-briefcase mr-2 text-lg text-blueGray-400"></i>
											{user?.business?.name}
										</div>
										<div className="mb-2 text-blueGray-400">
											<i className="fas fa-university mr-2 text-lg text-blueGray-400"></i>
											{user?.business?.address}
										</div>
									</div>
								</div>
								<div className={openTab === 2 ? "block" : "hidden"} id="link2">
									<div className="text-center">
										<div className="relative w-full lg:w-6/12 mb-3">
											<label
												id="item-cost"
												className="block uppercase text-left text-blueGray-600 text-xs font-bold mb-2">
												Old Password *
											</label>
											<input
												id="item-cost-value"
												type="password"
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												value={oldPassword}
												onChange={(e) => setOldPassword(e.target.value)}
											/>
										</div>
										<div className="relative w-full lg:w-6/12 mb-3">
											<label
												id="item-cost"
												className="block uppercase text-left text-blueGray-600 text-xs font-bold mb-2">
												New Password *
											</label>
											<input
												id="item-cost-value"
												type="password"
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
											/>
										</div>
										<div className="relative w-full lg:w-6/12 mb-3">
											<label
												id="item-cost"
												className="block uppercase text-left text-blueGray-600 text-xs font-bold mb-2">
												Confirm New Password *
											</label>
											<input
												id="item-cost-value"
												type="password"
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												value={confirmNewPassword}
												onChange={(e) => setConfirmNewPassword(e.target.value)}
											/>
										</div>
										<div>
											<button
												onClick={handleChangePassword}
												type="button"
												className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-md px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mt-2 ease-linear transition-all duration-150">
												Change Password
											</button>
										</div>
									</div>
								</div>
								<div className={openTab === 3 ? "block" : "hidden"} id="link2">
									<div className="block overflow-x-auto w-full ">
										<table className="w-full text-left">
											<thead>
												<tr>
													<th>SN</th>
													<th>Full Name</th>
													<th>Phone</th>
													<th>Photo</th>
													<th>Email</th>
													<th>User Level</th>
												</tr>
											</thead>
											<tbody>
												{staff &&
													staff?.map((myStaff, index) => (
														<tr key={myStaff.uuid}>
															<td>{index + 1}</td>
															<td>{myStaff?.name}</td>
															<td>{myStaff?.phone}</td>
															<td>
																{myStaff?.avatar && (
																	<img
																		src={
																			import.meta.env.VITE_API_DATA +
																			myStaff?.avatar
																		}
																		className="rounded-full shadow-lg"
																		width="50"
																		height="50"
																	/>
																)}
															</td>
															<td>{myStaff?.email}</td>
															<td>{myStaff?.clrs}</td>
														</tr>
													))}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default CardProfileTabs;
