import { useMutation } from "@apollo/client";
import React, { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
	Tabs,
	Card,
	Form,
	Input,
	Button,
	Space,
	Avatar,
	Table,
	Tag,
	Typography,
	Row,
	Col,
	Statistic,
	Badge,
	Empty,
	Modal,
	Select,
	Dropdown
} from "antd";
import {
	UserOutlined,
	LockOutlined,
	TeamOutlined,
	MailOutlined,
	PhoneOutlined,
	SafetyOutlined,
	BankOutlined,
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	SearchOutlined,
	FilterOutlined,
	MoreOutlined,
	KeyOutlined
} from "@ant-design/icons";
import {
	CHANGE_PASSWORD,
	RESET_USER_PASSWORD
} from "../../gql/mutations/mutations";
import { LOADING } from "../../reducer/reducer-types";
import context from "../../context/context";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CardProfileTabs = ({
	user,
	staff,
	onEditUser,
	onDeleteUser,
	onCreateUser,
	loading
}) => {
	const { state, dispatch } = useContext(context);
	const [form] = Form.useForm();
	const [createForm] = Form.useForm();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [staffLoading, setStaffLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [filteredStaff, setFilteredStaff] = useState([]);
	const [resetPasswordModal, setResetPasswordModal] = useState(false);
	const [resetTarget, setResetTarget] = useState(null);
	const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
	const [resetForm] = Form.useForm();

	const [performChangePassword] = useMutation(CHANGE_PASSWORD);
	const [performResetUserPassword] = useMutation(RESET_USER_PASSWORD);

	const openResetPasswordModal = (record) => {
		setResetTarget(record);
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

	// Filter staff based on search text
	useEffect(() => {
		if (!staff) {
			setFilteredStaff([]);
			return;
		}

		if (!searchText) {
			setFilteredStaff(staff);
			return;
		}

		const filtered = staff.filter((staffMember) => {
			const searchLower = searchText.toLowerCase();
			return (
				staffMember.name?.toLowerCase().includes(searchLower) ||
				staffMember.email?.toLowerCase().includes(searchLower) ||
				staffMember.phone?.toLowerCase().includes(searchLower) ||
				staffMember.clrs?.toLowerCase().includes(searchLower)
			);
		});

		setFilteredStaff(filtered);
	}, [staff, searchText]);

	const handleChangePassword = async (values) => {
		const { oldPassword, newPassword, confirmNewPassword } = values;

		if (newPassword !== confirmNewPassword) {
			return toast.error("New password and confirm password do not match");
		}

		try {
			dispatch({ type: LOADING, payload: true });
			const result = await performChangePassword({
				variables: {
					oldPassword,
					newPassword,
					confirmNewPassword
				}
			});

			if (result?.data?.updatePassword?.status === "PASSWORD_UPDATED") {
				toast.success("Password updated successfully!");
				form.resetFields();
			}
		} catch (error) {
			toast.error(
				"Failed to update password. Please check your current password."
			);
		} finally {
			dispatch({ type: LOADING, payload: false });
		}
	};

	const staffColumns = [
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
					<Text strong>{name}</Text>
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
			title: "Role",
			dataIndex: "clrs",
			key: "clrs",
			sorter: (a, b) => (a.clrs || "").localeCompare(b.clrs || ""),
			filters: [
				{ text: "Owner", value: "Owner" },
				{ text: "Senior Manager", value: "Senior_Manager" },
				{ text: "Sales Manager", value: "Sales_Manager" },
				{ text: "Stock Manager", value: "Stock_Manager" },
				{ text: "Sales", value: "Sales" }
			],
			onFilter: (value, record) => record.clrs === value,
			render: (clrs) => {
				const colors = {
					Owner: "red",
					Senior_Manager: "purple",
					Sales_Manager: "blue",
					Stock_Manager: "green",
					Sales: "orange"
				};
				return (
					<Tag color={colors[clrs] || "default"}>
						{clrs?.replace("_", " ") || "Unknown"}
					</Tag>
				);
			}
		},
		{
			title: "Actions",
			key: "actions",
			width: 60,
			fixed: "right",
			render: (_, record) => {
				const menuItems = [
					{
						key: "edit",
						label: "Edit",
						icon: <EditOutlined />,
						onClick: () => onEditUser && onEditUser(record)
					},
					{
						key: "reset-password",
						label: "Reset Password",
						icon: <KeyOutlined />,
						onClick: () => openResetPasswordModal(record)
					},
					...(user?.clrs === "Owner" && record.clrs !== "Owner"
						? [
								{ type: "divider" },
								{
									key: "delete",
									label: "Delete",
									icon: <DeleteOutlined />,
									danger: true,
									onClick: () => onDeleteUser && onDeleteUser(record)
								}
							]
						: [])
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

	const tabItems = [
		{
			key: "1",
			label: (
				<Space>
					<UserOutlined />
					Profile Details
				</Space>
			),
			children: (
				<Card bordered={false}>
					<div className="text-center mb-6">
						<Title level={3}>{user?.name}</Title>
						<Text type="secondary" className="text-lg">
							{user?.business?.name || "CTSH Kano"}
						</Text>
					</div>

					<Row gutter={[16, 16]}>
						<Col xs={24} md={12}>
							<Card size="small" className="h-full">
								<Statistic
									title="Email Address"
									value={user?.email}
									prefix={<MailOutlined />}
									valueStyle={{ fontSize: "16px", wordBreak: "break-all" }}
								/>
							</Card>
						</Col>
						<Col xs={24} md={12}>
							<Card size="small" className="h-full">
								<Statistic
									title="Role"
									value={user?.clrs?.replace("_", " ") || "Staff"}
									prefix={<SafetyOutlined />}
									valueStyle={{ fontSize: "16px" }}
								/>
							</Card>
						</Col>
						{user?.phone && (
							<Col xs={24} md={12}>
								<Card size="small" className="h-full">
									<Statistic
										title="Phone Number"
										value={user?.phone}
										prefix={<PhoneOutlined />}
										valueStyle={{ fontSize: "16px" }}
									/>
								</Card>
							</Col>
						)}
						<Col xs={24} md={12}>
							<Card size="small" className="h-full">
								<Statistic
									title="Business Address"
									value={user?.business?.address || "Not specified"}
									prefix={<BankOutlined />}
									valueStyle={{ fontSize: "16px", wordBreak: "break-all" }}
								/>
							</Card>
						</Col>
					</Row>
				</Card>
			)
		},
		{
			key: "2",
			label: (
				<Space>
					<LockOutlined />
					Security Settings
				</Space>
			),
			children: (
				<Card bordered={false}>
					<Title level={4} className="mb-4">
						Change Password
					</Title>
					<Form
						form={form}
						layout="vertical"
						onFinish={handleChangePassword}
						className="max-w-md mx-auto">
						<Form.Item
							name="oldPassword"
							label="Current Password"
							rules={[
								{
									required: true,
									message: "Please enter your current password!"
								}
							]}>
							<Input.Password
								prefix={<LockOutlined />}
								placeholder="Enter current password"
							/>
						</Form.Item>

						<Form.Item
							name="newPassword"
							label="New Password"
							rules={[
								{ required: true, message: "Please enter new password!" },
								{ min: 8, message: "Password must be at least 8 characters!" }
							]}>
							<Input.Password
								prefix={<LockOutlined />}
								placeholder="Enter new password"
							/>
						</Form.Item>

						<Form.Item
							name="confirmNewPassword"
							label="Confirm New Password"
							dependencies={["newPassword"]}
							rules={[
								{
									required: true,
									message: "Please confirm your new password!"
								},
								({ getFieldValue }) => ({
									validator(_, value) {
										if (!value || getFieldValue("newPassword") === value) {
											return Promise.resolve();
										}
										return Promise.reject(new Error("Passwords do not match!"));
									}
								})
							]}>
							<Input.Password
								prefix={<LockOutlined />}
								placeholder="Confirm new password"
							/>
						</Form.Item>

						<Form.Item>
							<Button
								type="primary"
								htmlType="submit"
								loading={state.loading}
								className="w-full">
								Update Password
							</Button>
						</Form.Item>
					</Form>
				</Card>
			)
		},
		{
			key: "3",
			label: (
				<Space>
					<TeamOutlined />
					Team Management
					{staff?.length > 0 && <Badge count={staff.length} showZero />}
				</Space>
			),
			children: (
				<Card bordered={false}>
					<div className="mb-4">
						<div className="flex justify-between items-center mb-4">
							<div>
								<Title level={4} style={{ margin: 0 }}>
									Staff Members
								</Title>
								<Text type="secondary">
									{filteredStaff?.length || 0} of {staff?.length || 0} team
									member{staff?.length !== 1 ? "s" : ""}
									{searchText && ` matching "${searchText}"`}
								</Text>
							</div>
							{user?.clrs === "Owner" && (
								<Button
									type="primary"
									icon={<PlusOutlined />}
									onClick={() => setShowCreateModal(true)}>
									Add Staff
								</Button>
							)}
						</div>

						{/* Search and Filter Controls */}
						<div className="mb-4">
							<Row gutter={[16, 16]}>
								<Col xs={24} sm={18} md={20}>
									<Input
										placeholder="Search by name, email, phone, or role..."
										prefix={<SearchOutlined />}
										value={searchText}
										onChange={(e) => setSearchText(e.target.value)}
										allowClear
										size="large"
									/>
								</Col>
								<Col xs={24} sm={6} md={4}>
									<Select
										placeholder="Filter by Role"
										allowClear
										size="large"
										style={{ width: "100%" }}
										onChange={(value) => {
											if (value) {
												const filtered =
													staff?.filter((s) => s.clrs === value) || [];
												setFilteredStaff(filtered);
											} else {
												setFilteredStaff(staff || []);
											}
										}}
										suffixIcon={<FilterOutlined />}>
										<Select.Option value="Owner">Owner</Select.Option>
										<Select.Option value="Senior_Manager">
											Senior Manager
										</Select.Option>
										<Select.Option value="Sales_Manager">
											Sales Manager
										</Select.Option>
										<Select.Option value="Stock_Manager">
											Stock Manager
										</Select.Option>
										<Select.Option value="Sales">Sales</Select.Option>
									</Select>
								</Col>
							</Row>
						</div>
					</div>

					{/* Team Statistics */}
					{staff && staff.length > 0 && (
						<div className="mb-6">
							<Row gutter={16}>
								<Col xs={12} sm={6}>
									<Card size="small" className="text-center">
										<Statistic
											title="Total Staff"
											value={staff.length}
											prefix={<TeamOutlined />}
											valueStyle={{ color: "#1890ff" }}
										/>
									</Card>
								</Col>
								<Col xs={12} sm={6}>
									<Card size="small" className="text-center">
										<Statistic
											title="Managers"
											value={
												staff.filter((s) => s.clrs?.includes("Manager")).length
											}
											prefix={<UserOutlined />}
											valueStyle={{ color: "#722ed1" }}
										/>
									</Card>
								</Col>
								<Col xs={12} sm={6}>
									<Card size="small" className="text-center">
										<Statistic
											title="Sales Staff"
											value={staff.filter((s) => s.clrs === "Sales").length}
											prefix={<UserOutlined />}
											valueStyle={{ color: "#fa8c16" }}
										/>
									</Card>
								</Col>
								<Col xs={12} sm={6}>
									<Card size="small" className="text-center">
										<Statistic
											title="Online Now"
											value={
												staff.filter(
													(s) =>
														s.last_login &&
														new Date(s.last_login) >
															new Date(Date.now() - 15 * 60 * 1000)
												).length
											}
											prefix={<Badge status="processing" />}
											valueStyle={{ color: "#52c41a" }}
										/>
									</Card>
								</Col>
							</Row>
						</div>
					)}

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
							initialValues={{ useDefault: true }}
							onFinish={handleResetPassword}>
							<Form.Item name="useDefault" valuePropName="checked" noStyle>
								{/* Hidden — controlled by radio buttons below */}
							</Form.Item>

							<Form.Item
								label="Reset option"
								name="resetOption"
								initialValue="default">
								<Select
									onChange={(val) =>
										resetForm.setFieldsValue({ useDefault: val === "default" })
									}>
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
								shouldUpdate={(prev, cur) =>
									prev.resetOption !== cur.resetOption
								}>
								{({ getFieldValue }) =>
									getFieldValue("resetOption") === "custom" ? (
										<>
											<Form.Item
												name="newPassword"
												label="New Password"
												rules={[
													{
														required: true,
														message: "Please enter a password!"
													},
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

					{/* Create Staff Modal */}
					<Modal
						title={
							<Space>
								<TeamOutlined />
								<span>Add New Staff Member</span>
							</Space>
						}
						open={showCreateModal}
						onCancel={() => {
							setShowCreateModal(false);
							createForm.resetFields();
						}}
						footer={null}
						width={600}>
						<Form
							form={createForm}
							layout="vertical"
							onFinish={(values) => {
								onCreateUser && onCreateUser(values);
								setShowCreateModal(false);
								createForm.resetFields();
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
											{
												required: true,
												min: 8,
												message: "Password must be at least 8 characters!"
											}
										]}>
										<Input.Password placeholder="Enter password" />
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
										<Input.Password placeholder="Confirm password" />
									</Form.Item>
								</Col>
							</Row>

							<Row gutter={16}>
								<Col span={12}>
									<Form.Item label="Phone Number" name="phone">
										<Input
											prefix={<PhoneOutlined />}
											placeholder="Enter phone number"
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label="Clearance Level"
										name="clrs"
										rules={[
											{
												required: true,
												message: "Please select clearance level!"
											}
										]}>
										<Select placeholder="Select clearance level">
											<Select.Option value="Sales">Sales</Select.Option>
											<Select.Option value="Sales_Manager">
												Sales Manager
											</Select.Option>
											<Select.Option value="Stock_Manager">
												Stock Manager
											</Select.Option>
											<Select.Option value="Senior_Manager">
												Senior Manager
											</Select.Option>
										</Select>
									</Form.Item>
								</Col>
							</Row>

							<Form.Item>
								<Space style={{ width: "100%", justifyContent: "flex-end" }}>
									<Button
										onClick={() => {
											setShowCreateModal(false);
											createForm.resetFields();
										}}>
										Cancel
									</Button>
									<Button type="primary" htmlType="submit" loading={loading}>
										Create Staff
									</Button>
								</Space>
							</Form.Item>
						</Form>
					</Modal>

					{filteredStaff && filteredStaff.length > 0 ? (
						<Table
							columns={staffColumns}
							dataSource={filteredStaff}
							rowKey="uuid"
							loading={loading || staffLoading}
							pagination={{
								pageSize: 10,
								showSizeChanger: true,
								showQuickJumper: true,
								showTotal: (total, range) =>
									`${range[0]}-${range[1]} of ${total} staff members`,
								pageSizeOptions: ["5", "10", "20", "50"]
							}}
							className="rounded-lg"
							scroll={{ x: 800 }}
							size="middle"
						/>
					) : (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								<div>
									<Text type="secondary">
										{searchText || staff?.length === 0
											? staff?.length === 0
												? "No staff members found"
												: `No staff members match "${searchText}"`
											: "No staff members to display"}
									</Text>
									{searchText && staff?.length > 0 && (
										<div className="mt-2">
											<Button onClick={() => setSearchText("")}>
												Clear Search
											</Button>
										</div>
									)}
									{!searchText &&
										staff?.length === 0 &&
										user?.clrs === "Owner" && (
											<div className="mt-2">
												<Button
													type="primary"
													icon={<PlusOutlined />}
													onClick={() => setShowCreateModal(true)}>
													Add First Staff Member
												</Button>
											</div>
										)}
								</div>
							}
						/>
					)}
				</Card>
			)
		}
	];

	return (
		<Tabs
			defaultActiveKey="1"
			items={tabItems}
			className="custom-tabs"
			style={{
				"--ant-tabs-card-height": "50px"
			}}
		/>
	);
};

export default CardProfileTabs;
