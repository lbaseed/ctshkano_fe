import React, { useContext, useEffect, useState } from "react";
import CardSession from "../../../components/Cards/Card";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_TRADE_LOCATIONS } from "../../../gql/tradeLocation";
import {
	CREATE_TRADE_LOCATION,
	UPDATE_TRADE_LOCATION,
	DELETE_TRADE_LOCATION
} from "../../../gql/tradeLocation";
import { BULK_UPDATE_TRADE_LOCATION } from "../../../gql/mutations/mutations";
import {
	GET_TRADERS_BY_TRADE_LOCATION,
	GET_TRADERS_LIST
} from "../../../gql/queries/queries";
import context from "../../../context/context";
import { LOADING } from "../../../reducer/reducer-types";
import {
	Button,
	Form,
	Input,
	Modal,
	Switch,
	Table,
	Dropdown,
	Space,
	Tag,
	Popconfirm,
	Tooltip,
	Upload,
	Select,
	Divider,
	Row,
	Col,
	Statistic,
	Alert
} from "antd";
import {
	MoreOutlined,
	EyeOutlined,
	EditOutlined,
	DeleteOutlined,
	PlusOutlined,
	DownloadOutlined,
	UploadOutlined,
	UserAddOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	TeamOutlined
} from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";

const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 7 }
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 15 }
	}
};

export const TradeLocationManagement = () => {
	const { dispatch } = useContext(context);

	const [locations, setLocations] = useState([]);
	const [selectedLocation, setSelectedLocation] = useState(null);
	const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
	const [searchText, setSearchText] = useState("");

	const [createModalVisible, setCreateModalVisible] = useState(false);
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [viewModalVisible, setViewModalVisible] = useState(false);

	const [createForm] = Form.useForm();
	const [editForm] = Form.useForm();

	const [addTradersVisible, setAddTradersVisible] = useState(false);
	const [addTradersTarget, setAddTradersTarget] = useState(null); // the location row
	const [atFileName, setAtFileName] = useState(null);
	const [atHeaders, setAtHeaders] = useState([]);
	const [atParsedData, setAtParsedData] = useState([]);
	const [atIdentifierCol, setAtIdentifierCol] = useState(null);
	const [atIdentifierType, setAtIdentifierType] = useState("ctsh_id");
	const [atPreview, setAtPreview] = useState([]);
	const [atResult, setAtResult] = useState(null);

	// ── View Traders state ──────────────────────────────────────────────────
	const [tradersModalVisible, setTradersModalVisible] = useState(false);
	const [tradersLocation, setTradersLocation] = useState(null);
	const [tradersPage, setTradersPage] = useState(1);
	const [exportingTraders, setExportingTraders] = useState(false);
	const TRADERS_PAGE_SIZE = 20;

	const [fetchTraders, { data: tradersData, loading: tradersLoading }] =
		useLazyQuery(GET_TRADERS_BY_TRADE_LOCATION, {
			fetchPolicy: "cache-and-network"
		});

	const [fetchAllTradersForExport] = useLazyQuery(
		GET_TRADERS_BY_TRADE_LOCATION,
		{
			fetchPolicy: "network-only"
		}
	);

	const [bulkUpdateTradeLocation, { loading: bulkLoading }] = useMutation(
		BULK_UPDATE_TRADE_LOCATION
	);

	const [createTradeLocation] = useMutation(CREATE_TRADE_LOCATION);
	const [updateTradeLocation] = useMutation(UPDATE_TRADE_LOCATION);
	const [deleteTradeLocation] = useMutation(DELETE_TRADE_LOCATION);

	const { loading, data, refetch } = useQuery(GET_TRADE_LOCATIONS, {
		fetchPolicy: "cache-and-network"
	});

	useEffect(() => {
		if (data?.tradeLocations) {
			setLocations(data.tradeLocations);
		}
	}, [data]);

	// ─── Helpers ──────────────────────────────────────────────────────────────

	const updateTableData = (location, action) => {
		if (action === "delete") {
			setLocations((prev) => prev.filter((l) => l.uuid !== location.uuid));
		} else if (action === "update") {
			setLocations((prev) =>
				prev.map((l) => (l.uuid === location.uuid ? location : l))
			);
		}
	};

	const filteredLocations = locations.filter((l) =>
		l.name.toLowerCase().includes(searchText.toLowerCase())
	);

	// ─── Create ───────────────────────────────────────────────────────────────

	const openCreateModal = () => {
		createForm.resetFields();
		setCreateModalVisible(true);
	};

	const closeCreateModal = () => {
		setCreateModalVisible(false);
		createForm.resetFields();
	};

	const handleCreate = async (values) => {
		dispatch({ type: LOADING, payload: true });
		try {
			const result = await createTradeLocation({
				variables: {
					name: values.name.trim().toUpperCase(),
					description: values.description?.trim() || null,
					is_active: values.is_active ?? true
				}
			});
			if (result.data?.createTradeLocation) {
				setLocations((prev) => [result.data.createTradeLocation, ...prev]);
				toast.success("Trade location created successfully!");
				closeCreateModal();
			}
		} catch (error) {
			toast.error(error.message || "Failed to create trade location.");
		}
		dispatch({ type: LOADING, payload: false });
	};

	// ─── Edit ─────────────────────────────────────────────────────────────────

	const openEditModal = (location) => {
		setSelectedLocation(location);
		editForm.setFieldsValue({
			name: location.name,
			description: location.description || "",
			is_active: location.is_active
		});
		setEditModalVisible(true);
	};

	const closeEditModal = () => {
		setEditModalVisible(false);
		setSelectedLocation(null);
		editForm.resetFields();
	};

	const handleUpdate = async (values) => {
		if (!selectedLocation) return;
		dispatch({ type: LOADING, payload: true });
		try {
			const result = await updateTradeLocation({
				variables: {
					uuid: selectedLocation.uuid,
					name: values.name.trim().toUpperCase(),
					description: values.description?.trim() || null,
					is_active: values.is_active
				}
			});
			if (result.data?.updateTradeLocation) {
				updateTableData(result.data.updateTradeLocation, "update");
				toast.success("Trade location updated successfully!");
				closeEditModal();
			}
		} catch (error) {
			toast.error(error.message || "Failed to update trade location.");
		}
		dispatch({ type: LOADING, payload: false });
	};

	// ─── Delete ───────────────────────────────────────────────────────────────

	const handleDelete = async (location) => {
		if (location.countTraders > 0) {
			toast.warning(
				`Cannot delete "${location.name}" — it has ${location.countTraders} trader(s) assigned.`
			);
			return;
		}
		dispatch({ type: LOADING, payload: true });
		try {
			const result = await deleteTradeLocation({
				variables: { uuid: location.uuid }
			});
			if (result.data?.deleteTradeLocation) {
				updateTableData(location, "delete");
				toast.success("Trade location deleted successfully!");
			}
		} catch (error) {
			toast.error(error.message || "Failed to delete trade location.");
		}
		dispatch({ type: LOADING, payload: false });
	};

	// ─── View ─────────────────────────────────────────────────────────────────

	const openViewModal = (location) => {
		setSelectedLocation(location);
		setViewModalVisible(true);
	};

	const closeViewModal = () => {
		setViewModalVisible(false);
		setSelectedLocation(null);
	};

	// ─── View Traders handlers ────────────────────────────────────────────────

	const openTradersModal = (location) => {
		setTradersLocation(location);
		setTradersPage(1);
		fetchTraders({
			variables: {
				trade_location: location.name,
				first: TRADERS_PAGE_SIZE,
				page: 1
			}
		});
		setTradersModalVisible(true);
	};

	const closeTradersModal = () => {
		setTradersModalVisible(false);
		setTradersLocation(null);
		setTradersPage(1);
	};

	const handleTradersPageChange = (page) => {
		setTradersPage(page);
		fetchTraders({
			variables: {
				trade_location: tradersLocation.name,
				first: TRADERS_PAGE_SIZE,
				page
			}
		});
	};

	const handleExportTradersToExcel = async () => {
		if (!tradersLocation) return;
		setExportingTraders(true);
		try {
			const total = tradersLocation.countTraders || 0;
			const result = await fetchAllTradersForExport({
				variables: {
					trade_location: tradersLocation.name,
					first: total > 0 ? total : 10000,
					page: 1
				}
			});
			const allTraders = result?.data?.traderList?.data ?? [];
			if (!allTraders.length) return toast.warning("No traders to export.");
			const exportData = allTraders.map((trader, index) => ({
				"S/N": index + 1,
				"CTSH ID": trader.ctsh_id || "",
				Surname: trader.surname || "",
				"Other Names": trader.other_names || "",
				Phone: trader.phone || "",
				Gender: trader.gender || "",
				"Business Location": trader.business_location || "",
				Trade: trader.trade?.name || ""
			}));
			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Traders");
			const date = new Date().toISOString().split("T")[0];
			const locName = tradersLocation.name.replace(/\s+/g, "_");
			XLSX.writeFile(workbook, `Traders_${locName}_${date}.xlsx`);
			toast.success(`Exported ${allTraders.length} traders successfully!`);
		} catch (err) {
			toast.error(err.message || "Export failed.");
		} finally {
			setExportingTraders(false);
		}
	};

	// ─── Export ───────────────────────────────────────────────────────────────

	const openAddTradersModal = (location) => {
		setAddTradersTarget(location);
		setAtFileName(null);
		setAtHeaders([]);
		setAtParsedData([]);
		setAtIdentifierCol(null);
		setAtIdentifierType("ctsh_id");
		setAtPreview([]);
		setAtResult(null);
		setAddTradersVisible(true);
	};

	const closeAddTradersModal = () => {
		setAddTradersVisible(false);
		setAddTradersTarget(null);
		setAtResult(null);
	};

	const handleAtFile = (file) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target.result);
				const workbook = XLSX.read(data, { type: "array" });
				const sheet = workbook.Sheets[workbook.SheetNames[0]];
				const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
				if (rows.length < 2) {
					tost.error("File appears empty or has no data rows.");
					return;
				}
				const hdrs = (rows[0] || []).map((h) => String(h ?? "").trim());
				const dataRows = rows
					.slice(1)
					.filter((row) =>
						row.some(
							(cell) => cell !== null && cell !== undefined && cell !== ""
						)
					);
				setAtHeaders(hdrs);
				setAtParsedData(dataRows);
				setAtFileName(file.name);
				setAtResult(null);
				// Auto-detect identifier column
				const idxCtshId = hdrs.findIndex((h) => /ctsh.?id/i.test(h));
				const idxPhone = hdrs.findIndex((h) => /phone|mobile/i.test(h));
				if (idxCtshId >= 0) {
					setAtIdentifierCol(idxCtshId);
					setAtIdentifierType("ctsh_id");
				} else if (idxPhone >= 0) {
					setAtIdentifierCol(idxPhone);
					setAtIdentifierType("phone");
				} else {
					setAtIdentifierCol(null);
				}
			} catch {
				tost.error("Failed to parse file.");
			}
		};
		reader.readAsArrayBuffer(file);
		return false;
	};

	useEffect(() => {
		if (atIdentifierCol === null) {
			setAtPreview([]);
			return;
		}
		const rows = atParsedData.slice(0, 10).map((row, i) => ({
			key: i,
			identifier: String(row[atIdentifierCol] ?? "").trim()
		}));
		setAtPreview(rows);
	}, [atIdentifierCol, atParsedData]);

	const atValidCount =
		atIdentifierCol !== null
			? atParsedData.filter(
					(row) => String(row[atIdentifierCol] ?? "").trim() !== ""
				).length
			: 0;

	const handleAtSubmit = async () => {
		if (atIdentifierCol === null || !addTradersTarget) return;
		const updates = atParsedData
			.map((row) => ({
				identifier: String(row[atIdentifierCol] ?? "").trim(),
				trade_location: addTradersTarget.name
			}))
			.filter((u) => u.identifier !== "");
		if (!updates.length) {
			tost.error("No valid rows found.");
			return;
		}
		try {
			const { data } = await bulkUpdateTradeLocation({
				variables: { updates, identifier_type: atIdentifierType }
			});
			setAtResult(data.bulkUpdateTradeLocation);
			// Refetch to update countTraders
			refetch();
		} catch (err) {
			tost.error(err.message || "Failed to assign traders.");
		}
	};

	const handleExportToExcel = () => {
		const exportData = filteredLocations.map((l, idx) => ({
			"S/N": idx + 1,
			"Location Name": l.name,
			Description: l.description || "",
			"Total Traders": l.countTraders ?? 0,
			Status: l.is_active ? "Active" : "Inactive",
			"Created At": new Date(l.created_at).toLocaleDateString()
		}));
		const worksheet = XLSX.utils.json_to_sheet(exportData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "TradeLocations");
		const date = new Date().toISOString().split("T")[0];
		XLSX.writeFile(workbook, `TradeLocations_${date}.xlsx`);
		toast.success("Excel file exported successfully!");
	};

	// ─── Table columns ────────────────────────────────────────────────────────

	const columns = [
		{
			title: "S/N",
			render: (_, __, index) =>
				(pagination.current - 1) * pagination.pageSize + index + 1,
			width: 60
		},
		{
			title: "Location Name",
			dataIndex: "name",
			key: "name",
			render: (name) => <span className="font-semibold">{name}</span>
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			render: (desc) =>
				desc ? (
					<span className="text-gray-600">{desc}</span>
				) : (
					<span className="text-gray-400">—</span>
				)
		},
		{
			title: "Traders",
			dataIndex: "countTraders",
			key: "countTraders",
			render: (count) => (
				<Tag color={count > 0 ? "blue" : "default"}>{count ?? 0}</Tag>
			),
			width: 90
		},
		{
			title: "Status",
			dataIndex: "is_active",
			key: "is_active",
			render: (active) => (
				<Tag color={active ? "green" : "red"}>
					{active ? "Active" : "Inactive"}
				</Tag>
			),
			width: 100
		},
		{
			title: "Actions",
			key: "actions",
			width: 90,
			render: (_, record) => {
				const items = [
					{
						key: "view_traders",
						label: (
							<span>
								<TeamOutlined className="mr-1" /> View Traders (
								{record.countTraders ?? 0})
							</span>
						)
					},
					{
						key: "view",
						label: (
							<span>
								<EyeOutlined className="mr-1" /> View
							</span>
						)
					},
					{
						key: "edit",
						label: (
							<span>
								<EditOutlined className="mr-1" /> Edit
							</span>
						)
					},
					{
						key: "add_traders",
						label: (
							<span>
								<UserAddOutlined className="mr-1" /> Add Traders to Location
							</span>
						)
					},
					{
						key: "delete",
						label: (
							<Popconfirm
								title="Delete trade location"
								description={
									record.countTraders > 0
										? `This location has ${record.countTraders} trader(s). Cannot delete.`
										: "Are you sure you want to delete this location?"
								}
								onConfirm={() => {
									if (record.countTraders > 0) {
										toast.warning(
											`Cannot delete "${record.name}" — ${record.countTraders} trader(s) assigned.`
										);
									} else {
										handleDelete(record);
									}
								}}
								okText="Delete"
								cancelText="Cancel"
								okButtonProps={{
									danger: true,
									disabled: record.countTraders > 0
								}}>
								<span
									className={
										record.countTraders > 0
											? "text-gray-400 cursor-not-allowed"
											: "text-red-500"
									}>
									<DeleteOutlined className="mr-1" /> Delete
								</span>
							</Popconfirm>
						)
					}
				];

				const handleMenuClick = ({ key }) => {
					if (key === "view_traders") openTradersModal(record);
					if (key === "view") openViewModal(record);
					if (key === "edit") openEditModal(record);
					if (key === "add_traders") openAddTradersModal(record);
					// delete is handled by Popconfirm directly
				};

				return (
					<Dropdown
						menu={{ items, onClick: handleMenuClick }}
						trigger={["click"]}>
						<Button
							size="small"
							icon={<MoreOutlined />}
							onClick={(e) => e.stopPropagation()}
						/>
					</Dropdown>
				);
			}
		}
	];

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<>
			<ToastContainer position="top-right" autoClose={4000} />

			<div className="flex flex-wrap">
				<div className="w-full md:w-12/12 px-4 min-h-screen">
					<CardSession
						title="Trade Location Management"
						addNew={openCreateModal}
						textBtn="+ Add Location">
						<div className="block overflow-x-auto w-full mt-6">
							<div className="mb-4 flex flex-wrap items-center gap-2">
								<Input.Search
									placeholder="Search locations..."
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									allowClear
									style={{ width: 220 }}
								/>
								<Button
									icon={<DownloadOutlined />}
									onClick={handleExportToExcel}
									disabled={filteredLocations.length === 0}>
									Export Excel
								</Button>
							</div>

							<Table
								columns={columns}
								dataSource={filteredLocations}
								loading={loading}
								rowKey="uuid"
								pagination={{
									...pagination,
									total: filteredLocations.length,
									showSizeChanger: true,
									showTotal: (total) => `${total} location(s)`
								}}
								onChange={(p) =>
									setPagination({ current: p.current, pageSize: p.pageSize })
								}
								onRow={(record) => ({
									onClick: () => openTradersModal(record),
									style: { cursor: "pointer" }
								})}
								size="small"
							/>
						</div>
					</CardSession>
				</div>
			</div>

			{/* ── Traders Modal ───────────────────────────────────────────────── */}
			<Modal
				title={
					<span>
						<TeamOutlined className="mr-2 text-blue-600" />
						Traders &mdash; {tradersLocation?.name}{" "}
						<span className="text-gray-500 text-sm font-normal">
							({tradersLocation?.countTraders || 0} total)
						</span>
					</span>
				}
				open={tradersModalVisible}
				onCancel={closeTradersModal}
				width={1000}
				footer={[
					<Button
						key="export"
						type="default"
						icon={<DownloadOutlined />}
						disabled={!tradersLocation?.countTraders}
						loading={exportingTraders}
						onClick={handleExportTradersToExcel}>
						Export to Excel
					</Button>,
					<Button key="close" onClick={closeTradersModal}>
						Close
					</Button>
				]}
				maskClosable={false}
				destroyOnHidden={true}>
				<Table
					loading={tradersLoading}
					dataSource={tradersData?.traderList?.data ?? []}
					rowKey="uuid"
					size="small"
					pagination={{
						current: tradersPage,
						pageSize: TRADERS_PAGE_SIZE,
						total: tradersData?.traderList?.paginatorInfo?.total ?? 0,
						showSizeChanger: false,
						showTotal: (total) => `Total ${total} traders`,
						onChange: handleTradersPageChange
					}}
					columns={[
						{
							title: "S/N",
							render: (_, __, index) =>
								(tradersPage - 1) * TRADERS_PAGE_SIZE + index + 1,
							width: 60
						},
						{
							title: "CTSH ID",
							dataIndex: "ctsh_id",
							key: "ctsh_id"
						},
						{
							title: "Surname",
							dataIndex: "surname",
							key: "surname"
						},
						{
							title: "Other Names",
							dataIndex: "other_names",
							key: "other_names"
						},
						{
							title: "Phone",
							dataIndex: "phone",
							key: "phone"
						},
						{
							title: "Gender",
							dataIndex: "gender",
							key: "gender",
							width: 90
						},
						{
							title: "Business Location",
							dataIndex: "business_location",
							key: "business_location"
						},
						{
							title: "Trade",
							key: "trade",
							render: (_, r) => r.trade?.name || ""
						}
					]}
				/>
			</Modal>

			{/* ── Create Modal ─────────────────────────────────────────────────── */}
			<Modal
				title="Add Trade Location"
				open={createModalVisible}
				onCancel={closeCreateModal}
				footer={null}
				destroyOnClose>
				<Form
					{...formItemLayout}
					form={createForm}
					onFinish={handleCreate}
					initialValues={{ is_active: true }}>
					<Form.Item
						name="name"
						label="Location Name"
						rules={[
							{ required: true, message: "Please enter a location name" }
						]}>
						<Input placeholder="e.g. TARAUNI MARKET" />
					</Form.Item>

					<Form.Item name="description" label="Description">
						<Input.TextArea
							rows={3}
							placeholder="Optional description..."
							showCount
							maxLength={500}
						/>
					</Form.Item>

					<Form.Item name="is_active" label="Active" valuePropName="checked">
						<Switch checkedChildren="Yes" unCheckedChildren="No" />
					</Form.Item>

					<Form.Item wrapperCol={{ offset: 7 }}>
						<Space>
							<Button type="primary" htmlType="submit">
								Create
							</Button>
							<Button onClick={closeCreateModal}>Cancel</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>

			{/* ── Edit Modal ───────────────────────────────────────────────────── */}
			<Modal
				title={`Edit: ${selectedLocation?.name || ""}`}
				open={editModalVisible}
				onCancel={closeEditModal}
				footer={null}
				destroyOnClose>
				<Form {...formItemLayout} form={editForm} onFinish={handleUpdate}>
					<Form.Item
						name="name"
						label="Location Name"
						rules={[
							{ required: true, message: "Please enter a location name" }
						]}>
						<Input placeholder="e.g. TARAUNI MARKET" />
					</Form.Item>

					<Form.Item name="description" label="Description">
						<Input.TextArea
							rows={3}
							placeholder="Optional description..."
							showCount
							maxLength={500}
						/>
					</Form.Item>

					<Form.Item name="is_active" label="Active" valuePropName="checked">
						<Switch checkedChildren="Yes" unCheckedChildren="No" />
					</Form.Item>

					<Form.Item wrapperCol={{ offset: 7 }}>
						<Space>
							<Button type="primary" htmlType="submit">
								Save Changes
							</Button>
							<Button onClick={closeEditModal}>Cancel</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>

			{/* ── View Modal ───────────────────────────────────────────────────── */}
			<Modal
				title="Trade Location Details"
				open={viewModalVisible}
				onCancel={closeViewModal}
				footer={[
					<Button key="close" onClick={closeViewModal}>
						Close
					</Button>
				]}
				destroyOnClose>
				{selectedLocation && (
					<div className="space-y-3 py-2">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<p className="text-xs text-gray-500 uppercase font-semibold mb-1">
									Location Name
								</p>
								<p className="font-semibold text-base">
									{selectedLocation.name}
								</p>
							</div>
							<div>
								<p className="text-xs text-gray-500 uppercase font-semibold mb-1">
									Status
								</p>
								<Tag color={selectedLocation.is_active ? "green" : "red"}>
									{selectedLocation.is_active ? "Active" : "Inactive"}
								</Tag>
							</div>
							<div>
								<p className="text-xs text-gray-500 uppercase font-semibold mb-1">
									Total Traders
								</p>
								<Tag color="blue">{selectedLocation.countTraders ?? 0}</Tag>
							</div>
							<div>
								<p className="text-xs text-gray-500 uppercase font-semibold mb-1">
									Created At
								</p>
								<p className="text-sm">
									{selectedLocation.created_at
										? new Date(selectedLocation.created_at).toLocaleDateString(
												"en-GB",
												{ day: "2-digit", month: "short", year: "numeric" }
											)
										: "—"}
								</p>
							</div>
						</div>

						{selectedLocation.description && (
							<div className="mt-3">
								<p className="text-xs text-gray-500 uppercase font-semibold mb-1">
									Description
								</p>
								<p className="text-sm bg-gray-50 p-3 rounded border">
									{selectedLocation.description}
								</p>
							</div>
						)}
					</div>
				)}
			</Modal>

			{/* ── Add Traders to Location Modal ────────────────────────────────── */}
			<Modal
				title={
					<span>
						<UserAddOutlined className="mr-2" />
						Add Traders to &quot;{addTradersTarget?.name}&quot;
					</span>
				}
				open={addTradersVisible}
				onCancel={closeAddTradersModal}
				footer={null}
				width={700}
				destroyOnClose>
				{/* Step 1 – Upload file */}
				{!atResult && (
					<>
						<p className="text-sm text-gray-600 mb-3">
							Upload an Excel file (.xlsx / .xls / .csv) containing the CTSH IDs
							or phone numbers of traders you want to assign to{" "}
							<strong>{addTradersTarget?.name}</strong>.
						</p>

						<Upload.Dragger
							accept=".xlsx,.xls,.csv"
							beforeUpload={handleAtFile}
							showUploadList={atFileName ? [{ name: atFileName }] : false}
							maxCount={1}>
							<p className="ant-upload-drag-icon">
								<UploadOutlined style={{ fontSize: 32, color: "#1677ff" }} />
							</p>
							<p className="ant-upload-text">
								Click or drag an Excel / CSV file here
							</p>
							<p className="ant-upload-hint">
								Supports .xlsx, .xls, .csv — first row must be headers
							</p>
						</Upload.Dragger>

						{atFileName && (
							<p className="mt-2 text-xs text-green-600">
								<CheckCircleOutlined className="mr-1" />
								{atFileName} loaded — {atParsedData.length} data row(s)
							</p>
						)}

						{atHeaders.length > 0 && (
							<>
								<Divider orientation="left" plain className="mt-4 mb-3">
									Column Mapping
								</Divider>

								<Row gutter={12} className="mb-3">
									<Col span={12}>
										<label className="block text-xs font-semibold text-gray-600 mb-1">
											Identifier Column
										</label>
										<Select
											value={atIdentifierCol}
											onChange={setAtIdentifierCol}
											placeholder="Select column"
											style={{ width: "100%" }}>
											{atHeaders.map((h, i) => (
												<Select.Option key={i} value={i}>
													{h || `Column ${i + 1}`}
												</Select.Option>
											))}
										</Select>
									</Col>
									<Col span={12}>
										<label className="block text-xs font-semibold text-gray-600 mb-1">
											Identifier Type
										</label>
										<Select
											value={atIdentifierType}
											onChange={setAtIdentifierType}
											style={{ width: "100%" }}>
											<Select.Option value="ctsh_id">CTSH ID</Select.Option>
											<Select.Option value="phone">Phone Number</Select.Option>
										</Select>
									</Col>
								</Row>

								{atPreview.length > 0 && (
									<>
										<Divider orientation="left" plain className="mt-4 mb-2">
											Preview (first 10 rows)
										</Divider>
										<Table
											size="small"
											pagination={false}
											dataSource={atPreview}
											columns={[
												{
													title: "Identifier",
													dataIndex: "identifier",
													render: (v) =>
														v ? (
															<code>{v}</code>
														) : (
															<span className="text-red-400">empty</span>
														)
												},
												{
													title: "Will assign to",
													render: () => (
														<Tag color="cyan">{addTradersTarget?.name}</Tag>
													)
												}
											]}
										/>
										<p className="mt-2 text-xs text-gray-500">
											{atValidCount} valid row(s) out of {atParsedData.length}{" "}
											total will be processed.
										</p>
									</>
								)}

								<div className="mt-4 flex justify-end gap-2">
									<Button onClick={closeAddTradersModal}>Cancel</Button>
									<Button
										type="primary"
										icon={<UserAddOutlined />}
										loading={bulkLoading}
										disabled={atValidCount === 0 || atIdentifierCol === null}
										onClick={handleAtSubmit}>
										Assign {atValidCount} Trader{atValidCount !== 1 ? "s" : ""}
									</Button>
								</div>
							</>
						)}
					</>
				)}

				{/* Step 2 – Result */}
				{atResult && (
					<>
						<Alert
							type={atResult.success ? "success" : "warning"}
							message={atResult.message}
							showIcon
							className="mb-4"
						/>

						<Row gutter={16} className="mb-4">
							<Col span={8}>
								<Statistic
									title="Processed"
									value={atResult.total_processed ?? 0}
								/>
							</Col>
							<Col span={8}>
								<Statistic
									title={
										<span className="text-green-600">
											<CheckCircleOutlined className="mr-1" />
											Assigned
										</span>
									}
									value={atResult.success_count ?? 0}
									valueStyle={{ color: "#3f8600" }}
								/>
							</Col>
							<Col span={8}>
								<Statistic
									title={
										<span className="text-red-500">
											<CloseCircleOutlined className="mr-1" />
											Not Found / Failed
										</span>
									}
									value={
										(atResult.not_found_count ?? 0) +
										(atResult.failed_count ?? 0)
									}
									valueStyle={{ color: "#cf1322" }}
								/>
							</Col>
						</Row>

						{atResult.errors && atResult.errors.length > 0 && (
							<>
								<Divider orientation="left" plain>
									Errors
								</Divider>
								<ul className="text-sm text-red-600 list-disc pl-5 max-h-40 overflow-y-auto">
									{atResult.errors.map((e, i) => (
										<li key={i}>{e}</li>
									))}
								</ul>
							</>
						)}

						<div className="mt-4 flex justify-end gap-2">
							<Button onClick={closeAddTradersModal}>Close</Button>
						</div>
					</>
				)}
			</Modal>
		</>
	);
};

export default TradeLocationManagement;
