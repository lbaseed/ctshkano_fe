import React, { useContext, useEffect, useState } from "react";
import human from "../assets/img/human.jpg";
import { useCookies } from "react-cookie";
import context from "../context/context";
import CardProfileTabs from "../components/Cards/CardProfileTabs";
import { ToastContainer, toast } from "react-toastify";
import Loading from "../components/Loading/Loading";
import {
	Card,
	Avatar,
	Button,
	Modal,
	Form,
	Input,
	Select,
	Space,
	Typography,
	Row,
	Col,
	Upload,
	Badge,
	Divider,
	Tooltip,
	Tag
} from "antd";
import {
	UserOutlined,
	CameraOutlined,
	MailOutlined,
	PhoneOutlined,
	PlusOutlined,
	EditOutlined,
	BankOutlined,
	TeamOutlined
} from "@ant-design/icons";
import { GET_USERS } from "../gql/queries/queries";
import { useMutation, useQuery } from "@apollo/client";
import {
	CREATE_USER,
	UPDATE_USER,
	DELETE_USER,
	UPDATE_USER_AVATAR
} from "../gql/mutations/mutations";
import { LOADING } from "../reducer/reducer-types";

const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
	const { state, dispatch } = useContext(context);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingUser, setEditingUser] = useState(null);

	const [staff, setStaff] = useState([]);

	// Edit form states
	const [editFullname, setEditFullname] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [editClrs, setEditClrs] = useState("");
	const [editPhone, setEditPhone] = useState("");

	// Self-edit profile states
	const [showSelfEditModal, setShowSelfEditModal] = useState(false);
	const [selfEditName, setSelfEditName] = useState("");
	const [selfEditPhone, setSelfEditPhone] = useState("");

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

	const [updateUser] = useMutation(UPDATE_USER, {
		refetchQueries: [{ query: GET_USERS }]
	});

	const [deleteUser] = useMutation(DELETE_USER, {
		refetchQueries: [{ query: GET_USERS }]
	});

	const [performUpload] = useMutation(UPDATE_USER_AVATAR);

	useEffect(() => {
		if (staffData?.myStaff) {
			setStaff(staffData.myStaff);
		}
	}, [staffData, staffLoading]);

	let options = [
		{ value: "", label: "Select" },
		{ value: "Sales", label: "Sales" },
		{ value: "Sales_Manager", label: "Sales Manager" },
		{ value: "Stock_Manager", label: "Stock Manager" },
		{ value: "Senior_Manager", label: "Senior Manager" }
	];

	const handleCreateUser = async (values) => {
		const { fullname, email, password, confirmPassword, clrs, phone } = values;

		if (password !== confirmPassword) {
			return toast.error("Password Mismatched");
		}

		try {
			dispatch({ type: LOADING, payload: true });

			const result = await createUser({
				variables: {
					name: fullname,
					email,
					password,
					confirmPassword,
					clrs,
					phone
				}
			});

			if (result.data) {
				setStaff((current) => [...current, result.data.createUser]);
				toast.success("Staff Account Created Successfully!");
				setShowCreateModal(false);
				// Clear form
				setFullname("");
				setEmail("");
				setPassword("");
				setPhone("");
				setConfirmPassword("");
				setClrs("");
			}
		} catch (error) {
			toast.error(error.message || "Failed to create user");
		} finally {
			dispatch({ type: LOADING, payload: false });
		}
	};

	const handleEditUser = async (values) => {
		const { fullname, email, clrs, phone } = values;

		try {
			dispatch({ type: LOADING, payload: true });

			const result = await updateUser({
				variables: {
					uuid: editingUser.uuid,
					name: fullname,
					email,
					clrs,
					phone
				}
			});

			if (result.data) {
				setStaff((current) =>
					current.map((staffMember) =>
						staffMember.uuid === editingUser.uuid
							? { ...staffMember, ...result.data.updateUser }
							: staffMember
					)
				);
				toast.success("Staff Member Updated Successfully!");
				setShowEditModal(false);
				setEditingUser(null);
			}
		} catch (error) {
			toast.error(error.message || "Failed to update user");
		} finally {
			dispatch({ type: LOADING, payload: false });
		}
	};

	const openEditModal = (staffMember) => {
		setEditingUser(staffMember);
		setEditFullname(staffMember.name || "");
		setEditEmail(staffMember.email || "");
		setEditClrs(staffMember.clrs || "");
		setEditPhone(staffMember.phone || "");
		setShowEditModal(true);
	};

	const closeEditModal = () => {
		setShowEditModal(false);
		setEditingUser(null);
		setEditFullname("");
		setEditEmail("");
		setEditClrs("");
		setEditPhone("");
	};

	const openSelfEditModal = () => {
		setSelfEditName(user?.name || "");
		setSelfEditPhone(user?.phone || "");
		setShowSelfEditModal(true);
	};

	const handleSelfEditSubmit = async (values) => {
		try {
			dispatch({ type: LOADING, payload: true });
			const result = await updateUser({
				variables: {
					uuid: user.uuid,
					name: values.selfName,
					phone: values.selfPhone,
					email: user.email,
					clrs: user.clrs
				}
			});
			if (result.data) {
				toast.success("Profile updated successfully!");
				setShowSelfEditModal(false);
			}
		} catch (error) {
			toast.error(error.message || "Failed to update profile");
		} finally {
			dispatch({ type: LOADING, payload: false });
		}
	};

	const handleDeleteUser = async (staffMember) => {
		try {
			dispatch({ type: LOADING, payload: true });

			const result = await deleteUser({
				variables: {
					uuid: staffMember.uuid
				}
			});

			if (result.data) {
				setStaff((current) =>
					current.filter((member) => member.uuid !== staffMember.uuid)
				);
				toast.success("Staff Member Deleted Successfully!");
			}
		} catch (error) {
			toast.error(error.message || "Failed to delete user");
		} finally {
			dispatch({ type: LOADING, payload: false });
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
		<div className="min-h-screen bg-gray-50 p-4">
			<ToastContainer />
			{state.loading && <Loading />}

			{/* Edit My Profile Modal */}
			<Modal
				title={
					<Space>
						<EditOutlined />
						<span>Edit My Profile</span>
					</Space>
				}
				open={showSelfEditModal}
				onCancel={() => setShowSelfEditModal(false)}
				footer={null}
				width={480}>
				<Form
					layout="vertical"
					onFinish={handleSelfEditSubmit}
					initialValues={{ selfName: selfEditName, selfPhone: selfEditPhone }}
					key={showSelfEditModal ? "open" : "closed"}>
					<Form.Item
						label="Full Name"
						name="selfName"
						rules={[{ required: true, message: "Please enter your name!" }]}>
						<Input prefix={<UserOutlined />} placeholder="Enter full name" />
					</Form.Item>
					<Form.Item label="Phone Number" name="selfPhone">
						<Input
							prefix={<PhoneOutlined />}
							placeholder="Enter phone number"
						/>
					</Form.Item>
					<Form.Item>
						<Space style={{ width: "100%", justifyContent: "flex-end" }}>
							<Button onClick={() => setShowSelfEditModal(false)}>
								Cancel
							</Button>
							<Button type="primary" htmlType="submit" loading={state.loading}>
								Save Changes
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>

			{/* Edit Staff Modal */}
			<Modal
				title={
					<Space>
						<EditOutlined />
						<span>Edit Staff Member</span>
					</Space>
				}
				open={showEditModal}
				onCancel={closeEditModal}
				footer={null}
				width={600}>
				<Form
					layout="vertical"
					onFinish={handleEditUser}
					initialValues={{
						fullname: editFullname,
						email: editEmail,
						clrs: editClrs,
						phone: editPhone
					}}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								label="Full Name"
								name="fullname"
								rules={[
									{ required: true, message: "Please input full name!" }
								]}>
								<Input
									prefix={<UserOutlined />}
									placeholder="Enter full name"
									value={editFullname}
									onChange={(e) => setEditFullname(e.target.value)}
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="Email"
								name="email"
								rules={[
									{
										required: true,
										type: "email",
										message: "Please input valid email!"
									}
								]}>
								<Input
									prefix={<MailOutlined />}
									placeholder="Enter email address"
									value={editEmail}
									onChange={(e) => setEditEmail(e.target.value)}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item label="Phone Number" name="phone">
								<Input
									prefix={<PhoneOutlined />}
									placeholder="Enter phone number"
									value={editPhone}
									onChange={(e) => setEditPhone(e.target.value)}
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="Clearance Level"
								name="clrs"
								rules={[
									{ required: true, message: "Please select clearance level!" }
								]}>
								<Select
									placeholder="Select clearance level"
									value={editClrs}
									onChange={(value) => setEditClrs(value)}>
									<Option value="Sales">Sales</Option>
									<Option value="Sales_Manager">Sales Manager</Option>
									<Option value="Stock_Manager">Stock Manager</Option>
									<Option value="Senior_Manager">Senior Manager</Option>
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item>
						<Space style={{ width: "100%", justifyContent: "flex-end" }}>
							<Button onClick={closeEditModal}>Cancel</Button>
							<Button type="primary" htmlType="submit" loading={state.loading}>
								Update Staff
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>

			{/* Main Profile Card */}
			<Card
				className="max-w-6xl mx-auto"
				style={{ borderRadius: "16px", padding: "20px" }}
				bodyStyle={{ padding: 0 }}>
				{/* Cover Image Section */}
				<div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl">
					<div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-2xl" />
					<div className="absolute bottom-4 left-6 text-white">
						<Title level={2} style={{ color: "white", margin: 0 }}>
							User Profile
						</Title>
						<Text style={{ color: "rgba(255,255,255,0.8)" }}>
							Manage your account settings and team
						</Text>
					</div>
				</div>

				{/* Profile Header */}
				<div className="relative px-6 pb-6">
					<div className="flex flex-col md:flex-row items-start md:items-end -mt-16 md:-mt-12">
						{/* Avatar Section */}
						<div className="relative mb-4 md:mb-0 md:mr-12 lg:mr-16">
							<Badge
								count={
									<Tooltip title="Change Profile Picture">
										<Button
											type="primary"
											shape="circle"
											icon={<CameraOutlined />}
											size="small"
											onClick={() =>
												document.getElementById("avatar-upload").click()
											}
										/>
									</Tooltip>
								}
								offset={[-10, 120]}>
								<Avatar
									size={128}
									src={file}
									icon={<UserOutlined />}
									className="border-4 border-white shadow-lg"
								/>
							</Badge>
							<input
								id="avatar-upload"
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								style={{ display: "none" }}
							/>
						</div>

						{/* User Info */}
						<div className="flex-1 ml-3 text-center md:text-left">
							<Title level={3} style={{ margin: "0 0 8px 0" }}>
								{user?.name}
							</Title>
							<Space direction="vertical" size={4}>
								<Space>
									<MailOutlined className="text-gray-500" />
									<Text type="secondary">{user?.email}</Text>
								</Space>
								{user?.phone && (
									<Space>
										<PhoneOutlined className="text-gray-500" />
										<Text type="secondary">{user?.phone}</Text>
									</Space>
								)}
								<Space>
									<BankOutlined className="text-gray-500" />
									<Text type="secondary">
										{user?.business?.name || "CTSH Kano"}
									</Text>
								</Space>
							</Space>
							<div className="mt-3">
								<Tag color="blue" className="px-3 py-1">
									{user?.clrs || "Staff"}
								</Tag>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col space-y-2 md:space-y-0 md:space-x-2 md:flex-row mt-4 md:mt-0">
							<Button
								icon={<EditOutlined />}
								className="rounded-lg"
								onClick={openSelfEditModal}>
								Edit Profile
							</Button>
						</div>
					</div>
				</div>

				<Divider style={{ margin: "0 0 24px 0" }} />

				{/* Profile Content */}
				<div className="px-6 pb-6">
					<CardProfileTabs
						user={user}
						staff={staff}
						onEditUser={openEditModal}
						onDeleteUser={handleDeleteUser}
						onCreateUser={handleCreateUser}
						loading={state.loading}
					/>
				</div>
			</Card>
		</div>
	);
};

export default Profile;
