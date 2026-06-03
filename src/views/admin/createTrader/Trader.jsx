import React, { useContext, useEffect, useRef, useState } from "react";
import context from "../../../context/context";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router";
import CardSession from "../../../components/Cards/Card";

import { toast, ToastContainer } from "react-toastify";
import { GET_TRADER, SEARCH_TRADER } from "../../../gql/queries/queries";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
	Input,
	Button,
	Modal,
	Card,
	Avatar,
	Tag,
	Descriptions,
	Row,
	Col,
	Space,
	Typography,
	Divider,
	Badge,
	Tooltip,
	Empty,
	Spin,
	Alert,
	Image,
	Popconfirm
} from "antd";
import {
	UserOutlined,
	PhoneOutlined,
	MailOutlined,
	CalendarOutlined,
	HomeOutlined,
	BankOutlined,
	ShopOutlined,
	IdcardOutlined,
	CameraOutlined,
	PlusOutlined,
	SearchOutlined,
	EditOutlined,
	TeamOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	GiftOutlined,
	TrophyOutlined
} from "@ant-design/icons";
import CameraNew from "./CameraNew";
import { Root, Preview, Footer, GlobalStyle } from "./mainStyle";
import Guarantor from "./Guarantor";
import {
	UPLOAD_TRADER_PHOTO,
	REMOVE_TRADER_PHOTO
} from "../../../gql/mutations/mutations";
import BankDetails from "./BankDetails";
import EditTraderProfile from "./EditTraderProfile";
import moment from "moment";
import { useLgas } from "../../../hooks/useLgas";

const { Title, Text, Paragraph } = Typography;

const Trader = () => {
	const { state, dispatch } = useContext(context);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [showModal, setShowModal] = useState(false);
	const [trader, setTrader] = useState();
	const [openEditProfile, setOpenEditProfile] = useState(false);

	const [param, setParam] = useState();
	const camera = useRef(null);
	const [image, setImage] = useState(null);

	const [openBankDetails, setOpenBankDetails] = useState(false);
	const [showImageLightbox, setShowImageLightbox] = useState(false);

	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const ownerId = queryParams.get("id");

	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const [cardImage, setCardImage] = useState();

	const [performSearch, { loading: searchLoading }] =
		useLazyQuery(SEARCH_TRADER);

	const [uploadPhoto, { loading: uploadLoading }] =
		useMutation(UPLOAD_TRADER_PHOTO);

	const [removePhoto, { loading: removePhotoLoading }] =
		useMutation(REMOVE_TRADER_PHOTO);

	const { lgaOptions, loading: lgasLoading } = useLgas(true);

	// Helper function to calculate age
	const calculateAge = (dob) => {
		if (!dob) return "N/A";
		return moment().diff(moment(dob), "years");
	};

	// Helper function to format phone number
	const formatPhoneNumber = (phone) => {
		if (!phone) return "N/A";
		const cleaned = phone.replace(/\D/g, "");
		const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
		if (match) {
			return `${match[1]}-${match[2]}-${match[3]}`;
		}
		return phone;
	};

	// Helper function to get LGA label
	const getLGALabel = (code) => {
		if (!code) return "N/A";
		const lga = lgaOptions.find((l) => l.value === code);
		return lga ? lga.label : code;
	};

	const handleSearch = async () => {
		try {
			const result = await performSearch({ variables: { param } });

			if (result?.data?.searchTrader) {
				setTrader(result?.data?.searchTrader);
				toast.success("Trader record found");
			} else {
				toast.error("No record Found");
			}
		} catch (error) {
			toast.error(error);
		}
	};

	const uploadImage = async () => {
		const file = new File([cardImage], trader?.uuid + ".jpeg", {
			type: "image/jpeg"
		});

		try {
			const result = await uploadPhoto({
				variables: { trader_uuid: trader?.uuid, file: file }
			});

			if (result?.data?.uploadTraderPhoto)
				toast.success("Photo Saved Successfully");
		} catch (error) {
			toast.error(error);
		}
	};

	const handleRemovePhoto = async () => {
		try {
			const result = await removePhoto({
				variables: { trader_uuid: trader?.uuid }
			});
			if (result?.data?.removeTraderPhoto) {
				setTrader(result.data.removeTraderPhoto);
				toast.success("Photo removed successfully");
			}
		} catch (error) {
			toast.error(error?.message || "Failed to remove photo");
		}
	};

	useEffect(() => {
		if (ownerId) {
			setParam(ownerId);
			performSearch({ variables: { param: ownerId } })
				.then((result) => {
					if (result?.data?.searchTrader) {
						setTrader(result?.data?.searchTrader);
					} else {
						toast.error("No record Found");
					}
				})
				.catch((error) => {
					toast.error(error.message);
				});
		}
	}, [ownerId]);

	return (
		<>
			<ToastContainer />
			<div className="flex flex-wrap">
				<div className="w-full px-4 min-h-screen">
					<CardSession title="Trader Profile Management">
						{/* Search Section */}
						<Card className="mb-6 mt-3" style={{ borderRadius: "12px" }}>
							<div className="flex flex-col md:flex-row gap-4 items-end">
								<div className="flex-1">
									{/* <Text strong className="block mb-2">
										Search Trader
									</Text> */}
									<Input
										placeholder="Search by phone number, ID, or name..."
										value={param}
										onChange={(e) => setParam(e.target.value)}
										onKeyUp={(e) => {
											if (e.key === "Enter") handleSearch(e);
										}}
										prefix={<SearchOutlined />}
										size="large"
										style={{ borderRadius: "8px" }}
									/>
								</div>
								<div className="md:mb-0 mb-2 ml-2">
									<Button
										type="primary"
										size="large"
										icon={<SearchOutlined />}
										onClick={handleSearch}
										loading={searchLoading}
										style={{ borderRadius: "8px", minWidth: "120px" }}>
										Search
									</Button>
								</div>
							</div>
						</Card>

						{/* Trader Profile Section */}
						{trader ? (
							<div className="space-y-6">
								{/* Header Card with Photo and Basic Info */}
								<Card style={{ borderRadius: "12px" }} className="shadow-lg">
									<Row gutter={[24, 24]} align="middle">
										<Col xs={24} md={8} lg={6}>
											<div className="text-center">
												<div className="relative inline-block">
													<Tooltip title="Click to view full size">
														<Avatar
															size={180}
															src={
																trader?.photo
																	? `data:image/jpeg;base64,${trader?.photo}`
																	: null
															}
															icon={<UserOutlined />}
															style={{
																border: "4px solid #f0f0f0",
																boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
																cursor: trader?.photo ? "pointer" : "default"
															}}
															onClick={() => {
																if (trader?.photo) {
																	setShowImageLightbox(true);
																}
															}}
														/>
													</Tooltip>
													<Badge
														count={
															<Tooltip title="Take/Update Photo">
																<Button
																	type="primary"
																	shape="circle"
																	icon={<CameraOutlined />}
																	size="small"
																	onClick={() => setIsCameraOpen(true)}
																	style={{
																		position: "absolute",
																		bottom: 8,
																		right: 8
																	}}
																/>
															</Tooltip>
														}
													/>
												</div>

												{/* Remove photo link */}
												{trader?.photo && !isCameraOpen && !cardImage && (
													<div className="mt-2">
														<Popconfirm
															title="Remove profile photo?"
															description="This will permanently delete the trader's photo."
															okText="Remove"
															okType="danger"
															cancelText="Cancel"
															onConfirm={handleRemovePhoto}>
															<Button
																type="link"
																danger
																size="small"
																loading={removePhotoLoading}
																style={{ padding: 0 }}>
																Remove Photo
															</Button>
														</Popconfirm>
													</div>
												)}

												{/* Photo Upload Section */}
												{isCameraOpen && (
													<div className="mt-4">
														<CameraNew
															onCapture={(blob) => setCardImage(blob)}
															onClear={() => setCardImage(undefined)}
														/>
														<div className="mt-3 space-x-2">
															<Button onClick={() => setIsCameraOpen(false)}>
																Close Camera
															</Button>
														</div>
													</div>
												)}

												{cardImage && (
													<div className="mt-4">
														<img
															src={URL.createObjectURL(cardImage)}
															alt="Preview"
															style={{
																width: "120px",
																height: "120px",
																borderRadius: "8px",
																objectFit: "cover",
																border: "2px solid #d9d9d9"
															}}
														/>
														<div className="mt-2 space-x-2">
															<Button
																type="primary"
																size="small"
																onClick={uploadImage}
																loading={uploadLoading}>
																Save Photo
															</Button>
															<Button
																size="small"
																onClick={() => setCardImage(undefined)}>
																Cancel
															</Button>
														</div>
													</div>
												)}
											</div>
										</Col>

										<Col xs={24} md={16} lg={18}>
											<div className="space-y-3">
												<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
													<Title level={2} className="mb-0 text-lg sm:text-2xl">
														{trader?.surname}, {trader?.other_names}
													</Title>
													<div className="flex flex-wrap gap-1">
														<Tag color="blue" icon={<IdcardOutlined />}>
															ID: {trader?.ctsh_id}
														</Tag>
														<Tag
															color={
																trader?.gender === "MALE" ? "blue" : "pink"
															}
															icon={<UserOutlined />}>
															{trader?.gender}
														</Tag>
													</div>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="flex items-center space-x-2">
														<PhoneOutlined className="text-green-600" />
														<Text strong>Phone: </Text>
														<Text copyable>
															{formatPhoneNumber(trader?.phone)}
														</Text>
													</div>

													<div className="flex items-center space-x-2">
														<MailOutlined className="text-blue-600" />
														<Text strong>Email: </Text>
														<Text copyable>
															{trader?.email || "Not provided"}
														</Text>
													</div>

													<div className="flex items-center space-x-2">
														<CalendarOutlined className="text-orange-600" />
														<Text strong>Age: </Text>
														<Text>{calculateAge(trader?.dob)} years old</Text>
													</div>

													<div className="flex items-center space-x-2">
														<HomeOutlined className="text-purple-600" />
														<Text strong>LGA:</Text>
														<Text>{getLGALabel(trader?.lga)}</Text>
													</div>
												</div>

												<div className="flex flex-wrap items-center gap-2 mt-4">
													<ShopOutlined className="text-indigo-600" />
													<Text strong>Trade: </Text>
													<Tag color="processing">{trader?.trade?.name}</Tag>
													<Text strong>Location:</Text>
													<Tag color="success">{trader?.business_location}</Tag>
													{trader?.trade_location && (
														<>
															<Text strong>Trade Location:</Text>
															<Tag color="cyan">{trader.trade_location}</Tag>
														</>
													)}
												</div>
											</div>
										</Col>
									</Row>
								</Card>

								{/* Detailed Information Tabs */}
								<div className="mt-8">
									<Row gutter={[16, 16]}>
										{/* Personal Details */}
										<Col xs={24} lg={12}>
											<Card
												title={
													<div className="flex items-center space-x-2">
														<UserOutlined className="text-blue-600" />
														<span>Personal Information</span>
													</div>
												}
												style={{ borderRadius: "12px", height: "100%" }}>
												<Descriptions
													column={1}
													size="small"
													labelStyle={{ fontWeight: "bold", width: "120px" }}>
													<Descriptions.Item label="Full Name">
														{trader?.surname}, {trader?.other_names}
													</Descriptions.Item>
													<Descriptions.Item label="Date of Birth">
														<div className="flex items-center space-x-2">
															<Text>{trader?.dob}</Text>
															<Text type="secondary">
																({calculateAge(trader?.dob)} years)
															</Text>
														</div>
													</Descriptions.Item>
													<Descriptions.Item label="Gender">
														<Tag
															color={
																trader?.gender === "MALE" ? "blue" : "pink"
															}>
															{trader?.gender}
														</Tag>
													</Descriptions.Item>
													<Descriptions.Item label="Phone">
														<Text copyable>
															{formatPhoneNumber(trader?.phone)}
														</Text>
													</Descriptions.Item>
													<Descriptions.Item label="Email">
														<Text copyable>
															{trader?.email || "Not provided"}
														</Text>
													</Descriptions.Item>
												</Descriptions>
											</Card>
										</Col>

										{/* Address & ID Information */}
										<Col xs={24} lg={12}>
											<Card
												title={
													<div className="flex items-center space-x-2">
														<HomeOutlined className="text-green-600" />
														<span>Address & Identification</span>
													</div>
												}
												style={{ borderRadius: "12px", height: "100%" }}>
												<Descriptions
													column={1}
													size="small"
													labelStyle={{ fontWeight: "bold", width: "120px" }}>
													<Descriptions.Item label="Home Address">
														<Paragraph
															copyable
															style={{ margin: 0 }}
															ellipsis={{ rows: 2, expandable: true }}>
															{trader?.home_address}
														</Paragraph>
													</Descriptions.Item>
													<Descriptions.Item label="Landmark">
														{trader?.land_mark || "Not provided"}
													</Descriptions.Item>
													<Descriptions.Item label="LGA">
														<Tag color="blue">{getLGALabel(trader?.lga)}</Tag>
													</Descriptions.Item>
													<Descriptions.Item label="PVC">
														{trader?.pvc ? (
															<Text copyable code>
																{trader?.pvc}
															</Text>
														) : (
															<Text type="secondary">Not provided</Text>
														)}
													</Descriptions.Item>
													<Descriptions.Item label="NIN">
														{trader?.nin ? (
															<Text copyable code>
																{trader?.nin}
															</Text>
														) : (
															<Text type="secondary">Not provided</Text>
														)}
													</Descriptions.Item>
												</Descriptions>
											</Card>
										</Col>

										{/* Business Information */}
										<Col xs={24} lg={12}>
											<Card
												title={
													<div className="flex items-center space-x-2">
														<ShopOutlined className="text-purple-600" />
														<span>Business Information</span>
													</div>
												}
												style={{ borderRadius: "12px", height: "100%" }}>
												<Descriptions
													column={1}
													size="small"
													labelStyle={{ fontWeight: "bold", width: "120px" }}>
													<Descriptions.Item label="Trade/Skill">
														<Tag color="processing" icon={<ShopOutlined />}>
															{trader?.trade?.name}
														</Tag>
													</Descriptions.Item>
													<Descriptions.Item label="Business Location">
														<Tag color="success" icon={<HomeOutlined />}>
															{trader?.business_location || "Not specified"}
														</Tag>
													</Descriptions.Item>
													{trader?.trade_location && (
														<Descriptions.Item label="Trade Location">
															<Tag color="cyan">{trader.trade_location}</Tag>
														</Descriptions.Item>
													)}
													<Descriptions.Item label="Operating Capital">
														{trader?.operating_capital ? (
															<Text strong style={{ color: "#52c41a" }}>
																₦
																{parseInt(
																	trader?.operating_capital
																).toLocaleString()}
															</Text>
														) : (
															<Text type="secondary">Not specified</Text>
														)}
													</Descriptions.Item>
													<Descriptions.Item label="Registration Date">
														<Text>
															{moment(trader?.created_at).format(
																"MMMM Do, YYYY"
															)}
														</Text>
													</Descriptions.Item>
												</Descriptions>
											</Card>
										</Col>

										{/* Bank Details */}
										<Col xs={24} lg={12}>
											<Card
												title={
													<div className="flex items-center space-x-2">
														<BankOutlined className="text-orange-600" />
														<span>Financial Information</span>
													</div>
												}
												style={{ borderRadius: "12px", height: "100%" }}
												extra={
													!trader?.bank_details && (
														<Button
															type="primary"
															icon={<PlusOutlined />}
															onClick={() => setOpenBankDetails(true)}
															size="small">
															Add Bank Details
														</Button>
													)
												}>
												{trader?.bank_details ? (
													(() => {
														const parsedDetails = JSON.parse(
															trader?.bank_details
														);
														return (
															<Descriptions
																column={1}
																size="small"
																labelStyle={{
																	fontWeight: "bold",
																	width: "120px"
																}}>
																<Descriptions.Item label="Bank Name">
																	<Text strong>{parsedDetails?.bank_name}</Text>
																</Descriptions.Item>
																<Descriptions.Item label="Account Number">
																	<Text copyable code>
																		{parsedDetails?.account_number}
																	</Text>
																</Descriptions.Item>
																<Descriptions.Item label="Account Name">
																	<Text>{parsedDetails?.account_name}</Text>
																</Descriptions.Item>
																<Descriptions.Item label="Status">
																	<Tag
																		color="success"
																		icon={<CheckCircleOutlined />}>
																		Verified
																	</Tag>
																</Descriptions.Item>
															</Descriptions>
														);
													})()
												) : (
													<div className="text-center py-8">
														<Empty
															image={Empty.PRESENTED_IMAGE_SIMPLE}
															description="No bank details available">
															<Button
																type="primary"
																icon={<PlusOutlined />}
																onClick={() => setOpenBankDetails(true)}>
																Add Bank Details
															</Button>
														</Empty>
													</div>
												)}
											</Card>
										</Col>

										{/* Scheme Benefits */}
										<Col xs={24} lg={12}>
											<Card
												title={
													<div className="flex items-center space-x-2">
														<GiftOutlined className="text-yellow-600" />
														<span>Scheme Benefits</span>
													</div>
												}
												style={{ borderRadius: "12px", height: "100%" }}
												extra={
													<Button
														type="primary"
														icon={<PlusOutlined />}
														size="small"
														style={{ borderRadius: "6px" }}>
														Add Benefit
													</Button>
												}>
												{trader?.scheme_benefits &&
												trader?.scheme_benefits.length > 0 ? (
													<div className="space-y-3">
														{trader.scheme_benefits.map((benefit, index) => (
															<div
																key={index}
																className="p-3 border border-gray-200 rounded-lg bg-gray-50">
																<div className="flex items-center justify-between mb-2">
																	<Text strong className="text-blue-600">
																		{benefit.scheme_name ||
																			`Scheme ${index + 1}`}
																	</Text>
																	<Tag
																		color={
																			benefit.status === "ACTIVE"
																				? "success"
																				: benefit.status === "COMPLETED"
																					? "blue"
																					: "orange"
																		}
																		icon={
																			benefit.status === "ACTIVE" ? (
																				<CheckCircleOutlined />
																			) : (
																				<ClockCircleOutlined />
																			)
																		}>
																		{benefit.status || "PENDING"}
																	</Tag>
																</div>
																<Descriptions size="small" column={1}>
																	{benefit.benefit_type && (
																		<Descriptions.Item label="Type">
																			<Tag color="processing">
																				{benefit.benefit_type}
																			</Tag>
																		</Descriptions.Item>
																	)}
																	{benefit.amount && (
																		<Descriptions.Item label="Amount">
																			<Text strong style={{ color: "#52c41a" }}>
																				₦
																				{parseInt(
																					benefit.amount
																				).toLocaleString()}
																			</Text>
																		</Descriptions.Item>
																	)}
																	{benefit.date_received && (
																		<Descriptions.Item label="Date Received">
																			<Text>
																				{moment(benefit.date_received).format(
																					"MMM DD, YYYY"
																				)}
																			</Text>
																		</Descriptions.Item>
																	)}
																	{benefit.description && (
																		<Descriptions.Item label="Description">
																			<Text type="secondary">
																				{benefit.description}
																			</Text>
																		</Descriptions.Item>
																	)}
																</Descriptions>
															</div>
														))}
													</div>
												) : (
													<div className="text-center py-8">
														<Empty
															image={Empty.PRESENTED_IMAGE_SIMPLE}
															description={
																<div>
																	<Text
																		type="secondary"
																		style={{ fontSize: "14px" }}>
																		No scheme benefits recorded
																	</Text>
																	<div className="mt-2">
																		<Text
																			type="secondary"
																			style={{ fontSize: "12px" }}>
																			Add benefits received from government or
																			NGO schemes
																		</Text>
																	</div>
																</div>
															}>
															<Button
																type="primary"
																icon={<PlusOutlined />}
																size="small"
																style={{ borderRadius: "6px" }}>
																Add First Benefit
															</Button>
														</Empty>
													</div>
												)}
											</Card>
										</Col>
									</Row>
								</div>

								{/* Action Buttons */}
								<Card style={{ borderRadius: "12px" }}>
									<div className="flex flex-wrap gap-2">
										<Button
											type="primary"
											icon={<TeamOutlined />}
											size="large"
											onClick={() => setShowModal(true)}
											style={{ borderRadius: "8px" }}>
											Add Reference/Guarantor
										</Button>

										{!trader?.bank_details && (
											<Button
												icon={<BankOutlined />}
												size="large"
												onClick={() => setOpenBankDetails(true)}
												style={{ borderRadius: "8px" }}>
												Add Bank Details
											</Button>
										)}

										<Button
											icon={<EditOutlined />}
											size="large"
											onClick={() => setOpenEditProfile(true)}
											style={{ borderRadius: "8px" }}>
											Edit Profile
										</Button>
									</div>
								</Card>
							</div>
						) : (
							<div className="text-center py-16">
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									description={
										<div>
											<Text type="secondary" style={{ fontSize: "16px" }}>
												{param
													? "No trader found with the provided search term"
													: "Search for a trader to view their profile"}
											</Text>
											{param && (
												<div className="mt-4">
													<Button type="primary" onClick={() => setParam("")}>
														Clear Search
													</Button>
												</div>
											)}
										</div>
									}
								/>
							</div>
						)}
					</CardSession>
				</div>
			</div>

			{/* Image Lightbox Modal */}
			<Modal
				title={
					<div className="flex items-center space-x-2">
						<UserOutlined />
						<span>
							{trader?.surname} {trader?.other_names} - Profile Photo
						</span>
					</div>
				}
				open={showImageLightbox}
				onCancel={() => setShowImageLightbox(false)}
				footer={null}
				width="auto"
				centered
				style={{
					maxWidth: "90vw",
					maxHeight: "90vh"
				}}
				bodyStyle={{
					padding: "20px",
					textAlign: "center"
				}}>
				{trader?.photo && (
					<Image
						src={`data:image/jpeg;base64,${trader?.photo}`}
						alt={`${trader?.surname} ${trader?.other_names} Profile Photo`}
						style={{
							maxWidth: "100%",
							maxHeight: "70vh",
							objectFit: "contain"
						}}
						preview={false}
					/>
				)}
			</Modal>

			{/* Modals */}
			<Modal
				title={
					<div className="flex items-center space-x-2">
						<TeamOutlined />
						<span>
							Add Reference for {trader?.surname} {trader?.other_names}
						</span>
					</div>
				}
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={false}
				mask={true}
				maskClosable={false}
				width="min(1000px, 95vw)"
				style={{ borderRadius: "12px" }}>
				<Guarantor closeModal={() => setShowModal(false)} trader={trader} />
			</Modal>

			<Modal
				title={
					<div className="flex items-center space-x-2">
						<BankOutlined />
						<span>
							Add Bank Details for {trader?.surname} {trader?.other_names}
						</span>
					</div>
				}
				open={openBankDetails}
				onCancel={() => setOpenBankDetails(false)}
				footer={false}
				mask={true}
				maskClosable={false}
				destroyOnClose={true}
				style={{ borderRadius: "12px" }}>
				<BankDetails
					closeModal={() => setOpenBankDetails(false)}
					trader={trader}
				/>
			</Modal>

			<Modal
				title={
					<div className="flex items-center space-x-2">
						<EditOutlined />
						<span>
							Edit Profile - {trader?.surname} {trader?.other_names}
						</span>
					</div>
				}
				open={openEditProfile}
				onCancel={() => setOpenEditProfile(false)}
				footer={false}
				mask={true}
				maskClosable={false}
				destroyOnClose={true}
				width="min(1200px, 95vw)"
				style={{ borderRadius: "12px" }}>
				<EditTraderProfile
					closeModal={() => setOpenEditProfile(false)}
					trader={trader}
				/>
			</Modal>

			<GlobalStyle />
		</>
	);
};

export default Trader;
