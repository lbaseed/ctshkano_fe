import React, { useContext, useEffect, useState } from "react";
import CardSession from "../../../components/Cards/Card";
import CardProfile from "../../../components/Cards/CardProfileTabs";
import { useCookies } from "react-cookie";
import { useMutation, useQuery } from "@apollo/client";
import { GET_TRADES } from "../../../gql/queries/queries";
import CustomModal from "../../../components/Modals/CustomModal";
import Loading from "../../../components/Loading/Loading";
import {
	CREATE_TRADE,
	UPDATE_TRADE,
	DELETE_TRADE
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
	ExclamationCircleOutlined
} from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";

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
	const [form] = Form.useForm();
	const [editForm] = Form.useForm();

	const [createTrade, { createloading, createError }] =
		useMutation(CREATE_TRADE);
	const [updateTrade, { updateLoading }] = useMutation(UPDATE_TRADE);
	const [deleteTrade, { deleteLoading }] = useMutation(DELETE_TRADE);

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
			category: trade.category
		});
		setEditModalVisible(true);
	};

	const closeEditModal = () => {
		setEditModalVisible(false);
		setSelectedTrade(null);
		editForm.resetFields();
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
			category: value.category
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
			category: value.category
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

	const columns = [
		{
			title: "S/N",
			dataIndex: "key",
			render: (_, __, index) => {
				return index + 1;
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

			<div className="flex flex-wrap">
				<div className="w-full md:w-12/12 px-4 min-h-screen">
					<CardSession title="Manage Trades" addNew={openModal}>
						<div className="block overflow-x-auto w-full mt-6">
							<div style={{ minWidth: "900px" }}>
								<Table dataSource={trades} columns={columns} />
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
