import React, { useState, useEffect } from "react";
import {
	Card,
	Table,
	Button,
	Space,
	Modal,
	Form,
	Input,
	Switch,
	Upload,
	Divider,
	Alert,
	Tag,
	Popconfirm,
	Typography,
	Row,
	Col,
	Tooltip,
	message
} from "antd";
import {
	PlusOutlined,
	UploadOutlined,
	EditOutlined,
	DeleteOutlined,
	DownloadOutlined,
	CloudUploadOutlined,
	ReloadOutlined,
	FileExcelOutlined
} from "@ant-design/icons";
import { useQuery, useMutation } from "@apollo/client";
import {
	GET_LGAS,
	CREATE_LGA,
	UPDATE_LGA,
	DELETE_LGA,
	UPLOAD_LGAS
} from "../../gql/lga";
import { toast, ToastContainer } from "react-toastify";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const LgaManagement = () => {
	const [form] = Form.useForm();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
	const [editingLga, setEditingLga] = useState(null);
	const [fileList, setFileList] = useState([]);
	const [uploadResult, setUploadResult] = useState(null);

	// GraphQL operations
	const {
		data: lgasData,
		loading,
		refetch
	} = useQuery(GET_LGAS, {
		variables: { isActive: null, orderBy: "name", direction: "ASC" },
		fetchPolicy: "cache-and-network"
	});

	const [createLga, { loading: createLoading }] = useMutation(CREATE_LGA);
	const [updateLga, { loading: updateLoading }] = useMutation(UPDATE_LGA);
	const [deleteLga, { loading: deleteLoading }] = useMutation(DELETE_LGA);
	const [uploadLgas, { loading: uploadLoading }] = useMutation(UPLOAD_LGAS);

	const handleAddLga = () => {
		setEditingLga(null);
		form.resetFields();
		setIsModalVisible(true);
	};

	const handleEditLga = (lga) => {
		setEditingLga(lga);
		form.setFieldsValue({
			code: lga.code,
			name: lga.name,
			state: lga.state,
			is_active: lga.is_active
		});
		setIsModalVisible(true);
	};

	const handleDeleteLga = async (uuid) => {
		try {
			const result = await deleteLga({ variables: { uuid } });
			if (result.data?.deleteLga) {
				toast.success("LGA deleted successfully!");
				refetch();
			}
		} catch (error) {
			console.error("Delete error:", error);
			toast.error("Failed to delete LGA. It may be in use by traders.");
		}
	};

	const handleSubmit = async (values) => {
		try {
			if (editingLga) {
				// Update existing LGA
				const result = await updateLga({
					variables: {
						uuid: editingLga.uuid,
						code: values.code.toUpperCase(),
						name: values.name.toUpperCase(),
						state: values.state?.toUpperCase() || "KANO",
						isActive: values.is_active
					}
				});

				if (result.data?.updateLga) {
					toast.success("LGA updated successfully!");
					setIsModalVisible(false);
					refetch();
				}
			} else {
				// Create new LGA
				const result = await createLga({
					variables: {
						code: values.code.toUpperCase(),
						name: values.name.toUpperCase(),
						state: values.state?.toUpperCase() || "KANO",
						isActive: values.is_active ?? true
					}
				});

				if (result.data?.createLga) {
					toast.success("LGA created successfully!");
					setIsModalVisible(false);
					form.resetFields();
					refetch();
				}
			}
		} catch (error) {
			console.error("Submit error:", error);
			toast.error(error.message || "Operation failed. Please try again.");
		}
	};

	const handleFileUpload = async () => {
		if (fileList.length === 0) {
			toast.error("Please select a file to upload");
			return;
		}

		try {
			const file = fileList[0].originFileObj;
			const result = await uploadLgas({ variables: { file } });

			if (result.data?.uploadLgas) {
				const uploadResult = result.data.uploadLgas;
				setUploadResult(uploadResult);

				if (uploadResult.success) {
					toast.success(uploadResult.message);
					refetch();
				} else {
					toast.error(uploadResult.message);
				}
			}
		} catch (error) {
			console.error("Upload error:", error);
			toast.error("Upload failed. Please try again.");
		}
	};

	const downloadTemplate = () => {
		const csvContent =
			"code,name,state,is_active\nKNO,KANO,KANO,true\nFGE,FAGGE,KANO,true";
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "lga_template.csv";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	};

	const uploadProps = {
		fileList,
		beforeUpload: (file) => {
			const isValidType =
				file.type === "text/csv" ||
				file.type === "application/vnd.ms-excel" ||
				file.type ===
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

			if (!isValidType) {
				message.error("You can only upload CSV or Excel files!");
				return false;
			}

			setFileList([file]);
			return false;
		},
		onRemove: () => {
			setFileList([]);
		}
	};

	const columns = [
		{
			title: "Code",
			dataIndex: "code",
			key: "code",
			sorter: true,
			render: (code) => <Text strong>{code}</Text>
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
			sorter: true
		},
		{
			title: "State",
			dataIndex: "state",
			key: "state",
			sorter: true
		},
		{
			title: "Traders Count",
			dataIndex: "traders_count",
			key: "traders_count",
			align: "center",
			render: (count) => <Tag color="blue">{count || 0}</Tag>
		},
		{
			title: "Status",
			dataIndex: "is_active",
			key: "is_active",
			align: "center",
			render: (isActive) => (
				<Tag color={isActive ? "success" : "error"}>
					{isActive ? "Active" : "Inactive"}
				</Tag>
			)
		},
		{
			title: "Actions",
			key: "actions",
			align: "center",
			render: (_, record) => (
				<Space>
					<Tooltip title="Edit LGA">
						<Button
							type="primary"
							size="small"
							icon={<EditOutlined />}
							onClick={() => handleEditLga(record)}
						/>
					</Tooltip>
					<Popconfirm
						title="Delete LGA"
						description="Are you sure you want to delete this LGA? This action cannot be undone."
						onConfirm={() => handleDeleteLga(record.uuid)}
						okText="Yes"
						cancelText="No">
						<Tooltip title="Delete LGA">
							<Button
								danger
								size="small"
								icon={<DeleteOutlined />}
								loading={deleteLoading}
							/>
						</Tooltip>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<>
			<ToastContainer />
			<div className="p-6">
				<Card>
					<div className="flex justify-between items-center mb-6">
						<div>
							<Title level={3} className="mb-2">
								LGA Management
							</Title>
							<Text type="secondary">
								Manage Local Government Areas for the system
							</Text>
						</div>
						<Space>
							<Button
								icon={<ReloadOutlined />}
								onClick={() => refetch()}
								disabled={loading}>
								Refresh
							</Button>
							<Button
								type="default"
								icon={<CloudUploadOutlined />}
								onClick={() => setIsUploadModalVisible(true)}>
								Upload LGAs
							</Button>
							<Button
								type="primary"
								icon={<PlusOutlined />}
								onClick={handleAddLga}>
								Add LGA
							</Button>
						</Space>
					</div>

					<Table
						columns={columns}
						dataSource={lgasData?.lgas || []}
						loading={loading}
						rowKey="uuid"
						pagination={{
							total: lgasData?.lgas?.length || 0,
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: (total, range) =>
								`${range[0]}-${range[1]} of ${total} LGAs`
						}}
						size="small"
					/>
				</Card>

				{/* Add/Edit LGA Modal */}
				<Modal
					title={editingLga ? "Edit LGA" : "Add New LGA"}
					open={isModalVisible}
					onCancel={() => setIsModalVisible(false)}
					footer={null}
					destroyOnClose>
					<Form
						form={form}
						layout="vertical"
						onFinish={handleSubmit}
						initialValues={{ is_active: true, state: "KANO" }}>
						<Row gutter={16}>
							<Col span={12}>
								<Form.Item
									label="LGA Code"
									name="code"
									rules={[
										{ required: true, message: "Please enter LGA code" },
										{ max: 10, message: "Code must be 10 characters or less" }
									]}>
									<Input
										placeholder="e.g., KNO"
										style={{ textTransform: "uppercase" }}
										maxLength={10}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label="LGA Name"
									name="name"
									rules={[
										{ required: true, message: "Please enter LGA name" },
										{ max: 100, message: "Name must be 100 characters or less" }
									]}>
									<Input
										placeholder="e.g., KANO"
										style={{ textTransform: "uppercase" }}
										maxLength={100}
									/>
								</Form.Item>
							</Col>
						</Row>

						<Row gutter={16}>
							<Col span={12}>
								<Form.Item
									label="State"
									name="state"
									rules={[
										{ max: 50, message: "State must be 50 characters or less" }
									]}>
									<Input
										placeholder="e.g., KANO"
										style={{ textTransform: "uppercase" }}
										maxLength={50}
									/>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									label="Status"
									name="is_active"
									valuePropName="checked">
									<Switch
										checkedChildren="Active"
										unCheckedChildren="Inactive"
									/>
								</Form.Item>
							</Col>
						</Row>

						<div className="flex justify-end space-x-2">
							<Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
							<Button
								type="primary"
								htmlType="submit"
								loading={createLoading || updateLoading}>
								{editingLga ? "Update" : "Create"}
							</Button>
						</div>
					</Form>
				</Modal>

				{/* Upload LGAs Modal */}
				<Modal
					title="Upload LGA Data"
					open={isUploadModalVisible}
					onCancel={() => {
						setIsUploadModalVisible(false);
						setFileList([]);
						setUploadResult(null);
					}}
					footer={null}
					width={600}
					destroyOnClose>
					<div className="space-y-4">
						<Alert
							message="Upload Instructions"
							description={
								<div>
									<p>
										Upload a CSV or Excel file with LGA data. The file should
										contain columns:
									</p>
									<ul className="list-disc list-inside mt-2">
										<li>
											<strong>code</strong>: LGA code (required, e.g., "KNO")
										</li>
										<li>
											<strong>name</strong>: LGA name (required, e.g., "KANO")
										</li>
										<li>
											<strong>state</strong>: State name (optional, defaults to
											"KANO")
										</li>
										<li>
											<strong>is_active</strong>: Status (optional, true/false,
											defaults to true)
										</li>
									</ul>
									<Button
										type="link"
										icon={<DownloadOutlined />}
										onClick={downloadTemplate}
										className="p-0 mt-2">
										Download Sample Template
									</Button>
								</div>
							}
							type="info"
							showIcon
							className="mb-4"
						/>

						<Dragger {...uploadProps} className="mb-4">
							<p className="ant-upload-drag-icon">
								<FileExcelOutlined />
							</p>
							<p className="ant-upload-text">
								Click or drag file to this area to upload
							</p>
							<p className="ant-upload-hint">
								Support CSV and Excel files. Only single file upload is
								supported.
							</p>
						</Dragger>

						{uploadResult && (
							<Alert
								message={uploadResult.message}
								description={
									<div>
										{uploadResult.imported_count > 0 && (
											<p>
												Successfully imported: {uploadResult.imported_count}{" "}
												LGA(s)
											</p>
										)}
										{uploadResult.errors && uploadResult.errors.length > 0 && (
											<div className="mt-2">
												<Text strong>Errors:</Text>
												<ul className="list-disc list-inside mt-1">
													{uploadResult.errors.map((error, index) => (
														<li key={index} className="text-red-600">
															{error}
														</li>
													))}
												</ul>
											</div>
										)}
									</div>
								}
								type={uploadResult.success ? "success" : "error"}
								showIcon
								className="mb-4"
							/>
						)}

						<div className="flex justify-end space-x-2">
							<Button
								onClick={() => {
									setIsUploadModalVisible(false);
									setFileList([]);
									setUploadResult(null);
								}}>
								Cancel
							</Button>
							<Button
								type="primary"
								icon={<UploadOutlined />}
								onClick={handleFileUpload}
								loading={uploadLoading}
								disabled={fileList.length === 0}>
								Upload
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</>
	);
};

export default LgaManagement;
