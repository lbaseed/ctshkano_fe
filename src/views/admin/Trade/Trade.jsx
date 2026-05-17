import React, { useContext, useEffect, useState } from "react";
import CardSession from "../../../components/Cards/Card";
import CardProfile from "../../../components/Cards/CardProfileTabs";
import { useCookies } from "react-cookie";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_TRADES, GET_TRADERS_LIST } from "../../../gql/queries/queries";
import CustomModal from "../../../components/Modals/CustomModal";
import Loading from "../../../components/Loading/Loading";
import {
	CREATE_TRADE,
	UPDATE_TRADE,
	DELETE_TRADE,
	MERGE_TRADES
} from "../../../gql/mutations/mutations";
import context from "../../../context/context";
import { LOADING } from "../../../reducer/reducer-types";
import {
	Button,
	Form,
	Input,
	Modal,
	Select,
	Table,
	Dropdown,
	Space,
	Popconfirm
} from "antd";
import {
	MoreOutlined,
	EyeOutlined,
	EditOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined,
	DownloadOutlined,
	MergeCellsOutlined,
	TeamOutlined,
	SearchOutlined
} from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";

const className =
	"px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left ";

const formItemLayout = {
	labelCol: {
		xs: {
			span: 24
		},
		sm: {
			span: 6
		}
	},
	wrapperCol: {
		xs: {
			span: 24
		},
		sm: {
			span: 14
		}
	}
};

export const Trade = () => {
	const { state, dispatch } = useContext(context);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [showModal, setShowModal] = useState(false);
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [viewModalVisible, setViewModalVisible] = useState(false);
	const [selectedTrade, setSelectedTrade] = useState(null);
	const [trade, setTrade] = useState("");
	const [trades, setTrades] = useState([]);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10
	});
	const [form] = Form.useForm();
	const [editForm] = Form.useForm();

	const [mergeModalVisible, setMergeModalVisible] = useState(false);
	const [mergeTargetUuid, setMergeTargetUuid] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [mergeForm] = Form.useForm();

	const [tradersModalVisible, setTradersModalVisible] = useState(false);
	const [tradersPage, setTradersPage] = useState(1);
	const [exportingTraders, setExportingTraders] = useState(false);
	const TRADERS_PAGE_SIZE = 20;

	const [fetchTraders, { data: tradersData, loading: tradersLoading }] =
		useLazyQuery(GET_TRADERS_LIST, { fetchPolicy: "cache-and-network" });

	const [fetchAllTradersForExport] = useLazyQuery(GET_TRADERS_LIST, {
		fetchPolicy: "network-only"
	});

	const [createTrade, { createloading, createError }] =
		useMutation(CREATE_TRADE);
	const [updateTrade, { updateLoading }] = useMutation(UPDATE_TRADE);
	const [deleteTrade, { deleteLoading }] = useMutation(DELETE_TRADE);
	const [mergeTrades, { loading: mergeLoading }] = useMutation(MERGE_TRADES);

	const openModal = () => {
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		form.resetFields();
	};

	const openEditModal = (trade) => {
		setSelectedTrade(trade);
		editForm.setFieldsValue({
			name: trade.name,
			business_nature: trade.business_nature,
			category: trade.category,
			description: trade.description
		});
		setEditModalVisible(true);
	};

	const closeEditModal = () => {
		setEditModalVisible(false);
		setSelectedTrade(null);
		editForm.resetFields();
	};

	const openTradersModal = (trade) => {
		setSelectedTrade(trade);
		setTradersPage(1);
		fetchTraders({
			variables: {
				trade_id: trade.id,
				first: TRADERS_PAGE_SIZE,
				page: 1,
				orderBy: "SURNAME",
				direction: "ASC"
			}
		});
		setTradersModalVisible(true);
	};

	const closeTradersModal = () => {
		setTradersModalVisible(false);
		setSelectedTrade(null);
		setTradersPage(1);
	};

	const handleTradersPageChange = (page) => {
		setTradersPage(page);
		fetchTraders({
			variables: {
				trade_id: selectedTrade.id,
				first: TRADERS_PAGE_SIZE,
				page,
				orderBy: "SURNAME",
				direction: "ASC"
			}
		});
	};

	const openMergeModal = (trade) => {
		setSelectedTrade(trade);
		setMergeTargetUuid(null);
		mergeForm.resetFields();
		setMergeModalVisible(true);
	};

	const closeMergeModal = () => {
		setMergeModalVisible(false);
		setSelectedTrade(null);
		setMergeTargetUuid(null);
		mergeForm.resetFields();
	};

	const handleMergeTrades = async () => {
		if (!mergeTargetUuid) {
			return toast.error("Please select a target trade to merge into.");
		}
		dispatch({ type: LOADING, payload: true });
		try {
			const result = await mergeTrades({
				variables: {
					source_uuid: selectedTrade.uuid,
					target_uuid: mergeTargetUuid
				}
			});
			if (result.data?.mergeTrades) {
				const updatedTarget = result.data.mergeTrades;
				setTrades((prev) =>
					prev
						.filter((t) => t.uuid !== selectedTrade.uuid)
						.map((t) => (t.uuid === updatedTarget.uuid ? updatedTarget : t))
				);
				toast.success(
					`Merged "${selectedTrade.name}" into "${updatedTarget.name}" successfully!`
				);
				closeMergeModal();
			}
		} catch (error) {
			toast.error(error.message || "Failed to merge trades.");
		}
		dispatch({ type: LOADING, payload: false });
	};

	const openViewModal = (trade) => {
		setSelectedTrade(trade);
		setViewModalVisible(true);
	};

	const closeViewModal = () => {
		setViewModalVisible(false);
		setSelectedTrade(null);
	};

	const { loading, error, data } = useQuery(GET_TRADES, {
		fetchPolicy: "cache-and-network"
	});

	useEffect(() => {
		if (data) {
			setTrades(data?.trades);
		}
	}, [loading]);

	const handleCreateTrade = async (value) => {
		if (!value) return toast.error("Please fill in all required fields!");

		const variables = {
			name: value.name.trim().toUpperCase(),
			businessNature: value.business_nature,
			category: value.category,
			description: value.description || null
		};
		dispatch({ type: LOADING, payload: true });

		try {
			const result = await createTrade({ variables });

			if (result.data) {
				setTrades([result.data.createTrade, ...trades]);
				toast.success("Trade created successfully!");
				closeModal();
			}
		} catch (error) {
			toast.error(error.message || "Failed to create trade");
		}
		dispatch({ type: LOADING, payload: false });
	};

	const handleUpdateTrade = async (value) => {
		if (!value || !selectedTrade)
			return toast.error("Please fill in all required fields!");

		const variables = {
			uuid: selectedTrade.uuid,
			name: value.name.trim().toUpperCase(),
			businessNature: value.business_nature,
			category: value.category,
			description: value.description || null
		};
		dispatch({ type: LOADING, payload: true });

		try {
			const result = await updateTrade({ variables });

			if (result.data) {
				updateTableData(result.data.updateTrade, "update");
				toast.success("Trade updated successfully!");
				closeEditModal();
			}
		} catch (error) {
			toast.error(error.message || "Failed to update trade");
		}
		dispatch({ type: LOADING, payload: false });
	};

	const handleDeleteTrade = async (trade) => {
		// Check if trade has traders before deleting
		if (trade.countTraders > 0) {
			toast.error(
				"Cannot delete trade with existing traders. Please remove all traders first."
			);
			return;
		}

		dispatch({ type: LOADING, payload: true });

		try {
			const result = await deleteTrade({
				variables: { uuid: trade.uuid }
			});

			if (result.data) {
				updateTableData(trade, "delete");
				toast.success("Trade deleted successfully!");
			}
		} catch (error) {
			toast.error(error.message || "Failed to delete trade");
		}
		dispatch({ type: LOADING, payload: false });
	};

	const updateTableData = (trade, action) => {
		if (action === "delete") {
			setTrades((trades) =>
				trades.filter((item) => {
					return item.uuid !== trade.uuid;
				})
			);
		}

		if (action === "update") {
			const newState = trades.map((item) => {
				if (item.uuid === trade.uuid) {
					return trade;
				}

				return item;
			});

			setTrades(newState);
		}
	};

	const handleExportTradersToExcel = async () => {
		if (!selectedTrade) return;
		setExportingTraders(true);
		try {
			const total = selectedTrade.countTraders || 0;
			const result = await fetchAllTradersForExport({
				variables: {
					trade_id: selectedTrade.id,
					first: total > 0 ? total : 10000,
					page: 1,
					orderBy: "SURNAME",
					direction: "ASC"
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
				"Trade Location": trader.trade_location || ""
			}));
			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Traders");
			const date = new Date().toISOString().split("T")[0];
			const tradeName = selectedTrade?.name?.replace(/\s+/g, "_") ?? "Trade";
			XLSX.writeFile(workbook, `Traders_${tradeName}_${date}.xlsx`);
			toast.success(`Exported ${allTraders.length} traders successfully!`);
		} catch (err) {
			toast.error(err.message || "Export failed.");
		} finally {
			setExportingTraders(false);
		}
	};

	const handleExportToExcel = () => {
		const exportData = trades.map((trade, index) => ({
			"S/N": index + 1,
			"Trade Title": trade.name,
			"Total Traders": trade.countTraders || 0,
			"Business Nature": trade.business_nature,
			"Business Category": trade.category || "N/A",
			Description: trade.description || "",
			"Created At": new Date(trade.created_at).toLocaleDateString(),
			"Last Updated": new Date(trade.updated_at).toLocaleDateString()
		}));

		const worksheet = XLSX.utils.json_to_sheet(exportData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Trades");

		// Generate filename with current date
		const date = new Date().toISOString().split("T")[0];
		const filename = `Trades_Export_${date}.xlsx`;

		XLSX.writeFile(workbook, filename);
		toast.success("Excel file exported successfully!");
	};

	const handleTableChange = (newPagination) => {
		setPagination({
			current: newPagination.current,
			pageSize: newPagination.pageSize
		});
	};

	const filteredTrades = searchTerm.trim()
		? trades.filter((t) => {
				const term = searchTerm.trim().toLowerCase();
				return (
					(t.name || "").toLowerCase().includes(term) ||
					(t.business_nature || "").toLowerCase().includes(term) ||
					(t.category || "").toLowerCase().includes(term)
				);
			})
		: trades;

	const columns = [
		{
			title: "S/N",
			dataIndex: "key",
			render: (_, __, index) => {
				return (pagination.current - 1) * pagination.pageSize + index + 1;
			}
		},
		{
			title: "Trade Title",
			dataIndex: "name",
			key: "name"
		},
		{
			title: "Total Traders",
			dataIndex: "countTraders",
			key: "countTraders"
		},
		{
			title: "Business Nature",
			dataIndex: "business_nature",
			key: "business_nature"
		},
		{
			title: "Actions",
			dataIndex: "",
			key: "actions",
			render: (_, record) => {
				const handleMenuClick = ({ key }) => {
					switch (key) {
						case "traders":
							openTradersModal(record);
							break;
						case "merge":
							openMergeModal(record);
							break;
						case "view":
							openViewModal(record);
							break;
						case "edit":
							openEditModal(record);
							break;
						case "delete":
							if (record.countTraders > 0) {
								toast.warning("Cannot delete trade with existing traders");
							} else {
								// Show confirmation modal for delete
								Modal.confirm({
									title: "Delete Trade",
									content: (
										<div>
											<p>
												Are you sure you want to delete{" "}
												<strong>{record.name}</strong>?
											</p>
											<p>This action cannot be undone.</p>
											{record.countTraders > 0 && (
												<p style={{ color: "red" }}>
													This trade has {record.countTraders} trader(s) and
													cannot be deleted.
												</p>
											)}
										</div>
									),
									okText: "Yes, Delete",
									cancelText: "Cancel",
									okType: "danger",
									icon: <ExclamationCircleOutlined style={{ color: "red" }} />,
									onOk: () => handleDeleteTrade(record)
								});
							}
							break;
						default:
							break;
					}
				};

				const menuItems = [
					{
						key: "traders",
						icon: <TeamOutlined />,
						label: `View Traders (${record.countTraders || 0})`
					},
					{
						key: "view",
						icon: <EyeOutlined />,
						label: "View Details"
					},
					{
						key: "edit",
						icon: <EditOutlined />,
						label: "Edit Trade"
					},
					{
						key: "merge",
						icon: <MergeCellsOutlined />,
						label: "Merge into..."
					},
					{
						type: "divider"
					},
					{
						key: "delete",
						icon: <DeleteOutlined />,
						label: "Delete Trade",
						danger: true,
						disabled: record.countTraders > 0
					}
				];

				return (
					<Dropdown
						menu={{
							items: menuItems,
							onClick: handleMenuClick
						}}
						trigger={["hover"]}
						placement="bottomRight">
						<Button type="text" icon={<MoreOutlined />} />
					</Dropdown>
				);
			}
		}
	];

	const businessNatures = [
		{ value: "MANUFACTURING", label: "Manufacturing" },
		{ value: "RETAIL", label: "Retail" },
		{ value: "TRADE", label: "Trade" }
	];

	const category = [
		{ value: "ARTISAN", label: "Artisan" },
		{ value: "BODY CARE & FASHION", label: "Bodycare and Fashion" },
		{ value: "RETAIL", label: "Retail" },
		{ value: "FOOD & CONFECTIONARIES", label: "Food and Confectioneries" },
		{
			value: "TAILORING/SEWING, SHOE MAKING & FABRICS",
			label: "Tailoring/Sewing, Shoe Making, and Fabrics"
		},
		{ value: "MECHANICS & REPAIRS", label: "Mechanics and Repairs" },
		{
			value: "PRODUCTION AND SERVICES",
			label: "Production and Services (Others)"
		},
		{ value: "OTHERS", label: "Others" }
	];
	return (
		<>
			<ToastContainer />
			{state.loading && <Loading />}
			{/* {loading && <Loading />} */}
			{showModal && (
				<Modal
					title={`Add New Trade`}
					open={showModal}
					onCancel={closeModal}
					width={1000}
					footer={false}
					maskClosable={false}
					destroyOnHidden={true}>
					<Form
						form={form}
						onFinish={handleCreateTrade}
						{...formItemLayout}
						variant="outlined"
						style={{
							maxWidth: "100%"
						}}>
						<Form.Item
							label="Trade Title"
							name="name"
							rules={[
								{
									required: true,
									message: "Please input trade title!"
								}
							]}>
							<Input style={{ textTransform: "uppercase" }} />
						</Form.Item>

						<Form.Item
							label="Business Category"
							name="category"
							rules={[
								{
									required: true,
									message: "Please select business category!"
								}
							]}>
							<Select
								options={category}
								placeholder="Select Category of Business"
							/>
						</Form.Item>

						<Form.Item
							label="Business Nature"
							name="business_nature"
							rules={[
								{
									required: true,
									message: "Please select business Nature!"
								}
							]}>
							<Select
								options={businessNatures}
								placeholder="Select Nature of Business"
							/>
						</Form.Item>

						<Form.Item label="Description" name="description">
							<Input.TextArea
								rows={3}
								placeholder="Enter a short description of this trade (optional)"
								maxLength={500}
								showCount
							/>
						</Form.Item>

						<Form.Item
							wrapperCol={{
								offset: 6,
								span: 16
							}}>
							<Button type="primary" htmlType="submit">
								Create
							</Button>
						</Form.Item>
					</Form>
				</Modal>
			)}

			{/* Edit Trade Modal */}
			{editModalVisible && selectedTrade && (
				<Modal
					title={`Edit Trade - ${selectedTrade.name}`}
					open={editModalVisible}
					onCancel={closeEditModal}
					width={1000}
					footer={false}
					maskClosable={false}
					destroyOnClose={true}>
					<Form
						form={editForm}
						onFinish={handleUpdateTrade}
						{...formItemLayout}
						variant="outlined"
						style={{
							maxWidth: "100%"
						}}>
						<Form.Item
							label="Trade Title"
							name="name"
							rules={[
								{
									required: true,
									message: "Please input trade title!"
								}
							]}>
							<Input style={{ textTransform: "uppercase" }} />
						</Form.Item>

						<Form.Item
							label="Business Category"
							name="category"
							rules={[
								{
									required: true,
									message: "Please select business category!"
								}
							]}>
							<Select
								options={category}
								placeholder="Select Category of Business"
							/>
						</Form.Item>

						<Form.Item
							label="Business Nature"
							name="business_nature"
							rules={[
								{
									required: true,
									message: "Please select business Nature!"
								}
							]}>
							<Select
								options={businessNatures}
								placeholder="Select Nature of Business"
							/>
						</Form.Item>

						<Form.Item label="Description" name="description">
							<Input.TextArea
								rows={3}
								placeholder="Enter a short description of this trade (optional)"
								maxLength={500}
								showCount
							/>
						</Form.Item>

						<Form.Item
							wrapperCol={{
								offset: 6,
								span: 16
							}}>
							<Space>
								<Button onClick={closeEditModal}>Cancel</Button>
								<Button
									type="primary"
									htmlType="submit"
									loading={updateLoading}>
									Update Trade
								</Button>
							</Space>
						</Form.Item>
					</Form>
				</Modal>
			)}

			{/* View Trade Modal */}
			{viewModalVisible && selectedTrade && (
				<Modal
					title={`Trade Details - ${selectedTrade.name}`}
					open={viewModalVisible}
					onCancel={closeViewModal}
					width={800}
					footer={[
						<Button key="close" onClick={closeViewModal}>
							Close
						</Button>,
						<Button
							key="edit"
							type="primary"
							onClick={() => {
								closeViewModal();
								openEditModal(selectedTrade);
							}}>
							Edit Trade
						</Button>
					]}
					maskClosable={false}>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Trade Title
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{selectedTrade.name}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Business Nature
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{selectedTrade.business_nature}
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Business Category
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{selectedTrade.category || "N/A"}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Total Traders
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{selectedTrade.countTraders || 0} Traders
								</div>
							</div>
						</div>

						{selectedTrade.options && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Options/Description
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{selectedTrade.options}
								</div>
							</div>
						)}

						{selectedTrade.description && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Description
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border whitespace-pre-wrap">
									{selectedTrade.description}
								</div>
							</div>
						)}

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Created At
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{new Date(selectedTrade.created_at).toLocaleDateString()}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Last Updated
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{new Date(selectedTrade.updated_at).toLocaleDateString()}
								</div>
							</div>
						</div>

						{selectedTrade.countTraders > 0 && (
							<div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
								<p className="text-yellow-800 text-sm">
									<strong>Note:</strong> This trade has{" "}
									{selectedTrade.countTraders} trader(s) associated with it. You
									cannot delete this trade until all traders are removed or
									transferred to another trade.
								</p>
							</div>
						)}
					</div>
				</Modal>
			)}

			{/* Merge Trade Modal */}
			{mergeModalVisible && selectedTrade && (
				<Modal
					title={
						<span>
							<MergeCellsOutlined className="mr-2 text-blue-600" />
							Merge Trade — {selectedTrade.name}
						</span>
					}
					open={mergeModalVisible}
					onCancel={closeMergeModal}
					width={600}
					footer={false}
					maskClosable={false}
					destroyOnClose={true}>
					<div className="space-y-4">
						{/* Source info */}
						<div className="bg-gray-50 border border-gray-200 rounded-md p-3">
							<p className="text-sm text-gray-600 mb-1">
								<strong>Source trade (will be removed):</strong>
							</p>
							<p className="font-semibold text-gray-800">
								{selectedTrade.name}
							</p>
							<p className="text-sm text-gray-500">
								{selectedTrade.countTraders || 0} trader
								{selectedTrade.countTraders !== 1 ? "s" : ""} will be moved
							</p>
						</div>

						{/* Target selector */}
						<Form form={mergeForm} layout="vertical">
							<Form.Item
								label="Merge into (target trade)"
								name="target_uuid"
								rules={[
									{ required: true, message: "Please select a target trade!" }
								]}>
								<Select
									placeholder="Select target trade..."
									showSearch
									optionFilterProp="label"
									onChange={(val) => setMergeTargetUuid(val)}
									options={trades
										.filter((t) => t.uuid !== selectedTrade.uuid)
										.map((t) => ({
											value: t.uuid,
											label: `${t.name} (${t.countTraders || 0} traders)`
										}))}
								/>
							</Form.Item>
						</Form>

						{/* Warning */}
						{mergeTargetUuid && (
							<div className="bg-orange-50 border border-orange-300 rounded-md p-3">
								<p className="text-orange-800 text-sm">
									<strong>Warning:</strong> All{" "}
									{selectedTrade.countTraders || 0} trader
									{selectedTrade.countTraders !== 1 ? "s" : ""} from{" "}
									<strong>{selectedTrade.name}</strong> will be reassigned to{" "}
									<strong>
										{trades.find((t) => t.uuid === mergeTargetUuid)?.name}
									</strong>
									. The trade <strong>{selectedTrade.name}</strong> will be
									permanently deleted. This action cannot be undone.
								</p>
							</div>
						)}

						<div className="flex justify-end gap-2 pt-2">
							<Button onClick={closeMergeModal}>Cancel</Button>
							<Button
								type="primary"
								danger
								icon={<MergeCellsOutlined />}
								loading={mergeLoading}
								disabled={!mergeTargetUuid}
								onClick={handleMergeTrades}>
								Merge & Delete Source
							</Button>
						</div>
					</div>
				</Modal>
			)}

			{/* Traders Modal */}
			{tradersModalVisible && selectedTrade && (
				<Modal
					title={
						<span>
							<TeamOutlined className="mr-2 text-blue-600" />
							Traders &mdash; {selectedTrade.name}{" "}
							<span className="text-gray-500 text-sm font-normal">
								({selectedTrade.countTraders || 0} total)
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
							disabled={!selectedTrade?.countTraders}
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
								title: "Trade Location",
								dataIndex: "trade_location",
								key: "trade_location"
							}
						]}
					/>
				</Modal>
			)}

			<div className="flex flex-wrap">
				<div className="w-full md:w-12/12 px-4 min-h-screen">
					<CardSession title="Manage Trades" addNew={openModal}>
						<div className="block overflow-x-auto w-full mt-6">
							<div className="mb-4 flex justify-between gap-2 flex-wrap">
								<Input
									prefix={<SearchOutlined />}
									placeholder="Search by name, nature or category..."
									value={searchTerm}
									onChange={(e) => {
										setSearchTerm(e.target.value);
										setPagination((p) => ({ ...p, current: 1 }));
									}}
									allowClear
									style={{ maxWidth: 320 }}
								/>
								<Button
									type="default"
									icon={<DownloadOutlined />}
									onClick={handleExportToExcel}
									disabled={trades.length === 0}>
									Export to Excel
								</Button>
							</div>
							<div style={{ minWidth: "900px" }}>
								<Table
									dataSource={filteredTrades}
									columns={columns}
									pagination={{
										current: pagination.current,
										pageSize: pagination.pageSize,
										total: filteredTrades.length,
										showSizeChanger: true,
										showTotal: (total) => `Total ${total} trades`
									}}
									onChange={handleTableChange}
									onRow={(record) => ({
										onClick: () => openTradersModal(record),
										style: { cursor: "pointer" }
									})}
								/>
							</div>
						</div>
					</CardSession>
				</div>
				<div className="w-full lg:w-4/12 px-4 hidden">
					<CardProfile />
				</div>
			</div>
		</>
	);
};
export default Trade;
