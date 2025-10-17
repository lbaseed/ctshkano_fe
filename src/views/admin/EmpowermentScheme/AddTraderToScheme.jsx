import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import {
	Card,
	Form,
	Input,
	Button,
	Typography,
	Row,
	Col,
	Statistic,
	Avatar,
	Badge,
	Spin,
	Empty,
	Space,
	Alert,
	Tag,
	message,
	Descriptions,
	List,
	Select,
	Steps,
	Divider
} from "antd";
import {
	UserAddOutlined,
	SearchOutlined,
	TeamOutlined,
	CalendarOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	ArrowLeftOutlined,
	UserOutlined,
	PhoneOutlined,
	ShopOutlined,
	ToolOutlined,
	CommentOutlined,
	FileTextOutlined,
	RightOutlined
} from "@ant-design/icons";
import {
	GET_EMPOWERMENT_SCHEME,
	GET_EMPOWERMENT_SCHEMES
} from "../../../gql/queries/empowermentSchemeQueries";
import { GET_TRADERS } from "../../../gql/queries/queries";
import { APPLY_TO_EMPOWERMENT_SCHEME } from "../../../gql/mutations/empowermentSchemeMutations";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const AddTraderToScheme = () => {
	const navigate = useNavigate();
	const { uuid } = useParams();
	const [form] = Form.useForm();

	// State management
	const [currentStep, setCurrentStep] = useState(uuid ? 1 : 0); // Skip scheme selection if uuid provided
	const [selectedScheme, setSelectedScheme] = useState(null);
	const [selectedTrader, setSelectedTrader] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredTraders, setFilteredTraders] = useState([]);
	const [schemeSearchTerm, setSchemeSearchTerm] = useState("");
	const [isSearching, setIsSearching] = useState(false);

	// GraphQL operations
	const { data: schemesData, loading: schemesLoading } = useQuery(
		GET_EMPOWERMENT_SCHEMES,
		{
			variables: {
				first: 50, // Get more schemes for selection
				status: "ACTIVE" // Only get active schemes
			}
		}
	);

	const {
		data: schemeData,
		loading: schemeLoading,
		refetch: refetchScheme
	} = useQuery(GET_EMPOWERMENT_SCHEME, {
		variables: { uuid: selectedScheme?.uuid || uuid },
		skip: !selectedScheme && !uuid // Skip if no scheme selected
	});

	const { data: tradersData, loading: tradersLoading } = useQuery(GET_TRADERS, {
		variables: {
			orderByColumn: "full_name",
			direction: "ASC"
		}
	});

	const [applyToScheme, { loading: applying }] = useMutation(
		APPLY_TO_EMPOWERMENT_SCHEME,
		{
			onCompleted: () => {
				message.success({
					content: "🎉 Trader successfully added to empowerment scheme!",
					duration: 3
				});
				setTimeout(() => {
					navigate(`/admin/empowerment-schemes/${uuid}`);
				}, 1000);
			},
			onError: (error) => {
				console.error("Add trader error:", error);
				message.error({
					content:
						error.message ||
						"❌ Error adding trader to scheme. Please try again.",
					duration: 5
				});
			}
		}
	);

	const schemes = schemesData?.empowermentSchemes?.data || [];
	const scheme = schemeData?.empowermentScheme || selectedScheme;
	const traders = tradersData?.traders || [];
	const loading = schemesLoading || schemeLoading || tradersLoading;

	// Initialize selected scheme if uuid provided
	useEffect(() => {
		if (uuid && schemes.length > 0) {
			const schemeFromUrl = schemes.find((s) => s.uuid === uuid);
			if (schemeFromUrl) {
				setSelectedScheme(schemeFromUrl);
				setCurrentStep(1);
			}
		}
	}, [uuid, schemes]);

	// Filter traders based on search term (phone, full name, ctsh_id) with debounce
	useEffect(() => {
		const debounceTimeout = setTimeout(() => {
			setIsSearching(false);

			if (traders.length > 0) {
				const filtered = traders.filter((trader) => {
					if (!searchTerm || searchTerm.trim() === "") return true;

					const searchLower = searchTerm.toLowerCase().trim();
					const searchOriginal = searchTerm.trim();

					// Construct full name from surname and other_names
					const fullName = `${trader.surname || ""} ${trader.other_names || ""}`
						.trim()
						.toLowerCase();

					// Search by phone number (contains, handles both formatted and unformatted)
					const phoneMatch =
						trader.phone?.includes(searchOriginal) ||
						trader.phone
							?.replace(/[\s\-\(\)]/g, "")
							.includes(searchOriginal.replace(/[\s\-\(\)]/g, ""));

					// Search by full name (contains, handles partial names)
					const nameMatch =
						fullName.includes(searchLower) ||
						trader.surname?.toLowerCase().includes(searchLower) ||
						trader.other_names?.toLowerCase().includes(searchLower);

					// Search by CTSH ID (case-insensitive, exact or partial match)
					const ctshIdMatch = trader.ctsh_id
						?.toLowerCase()
						.includes(searchLower);

					return phoneMatch || nameMatch || ctshIdMatch;
				});
				setFilteredTraders(filtered);
			} else {
				setFilteredTraders([]);
			}
		}, 300); // 300ms debounce

		if (searchTerm) {
			setIsSearching(true);
		}

		return () => clearTimeout(debounceTimeout);
	}, [traders, searchTerm]);

	// Filter schemes based on search term
	const filteredSchemes = schemes.filter(
		(scheme) =>
			scheme.name?.toLowerCase().includes(schemeSearchTerm.toLowerCase()) ||
			scheme.description?.toLowerCase().includes(schemeSearchTerm.toLowerCase())
	);

	// Get traders already in the scheme to avoid duplicates
	const existingTraderIds = scheme?.traders?.map((t) => t.id) || [];
	const availableTraders = filteredTraders.filter(
		(trader) => !existingTraderIds.includes(trader.id)
	);

	const handleSubmit = async (values) => {
		const { trader_id, remarks } = values;

		if (!trader_id) {
			message.error("Please select a trader");
			return;
		}

		if (!scheme) {
			message.error("Scheme not found");
			return;
		}

		// Check if scheme is still open
		if (!scheme.is_open) {
			message.error("This empowerment scheme is not open for new applications");
			return;
		}

		try {
			await applyToScheme({
				variables: {
					empowerment_scheme_id: scheme.id,
					trader_id: parseInt(trader_id),
					remarks: remarks?.trim() || null
				}
			});
		} catch (error) {
			console.error("Form submission error:", error);
		}
	};

	const handleSchemeSelect = (scheme) => {
		setSelectedScheme(scheme);
		setCurrentStep(1);
		// Refetch scheme details
		if (refetchScheme) {
			refetchScheme({ uuid: scheme.uuid });
		}
	};

	const handleTraderSelect = (traderId) => {
		const trader = availableTraders.find((t) => t.id === traderId);
		setSelectedTrader(trader);
		form.setFieldsValue({ trader_id: traderId });
	};

	const handleBackToSchemeSelection = () => {
		setCurrentStep(0);
		setSelectedScheme(null);
		setSelectedTrader(null);
		form.resetFields();
	};

	// Helper function to highlight search terms
	const highlightSearchTerm = (text, searchTerm) => {
		if (!searchTerm || !text) return text;

		const regex = new RegExp(
			`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
			"gi"
		);
		const parts = text.split(regex);

		return parts.map((part, index) =>
			regex.test(part) ? (
				<span
					key={index}
					style={{ backgroundColor: "#fff566", fontWeight: "bold" }}>
					{part}
				</span>
			) : (
				part
			)
		);
	};

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "50vh"
				}}>
				<Spin size="large" tip="Loading scheme and traders data..." />
			</div>
		);
	}

	// Scheme Selection Step
	const renderSchemeSelection = () => (
		<Card>
			<Title level={4} style={{ marginBottom: 16 }}>
				<FileTextOutlined style={{ color: "#1890ff", marginRight: 8 }} />
				Select Empowerment Scheme
			</Title>

			{/* Search Schemes */}
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				<Input
					placeholder="Search schemes by name or description..."
					value={schemeSearchTerm}
					onChange={(e) => setSchemeSearchTerm(e.target.value)}
					prefix={<SearchOutlined />}
					size="large"
					allowClear
				/>

				{/* Schemes List */}
				{filteredSchemes.length === 0 ? (
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description="No empowerment schemes found"
					/>
				) : (
					<List
						grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
						dataSource={filteredSchemes}
						renderItem={(scheme) => (
							<List.Item>
								<Card
									hoverable
									onClick={() => handleSchemeSelect(scheme)}
									style={{
										border: "1px solid #d9d9d9",
										cursor: "pointer"
									}}
									actions={[
										<Button
											type="primary"
											icon={<RightOutlined />}
											onClick={(e) => {
												e.stopPropagation();
												handleSchemeSelect(scheme);
											}}>
											Select Scheme
										</Button>
									]}>
									<Card.Meta
										title={
											<Space>
												<Text strong>{scheme.name}</Text>
												<Tag color={scheme.is_open ? "green" : "red"}>
													{scheme.is_open ? "Open" : "Closed"}
												</Tag>
											</Space>
										}
										description={
											<Space
												direction="vertical"
												size={4}
												style={{ width: "100%" }}>
												<Text type="secondary" ellipsis>
													{scheme.description || "No description available"}
												</Text>
												<div>
													<Text type="secondary" style={{ fontSize: "12px" }}>
														<TeamOutlined /> {scheme.current_participants || 0}{" "}
														/ {scheme.max_participants || 0} participants
													</Text>
													<Divider type="vertical" />
													<Text type="secondary" style={{ fontSize: "12px" }}>
														<CalendarOutlined />
														{scheme.application_deadline
															? new Date(
																	scheme.application_deadline
															  ).toLocaleDateString()
															: "No deadline"}
													</Text>
												</div>
											</Space>
										}
									/>
								</Card>
							</List.Item>
						)}
					/>
				)}
			</Space>
		</Card>
	);

	return (
		<div
			style={{
				padding: "24px",
				minHeight: "100vh",
				backgroundColor: "#f5f5f5"
			}}>
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				{/* Header */}
				<Card>
					<Row align="middle" justify="space-between">
						<Col>
							<Space>
								<Button
									icon={<ArrowLeftOutlined />}
									onClick={() => {
										if (currentStep === 0 || !selectedScheme) {
											navigate("/admin/empowerment-schemes");
										} else {
											handleBackToSchemeSelection();
										}
									}}
									type="text"
								/>
								<Title level={2} style={{ margin: 0 }}>
									<UserAddOutlined
										style={{ color: "#1890ff", marginRight: 8 }}
									/>
									Add Trader to Scheme
								</Title>
							</Space>
						</Col>
						<Col>
							{selectedScheme && (
								<Tag
									color="blue"
									style={{ fontSize: "14px", padding: "4px 12px" }}>
									{selectedScheme.name}
								</Tag>
							)}
						</Col>
					</Row>
				</Card>

				{/* Steps */}
				<Card>
					<Steps current={currentStep} size="small">
						<Step title="Select Scheme" icon={<FileTextOutlined />} />
						<Step title="Add Trader" icon={<UserAddOutlined />} />
					</Steps>
				</Card>

				{/* Step Content */}
				{currentStep === 0 ? renderSchemeSelection() : null}

				{/* Trader Addition Step */}
				{currentStep === 1 && (
					<>
						{/* Scheme Status Info */}
						{scheme && (
							<Card>
								<Title level={4} style={{ marginBottom: 16 }}>
									<CheckCircleOutlined
										style={{ color: "#52c41a", marginRight: 8 }}
									/>
									Scheme Overview
								</Title>
								<Row gutter={[16, 16]}>
									<Col xs={24} sm={12} md={6}>
										<Card size="small" style={{ textAlign: "center" }}>
											<Statistic
												title={
													<Space>
														{scheme.is_open ? (
															<CheckCircleOutlined
																style={{ color: "#52c41a" }}
															/>
														) : (
															<CloseCircleOutlined
																style={{ color: "#ff4d4f" }}
															/>
														)}
														Status
													</Space>
												}
												value={scheme.is_open ? "Open" : "Closed"}
												valueStyle={{
													color: scheme.is_open ? "#52c41a" : "#ff4d4f",
													fontSize: "18px"
												}}
											/>
										</Card>
									</Col>
									<Col xs={24} sm={12} md={6}>
										<Card size="small" style={{ textAlign: "center" }}>
											<Statistic
												title={
													<Space>
														<TeamOutlined style={{ color: "#1890ff" }} />
														Participants
													</Space>
												}
												value={`${scheme.current_participants || 0} / ${
													scheme.max_participants || 0
												}`}
												valueStyle={{ color: "#1890ff", fontSize: "18px" }}
											/>
										</Card>
									</Col>
									<Col xs={24} sm={12} md={6}>
										<Card size="small" style={{ textAlign: "center" }}>
											<Statistic
												title={
													<Space>
														<UserAddOutlined style={{ color: "#52c41a" }} />
														Available Slots
													</Space>
												}
												value={scheme.available_slots || 0}
												valueStyle={{ color: "#52c41a", fontSize: "18px" }}
											/>
										</Card>
									</Col>
									<Col xs={24} sm={12} md={6}>
										<Card size="small" style={{ textAlign: "center" }}>
											<Statistic
												title={
													<Space>
														<CalendarOutlined style={{ color: "#fa8c16" }} />
														Deadline
													</Space>
												}
												value={
													scheme.application_deadline
														? new Date(
																scheme.application_deadline
														  ).toLocaleDateString()
														: "Not Set"
												}
												valueStyle={{ color: "#fa8c16", fontSize: "14px" }}
											/>
										</Card>
									</Col>
								</Row>
							</Card>
						)}

						{/* Main Form */}
						<Card>
							{!scheme?.is_open && (
								<Alert
									message="Scheme Closed"
									description="This empowerment scheme is not open for new applications."
									type="warning"
									showIcon
									style={{ marginBottom: 16 }}
								/>
							)}

							<Form
								form={form}
								layout="vertical"
								onFinish={handleSubmit}
								size="large">
								{/* Search Traders */}
								<Form.Item
									label={
										<Space>
											<SearchOutlined style={{ color: "#1890ff" }} />
											<Text strong>Search Traders</Text>
											<Text type="secondary" style={{ fontSize: "12px" }}>
												(Search by phone number, full name, or CTSH ID)
											</Text>
										</Space>
									}>
									<Input
										placeholder="Search by phone number, full name, or CTSH ID..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										prefix={
											isSearching ? <Spin size="small" /> : <SearchOutlined />
										}
										suffix={
											searchTerm && (
												<Button
													type="text"
													size="small"
													onClick={() => setSearchTerm("")}
													icon={<CloseCircleOutlined />}
												/>
											)
										}
										allowClear
									/>
								</Form.Item>

								{/* Trader Selection */}
								<Form.Item
									name="trader_id"
									label={
										<Space>
											<TeamOutlined style={{ color: "#52c41a" }} />
											<Text strong>Select Trader</Text>
											<Badge
												count={availableTraders.length}
												showZero
												color="#1890ff"
											/>
										</Space>
									}
									rules={[
										{ required: true, message: "Please select a trader" }
									]}
									extra={
										<div>
											{searchTerm ? (
												<Alert
													message={`${availableTraders.length} traders found matching "${searchTerm}"`}
													type={
														availableTraders.length > 0 ? "success" : "info"
													}
													showIcon
													style={{ marginBottom: 8 }}
												/>
											) : (
												<Text type="secondary" style={{ fontSize: "13px" }}>
													💡 Tip: You can search by phone number (e.g.,
													"08012345678"), full name (e.g., "John Doe"), or CTSH
													ID (e.g., "CTSH001")
												</Text>
											)}
										</div>
									}>
									<div>
										{availableTraders.length === 0 ? (
											<Empty
												image={Empty.PRESENTED_IMAGE_SIMPLE}
												description={
													<div>
														{traders.length === 0 ? (
															<Text type="secondary">
																No traders found in the system
															</Text>
														) : existingTraderIds.length > 0 &&
														  filteredTraders.length ===
																existingTraderIds.length ? (
															<Text type="secondary">
																All matching traders are already in this scheme
															</Text>
														) : (
															<Text type="secondary">
																No traders match your search criteria
															</Text>
														)}
													</div>
												}
											/>
										) : (
											<List
												grid={{
													gutter: 16,
													xs: 1,
													sm: 1,
													md: 2,
													lg: 2,
													xl: 3,
													xxl: 3
												}}
												dataSource={availableTraders}
												renderItem={(trader) => (
													<List.Item>
														<Card
															size="small"
															hoverable
															onClick={() => handleTraderSelect(trader.id)}
															style={{
																border:
																	selectedTrader?.id === trader.id
																		? "2px solid #1890ff"
																		: "1px solid #d9d9d9",
																backgroundColor:
																	selectedTrader?.id === trader.id
																		? "#f0f8ff"
																		: "white",
																transition: "all 0.3s ease",
																cursor: "pointer",
																transform:
																	selectedTrader?.id === trader.id
																		? "scale(1.02)"
																		: "scale(1)",
																boxShadow:
																	selectedTrader?.id === trader.id
																		? "0 4px 12px rgba(24, 144, 255, 0.15)"
																		: "0 2px 8px rgba(0, 0, 0, 0.06)"
															}}
															bodyStyle={{
																padding: "16px"
															}}>
															<Card.Meta
																avatar={
																	<Badge
																		count={
																			selectedTrader?.id === trader.id ? (
																				<CheckCircleOutlined
																					style={{ color: "#1890ff" }}
																				/>
																			) : (
																				0
																			)
																		}
																		offset={[-5, 5]}>
																		<Avatar
																			size={54}
																			style={{
																				backgroundColor:
																					selectedTrader?.id === trader.id
																						? "#1890ff"
																						: "#87d068",
																				border:
																					selectedTrader?.id === trader.id
																						? "3px solid #1890ff"
																						: "2px solid transparent",
																				boxShadow:
																					selectedTrader?.id === trader.id
																						? "0 0 0 2px rgba(24, 144, 255, 0.2)"
																						: "none"
																			}}
																			icon={<UserOutlined />}>
																			{(
																				(trader.surname || "") +
																				" " +
																				(trader.other_names || "")
																			)
																				.trim()
																				?.charAt(0)
																				?.toUpperCase()}
																		</Avatar>
																	</Badge>
																}
																title={
																	<div>
																		<Text
																			strong
																			style={{
																				color:
																					selectedTrader?.id === trader.id
																						? "#1890ff"
																						: "inherit",
																				fontSize: "16px"
																			}}>
																			{searchTerm
																				? highlightSearchTerm(
																						`${trader.surname || ""} ${
																							trader.other_names || ""
																						}`.trim() || "No Name",
																						searchTerm
																				  )
																				: `${trader.surname || ""} ${
																						trader.other_names || ""
																				  }`.trim() || "No Name"}
																		</Text>
																		{trader.ctsh_id && (
																			<div style={{ marginTop: "4px" }}>
																				<Tag color="purple" size="small">
																					ID:{" "}
																					{searchTerm
																						? highlightSearchTerm(
																								trader.ctsh_id,
																								searchTerm
																						  )
																						: trader.ctsh_id}
																				</Tag>
																			</div>
																		)}
																	</div>
																}
																description={
																	<Space
																		direction="vertical"
																		size={6}
																		style={{ width: "100%" }}>
																		<Text
																			type="secondary"
																			style={{ fontSize: "13px" }}>
																			<PhoneOutlined
																				style={{ color: "#1890ff" }}
																			/>{" "}
																			{searchTerm
																				? highlightSearchTerm(
																						trader.phone || "No Phone",
																						searchTerm
																				  )
																				: trader.phone || "No Phone"}
																		</Text>
																		{trader.business_name && (
																			<Text
																				type="secondary"
																				style={{ fontSize: "13px" }}>
																				<ShopOutlined
																					style={{ color: "#52c41a" }}
																				/>{" "}
																				{trader.business_name}
																			</Text>
																		)}
																		<div>
																			{trader.trade?.name && (
																				<Tag
																					color="blue"
																					style={{ margin: "2px 4px 2px 0" }}>
																					<ToolOutlined /> {trader.trade.name}
																				</Tag>
																			)}
																			{trader.location?.name && (
																				<Tag
																					color="geekblue"
																					style={{ margin: "2px 0" }}>
																					📍 {trader.location.name}
																				</Tag>
																			)}
																		</div>
																	</Space>
																}
															/>
														</Card>
													</List.Item>
												)}
											/>
										)}
									</div>
								</Form.Item>

								{/* Remarks */}
								<Form.Item
									name="remarks"
									label={
										<Space>
											<CommentOutlined style={{ color: "#722ed1" }} />
											<Text strong>Remarks (Optional)</Text>
										</Space>
									}>
									<TextArea
										rows={4}
										placeholder="Add any remarks about this application..."
										showCount
										maxLength={500}
									/>
								</Form.Item>

								{/* Selected Trader Summary */}
								{selectedTrader && (
									<Alert
										message={
											<Space>
												<CheckCircleOutlined />
												<Text strong>Selected Trader</Text>
											</Space>
										}
										description={
											<div style={{ marginTop: 8 }}>
												<Descriptions size="small" column={2} bordered>
													<Descriptions.Item label="Full Name" span={2}>
														<Text strong>{selectedTrader.full_name}</Text>
													</Descriptions.Item>
													<Descriptions.Item label="Phone" span={1}>
														<Text copyable>
															<PhoneOutlined /> {selectedTrader.phone}
														</Text>
													</Descriptions.Item>
													<Descriptions.Item label="ID" span={1}>
														<Tag color="blue">#{selectedTrader.id}</Tag>
													</Descriptions.Item>
													{selectedTrader.business_name && (
														<Descriptions.Item label="Business" span={2}>
															<Text>
																<ShopOutlined /> {selectedTrader.business_name}
															</Text>
														</Descriptions.Item>
													)}
													{selectedTrader.trade?.name && (
														<Descriptions.Item label="Trade" span={2}>
															<Tag color="green">
																<ToolOutlined /> {selectedTrader.trade.name}
															</Tag>
														</Descriptions.Item>
													)}
												</Descriptions>
											</div>
										}
										type="success"
										showIcon
										style={{
											marginBottom: 16,
											backgroundColor: "#f6ffed",
											border: "1px solid #b7eb8f"
										}}
									/>
								)}

								{/* Action Buttons */}
								<Form.Item>
									<Card
										size="small"
										style={{
											backgroundColor: "#fafafa",
											border: "1px dashed #d9d9d9"
										}}>
										<Row justify="space-between" align="middle">
											<Col>
												<Button
													size="large"
													onClick={() =>
														navigate(`/admin/empowerment-schemes/${uuid}`)
													}
													disabled={applying}
													icon={<ArrowLeftOutlined />}
													style={{
														minWidth: "120px",
														borderColor: "#d9d9d9"
													}}>
													Cancel
												</Button>
											</Col>
											<Col>
												<Space direction="vertical" align="end">
													{selectedTrader && (
														<Text type="secondary" style={{ fontSize: "12px" }}>
															Ready to add {selectedTrader.full_name} to scheme
														</Text>
													)}
													<Button
														type="primary"
														size="large"
														htmlType="submit"
														loading={applying}
														disabled={!selectedTrader || !scheme?.is_open}
														icon={applying ? undefined : <UserAddOutlined />}
														style={{
															minWidth: "160px",
															background:
																selectedTrader && scheme?.is_open
																	? "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)"
																	: undefined,
															border: "none",
															boxShadow:
																selectedTrader && scheme?.is_open
																	? "0 4px 12px rgba(24, 144, 255, 0.3)"
																	: undefined
														}}>
														{applying ? "Adding Trader..." : "Add to Scheme"}
													</Button>
												</Space>
											</Col>
										</Row>
									</Card>
								</Form.Item>
							</Form>
						</Card>
					</>
				)}
			</Space>
		</div>
	);
};

export default AddTraderToScheme;
