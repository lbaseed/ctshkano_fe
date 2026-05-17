import React, { useState, useEffect } from "react";
import {
	Button,
	Form,
	Input,
	Select,
	DatePicker,
	Card,
	Row,
	Col,
	Typography,
	Space,
	Divider,
	Alert
} from "antd";
import {
	UserOutlined,
	PhoneOutlined,
	MailOutlined,
	CalendarOutlined,
	HomeOutlined,
	IdcardOutlined,
	EnvironmentOutlined,
	ShopOutlined,
	EditOutlined,
	SaveOutlined
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_TRADER } from "../../../gql/mutations/mutations";
import { GET_TRADES } from "../../../gql/queries/queries";
import { useLgas } from "../../../hooks/useLgas";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";

const { Title, Text } = Typography;
const { TextArea } = Input;

const EditTraderProfile = (props) => {
	const [form] = Form.useForm();
	const [updateTrader, { loading }] = useMutation(UPDATE_TRADER);

	// Fetch trades
	const { data: tradesData } = useQuery(GET_TRADES, {
		fetchPolicy: "cache-and-network"
	});

	// Use dynamic LGA data
	const { lgaOptions, loading: lgasLoading } = useLgas(true);

	// Format phone number
	const formatPhoneNumber = (value) => {
		if (!value) return value;
		const phoneNumber = value.replace(/[^\d]/g, "");
		if (phoneNumber.length <= 3) return phoneNumber;
		if (phoneNumber.length <= 7) {
			return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
		}
		return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(
			3,
			6
		)}-${phoneNumber.slice(6, 11)}`;
	};

	// Calculate age
	const calculateAge = (dob) => {
		if (!dob) return 0;
		const age = moment().diff(moment(dob), "years");
		return age;
	};

	// Handle form submission
	const handleUpdateTrader = async (values) => {
		if (!props?.trader?.uuid) return toast.error("Trader ID is required");

		try {
			const variables = {
				uuid: props.trader.uuid,
				surname: values.surname.trim().toUpperCase(),
				other_names: values.other_names.trim().toUpperCase(),
				phone: values.phone.replace(/[^\d]/g, "").trim(),
				email: values.email ? values.email.trim().toLowerCase() : null,
				gender: values.gender,
				dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
				home_address: values.home_address.trim().toUpperCase(),
				land_mark: values.land_mark
					? values.land_mark.trim().toUpperCase()
					: null,
				lga: values.lga,
				pvc: values.pvc ? values.pvc.trim().toUpperCase() : null,
				nin: values.nin ? values.nin.trim() : null,
				tradeId: values.trade_id,
				business_location: values.business_location
					? values.business_location.trim().toUpperCase()
					: null,
				trade_location: values.trade_location
					? values.trade_location.trim().toUpperCase()
					: null,
				operating_capital: values.operating_capital
					? parseFloat(
							values.operating_capital.toString().replace(/[₦,\s]/g, "")
						)
					: null
			};

			const result = await updateTrader({ variables });

			if (result?.data?.updateTrader) {
				toast.success("Trader profile updated successfully!");
				props?.closeModal();
				window.location.reload();
			} else {
				toast.error("Failed to update profile. Please try again.");
			}
		} catch (error) {
			console.error("Error updating trader:", error);
			toast.error("Failed to update profile. Please try again.");
		}
	};

	// Pre-fill form with trader data
	useEffect(() => {
		if (props?.trader) {
			const trader = props.trader;
			form.setFieldsValue({
				surname: trader.surname,
				other_names: trader.other_names,
				phone: formatPhoneNumber(trader.phone),
				email: trader.email,
				gender: trader.gender,
				dob: trader.dob ? moment(trader.dob) : null,
				home_address: trader.home_address,
				land_mark: trader.land_mark,
				lga: trader.lga,
				pvc: trader.pvc,
				nin: trader.nin,
				trade_id: trader.trade?.id,
				business_location: trader.business_location,
				trade_location: trader.trade_location,
				operating_capital: trader.operating_capital
			});
		}
	}, [props?.trader, form]);

	return (
		<>
			<ToastContainer />
			<Card style={{ borderRadius: "12px" }} bodyStyle={{ padding: "24px" }}>
				<div className="mb-6">
					<Title level={4} className="mb-2">
						<EditOutlined className="mr-2" />
						Edit Trader Profile
					</Title>
					<Text type="secondary">
						Update information for {props?.trader?.surname}{" "}
						{props?.trader?.other_names}
					</Text>
				</div>

				<Form
					form={form}
					onFinish={handleUpdateTrader}
					layout="vertical"
					style={{ maxWidth: "100%" }}
					scrollToFirstError>
					{/* Personal Information Section */}
					<Divider orientation="left">
						<Text strong>
							<UserOutlined className="mr-2" />
							Personal Information
						</Text>
					</Divider>

					<Row gutter={[16, 0]}>
						<Col xs={24} md={12}>
							<Form.Item
								label="Surname"
								name="surname"
								rules={[
									{ required: true, message: "Please enter surname!" },
									{ min: 2, message: "Surname must be at least 2 characters!" }
								]}>
								<Input
									prefix={<UserOutlined />}
									placeholder="Enter surname"
									size="large"
									style={{ textTransform: "uppercase" }}
									showCount
									maxLength={30}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label="Other Names"
								name="other_names"
								rules={[
									{ required: true, message: "Please enter other names!" },
									{
										min: 2,
										message: "Other names must be at least 2 characters!"
									}
								]}>
								<Input
									prefix={<UserOutlined />}
									placeholder="Enter other names"
									size="large"
									style={{ textTransform: "uppercase" }}
									showCount
									maxLength={50}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={[16, 0]}>
						<Col xs={24} md={12}>
							<Form.Item
								label="Phone Number"
								name="phone"
								rules={[
									{ required: true, message: "Please enter phone number!" },
									{
										validator: (_, value) => {
											if (value && value.replace(/[^\d]/g, "").length < 10) {
												return Promise.reject(
													new Error("Phone number must be at least 10 digits!")
												);
											}
											return Promise.resolve();
										}
									}
								]}>
								<Input
									prefix={<PhoneOutlined />}
									placeholder="080-1234-5678"
									size="large"
									onChange={(e) => {
										const formatted = formatPhoneNumber(e.target.value);
										form.setFieldsValue({ phone: formatted });
									}}
									maxLength={13}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label="Email Address"
								name="email"
								rules={[
									{
										type: "email",
										message: "Please enter a valid email address!"
									}
								]}>
								<Input
									prefix={<MailOutlined />}
									placeholder="email@example.com"
									size="large"
									style={{ textTransform: "lowercase" }}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={[16, 0]}>
						<Col xs={24} md={12}>
							<Form.Item
								label="Gender"
								name="gender"
								rules={[{ required: true, message: "Please select gender!" }]}>
								<Select
									placeholder="Select gender"
									size="large"
									options={[
										{ value: "MALE", label: "Male" },
										{ value: "FEMALE", label: "Female" }
									]}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label="Date of Birth"
								name="dob"
								rules={[
									{ required: true, message: "Please select date of birth!" },
									{
										validator: (_, value) => {
											if (
												value &&
												calculateAge(value.format("YYYY-MM-DD")) < 18
											) {
												return Promise.reject(
													new Error("Trader must be at least 18 years old!")
												);
											}
											return Promise.resolve();
										}
									}
								]}>
								<DatePicker
									placeholder="Select date of birth"
									size="large"
									style={{ width: "100%" }}
									disabledDate={(current) => {
										return current && current > moment().subtract(18, "years");
									}}
									showToday={false}
									format="DD/MM/YYYY"
									suffixIcon={<CalendarOutlined />}
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Address Information Section */}
					<Divider orientation="left">
						<Text strong>
							<HomeOutlined className="mr-2" />
							Address Information
						</Text>
					</Divider>

					<Row gutter={[16, 0]}>
						<Col xs={24}>
							<Form.Item
								label="Home Address"
								name="home_address"
								rules={[
									{ required: true, message: "Please enter home address!" },
									{ min: 10, message: "Please provide a detailed address!" }
								]}>
								<TextArea
									placeholder="Enter detailed home address"
									size="large"
									style={{ textTransform: "uppercase" }}
									rows={3}
									showCount
									maxLength={200}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={[16, 0]}>
						<Col xs={24} md={12}>
							<Form.Item label="Landmark" name="land_mark">
								<Input
									prefix={<EnvironmentOutlined />}
									placeholder="Enter landmark"
									size="large"
									style={{ textTransform: "uppercase" }}
									maxLength={50}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label="Local Government Area"
								name="lga"
								rules={[{ required: true, message: "Please select LGA!" }]}>
								<Select
									options={lgaOptions}
									placeholder="Select LGA"
									size="large"
									showSearch
									loading={lgasLoading}
									filterOption={(input, option) =>
										option?.label?.toLowerCase().includes(input.toLowerCase())
									}
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Identification Section */}
					<Divider orientation="left">
						<Text strong>
							<IdcardOutlined className="mr-2" />
							Identification
						</Text>
					</Divider>

					<Row gutter={[16, 0]}>
						<Col xs={24} md={12}>
							<Form.Item
								label="PVC Number"
								name="pvc"
								rules={[
									{
										pattern: /^[A-Z0-9]{19}$/,
										message: "PVC must be 19 characters!"
									}
								]}>
								<Input
									prefix={<IdcardOutlined />}
									placeholder="Enter PVC number"
									size="large"
									style={{ textTransform: "uppercase" }}
									maxLength={19}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label="NIN Number"
								name="nin"
								rules={[
									{
										pattern: /^\d{11}$/,
										message: "NIN must be exactly 11 digits!"
									}
								]}>
								<Input
									prefix={<IdcardOutlined />}
									placeholder="Enter NIN"
									size="large"
									maxLength={11}
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Business Information Section */}
					<Divider orientation="left">
						<Text strong>
							<ShopOutlined className="mr-2" />
							Business Information
						</Text>
					</Divider>

					<Row gutter={[16, 0]}>
						<Col xs={24} md={12}>
							<Form.Item
								label="Trade/Skill"
								name="trade_id"
								rules={[{ required: true, message: "Please select a trade!" }]}>
								<Select
									placeholder="Select trade"
									size="large"
									showSearch
									options={tradesData?.trades?.map((trade) => ({
										value: trade.id,
										label: trade.name
									}))}
									filterOption={(input, option) =>
										option?.label?.toLowerCase().includes(input.toLowerCase())
									}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label="Business Location"
								name="business_location"
								rules={[
									{
										required: true,
										message: "Please enter business location!"
									},
									{
										min: 3,
										message: "Business location must be at least 3 characters!"
									}
								]}>
								<Input
									prefix={<EnvironmentOutlined />}
									placeholder="Enter business location (e.g., Sabon Gari Market)"
									size="large"
									style={{ textTransform: "uppercase" }}
									maxLength={100}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={[16, 0]}>
						<Col xs={24} md={12}>
							<Form.Item label="Trade Location" name="trade_location">
								<Input
									prefix={<EnvironmentOutlined />}
									placeholder="Enter trade location (e.g., Kantin Kwari Market)"
									size="large"
									style={{ textTransform: "uppercase" }}
									maxLength={100}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label="Operating Capital (₦)"
								name="operating_capital"
								rules={[
									{
										validator: (_, value) => {
											if (value) {
												// Remove currency symbols and commas for validation
												const cleanValue = value
													.toString()
													.replace(/[₦,\s]/g, "");

												// Check if it's a valid number
												if (isNaN(cleanValue) || cleanValue === "") {
													return Promise.reject(
														"Please enter a valid currency amount"
													);
												}

												// Check if it's positive
												if (parseFloat(cleanValue) < 0) {
													return Promise.reject(
														"Operating capital cannot be negative"
													);
												}

												// Check for reasonable maximum (e.g., 1 billion naira)
												if (parseFloat(cleanValue) > 1000000000) {
													return Promise.reject(
														"Please enter a reasonable amount"
													);
												}
											}
											return Promise.resolve();
										}
									}
								]}>
								<Input
									prefix="₦"
									placeholder="Enter operating capital (e.g., 50000)"
									size="large"
									onChange={(e) => {
										let value = e.target.value.replace(/[^0-9.]/g, "");
										if (value) {
											// Format with thousand separators
											const formatted = parseFloat(value).toLocaleString();
											form.setFieldValue("operating_capital", formatted);
										}
									}}
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Action Buttons */}
					<div className="text-center mt-8">
						<Space size="large">
							<Button
								onClick={props?.closeModal}
								size="large"
								style={{ borderRadius: "8px", minWidth: "120px" }}>
								Cancel
							</Button>
							<Button
								type="primary"
								htmlType="submit"
								loading={loading}
								size="large"
								style={{ borderRadius: "8px", minWidth: "120px" }}
								icon={<SaveOutlined />}>
								Save Changes
							</Button>
						</Space>
					</div>
				</Form>
			</Card>
		</>
	);
};

export default EditTraderProfile;
