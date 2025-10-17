import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
	Table,
	Button,
	Tag,
	Progress,
	Dropdown,
	Space,
	Card,
	Row,
	Col,
	Select,
	Tooltip,
	Typography
} from "antd";
import {
	EyeOutlined,
	EditOutlined,
	UserAddOutlined,
	FileTextOutlined,
	MoreOutlined,
	PlusOutlined,
	ReloadOutlined
} from "@ant-design/icons";
import { GET_EMPOWERMENT_SCHEMES } from "../../../gql/queries/empowermentSchemeQueries";
import { GET_LOCATIONS } from "../../../gql/queries/queries";
import Loading from "../../../components/Loading/Loading";
import { toast } from "react-toastify";

const { Option } = Select;
const { Title } = Typography;

const EmpowermentSchemes = () => {
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState("");
	const [locationFilter, setLocationFilter] = useState("");

	const {
		data: schemesData,
		loading: schemesLoading,
		error: schemesError,
		refetch: refetchSchemes
	} = useQuery(GET_EMPOWERMENT_SCHEMES, {
		variables: {
			first: 15,
			page: currentPage,
			...(statusFilter && { status: statusFilter }),
			...(locationFilter && { location_id: locationFilter })
		},
		fetchPolicy: "cache-and-network"
	});

	const { data: locationsData } = useQuery(GET_LOCATIONS);

	const schemes = schemesData?.empowermentSchemes?.data || [];
	const paginatorInfo = schemesData?.empowermentSchemes?.paginatorInfo;
	const locations = locationsData?.locations || [];

	const statusOptions = [
		{ value: "", label: "All Statuses" },
		{ value: "DRAFT", label: "Draft" },
		{ value: "ACTIVE", label: "Active" },
		{ value: "SUSPENDED", label: "Suspended" },
		{ value: "COMPLETED", label: "Completed" },
		{ value: "CANCELLED", label: "Cancelled" }
	];

	const getStatusTag = (status) => {
		const statusConfig = {
			DRAFT: { color: "default", text: "Draft" },
			ACTIVE: { color: "success", text: "Active" },
			SUSPENDED: { color: "warning", text: "Suspended" },
			COMPLETED: { color: "processing", text: "Completed" },
			CANCELLED: { color: "error", text: "Cancelled" }
		};

		const config = statusConfig[status] || { color: "default", text: status };
		return <Tag color={config.color}>{config.text}</Tag>;
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN"
		}).format(amount || 0);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		});
	};

	const getActionMenu = (record) => {
		const menuItems = [
			{
				key: "view",
				label: "View Details",
				icon: <EyeOutlined />,
				onClick: () => navigate(`/admin/empowerment-schemes/${record.uuid}`)
			},
			{
				key: "edit",
				label: "Edit Scheme",
				icon: <EditOutlined />,
				onClick: () =>
					navigate(`/admin/empowerment-schemes/${record.uuid}/edit`)
			}
		];

		if (record.is_open) {
			menuItems.push({
				key: "add-trader",
				label: "Add Trader",
				icon: <UserAddOutlined />,
				onClick: () =>
					navigate(`/admin/empowerment-schemes/${record.uuid}/add-trader`)
			});
		}

		menuItems.push({
			key: "applications",
			label: "View Applications",
			icon: <FileTextOutlined />,
			onClick: () =>
				navigate(`/admin/empowerment-schemes/${record.uuid}/applications`)
		});

		return { items: menuItems };
	};

	const columns = [
		{
			title: "Scheme Name",
			dataIndex: "name",
			key: "name",
			render: (text, record) => (
				<div>
					<Link
						to={`/admin/empowerment-schemes/${record.uuid}`}
						className="font-medium text-blue-600 hover:text-blue-800">
						{text}
					</Link>
					{record.location && (
						<div className="text-xs text-gray-500 mt-1">
							{record.location.title}
						</div>
					)}
				</div>
			)
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => getStatusTag(status),
			filters: statusOptions.slice(1).map((option) => ({
				text: option.label,
				value: option.value
			})),
			onFilter: (value, record) => record.status === value
		},
		{
			title: "Duration",
			dataIndex: "duration_months",
			key: "duration",
			render: (months) => `${months} months`,
			sorter: (a, b) => a.duration_months - b.duration_months
		},
		{
			title: "Participants",
			key: "participants",
			render: (_, record) => (
				<div>
					<div className="text-sm">
						{record.current_participants}/{record.max_participants}
					</div>
					<Progress
						percent={record.progress_percentage}
						size="small"
						showInfo={false}
					/>
				</div>
			),
			sorter: (a, b) => a.progress_percentage - b.progress_percentage
		},
		{
			title: "Amount",
			dataIndex: "amount_per_participant",
			key: "amount",
			render: (amount) => (amount ? formatCurrency(amount) : "N/A"),
			sorter: (a, b) =>
				(a.amount_per_participant || 0) - (b.amount_per_participant || 0)
		},
		{
			title: "Deadline",
			dataIndex: "application_deadline",
			key: "deadline",
			render: (date) => {
				const isExpired = new Date(date) < new Date();
				return (
					<span style={{ color: isExpired ? "#ff4d4f" : "inherit" }}>
						{formatDate(date)}
					</span>
				);
			},
			sorter: (a, b) =>
				new Date(a.application_deadline) - new Date(b.application_deadline)
		},
		{
			title: "Actions",
			key: "actions",
			width: 80,
			render: (_, record) => (
				<Dropdown
					menu={getActionMenu(record)}
					trigger={["hover"]}
					placement="bottomRight">
					<Button
						type="text"
						icon={<MoreOutlined />}
						className="hover:bg-gray-100"
					/>
				</Dropdown>
			)
		}
	];

	if (schemesError) {
		toast.error("Error loading empowerment schemes");
	}

	return (
		<div
			style={{
				padding: "24px",
				backgroundColor: "#f5f5f5",
				minHeight: "100vh"
			}}>
			<Card>
				<Row
					justify="space-between"
					align="middle"
					style={{ marginBottom: 24 }}>
					<Col>
						<Title level={3} style={{ margin: 0, color: "#1f2937" }}>
							Empowerment Schemes
						</Title>
					</Col>
					<Col>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => navigate("/admin/empowerment-schemes/create")}>
							Create New Scheme
						</Button>
					</Col>
				</Row>

				<Row gutter={16} style={{ marginBottom: 24 }}>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Select
							placeholder="Filter by status"
							value={statusFilter || undefined}
							onChange={setStatusFilter}
							allowClear
							style={{ width: "100%" }}>
							{statusOptions.slice(1).map((option) => (
								<Option key={option.value} value={option.value}>
									{option.label}
								</Option>
							))}
						</Select>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Select
							placeholder="Filter by location"
							value={locationFilter || undefined}
							onChange={setLocationFilter}
							allowClear
							style={{ width: "100%" }}>
							{locations.map((location) => (
								<Option key={location.id} value={location.id}>
									{location.title}
								</Option>
							))}
						</Select>
					</Col>
					<Col xs={24} sm={12} md={8} lg={6}>
						<Button
							icon={<ReloadOutlined />}
							onClick={() => {
								setStatusFilter("");
								setLocationFilter("");
								setCurrentPage(1);
								refetchSchemes();
							}}>
							Clear Filters
						</Button>
					</Col>
				</Row>

				<Table
					columns={columns}
					dataSource={schemes}
					rowKey="id"
					loading={schemesLoading}
					pagination={
						paginatorInfo && paginatorInfo.lastPage > 1
							? {
									current: currentPage,
									total: paginatorInfo.total,
									pageSize: paginatorInfo.perPage,
									showSizeChanger: false,
									showQuickJumper: true,
									showTotal: (total, range) =>
										`${range[0]}-${range[1]} of ${total} items`,
									onChange: (page) => setCurrentPage(page)
							  }
							: false
					}
					scroll={{ x: "max-content" }}
					size="middle"
					className="ant-table-striped"
					rowClassName={(record, index) =>
						index % 2 === 0 ? "table-row-light" : "table-row-dark"
					}
				/>
			</Card>
		</div>
	);
};

export default EmpowermentSchemes;
