import React, { useContext, useEffect, useState } from "react";
import human from "../assets/img/human.jpg";
import { useCookies } from "react-cookie";
import context from "../context/context";
import CardProfileTabs from "../components/Cards/CardProfileTabs";
import { ToastContainer, toast } from "react-toastify";
import Loading from "../components/Loading/Loading";
import CustomModal from "../components/Modals/CustomModal";
import Select from "react-select";
import { GET_USERS } from "../gql/queries/queries";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_USER, UPDATE_USER_AVATAR } from "../gql/mutations/mutations";
import { LOADING } from "../reducer/reducer-types";

const Profile = () => {
	const { state, dispatch } = useContext(context);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [showCreateModal, setShowCreateModal] = useState(false);

	const [staff, setStaff] = useState([]);
	const [fullname, setFullname] = useState("");
	const [email, setEmail] = useState("");
	const [clrs, setClrs] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [phone, setPhone] = useState("");

	const user = cookies?.ctshkano && cookies?.ctshkano?.user;
	let ctshkanoCookie = cookies?.ctshkano;

	const avatar = import.meta.env.VITE_API_DATA + user.avatar;

	const [file, setFile] = useState(user.avatar ? avatar : human);

	const { data: staffData, loading: staffLoading } = useQuery(GET_USERS, {
		fetchPolicy: "cache-and-network"
	});

	const [createUser] = useMutation(CREATE_USER, {
		refetchQueries: [{ query: GET_USERS }]
	});

	const [performUpload] = useMutation(UPDATE_USER_AVATAR);

	useEffect(() => {
		setStaff(staffData?.myStaff);
	}, [staffLoading]);

	let options = [
		{ value: "", label: "Select" },
		{ value: "Sales", label: "Sales" },
		{ value: "Sales_Manager", label: "Sales Manager" },
		{ value: "Stock_Manager", label: "Stock Manager" },
		{ value: "Senior_Manager", label: "Senior Manager" }
	];

	const handleCreateUser = async (e) => {
		e.preventDefault();

		if (!fullname || !email || !password || !confirmPassword || !clrs)
			return toast.error("Please all required Fields");

		if (password !== confirmPassword) return toast.error("Password Mismatched");

		const variables = {
			name: fullname,
			email,
			password,
			confirmPassword,
			clrs,
			phone
		};

		try {
			dispatch({ type: LOADING, payload: true });

			const result = await createUser({ variables });

			if (result.data) {
				setStaff((current) => [...current, result.data.createUser]);
				toast.success("Staff Acount Created Successfullly");
				setShowCreateModal(false);
			}
			setShowCreateModal(false);
			dispatch({ type: LOADING, payload: false });
			setFullname("");
			setEmail("");
			setPassword("");
			setPhone("");
			setConfirmPassword("");
		} catch (error) {
			dispatch({ type: LOADING, payload: false });
			toast.error(error);
			setShowCreateModal(false);
		}
	};

	const handleImageChange = async (e) => {
		setFile(URL.createObjectURL(e.target.files[0]));

		try {
			dispatch({ type: LOADING, payload: true });
			const file = e.target.files[0];
			const result = await performUpload({
				variables: {
					file
				}
			});

			if (result?.data?.updateUserAvatar) {
				toast.success("Photo Upload Successful");
				dispatch({ type: LOADING, payload: false });
			}

			dispatch({ type: LOADING, payload: false });

			luisCookie = {
				...luisCookie,
				user: {
					...luisCookie.user,
					avatar: result?.data?.updateUserAvatar.avatar
				}
			};

			let expires = new Date();
			expires.setTime(expires.getTime() + luisCookie.expires_in * 1000);

			setCookie("luis", luisCookie, {
				path: "/",
				expires,
				SameSite: "None"
			});
		} catch (error) {
			dispatch({ type: LOADING, payload: false });
			toast.error(error);
		}
	};

	return (
		<>
			<ToastContainer />
			{state.loading && <Loading />}
			{showCreateModal && (
				<CustomModal
					title="Add New User"
					confirm={handleCreateUser}
					okText="Create"
					cancel={() => setShowCreateModal(false)}>
					<>
						<h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
							Add New User
						</h6>
						<div className="flex flex-wrap">
							<div className="w-full lg:w-6/12 px-4">
								<div className="relative w-full mb-3">
									<label
										id="item-name"
										className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
										htmlFor="grid-password">
										Full Name *
									</label>
									<input
										id="full-name-value"
										type="text"
										className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
										placeholder="abc..."
										value={fullname}
										onChange={(e) => setFullname(e.target.value)}
									/>
								</div>

								<div className="relative w-full mb-3">
									<label
										id="email"
										className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
										htmlFor="email">
										Email *
									</label>
									<input
										id="item-cost-value"
										type="email"
										className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
										placeholder="abc..."
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>

								<div className="relative w-full mb-3">
									<label
										id="email"
										className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
										htmlFor="passwor">
										Password *
									</label>
									<input
										id="item-cost-value"
										type="password"
										className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
										placeholder="abc..."
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
								</div>

								<div className="relative w-full mb-3">
									<label
										id="email"
										className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
										htmlFor="conf_password">
										Confirm Password *
									</label>
									<input
										id="item-cost-value"
										type="password"
										className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
										placeholder="abc..."
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
									/>
								</div>

								<div className="relative w-full mb-3">
									<label
										id="email"
										className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
										htmlFor="conf_password">
										Phone Number
									</label>
									<input
										id="item-cost-value"
										type="text"
										className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
										placeholder="abc..."
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
									/>
								</div>

								<div className="relative w-full mb-3">
									<label
										id="item-group"
										className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
										htmlFor="grid-password">
										Clearance Level *
									</label>
									<Select
										name="group"
										options={options}
										onChange={(value) => setClrs(value.value)}
									/>
								</div>
							</div>
						</div>
					</>
				</CustomModal>
			)}
			<main className="profile-page">
				<section className="relative block h-500-px">
					<div
						className="absolute top-0 w-full h-full bg-center bg-cover"
						style={{
							backgroundImage:
								"url('https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80')"
						}}>
						<span
							id="blackOverlay"
							className="w-full h-full absolute opacity-50 bg-black"></span>
					</div>
					<div
						className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
						style={{ transform: "translateZ(0)" }}>
						<svg
							className="absolute bottom-0 overflow-hidden"
							xmlns="http://www.w3.org/2000/svg"
							preserveAspectRatio="none"
							version="1.1"
							viewBox="0 0 2560 100"
							x="0"
							y="0">
							<polygon
								className="text-blueGray-200 fill-current"
								points="2560 0 2560 100 0 100"></polygon>
						</svg>
					</div>
				</section>
				<section className="relative py-16 bg-blueGray-200">
					<div className="container mx-auto px-4">
						<div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
							<div className="px-6">
								<div className="flex flex-wrap justify-center">
									<div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
										<div className="relative">
											<img
												alt="..."
												src={file}
												className="shadow-2xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
												style={{ width: "150px", height: "150px" }}
											/>
											<label
												className="absolute bottom-0 right-0 rounded-full bg-emerald-400 items-center justify-center text-center text-white p-3"
												style={{
													width: "50px",
													height: "50px",
													border: "0px solid #000",
													marginRight: "0px"
												}}>
												<input
													className=" "
													type="file"
													accept="image/*"
													required
													onChange={handleImageChange}
													style={{
														display: "none",
														border: "1px solid #000",
														width: "100px",
														height: "40px",
														textDecoration: "none"
													}}
												/>
												<i className="fa fa-pencil"></i>
											</label>
										</div>
									</div>
									<div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
										<div className="py-6 px-3 mt-32 sm:mt-0">
											{user.clrs === "Owner" && (
												<button
													onClick={() => setShowCreateModal(true)}
													className="bg-lightBlue-500 active:bg-lightBlue-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
													type="button">
													Create Staff
												</button>
											)}
										</div>
									</div>
									{/* <div className="w-full lg:w-4/12 px-4 lg:order-1">
										<div className="flex justify-center py-4 lg:pt-4 pt-8">
											<div className="mr-4 p-3 text-center">
												<span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
													22
												</span>
												<span className="text-sm text-blueGray-400">
													Friends
												</span>
											</div>
											<div className="mr-4 p-3 text-center">
												<span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
													10
												</span>
												<span className="text-sm text-blueGray-400">
													Photos
												</span>
											</div>
											<div className="lg:mr-4 p-3 text-center">
												<span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
													89
												</span>
												<span className="text-sm text-blueGray-400">
													Comments
												</span>
											</div>
										</div>
									</div> */}
								</div>

								<div className="mt-8">
									<CardProfileTabs user={user} staff={staff} />
								</div>

								<div className="mt-10 py-10 border-t border-blueGray-200 text-center">
									<div className="flex flex-wrap justify-center">
										{/* <div className="w-full lg:w-9/12 px-4">
											<p className="mb-4 text-lg leading-relaxed text-blueGray-700">
												An artist of considerable range, Jenna the name taken by
												Melbourne-raised, Brooklyn-based Nick Murphy writes,
												performs and records all of his own music, giving it a
												warm, intimate feel with a solid groove structure. An
												artist of considerable range.
											</p>
											<a
												href="#pablo"
												className="font-normal text-lightBlue-500"
												onClick={(e) => e.preventDefault()}>
												Show more
											</a>
										</div> */}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</>
	);
};

export default Profile;
