import React, { useContext, useEffect, useState } from "react";
import CardSession from "../../../components/Cards/Card";
import CardProfile from "../../../components/Cards/CardProfileTabs";
import { useCookies } from "react-cookie";
import { useMutation, useQuery } from "@apollo/client";
import { GET_LOCATIONS } from "../../../gql/queries/queries";
import Loading from "../../../components/Loading/Loading";
import {
	CREATE_LOCATION,
	UPDATE_LOCATION,
	DELETE_LOCATION
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
	Space
} from "antd";
import {
	MoreOutlined,
	EyeOutlined,
	EditOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined
} from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import { useLgas } from "../../../hooks/useLgas";

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

export const Location = () => {
	const { state, dispatch } = useContext(context);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [showModal, setShowModal] = useState(false);
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [viewModalVisible, setViewModalVisible] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState(null);
	const [locations, setLocations] = useState([]);
	const [form] = Form.useForm();
	const [editForm] = Form.useForm();

	const [createLocation, { createloading, createError }] =
		useMutation(CREATE_LOCATION);
	const [updateLocation, { updateLoading }] = useMutation(UPDATE_LOCATION);
	const [deleteLocation, { deleteLoading }] = useMutation(DELETE_LOCATION);

	const { lgaOptions, loading: lgasLoading } = useLgas(true);

	const openModal = () => {
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		form.resetFields();
	};

	const openEditModal = (location) => {
		setSelectedLocation(location);
		editForm.setFieldsValue({
			title: location.title,
			lga: location.lga,
			description: location.description,
			type: location.type
		});
		setEditModalVisible(true);
	};

	const closeEditModal = () => {
		setEditModalVisible(false);
		setSelectedLocation(null);
		editForm.resetFields();
	};

	const openViewModal = (location) => {
		setSelectedLocation(location);
		setViewModalVisible(true);
	};

	const closeViewModal = () => {
		setViewModalVisible(false);
		setSelectedLocation(null);
	};

	const { loading, error, data } = useQuery(GET_LOCATIONS, {
		fetchPolicy: "cache-and-network"
	});

	useEffect(() => {
		if (data) {
			setLocations(data?.locations);
		}
	}, [loading]);

	const handleCreateLocation = async (value) => {
		if (!value) return toast.error("Please fill in all required fields!");

		const variables = {
			title: value.title.trim().toUpperCase(),
			description: value?.description
				? value.description.trim().toUpperCase()
				: "",
			lga: value.lga.trim().toUpperCase(),
			type: value.type
		};
		dispatch({ type: LOADING, payload: true });

		try {
			const result = await createLocation({ variables });

			if (result.data) {
				setLocations([result?.data?.createLocation, ...locations]);
				toast.success("Location created successfully!");
				closeModal();
			}
		} catch (error) {
			toast.error(error.message || "Failed to create location");
		}
		dispatch({ type: LOADING, payload: false });
	};

	const handleUpdateLocation = async (value) => {
		if (!value || !selectedLocation)
			return toast.error("Please fill in all required fields!");

		const variables = {
			uuid: selectedLocation.uuid,
			title: value.title.trim().toUpperCase(),
			description: value?.description
				? value.description.trim().toUpperCase()
				: "",
			lga: value.lga.trim().toUpperCase(),
			type: value.type
		};
		dispatch({ type: LOADING, payload: true });

		try {
			const result = await updateLocation({ variables });

			if (result.data) {
				updateTableData(result.data.updateLocation, "update");
				toast.success("Location updated successfully!");
				closeEditModal();
			}
		} catch (error) {
			toast.error(error.message || "Failed to update location");
		}
		dispatch({ type: LOADING, payload: false });
	};

	const handleDeleteLocation = async (location) => {
		// Check if location has traders before deleting
		if (location.countTraders > 0) {
			toast.error(
				"Cannot delete location with existing traders. Please remove all traders first."
			);
			return;
		}

		dispatch({ type: LOADING, payload: true });

		try {
			const result = await deleteLocation({
				variables: { uuid: location.uuid }
			});

			if (result.data) {
				updateTableData(location, "delete");
				toast.success("Location deleted successfully!");
			}
		} catch (error) {
			toast.error(error.message || "Failed to delete location");
		}
		dispatch({ type: LOADING, payload: false });
	};

	const updateTableData = (location, action) => {
		if (action === "delete") {
			setLocations((locations) =>
				locations.filter((item) => {
					return item.uuid !== location.uuid;
				})
			);
		}

		if (action === "update") {
			const newState = locations.map((item) => {
				if (item.uuid === location.uuid) {
					return location;
				}

				return item;
			});

			setLocations(newState);
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
			title: "Location Title",
			dataIndex: "title",
			key: "title"
		},
		{
			title: "LGA",
			dataIndex: "lga",
			key: "lga"
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description"
		},
		{
			title: "countTraders",
			dataIndex: "countTraders",
			key: "countTraders"
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
								toast.warning("Cannot delete location with existing traders");
							} else {
								// Show confirmation modal for delete
								Modal.confirm({
									title: "Delete Location",
									content: (
										<div>
											<p>
												Are you sure you want to delete{" "}
												<strong>{record.title}</strong>?
											</p>
											<p>This action cannot be undone.</p>
											{record.countTraders > 0 && (
												<p style={{ color: "red" }}>
													This location has {record.countTraders} trader(s) and
													cannot be deleted.
												</p>
											)}
										</div>
									),
									okText: "Yes, Delete",
									cancelText: "Cancel",
									okType: "danger",
									icon: <ExclamationCircleOutlined style={{ color: "red" }} />,
									onOk: () => handleDeleteLocation(record)
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
						label: "Edit Location"
					},
					{
						type: "divider"
					},
					{
						key: "delete",
						icon: <DeleteOutlined />,
						label: "Delete Location",
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

	return (
		<>
			<ToastContainer />
			{state.loading && <Loading />}
			{showModal && (
				<Modal
					title={`Add New Location`}
					open={showModal}
					onCancel={closeModal}
					width={1000}
					footer={false}
					maskClosable={false}
					destroyOnHidden={true}>
					<Form
						form={form}
						onFinish={handleCreateLocation}
						{...formItemLayout}
						variant="outlined"
						style={{
							maxWidth: "100%"
						}}>
						<Form.Item
							label="Location Title"
							name="title"
							rules={[
								{
									required: true,
									message: "Please input location title!"
								}
							]}>
							<Input style={{ textTransform: "uppercase" }} />
						</Form.Item>

						<Form.Item
							label="LGA"
							name="lga"
							rules={[
								{
									required: true,
									message: "Please input LGA!"
								}
							]}>
							<Select
								options={lgaOptions}
								placeholder="Select Location LGA"
								showSearch
								loading={lgasLoading}
								filterOption={(input, option) =>
									(option?.label ?? "")
										.toLowerCase()
										.includes(input.toLowerCase())
								}
							/>
						</Form.Item>
						<Form.Item
							label="Location Description"
							name="description"
							rules={[
								{
									required: false,
									message: "Please input location description!"
								}
							]}>
							<Input style={{ textTransform: "uppercase" }} />
						</Form.Item>

						<Form.Item
							label="Location Type"
							name="type"
							rules={[
								{
									required: true,
									message: "Please select location type!"
								}
							]}>
							<Select
								options={[
									{ value: "METRO", label: "Metro" },
									{ value: "RURAL", label: "Rural" }
								]}
								placeholder="Select Location Type"
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

			{/* Edit Location Modal */}
			{editModalVisible && selectedLocation && (
				<Modal
					title={`Edit Location - ${selectedLocation.title}`}
					open={editModalVisible}
					onCancel={closeEditModal}
					width={1000}
					footer={false}
					maskClosable={false}
					destroyOnClose={true}>
					<Form
						form={editForm}
						onFinish={handleUpdateLocation}
						{...formItemLayout}
						variant="outlined"
						style={{
							maxWidth: "100%"
						}}>
						<Form.Item
							label="Location Title"
							name="title"
							rules={[
								{
									required: true,
									message: "Please input location title!"
								}
							]}>
							<Input style={{ textTransform: "uppercase" }} />
						</Form.Item>

						<Form.Item
							label="LGA"
							name="lga"
							rules={[
								{
									required: true,
									message: "Please input LGA!"
								}
							]}>
							<Select
								options={lgaOptions}
								placeholder="Select Location LGA"
								showSearch
								loading={lgasLoading}
								filterOption={(input, option) =>
									(option?.label ?? "")
										.toLowerCase()
										.includes(input.toLowerCase())
								}
							/>
						</Form.Item>

						<Form.Item
							label="Location Description"
							name="description"
							rules={[
								{
									required: false,
									message: "Please input location description!"
								}
							]}>
							<Input style={{ textTransform: "uppercase" }} />
						</Form.Item>

						<Form.Item
							label="Location Type"
							name="type"
							rules={[
								{
									required: true,
									message: "Please select location type!"
								}
							]}>
							<Select
								options={[
									{ value: "METRO", label: "Metro" },
									{ value: "RURAL", label: "Rural" }
								]}
								placeholder="Select Location Type"
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
									Update Location
								</Button>
							</Space>
						</Form.Item>
					</Form>
				</Modal>
			)}

			{/* View Location Modal */}
			{viewModalVisible && selectedLocation && (
				<Modal
					title={`Location Details - ${selectedLocation.title}`}
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
								openEditModal(selectedLocation);
							}}>
							Edit Location
						</Button>
					]}
					maskClosable={false}>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Location Title
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{selectedLocation.title}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									LGA
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{lgaOptions.find((lga) => lga.value === selectedLocation.lga)
										?.label || selectedLocation.lga}
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Location Type
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{selectedLocation.type === "METRO" ? "Metro" : "Rural"}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Total Traders
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{selectedLocation.countTraders || 0} Traders
								</div>
							</div>
						</div>

						{selectedLocation.description && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Description
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{selectedLocation.description}
								</div>
							</div>
						)}

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Created At
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{new Date(selectedLocation.created_at).toLocaleDateString()}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Last Updated
								</label>
								<div className="px-3 py-2 bg-gray-50 rounded-md border">
									{new Date(selectedLocation.updated_at).toLocaleDateString()}
								</div>
							</div>
						</div>

						{selectedLocation.countTraders > 0 && (
							<div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
								<p className="text-yellow-800 text-sm">
									<strong>Note:</strong> This location has{" "}
									{selectedLocation.countTraders} trader(s) associated with it.
									You cannot delete this location until all traders are removed
									or transferred to another location.
								</p>
							</div>
						)}
					</div>
				</Modal>
			)}

			<div className="flex flex-wrap">
				<div className="w-full md:w-12/12 px-4 min-h-screen">
					<CardSession title="Manage Locations" addNew={openModal}>
						<div className="block overflow-x-auto w-full mt-6">
							<div style={{ minWidth: "900px" }}>
								<Table dataSource={locations} columns={columns} />
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
export default Location;
