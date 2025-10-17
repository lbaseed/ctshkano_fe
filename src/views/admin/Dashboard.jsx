import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
	Card,
	Row,
	Col,
	Statistic,
	Progress,
	Typography,
	Table,
	Tag,
	Avatar,
	Space,
	Button,
	Select,
	DatePicker,
	Empty,
	Spin,
	Alert,
	Badge,
	List,
	Timeline,
	Divider
} from "antd";
import {
	UserOutlined,
	TeamOutlined,
	ShopOutlined,
	FileTextOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	CloseCircleOutlined,
	TrophyOutlined,
	RiseOutlined,
	FallOutlined,
	EyeOutlined,
	ArrowUpOutlined,
	ArrowDownOutlined,
	CalendarOutlined,
	BankOutlined,
	BarChartOutlined,
	MoneyCollectFilled
} from "@ant-design/icons";
// Charts will be available when @ant-design/plots is installed
import moment from "moment";
import {
	GET_TRADERS,
	GET_TRADES,
	GET_LOCATIONS
} from "../../gql/queries/queries";
import {
	GET_EMPOWERMENT_SCHEMES,
	GET_EMPOWERMENT_SCHEME_APPLICATIONS
} from "../../gql/queries/empowermentSchemeQueries";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Dashboard = () => {
	const [dateRange, setDateRange] = useState([
		moment().subtract(30, "days"),
		moment()
	]);
	const [selectedPeriod, setSelectedPeriod] = useState("month");

	// Fetch data using existing queries
	const { data: tradersData, loading: tradersLoading } = useQuery(GET_TRADERS, {
		fetchPolicy: "cache-and-network"
	});

	const { data: tradesData, loading: tradesLoading } = useQuery(GET_TRADES, {
		fetchPolicy: "cache-and-network"
	});

	const { data: locationsData, loading: locationsLoading } = useQuery(
		GET_LOCATIONS,
		{
			fetchPolicy: "cache-and-network"
		}
	);

	const { data: schemesData, loading: schemesLoading } = useQuery(
		GET_EMPOWERMENT_SCHEMES,
		{
			variables: { first: 100 },
			fetchPolicy: "cache-and-network"
		}
	);

	const { data: applicationsData, loading: applicationsLoading } = useQuery(
		GET_EMPOWERMENT_SCHEME_APPLICATIONS,
		{
			variables: { first: 100 },
			fetchPolicy: "cache-and-network"
		}
	);

	const loading =
		tradersLoading ||
		tradesLoading ||
		locationsLoading ||
		schemesLoading ||
		applicationsLoading;

	// Process data
	const traders = tradersData?.traders || [];
	const trades = tradesData?.trades || [];
	const locations = locationsData?.locations || [];
	const schemes = schemesData?.empowermentSchemes?.data || [];
	const applications =
		applicationsData?.empowermentSchemeApplications?.data || [];

	// Calculate statistics
	const totalTraders = traders.length;
	const totalTrades = trades.length;
	const totalLocations = locations.length;
	const totalSchemes = schemes.length;
	const activeSchemes = schemes.filter((s) => s.status === "ACTIVE").length;
	const totalApplications = applications.length;
	const approvedApplications = applications.filter(
		(a) => a.status === "APPROVED"
	).length;
	const pendingApplications = applications.filter(
		(a) => a.status === "PENDING"
	).length;
	const rejectedApplications = applications.filter(
		(a) => a.status === "REJECTED"
	).length;

	// Calculate recent data
	const recentTraders = traders
		.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
		.slice(0, 5);

	const recentApplications = applications
		.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
		.slice(0, 5);

	// Calculate totals
	const totalSchemeAmount = schemes.reduce(
		(sum, scheme) =>
			sum +
			(parseFloat(scheme.amount_per_participant) || 0) *
				(scheme.max_participants || 0),
		0
	);

	const approvalRate =
		totalApplications > 0
			? (approvedApplications / totalApplications) * 100
			: 0;

	// Custom Naira Icon Component
	const NairaIcon = ({ style }) => (
		<span style={{ 
			fontWeight: 'bold', 
			fontSize: '16px', 
			fontFamily: 'Arial, sans-serif',
			...style 
		}}>
			₦
		</span>
	);

	// Prepare chart data
	const applicationStatusData = [
		{ type: "Approved", value: approvedApplications, color: "#52c41a" },
		{ type: "Pending", value: pendingApplications, color: "#faad14" },
		{ type: "Rejected", value: rejectedApplications, color: "#ff4d4f" }
	].filter((item) => item.value > 0);

	const tradeDistributionData = trades
		.map((trade) => ({
			trade: trade.name,
			count: traders.filter((trader) => trader.trade_id === trade.id).length
		}))
		.filter((item) => item.count > 0);

	const schemeStatusData = [
		{
			status: "Active",
			count: schemes.filter((s) => s.status === "ACTIVE").length
		},
		{
			status: "Draft",
			count: schemes.filter((s) => s.status === "DRAFT").length
		},
		{
			status: "Completed",
			count: schemes.filter((s) => s.status === "COMPLETED").length
		},
		{
			status: "Suspended",
			count: schemes.filter((s) => s.status === "SUSPENDED").length
		}
	].filter((item) => item.count > 0);

	// Monthly registration trend (mock data for demonstration)
	const monthlyTrendData = Array.from({ length: 6 }, (_, i) => {
		const date = moment().subtract(5 - i, "months");
		return {
			month: date.format("MMM YYYY"),
			traders: Math.floor(Math.random() * 50) + 10,
			applications: Math.floor(Math.random() * 30) + 5,
			schemes: Math.floor(Math.random() * 10) + 2
		};
	});

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
			currencyDisplay: "symbol"
		}).format(amount).replace("NGN", "₦");
	};

	const getStatusColor = (status) => {
		const colors = {
			APPROVED: "success",
			PENDING: "warning",
			REJECTED: "error",
			ACTIVE: "success",
			DRAFT: "default",
			COMPLETED: "processing",
			SUSPENDED: "warning"
		};
		return colors[status] || "default";
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
				<Spin size="large" tip="Loading dashboard data..." />
			</div>
		);
	}

	return (
		<div
			style={{
				padding: "24px",
				backgroundColor: "#f5f5f5",
				minHeight: "100vh"
			}}>
			{/* Header */}
			<Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
				<Col>
					<Title level={2} style={{ margin: 0, color: "#1f2937" }}>
						<BarChartOutlined style={{ marginRight: 12, color: "#1890ff" }} />
						Dashboard Overview
					</Title>
					<Text type="secondary">
						Welcome back! Here's what's happening with your platform.
					</Text>
				</Col>
				<Col>
					<Space>
						<RangePicker
							value={dateRange}
							onChange={setDateRange}
							style={{ marginRight: 8 }}
						/>
						<Select
							value={selectedPeriod}
							onChange={setSelectedPeriod}
							style={{ width: 120 }}>
							<Option value="week">Week</Option>
							<Option value="month">Month</Option>
							<Option value="quarter">Quarter</Option>
							<Option value="year">Year</Option>
						</Select>
					</Space>
				</Col>
			</Row>

			{/* Key Metrics Row */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} md={6}>
					<Card>
						<Statistic
							title="Total Traders"
							value={totalTraders}
							prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
							suffix={
								<Badge
									count={recentTraders.length}
									style={{ backgroundColor: "#52c41a" }}
									title="New this month"
								/>
							}
						/>
						<Progress
							percent={85}
							size="small"
							strokeColor="#1890ff"
							format={() => "Active: 85%"}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<Card>
						<Statistic
							title="Total Trades"
							value={totalTrades}
							prefix={<ShopOutlined style={{ color: "#52c41a" }} />}
						/>
						<Text type="secondary" style={{ fontSize: "12px" }}>
							Across {totalLocations} locations
						</Text>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<Card>
						<Statistic
							title="Empowerment Schemes"
							value={totalSchemes}
							prefix={<FileTextOutlined style={{ color: "#722ed1" }} />}
							suffix={<Tag color="success">{activeSchemes} Active</Tag>}
						/>
						<Progress
							percent={(activeSchemes / Math.max(totalSchemes, 1)) * 100}
							size="small"
							strokeColor="#722ed1"
							format={() =>
								`${Math.round(
									(activeSchemes / Math.max(totalSchemes, 1)) * 100
								)}% Active`
							}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<Card>
						<Statistic
							title="Total Applications"
							value={totalApplications}
							prefix={<FileTextOutlined style={{ color: "#fa8c16" }} />}
							suffix={
								<Tag
									color={
										approvalRate > 70
											? "success"
											: approvalRate > 50
											? "warning"
											: "error"
									}>
									{Math.round(approvalRate)}% Approved
								</Tag>
							}
						/>
						<div style={{ marginTop: 8 }}>
							<Space size="small">
								<Tag color="success" style={{ margin: 0 }}>
									<CheckCircleOutlined /> {approvedApplications}
								</Tag>
								<Tag color="warning" style={{ margin: 0 }}>
									<ClockCircleOutlined /> {pendingApplications}
								</Tag>
								<Tag color="error" style={{ margin: 0 }}>
									<CloseCircleOutlined /> {rejectedApplications}
								</Tag>
							</Space>
						</div>
					</Card>
				</Col>
			</Row>

			{/* Financial Overview */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} md={12}>
					<Card
						title={
							<Space>
								<BankOutlined style={{ color: "#1890ff" }} />
								<span>Financial Overview</span>
							</Space>
						}
						extra={
							<Button type="link" icon={<EyeOutlined />}>
								View Details
							</Button>
						}>
						<Row gutter={16}>
							<Col span={12}>
								<Statistic
									title="Total Scheme Value"
									value={totalSchemeAmount}
									formatter={(value) => formatCurrency(value)}
									prefix={<BankOutlined style={{ color: "#52c41a", fontSize: 24 }} />}
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title="Avg. per Participant"
									value={
										totalSchemes > 0
											? totalSchemeAmount /
											  (schemes.reduce(
													(sum, s) => sum + (s.max_participants || 0),
													0
											  ) || 1)
											: 0
									}
									formatter={(value) => formatCurrency(value)}
									prefix={<UserOutlined style={{ color: "#722ed1" }} />}
								/>
							</Col>
						</Row>
						<Divider />
						<Row gutter={16}>
							<Col span={12}>
								<Text type="secondary">Active Schemes Budget:</Text>
								<br />
								<Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
									{formatCurrency(
										schemes
											.filter((s) => s.status === "ACTIVE")
											.reduce(
												(sum, s) =>
													sum +
													(parseFloat(s.amount_per_participant) || 0) *
														(s.max_participants || 0),
												0
											)
									)}
								</Text>
							</Col>
							<Col span={12}>
								<Text type="secondary">Potential Beneficiaries:</Text>
								<br />
								<Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
									{schemes
										.reduce((sum, s) => sum + (s.max_participants || 0), 0)
										.toLocaleString()}{" "}
									Traders
								</Text>
							</Col>
						</Row>
					</Card>
				</Col>
				<Col xs={24} md={12}>
					<Card
						title="Application Status Distribution"
						extra={
							<Tag color="blue">{totalApplications} Total Applications</Tag>
						}>
						{applicationStatusData.length > 0 ? (
							<div
								style={{
									height: 200,
									display: "flex",
									alignItems: "center",
									justifyContent: "center"
								}}>
								<Space direction="vertical" align="center">
									{applicationStatusData.map((item, index) => (
										<div key={index} style={{ textAlign: "center" }}>
											<div
												style={{
													width: 60,
													height: 60,
													backgroundColor: item.color,
													borderRadius: "50%",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													margin: "0 auto 8px",
													color: "white",
													fontWeight: "bold",
													fontSize: "16px"
												}}>
												{item.value}
											</div>
											<Text>{item.type}</Text>
										</div>
									))}
								</Space>
							</div>
						) : (
							<Empty description="No application data available" />
						)}
					</Card>
				</Col>
			</Row>

			{/* Recent Activity Row */}
			<Row gutter={[16, 16]}>
				<Col xs={24} lg={12}>
					<Card
						title="Recent Trader Registrations"
						extra={
							<Button type="primary" size="small">
								View All Traders
							</Button>
						}>
						<List
							dataSource={recentTraders}
							renderItem={(trader) => (
								<List.Item>
									<List.Item.Meta
										avatar={
											<Avatar
												style={{ backgroundColor: "#1890ff" }}
												icon={<UserOutlined />}>
												{`${trader.surname || ""} ${trader.other_names || ""}`
													.charAt(0)
													.toUpperCase()}
											</Avatar>
										}
										title={
											<Space>
												<span>
													{`${trader.surname || ""} ${
														trader.other_names || ""
													}`.trim() || "No Name"}
												</span>
												{trader.ctsh_id && (
													<Tag color="purple" size="small">
														{trader.ctsh_id}
													</Tag>
												)}
											</Space>
										}
										description={
											<Space direction="vertical" size={4}>
												<Text type="secondary">{trader.phone}</Text>
												<Text type="secondary" style={{ fontSize: "12px" }}>
													Registered {moment(trader.created_at).fromNow()}
												</Text>
											</Space>
										}
									/>
								</List.Item>
							)}
						/>
						{recentTraders.length === 0 && (
							<Empty description="No recent registrations" />
						)}
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card
						title="Recent Applications"
						extra={
							<Button type="primary" size="small">
								View All Applications
							</Button>
						}>
						<Timeline>
							{recentApplications.map((application) => (
								<Timeline.Item
									key={application.id}
									color={
										getStatusColor(application.status) === "success"
											? "green"
											: getStatusColor(application.status) === "warning"
											? "yellow"
											: "red"
									}
									dot={
										application.status === "APPROVED" ? (
											<CheckCircleOutlined />
										) : application.status === "PENDING" ? (
											<ClockCircleOutlined />
										) : (
											<CloseCircleOutlined />
										)
									}>
									<div>
										<Text strong>
											{`${application.trader?.surname || ""} ${
												application.trader?.other_names || ""
											}`.trim()}
										</Text>
										{application.trader?.ctsh_id && (
											<Tag
												color="purple"
												size="small"
												style={{ marginLeft: 8 }}>
												{application.trader.ctsh_id}
											</Tag>
										)}
										<Tag
											color={getStatusColor(application.status)}
											size="small"
											style={{ marginLeft: 8 }}>
											{application.status}
										</Tag>
										<br />
										<Text type="secondary" style={{ fontSize: "12px" }}>
											Applied to: {application.empowermentScheme?.name}
										</Text>
										<br />
										<Text type="secondary" style={{ fontSize: "12px" }}>
											{moment(application.created_at).fromNow()}
										</Text>
									</div>
								</Timeline.Item>
							))}
						</Timeline>
						{recentApplications.length === 0 && (
							<Empty description="No recent applications" />
						)}
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default Dashboard;
