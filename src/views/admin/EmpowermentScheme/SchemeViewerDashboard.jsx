import { useState } from "react";
import { useQuery } from "@apollo/client";
import {
	Button,
	Card,
	Row,
	Col,
	Statistic,
	Table,
	Tag,
	Typography,
	Input,
	Select,
	Space,
	Badge,
	Progress,
	Descriptions,
	Empty,
	Spin,
	Avatar,
	Image,
	Divider,
	Alert
} from "antd";
import {
	SearchOutlined,
	TeamOutlined,
	FileTextOutlined,
	UserOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	CloseCircleOutlined,
	EyeOutlined,
	EnvironmentOutlined,
	DownloadOutlined
} from "@ant-design/icons";
import {
	GET_EMPOWERMENT_SCHEMES,
	GET_EMPOWERMENT_SCHEME_APPLICATIONS
} from "../../../gql/queries/empowermentSchemeQueries";
import { GET_TRADE_LOCATIONS } from "../../../gql/tradeLocation";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLOR = {
	DRAFT: "default",
	ACTIVE: "success",
	SUSPENDED: "warning",
	COMPLETED: "processing",
	CANCELLED: "error"
};

const APP_STATUS_COLOR = {
	pending: "gold",
	approved: "green",
	rejected: "red",
	disbursed: "blue",
	completed: "geekblue"
};

const PAGE_SIZE = 20;

const SchemeViewerDashboard = () => {
	const [selectedScheme, setSelectedScheme] = useState(null);
	const [participantSearch, setParticipantSearch] = useState("");
	const [excelExporting, setExcelExporting] = useState(false);
	const [participantPage, setParticipantPage] = useState(1);
	const [participantLocationFilter, setParticipantLocationFilter] =
		useState(null);
	const [schemeSearch, setSchemeSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState(null);

	// Fetch all schemes (up to 100, viewer context so no huge lists expected)
	const { data: schemesData, loading: schemesLoading } = useQuery(
		GET_EMPOWERMENT_SCHEMES,
		{
			variables: { first: 100, ...(statusFilter && { status: statusFilter }) },
			fetchPolicy: "cache-and-network"
		}
	);

	// Fetch participants for the selected scheme (server-side pagination)
	const {
		data: applicationsData,
		loading: applicationsLoading,
		refetch: refetchApplications
	} = useQuery(GET_EMPOWERMENT_SCHEME_APPLICATIONS, {
		variables: {
			empowerment_scheme_id: selectedScheme?.id,
			first: PAGE_SIZE,
			page: participantPage
		},
		skip: !selectedScheme?.id,
		fetchPolicy: "cache-and-network"
	});

	// Fetch trade locations for filter
	const { data: tradeLocationsData } = useQuery(GET_TRADE_LOCATIONS, {
		variables: { isActive: true },
		fetchPolicy: "cache-and-network"
	});

	const schemes = schemesData?.empowermentSchemes?.data || [];
	const tradeLocations = tradeLocationsData?.tradeLocations || [];
	const allApplications =
		applicationsData?.empowermentSchemeApplications?.data || [];
	const serverTotal =
		applicationsData?.empowermentSchemeApplications?.paginatorInfo?.total ?? 0;

	// Filter schemes list
	const filteredSchemes = schemes.filter((s) => {
		if (!schemeSearch.trim()) return true;
		const term = schemeSearch.toLowerCase();
		return (
			s.name?.toLowerCase().includes(term) ||
			s.description?.toLowerCase().includes(term)
		);
	});

	// Filter participants
	const filteredParticipants = allApplications.filter((record) => {
		if (
			participantLocationFilter &&
			record.trader?.trade_location !== participantLocationFilter
		) {
			return false;
		}
		if (participantSearch.trim()) {
			const name =
				`${record.trader?.surname || ""} ${record.trader?.other_names || ""}`.toLowerCase();
			const phone = (record.trader?.phone || "").toLowerCase();
			const ctshId = (record.trader?.ctsh_id || "").toLowerCase();
			const term = participantSearch.trim().toLowerCase();
			if (
				!name.includes(term) &&
				!phone.includes(term) &&
				!ctshId.includes(term)
			) {
				return false;
			}
		}
		return true;
	});

	// Participant summary stats
	const totalParticipants = serverTotal || allApplications.length;
	const approved = allApplications.filter((a) =>
		["approved", "disbursed", "completed"].includes(a.status?.toLowerCase())
	).length;
	const pending = allApplications.filter(
		(a) => a.status?.toLowerCase() === "pending"
	).length;
	const disbursed = allApplications.filter(
		(a) => a.status?.toLowerCase() === "disbursed"
	).length;

	const handleExportToExcel = async () => {
		const serverTotal =
			applicationsData?.empowermentSchemeApplications?.paginatorInfo?.total ??
			allApplications.length;
		if (serverTotal === 0) return;
		setExcelExporting(true);
		try {
			let sourceRecords = allApplications;
			if (serverTotal > allApplications.length) {
				try {
					const result = await refetchApplications({
						empowerment_scheme_id: selectedScheme.id,
						first: serverTotal
					});
					sourceRecords =
						result.data?.empowermentSchemeApplications?.data || allApplications;
				} catch {
					// fall back to whatever is loaded
				}
			}
			const data = sourceRecords.filter((record) => {
				if (
					participantLocationFilter &&
					record.trader?.trade_location !== participantLocationFilter
				)
					return false;
				if (participantSearch.trim()) {
					const term = participantSearch.trim().toLowerCase();
					const name =
						`${record.trader?.surname || ""} ${record.trader?.other_names || ""}`.toLowerCase();
					const phone = (record.trader?.phone || "").toLowerCase();
					const ctshId = (record.trader?.ctsh_id || "").toLowerCase();
					if (
						!name.includes(term) &&
						!phone.includes(term) &&
						!ctshId.includes(term)
					)
						return false;
				}
				return true;
			});
			if (!data.length) return;
			const exportData = data.map((record, index) => ({
				"S/N": index + 1,
				"CTSH ID": record.trader?.ctsh_id || "",
				Surname: record.trader?.surname || "",
				"Other Names": record.trader?.other_names || "",
				Phone: record.trader?.phone || "",
				"Trade Location": record.trader?.trade_location || "",
				Status: record.status || ""
			}));
			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
			const schemeName = (selectedScheme?.name || "scheme").replace(
				/\s+/g,
				"_"
			);
			const date = new Date().toISOString().split("T")[0];
			XLSX.writeFile(workbook, `Participants_${schemeName}_${date}.xlsx`);
		} finally {
			setExcelExporting(false);
		}
	};
	const schemeColumns = [
		{
			title: "S/N",
			key: "sn",
			width: 55,
			render: (_, __, index) => index + 1
		},
		{
			title: "Scheme Name",
			dataIndex: "name",
			key: "name",
			render: (name, record) => (
				<Space>
					<Text strong>{name}</Text>
					<Badge status={STATUS_COLOR[record.status]} />
				</Space>
			)
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => (
				<Tag color={STATUS_COLOR[status]}>{status?.replace("_", " ")}</Tag>
			)
		},
		{
			title: "Participants",
			key: "participants",
			render: (_, record) => (
				<Space direction="vertical" size={2}>
					<Text>
						{record.traders_count ?? 0} / {record.max_participants ?? "∞"}
					</Text>
					{record.max_participants ? (
						<Progress
							percent={Math.round(
								((record.traders_count ?? 0) / record.max_participants) * 100
							)}
							size="small"
							showInfo={false}
						/>
					) : null}
				</Space>
			)
		},
		{
			title: "Deadline",
			dataIndex: "application_deadline",
			key: "deadline",
			render: (d) =>
				d ? (
					new Date(d).toLocaleDateString("en-NG")
				) : (
					<Text type="secondary">—</Text>
				)
		},
		{
			title: "Action",
			key: "action",
			render: (_, record) => (
				<a
					onClick={() => {
						setSelectedScheme(record);
						setParticipantSearch("");
						setParticipantLocationFilter(null);
						setParticipantPage(1);
					}}>
					<EyeOutlined /> View Participants
				</a>
			)
		}
	];

	const participantColumns = [
		{
			title: "S/N",
			key: "sn",
			width: 55,
			render: (_, __, index) => (participantPage - 1) * PAGE_SIZE + index + 1
		},
		{
			title: "Photo",
			key: "photo",
			width: 60,
			render: (_, record) => {
				const src = record.trader?.photo
					? `data:image/jpeg;base64,${record.trader.photo}`
					: null;
				return src ? (
					<Image
						width={32}
						height={32}
						src={src}
						style={{
							borderRadius: "50%",
							objectFit: "cover",
							cursor: "pointer"
						}}
						preview={{
							src,
							mask: false
						}}
					/>
				) : (
					<Avatar
						size="small"
						style={{ backgroundColor: "#1890ff" }}
						icon={<UserOutlined />}
					/>
				);
			}
		},
		{
			title: "Name",
			key: "name",
			render: (_, record) => (
				<Text>
					{record.trader?.surname} {record.trader?.other_names}
				</Text>
			)
		},
		{
			title: "Phone",
			dataIndex: ["trader", "phone"],
			key: "phone"
		},
		{
			title: "CTSH ID",
			dataIndex: ["trader", "ctsh_id"],
			key: "ctsh_id",
			render: (v) => <Text code>{v}</Text>
		},
		{
			title: "Trade Location",
			dataIndex: ["trader", "trade_location"],
			key: "trade_location",
			render: (v) =>
				v ? (
					<Tag icon={<EnvironmentOutlined />} color="cyan">
						{v}
					</Tag>
				) : (
					<Text type="secondary">—</Text>
				)
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => (
				<Tag color={APP_STATUS_COLOR[status?.toLowerCase()] || "default"}>
					{status}
				</Tag>
			)
		}
	];

	return (
		<div style={{ padding: "0 0 40px" }}>
			<Title level={3} style={{ marginBottom: 4 }}>
				<FileTextOutlined style={{ color: "#1890ff", marginRight: 8 }} />
				Empowerment Schemes
			</Title>
			<Text type="secondary">
				Read-only view of all schemes and participants
			</Text>

			<Divider />

			{/* Schemes list */}
			<Card title="All Schemes" style={{ marginBottom: 24 }}>
				<Row gutter={[8, 8]} style={{ marginBottom: 12 }} align="middle">
					<Col xs={24} sm={12} md={8}>
						<Input
							placeholder="Search schemes..."
							prefix={<SearchOutlined />}
							value={schemeSearch}
							onChange={(e) => setSchemeSearch(e.target.value)}
							allowClear
							size="small"
							style={{ width: "100%" }}
						/>
					</Col>
					<Col xs={24} sm={8} md={6}>
						<Select
							allowClear
							placeholder="Filter by status"
							value={statusFilter}
							onChange={(v) => setStatusFilter(v ?? null)}
							size="small"
							style={{ width: "100%" }}>
							{["ACTIVE", "DRAFT", "SUSPENDED", "COMPLETED", "CANCELLED"].map(
								(s) => (
									<Option key={s} value={s}>
										{s}
									</Option>
								)
							)}
						</Select>
					</Col>
				</Row>
				<Table
					loading={schemesLoading}
					dataSource={filteredSchemes}
					rowKey="id"
					size="small"
					scroll={{ x: 600 }}
					pagination={{ pageSize: 10, showSizeChanger: false }}
					columns={schemeColumns}
					locale={{ emptyText: <Empty description="No schemes found" /> }}
					rowClassName={(record) =>
						selectedScheme?.id === record.id ? "ant-table-row-selected" : ""
					}
				/>
			</Card>

			{/* Participants panel */}
			{selectedScheme ? (
				<Card
					title={
						<Space wrap size="small">
							<TeamOutlined />
							<Text strong>Participants — {selectedScheme.name}</Text>
							<Tag color={STATUS_COLOR[selectedScheme.status]}>
								{selectedScheme.status}
							</Tag>
						</Space>
					}>
					{/* Controls toolbar */}
					<Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
						<Col xs={24} sm={9} md={8}>
							<Input
								placeholder="Search participants..."
								prefix={<SearchOutlined />}
								value={participantSearch}
								onChange={(e) => {
									setParticipantSearch(e.target.value);
									setParticipantPage(1);
								}}
								allowClear
								size="small"
								style={{ width: "100%" }}
							/>
						</Col>
						<Col xs={24} sm={9} md={8}>
							<Select
								showSearch
								allowClear
								size="small"
								placeholder={
									<span>
										<EnvironmentOutlined /> Location
									</span>
								}
								optionFilterProp="children"
								value={participantLocationFilter}
								onChange={(val) => {
									setParticipantLocationFilter(val ?? null);
									setParticipantPage(1);
								}}
								style={{ width: "100%" }}>
								{tradeLocations.map((loc) => (
									<Option key={loc.id} value={loc.name}>
										{loc.name}
									</Option>
								))}
							</Select>
						</Col>
						<Col xs={24} sm={6} md={4}>
							<Button
								size="small"
								icon={<DownloadOutlined />}
								loading={excelExporting}
								disabled={filteredParticipants.length === 0}
								onClick={handleExportToExcel}
								style={{
									color: "#389e0d",
									borderColor: "#b7eb8f",
									width: "100%"
								}}>
								Export Excel
							</Button>
						</Col>
					</Row>
					{/* Summary stats */}
					{!applicationsLoading && totalParticipants > 0 && (
						<Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
							<Col xs={12} sm={6}>
								<Statistic
									title="Max Participants"
									value={selectedScheme?.max_participants ?? "—"}
									prefix={<TeamOutlined />}
								/>
							</Col>
							<Col xs={12} sm={6}>
								<Statistic
									title="Total"
									value={totalParticipants}
									prefix={<ClockCircleOutlined />}
									valueStyle={{
										color:
											selectedScheme?.max_participants &&
											totalParticipants >= selectedScheme.max_participants
												? "#ff4d4f"
												: undefined
									}}
								/>
							</Col>
							<Col xs={12} sm={6}>
								<Statistic
									title="Approved / Disbursed"
									value={`${approved} / ${disbursed}`}
									prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
								/>
							</Col>
							<Col xs={12} sm={6}>
								<Statistic
									title="Pending"
									value={pending}
									prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
								/>
							</Col>
							<Col xs={12} sm={6}>
								<Statistic
									title="Filtered"
									value={filteredParticipants.length}
									prefix={<EyeOutlined />}
								/>
							</Col>
						</Row>
					)}

					{(participantSearch || participantLocationFilter) && (
						<Alert
							type="info"
							showIcon
							style={{ marginBottom: 12 }}
							message={`Showing ${filteredParticipants.length} of ${totalParticipants} participants`}
						/>
					)}

					<Table
						loading={applicationsLoading}
						dataSource={filteredParticipants}
						rowKey="id"
						size="small"
						scroll={{ x: 700 }}
						pagination={{
							pageSize: PAGE_SIZE,
							total: serverTotal,
							showSizeChanger: false,
							showTotal: (total) => `Total: ${total} participants`,
							current: participantPage,
							onChange: (page) => setParticipantPage(page)
						}}
						locale={{
							emptyText: applicationsLoading ? (
								<Spin />
							) : (
								<Empty description="No participants" />
							)
						}}
						columns={participantColumns}
					/>
				</Card>
			) : (
				<Card>
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description="Select a scheme above to view its participants"
					/>
				</Card>
			)}
		</div>
	);
};

export default SchemeViewerDashboard;
