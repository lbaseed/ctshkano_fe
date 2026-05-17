import React, { useContext, useState, useEffect } from "react";
import {
	Card,
	Table,
	Button,
	Input,
	Select,
	Modal,
	Form,
	Row,
	Col,
	Avatar,
	Tag,
	Space,
	Typography,
	Tooltip,
	Badge,
	Statistic,
	Dropdown,
	message,
	Tabs,
	Empty,
	Alert
} from "antd";
import {
	UserOutlined,
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	SearchOutlined,
	FilterOutlined,
	MoreOutlined,
	TeamOutlined,
	MailOutlined,
	PhoneOutlined,
	SafetyOutlined,
	EyeOutlined,
	UserAddOutlined,
	ExportOutlined,
	ImportOutlined,
	ReloadOutlined,
	CheckCircleOutlined,
	StopOutlined,
	KeyOutlined,
	LockOutlined
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_USERS } from "../../../gql/queries/queries";
import {
	CREATE_USER,
	UPDATE_USER,
	DELETE_USER,
	TOGGLE_USER_ACTIVATION,
	BULK_TOGGLE_USER_ACTIVATION,
	RESET_USER_PASSWORD
} from "../../../gql/mutations/mutations";
import { toast, ToastContainer } from "react-toastify";
import { useCookies } from "react-cookie";
import context from "../../../context/context";
import { LOADING } from "../../../reducer/reducer-types";
import moment from "moment";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const UserManagement = () => {
	const { state, dispatch } = useContext(context);
	const [cookies] = useCookies(["ctshkano"]);
	const currentUser = cookies?.ctshkano?.user;
	const isSuperAdmin = currentUser?.clrs === "SUPER_ADMIN";
	const [form] = Form.useForm();
	const [editForm] = Form.useForm();

	// State management
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [selectedRole, setSelectedRole] = useState(null);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showViewModal, setShowViewModal] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [viewingUser, setViewingUser] = useState(null);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [activeTab, setActiveTab] = useState("1");
	const [resetPasswordModal, setResetPasswordModal] = useState(false);
	const [resetTarget, setResetTarget] = useState(null);
	const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
	const [resetForm] = Form.useForm();

	// GraphQL queries and mutations
	const {
		data: usersData,
		loading: usersLoading,
		refetch
	} = useQuery(GET_ALL_USERS, {
		fetchPolicy: "cache-and-network"
	});

	const [createUser] = useMutation(CREATE_USER, {
		refetchQueries: [{ query: GET_ALL_USERS }]
	});

	const [updateUser] = useMutation(UPDATE_USER, {
		refetchQueries: [{ query: GET_ALL_USERS }]
	});

	const [deleteUser] = useMutation(DELETE_USER, {
		refetchQueries: [{ query: GET_ALL_USERS }]
	});

	const [toggleUserActivation] = useMutation(TOGGLE_USER_ACTIVATION, {
		refetchQueries: [{ query: GET_ALL_USERS }]
	});

	const [bulkToggleUserActivation] = useMutation(BULK_TOGGLE_USER_ACTIVATION, {
		refetchQueries: [{ query: GET_ALL_USERS }]
	});

	const [performResetUserPassword] = useMutation(RESET_USER_PASSWORD, {
		refetchQueries: [{ query: GET_ALL_USERS }]
	});

	const openResetPasswordModal = (user) => {
		setResetTarget(user);
		resetForm.resetFields();
		setResetPasswordModal(true);
	};

	const handleResetPassword = async (values) => {
		const password =
			values.resetOption === "custom" ? values.newPassword : "password";
		try {
			setResetPasswordLoading(true);
			await performResetUserPassword({
				variables: { uuid: resetTarget.uuid, password }
			});
			toast.success(`Password reset successfully for ${resetTarget.name}`);
			setResetPasswordModal(false);
			setResetTarget(null);
			resetForm.resetFields();
		} catch (error) {
			toast.error(error.message || "Failed to reset password");
		} finally {
			setResetPasswordLoading(false);
		}
	};

	// Load users data
	useEffect(() => {
		if (usersData?.users?.data) {
			setUsers(usersData.users.data);
		}
	}, [usersData]);

	// Filter users based on search and role
	useEffect(() => {
		let filtered = users || [];

		if (searchText) {
			const searchLower = searchText.toLowerCase();
			filtered = filtered.filter(
				(user) =>
					user.name?.toLowerCase().includes(searchLower) ||
					user.email?.toLowerCase().includes(searchLower) ||
					user.phone?.toLowerCase().includes(searchLower) ||
					user.clrs?.toLowerCase().includes(searchLower)
			);
		}

		if (selectedRole) {
			filtered = filtered.filter((user) => user.clrs === selectedRole);
		}

		setFilteredUsers(filtered);
	}, [users, searchText, selectedRole]);

	// Role options
	const roleOptions = [
		{ value: "SUPER_ADMIN", label: "Super Admin", color: "red" },
		{ value: "ADMIN", label: "Admin", color: "purple" },
		{ value: "EXECUTIVE", label: "Executive", color: "blue" },
		{ value: "STAFF", label: "Staff", color: "green" },
		{ value: "SCHEME_VIEWER", label: "Scheme Viewer", color: "cyan" },
		{ value: "TRADER", label: "Trader", color: "orange" }
	];

	// Handle create user
	const handleCreateUser = async (values) => {
		const { fullname, email, password, confirmPassword, clrs, phone } = values;

		if (password !== confirmPassword) {
			return toast.error("Passwords do not match");
		}

		try {
			dispatch({ type: LOADING, payload: true });

			const result = await createUser({
				variables: {
					name: fullname,
					email,
					password,
					password_confirmation: confirmPassword,
					...(isSuperAdmin && { clrs }),
					phone
				}
			});

			if (result.data) {
				toast.success("User created successfully!");
				setShowCreateModal(false);
				form.resetFields();
				refetch();
			}
		} catch (error) {
			toast.error(error.message || "Failed to create user");
		} finally {
			dispatch({ type: LOADING, payload: false });
		}
	};

	// Handle edit user
	const handleEditUser = async (values) => {
		const { fullname, email, clrs, phone } = values;

		try {
			dispatch({ type: LOADING, payload: true });

			const result = await updateUser({
				variables: {
					uuid: editingUser.uuid,
					name: fullname,
					email,
					...(isSuperAdmin && { clrs }),
					phone
				}
			});

			if (result.data) {
				toast.success("User updated successfully!");
				setShowEditModal(false);
				setEditingUser(null);
				editForm.resetFields();
				refetch();
			}
		} catch (error) {
			toast.error(error.message || "Failed to update user");
		} finally {
			dispatch({ type: LOADING, payload: false });
		}
	};

	// Handle delete user
	const handleDeleteUser = async (user) => {
		try {
			dispatch({ type: LOADING, payload: true });

			const result = await deleteUser({
				variables: {
					uuid: user.uuid
				}
			});

			if (result.data) {
				toast.success("User deleted successfully!");
				refetch();
			}
		} catch (error) {
			toast.error(error.message || "Failed to delete user");
		} finally {
			dispatch({ type: LOADING, payload: false });
		}
	};

	// Handle toggle user activation
	const handleToggleActivation = async (user) => {
		try {
			dispatch({ type: LOADING, payload: true });

			const result = await toggleUserActivation({
				variables: {
					uuid: user.uuid
				}
			});

			if (result.data) {
				const newStatus = result.data.toggleUserActivation.is_active;
				toast.success(
					`User ${newStatus ? "activated" : "deactivated"} successfully!`
				);
				refetch();
			}
		} catch (error) {
			toast.error(error.message || "Failed to toggle user activation");
		} finally {
			dispatch({ type: LOADING, payload: false });
		}
	};

	// Handle bulk user activation/deactivation
	const handleBulkActivation = async (isActive) => {
		if (selectedRowKeys.length === 0) {
			toast.warning("Please select users to update");
			return;
		}

		try {
			dispatch({ type: LOADING, payload: true });

			const result = await bulkToggleUserActivation({
				variables: {
					uuids: selectedRowKeys,
					is_active: isActive
				}
			});

			if (result.data?.bulkToggleUserActivation) {
				const { success, message, affected_count, failed_count, errors } =
					result.data.bulkToggleUserActivation;

				if (success && affected_count > 0) {
					toast.success(message);
					setSelectedRowKeys([]); // Clear selection
					refetch();
				} else {
					toast.warning(message);
				}

				// Show individual errors if any
				if (errors && errors.length > 0) {
					errors.forEach((error) => {
						toast.error(error, { autoClose: 8000 });
					});
				}
			}
		} catch (error) {
			toast.error(error.message || "Failed to update users");
		} finally {
			dispatch({ type: LOADING, payload: false });
		}
	};

	// Open edit modal
	const openEditModal = (user) => {
		setEditingUser(user);
		editForm.setFieldsValue({
			fullname: user.name,
			email: user.email,
			clrs: user.clrs,
			phone: user.phone
		});
		setShowEditModal(true);
	};

	// Open view modal
	const openViewModal = (user) => {
		setViewingUser(user);
		setShowViewModal(true);
	};

	// Table columns
	const columns = [
		{
			title: "Avatar",
			dataIndex: "avatar",
			key: "avatar",
			width: 80,
			render: (avatar, record) => (
				<Avatar
					size={48}
					src={avatar ? `${import.meta.env.VITE_API_DATA}${avatar}` : null}
					icon={<UserOutlined />}
					className="border border-gray-200"
				/>
			)
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
			render: (name, record) => (
				<div>
					<Text
						strong
						className="cursor-pointer"
						onClick={() => openViewModal(record)}>
						{name}
					</Text>
					<div>
						<Text type="secondary" style={{ fontSize: "12px" }}>
							ID: {record.uuid?.substring(0, 8)}...
						</Text>
					</div>
				</div>
			)
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
			sorter: (a, b) => (a.email || "").localeCompare(b.email || ""),
			render: (email) => (
				<Space>
					<MailOutlined className="text-gray-400" />
					<Text copyable>{email}</Text>
				</Space>
			)
		},
		{
			title: "Phone",
			dataIndex: "phone",
			key: "phone",
			render: (phone) =>
				phone ? (
					<Space>
						<PhoneOutlined className="text-gray-400" />
						<Text copyable>{phone}</Text>
					</Space>
				) : (
					<Text type="secondary">Not provided</Text>
				)
		},
		{
			title: "Enrollees",
			dataIndex: "traders_count",
			key: "traders_count",
			sorter: (a, b) => (a.traders_count || 0) - (b.traders_count || 0),
			render: (traders_count) => (
				<Tag color={traders_count > 0 ? "blue" : "default"}>
					{traders_count || 0} {traders_count === 1 ? "trader" : "traders"}
				</Tag>
			)
		},
		{
			title: "Role",
			dataIndex: "clrs",
			key: "clrs",
			sorter: (a, b) => (a.clrs || "").localeCompare(b.clrs || ""),
			filters: roleOptions.map((role) => ({
				text: role.label,
				value: role.value
			})),
			onFilter: (value, record) => record.clrs === value,
			render: (clrs) => {
				const role = roleOptions.find((r) => r.value === clrs);
				return (
					<Tag color={role?.color || "default"}>
						{role?.label || clrs?.replace("_", " ") || "Unknown"}
					</Tag>
				);
			}
		},
		{
			title: "Created",
			dataIndex: "created_at",
			key: "created_at",
			sorter: (a, b) =>
				moment(a.created_at).unix() - moment(b.created_at).unix(),
			render: (date) => (
				<Tooltip title={moment(date).format("LLLL")}>
					<Text type="secondary">{moment(date).fromNow()}</Text>
				</Tooltip>
			)
		},
		{
			title: "Status",
			key: "status",
			render: (_, record) => {
				const isRecent = moment(record.updated_at).isAfter(
					moment().subtract(30, "minutes")
				);
				const isActive = record.is_active;

				// Debug logging (can be removed later)
				if (process.env.NODE_ENV === "development") {
					console.log(
						`User ${
							record.name
						}: is_active = ${isActive} (type: ${typeof isActive})`
					);
				}

				return (
					<div className="space-y-1">
						<Badge
							status={isActive ? "success" : "error"}
							text={isActive ? "Enabled" : "Disabled"}
						/>
						<div>
							<Badge
								status={isRecent ? "processing" : "default"}
								text={isRecent ? "Online" : "Offline"}
							/>
						</div>
					</div>
				);
			}
		},
		{
			title: "Actions",
			key: "actions",
			width: 80,
			fixed: "right",
			render: (_, record) => {
				const menuItems = [
					{
						key: "view",
						label: "View Details",
						icon: <EyeOutlined />,
						onClick: () => openViewModal(record)
					},
					{
						key: "edit",
						label: "Edit User",
						icon: <EditOutlined />,
						onClick: () => openEditModal(record)
					},
					{
						key: "reset-password",
						label: "Reset Password",
						icon: <KeyOutlined />,
						onClick: () => openResetPasswordModal(record)
					},
					{
						key: "toggle",
						label: record.is_active ? "Deactivate" : "Activate",
						icon: record.is_active ? <StopOutlined /> : <CheckCircleOutlined />,
						danger: record.is_active,
						onClick: () => handleToggleActivation(record)
					},
					{ type: "divider" },
					{
						key: "delete",
						label: "Delete",
						icon: <DeleteOutlined />,
						danger: true,
						onClick: () => handleDeleteUser(record)
					}
				];
				return (
					<Dropdown
						menu={{ items: menuItems }}
						trigger={["click"]}
						placement="bottomRight">
						<Button icon={<MoreOutlined />} size="small" />
					</Dropdown>
				);
			}
		}
	];

	// Statistics calculations
	const totalUsers = users?.length || 0;
	const enabledUsers = users?.filter((user) => user.is_active).length || 0;
	const onlineUsers =
		users?.filter((user) =>
			moment(user.updated_at).isAfter(moment().subtract(30, "minutes"))
		).length || 0;
	const adminCount =
		users?.filter(
			(user) => user.clrs === "ADMIN" || user.clrs === "SUPER_ADMIN"
		).length || 0;
	const staffCount = users?.filter((user) => user.clrs === "STAFF").length || 0;

	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<ToastContainer />

			{/* Header */}
			<div className="mb-6">
				<div className="flex justify-between items-center mb-4">
					<div>
						<Title level={2} className="mb-2">
							<TeamOutlined className="mr-3 text-blue-600" />
							User Management
						</Title>
						<Text type="secondary" className="text-base">
							Manage system users, roles, and permissions
						</Text>
					</div>
					<div className="flex space-x-2">
						<Button
							icon={<ReloadOutlined />}
							onClick={() => refetch()}
							loading={usersLoading}>
							Refresh
						</Button>
						<Button
							type="primary"
							icon={<UserAddOutlined />}
							onClick={() => setShowCreateModal(true)}
							size="large">
							Add New User
						</Button>
					</div>
				</div>

				{/* Statistics Cards */}
				<Row gutter={16} className="mb-6">
					<Col xs={12} sm={6}>
						<Card className="text-center">
							<Statistic
								title="Total Users"
								value={totalUsers}
								prefix={<TeamOutlined />}
								valueStyle={{ color: "#1890ff" }}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card className="text-center">
							<Statistic
								title="Enabled Users"
								value={enabledUsers}
								prefix={<CheckCircleOutlined />}
								valueStyle={{ color: "#52c41a" }}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card className="text-center">
							<Statistic
								title="Admins"
								value={adminCount}
								prefix={<SafetyOutlined />}
								valueStyle={{ color: "#722ed1" }}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card className="text-center">
							<Statistic
								title="Staff"
								value={staffCount}
								prefix={<UserOutlined />}
								valueStyle={{ color: "#fa8c16" }}
							/>
						</Card>
					</Col>
				</Row>

				{/* Additional Statistics */}
				<Row gutter={16} className="mb-6">
					<Col xs={12} sm={6}>
						<Card className="text-center">
							<Statistic
								title="Online Now"
								value={onlineUsers}
								prefix={<Badge status="processing" />}
								valueStyle={{ color: "#1890ff" }}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card className="text-center">
							<Statistic
								title="Disabled Users"
								value={totalUsers - enabledUsers}
								prefix={<StopOutlined />}
								valueStyle={{ color: "#ff4d4f" }}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card className="text-center">
							<Statistic
								title="New This Month"
								value={
									users?.filter((user) =>
										moment(user.created_at).isAfter(
											moment().subtract(1, "month")
										)
									).length || 0
								}
								prefix={<UserAddOutlined />}
								valueStyle={{ color: "#722ed1" }}
							/>
						</Card>
					</Col>
					<Col xs={12} sm={6}>
						<Card className="text-center">
							<Statistic
								title="Activation Rate"
								value={
									totalUsers > 0
										? Math.round((enabledUsers / totalUsers) * 100)
										: 0
								}
								suffix="%"
								prefix={<CheckCircleOutlined />}
								valueStyle={{
									color:
										totalUsers > 0 && enabledUsers / totalUsers > 0.8
											? "#52c41a"
											: "#fa8c16"
								}}
							/>
						</Card>
					</Col>
				</Row>
			</div>

			{/* Main Content */}
			<Card className="shadow-sm" bodyStyle={{ padding: "24px" }}>
				{/* Search and Filter Controls */}
				<div className="mb-6">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8}>
							<Input
								placeholder="Search users..."
								prefix={<SearchOutlined />}
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								allowClear
								size="large"
							/>
						</Col>
						<Col xs={24} sm={12} md={6}>
							<Select
								placeholder="Filter by Role"
								allowClear
								size="large"
								style={{ width: "100%" }}
								value={selectedRole}
								onChange={setSelectedRole}
								suffixIcon={<FilterOutlined />}>
								{roleOptions.map((role) => (
									<Option key={role.value} value={role.value}>
										<Tag color={role.color}>{role.label}</Tag>
									</Option>
								))}
							</Select>
						</Col>
						<Col xs={24} sm={24} md={10}>
							<div className="flex justify-end space-x-2 items-center">
								{selectedRowKeys.length > 0 && (
									<>
										<Button
											type="primary"
											icon={<CheckCircleOutlined />}
											onClick={() => handleBulkActivation(true)}
											disabled={usersLoading}
											size="small">
											Activate Selected ({selectedRowKeys.length})
										</Button>
										<Button
											danger
											icon={<StopOutlined />}
											onClick={() => handleBulkActivation(false)}
											disabled={usersLoading}
											size="small">
											Deactivate Selected ({selectedRowKeys.length})
										</Button>
										<Button
											type="default"
											onClick={() => setSelectedRowKeys([])}
											size="small">
											Clear Selection
										</Button>
									</>
								)}
								<Text type="secondary">
									Showing {filteredUsers.length} of {totalUsers} users
									{searchText && ` matching "${searchText}"`}
								</Text>
							</div>
						</Col>
					</Row>
				</div>

				{/* Users Table */}
				<Table
					columns={columns}
					dataSource={filteredUsers}
					rowKey="uuid"
					loading={usersLoading}
					rowSelection={{
						selectedRowKeys,
						onChange: (selectedRowKeys) => {
							setSelectedRowKeys(selectedRowKeys);
						},
						preserveSelectedRowKeys: true,
						getCheckboxProps: (record) => ({
							disabled:
								record.clrs === "SUPER_ADMIN" &&
								state.user?.clrs !== "SUPER_ADMIN", // Disable selection for super admin if current user is not super admin
							name: record.name
						})
					}}
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} of ${total} users`,
						pageSizeOptions: ["5", "10", "20", "50"]
					}}
					scroll={{ x: 1000 }}
					size="middle"
					className="rounded-lg"
				/>
			</Card>

			{/* Reset Password Modal */}
			<Modal
				title={
					<Space>
						<KeyOutlined />
						<span>Reset Password — {resetTarget?.name}</span>
					</Space>
				}
				open={resetPasswordModal}
				onCancel={() => {
					setResetPasswordModal(false);
					setResetTarget(null);
					resetForm.resetFields();
				}}
				footer={null}
				width={480}
				destroyOnClose>
				<Form
					form={resetForm}
					layout="vertical"
					initialValues={{ resetOption: "default" }}
					onFinish={handleResetPassword}>
					<Form.Item label="Reset option" name="resetOption">
						<Select>
							<Select.Option value="default">
								Reset to default password (<strong>password</strong>)
							</Select.Option>
							<Select.Option value="custom">
								Set a custom password
							</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item
						noStyle
						shouldUpdate={(prev, cur) => prev.resetOption !== cur.resetOption}>
						{({ getFieldValue }) =>
							getFieldValue("resetOption") === "custom" ? (
								<>
									<Form.Item
										name="newPassword"
										label="New Password"
										rules={[
											{ required: true, message: "Please enter a password!" },
											{ min: 8, message: "Minimum 8 characters" }
										]}>
										<Input.Password
											prefix={<LockOutlined />}
											placeholder="Enter new password"
										/>
									</Form.Item>
									<Form.Item
										name="confirmNewPassword"
										label="Confirm Password"
										dependencies={["newPassword"]}
										rules={[
											{
												required: true,
												message: "Please confirm the password!"
											},
											({ getFieldValue: gfv }) => ({
												validator(_, value) {
													if (!value || gfv("newPassword") === value) {
														return Promise.resolve();
													}
													return Promise.reject(
														new Error("Passwords do not match!")
													);
												}
											})
										]}>
										<Input.Password
											prefix={<LockOutlined />}
											placeholder="Confirm password"
										/>
									</Form.Item>
								</>
							) : null
						}
					</Form.Item>

					<Form.Item style={{ marginBottom: 0 }}>
						<Space style={{ width: "100%", justifyContent: "flex-end" }}>
							<Button
								onClick={() => {
									setResetPasswordModal(false);
									setResetTarget(null);
									resetForm.resetFields();
								}}>
								Cancel
							</Button>
							<Button
								type="primary"
								htmlType="submit"
								loading={resetPasswordLoading}
								danger>
								Reset Password
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>

			{/* Create User Modal */}
			<Modal
				title={
					<Space>
						<UserAddOutlined />
						<span>Create New User</span>
					</Space>
				}
				open={showCreateModal}
				onCancel={() => {
					setShowCreateModal(false);
					form.resetFields();
				}}
				footer={null}
				width={600}
				destroyOnClose>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleCreateUser}
					className="mt-4">
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
									size="large"
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="Email"
								name="email"
								rules={[
									{ required: true, message: "Please input email!" },
									{ type: "email", message: "Please enter valid email!" }
								]}>
								<Input
									prefix={<MailOutlined />}
									placeholder="Enter email address"
									size="large"
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								label="Password"
								name="password"
								rules={[
									{ required: true, message: "Please input password!" },
									{ min: 8, message: "Password must be at least 8 characters!" }
								]}>
								<Input.Password placeholder="Enter password" size="large" />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="Confirm Password"
								name="confirmPassword"
								dependencies={["password"]}
								rules={[
									{ required: true, message: "Please confirm password!" },
									({ getFieldValue }) => ({
										validator(_, value) {
											if (!value || getFieldValue("password") === value) {
												return Promise.resolve();
											}
											return Promise.reject(
												new Error("Passwords do not match!")
											);
										}
									})
								]}>
								<Input.Password placeholder="Confirm password" size="large" />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item label="Phone Number" name="phone">
								<Input
									prefix={<PhoneOutlined />}
									placeholder="Enter phone number"
									size="large"
								/>
							</Form.Item>
						</Col>
						{isSuperAdmin && (
							<Col span={12}>
								<Form.Item
									label="Role"
									name="clrs"
									rules={[{ required: true, message: "Please select role!" }]}>
									<Select placeholder="Select role" size="large">
										{roleOptions.map((role) => (
											<Option key={role.value} value={role.value}>
												<Tag color={role.color}>{role.label}</Tag>
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
						)}
					</Row>

					<Form.Item className="mb-0 text-right">
						<Space>
							<Button
								onClick={() => {
									setShowCreateModal(false);
									form.resetFields();
								}}>
								Cancel
							</Button>
							<Button type="primary" htmlType="submit" loading={state.loading}>
								Create User
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>

			{/* Edit User Modal */}
			<Modal
				title={
					<Space>
						<EditOutlined />
						<span>Edit User</span>
					</Space>
				}
				open={showEditModal}
				onCancel={() => {
					setShowEditModal(false);
					setEditingUser(null);
					editForm.resetFields();
				}}
				footer={null}
				width={600}
				destroyOnClose>
				<Form
					form={editForm}
					layout="vertical"
					onFinish={handleEditUser}
					className="mt-4">
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
									size="large"
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="Email"
								name="email"
								rules={[
									{ required: true, message: "Please input email!" },
									{ type: "email", message: "Please enter valid email!" }
								]}>
								<Input
									prefix={<MailOutlined />}
									placeholder="Enter email address"
									size="large"
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
									size="large"
								/>
							</Form.Item>
						</Col>
						{isSuperAdmin && (
							<Col span={12}>
								<Form.Item
									label="Role"
									name="clrs"
									rules={[{ required: true, message: "Please select role!" }]}>
									<Select placeholder="Select role" size="large">
										{roleOptions.map((role) => (
											<Option key={role.value} value={role.value}>
												<Tag color={role.color}>{role.label}</Tag>
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
						)}
					</Row>

					<Form.Item className="mb-0 text-right">
						<Space>
							<Button
								onClick={() => {
									setShowEditModal(false);
									setEditingUser(null);
									editForm.resetFields();
								}}>
								Cancel
							</Button>
							<Button type="primary" htmlType="submit" loading={state.loading}>
								Update User
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>

			{/* View User Modal */}
			<Modal
				title={
					<Space>
						<EyeOutlined />
						<span>User Details</span>
					</Space>
				}
				open={showViewModal}
				onCancel={() => {
					setShowViewModal(false);
					setViewingUser(null);
				}}
				footer={[
					<Button key="close" onClick={() => setShowViewModal(false)}>
						Close
					</Button>,
					<Button
						key="edit"
						type="primary"
						icon={<EditOutlined />}
						onClick={() => {
							setShowViewModal(false);
							openEditModal(viewingUser);
						}}>
						Edit User
					</Button>
				]}
				width={500}>
				{viewingUser && (
					<div className="py-4">
						<div className="text-center mb-6">
							<Avatar
								size={80}
								src={
									viewingUser.avatar
										? `${import.meta.env.VITE_API_DATA}${viewingUser.avatar}`
										: null
								}
								icon={<UserOutlined />}
								className="mb-3"
							/>
							<Title level={4} className="mb-2">
								{viewingUser.name}
							</Title>
							<Tag
								color={
									roleOptions.find((r) => r.value === viewingUser.clrs)
										?.color || "default"
								}>
								{roleOptions.find((r) => r.value === viewingUser.clrs)?.label ||
									viewingUser.clrs?.replace("_", " ") ||
									"Unknown"}
							</Tag>
							<div className="mt-2">
								<Badge
									status={viewingUser.is_active ? "success" : "error"}
									text={
										viewingUser.is_active
											? "Account Enabled"
											: "Account Disabled"
									}
								/>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex justify-between">
								<Text strong>Email:</Text>
								<Text copyable>{viewingUser.email}</Text>
							</div>
							<div className="flex justify-between">
								<Text strong>Phone:</Text>
								<Text copyable>{viewingUser.phone || "Not provided"}</Text>
							</div>
							<div className="flex justify-between">
								<Text strong>Status:</Text>
								<Badge
									status={viewingUser.is_active ? "success" : "error"}
									text={viewingUser.is_active ? "Enabled" : "Disabled"}
								/>
							</div>
							<div className="flex justify-between">
								<Text strong>User ID:</Text>
								<Text type="secondary">{viewingUser.uuid}</Text>
							</div>
							<div className="flex justify-between">
								<Text strong>Created:</Text>
								<Text>
									{moment(viewingUser.created_at).format("MMM DD, YYYY")}
								</Text>
							</div>
							<div className="flex justify-between">
								<Text strong>Last Updated:</Text>
								<Text>{moment(viewingUser.updated_at).fromNow()}</Text>
							</div>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default UserManagement;
