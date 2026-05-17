import React from "react";
import {
	Button,
	DatePicker,
	Form,
	Input,
	Modal,
	Select,
	Table,
	Card,
	Row,
	Col,
	Typography,
	Space,
	Divider
} from "antd";
import {
	UserOutlined,
	PhoneOutlined,
	MailOutlined,
	CalendarOutlined,
	HomeOutlined,
	IdcardOutlined,
	EnvironmentOutlined,
	GlobalOutlined,
	BankOutlined
} from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { CREATE_GUARANTOR } from "../../../gql/mutations/mutations";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";

const { Title, Text } = Typography;
const { TextArea } = Input;

const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 8 }
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 16 }
	}
};

const Guarantor = (props) => {
	const [form] = Form.useForm();
	const [createGuarantor, { loading }] = useMutation(CREATE_GUARANTOR);

	// Phone number formatter
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
		)}-${phoneNumber.slice(6, 10)}`;
	};

	// NIN formatter
	const formatNIN = (value) => {
		if (!value) return value;
		const nin = value.replace(/[^\d]/g, "");
		return nin.slice(0, 11); // NIN is 11 digits
	};

	const handleCreateGuarantor = async (values) => {
		try {
			const variables = {
				name: values.name.trim().toUpperCase(),
				email: values.email ? values.email.trim().toLowerCase() : null,
				phone: values.phone.replace(/[^\d]/g, "").trim(), // Remove formatting for storage
				address: values.address ? values.address.trim().toUpperCase() : null,
				city: values.city ? values.city.trim().toUpperCase() : null,
				state: values.state ? values.state.trim().toUpperCase() : null,
				country: "NIGERIA",
				occupation: values.occupation
					? values.occupation.trim().toUpperCase()
					: null,
				dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
				nin: values.nin ? values.nin.replace(/[^\d]/g, "").trim() : null,
				trader_id: props?.trader?.id
			};

			const result = await createGuarantor({ variables });

			if (result?.data?.createGuarantor) {
				toast.success("Reference/Guarantor added successfully!");
				form.resetFields();
				props?.closeModal();
			} else {
				toast.error("Failed to add reference. Please try again.");
			}
		} catch (error) {
			console.error("Error creating guarantor:", error);
			toast.error("Failed to add reference. Please try again.");
		}
	};

	const statesList = [
		{ value: "Lagos", label: "Lagos" },
		{ value: "Oyo", label: "Oyo" },
		{ value: "Abuja", label: "Abuja" },
		{ value: "Rivers", label: "Rivers" },
		{ value: "Kano", label: "Kano" },
		{ value: "Kaduna", label: "Kaduna" },
		{ value: "Enugu", label: "Enugu" },
		{ value: "Delta", label: "Delta" },
		{ value: "Akwa Ibom", label: "Akwa Ibom" },
		{ value: "Cross River", label: "Cross River" },
		{ value: "Edo", label: "Edo" },
		{ value: "Anambra", label: "Anambra" },
		{ value: "Imo", label: "Imo" },
		{ value: "Borno", label: "Borno" },
		{ value: "Yobe", label: "Yobe" },
		{ value: "Kogi", label: "Kogi" },
		{ value: "Benue", label: "Benue" },
		{ value: "Niger", label: "Niger" },
		{ value: "Osun", label: "Osun" },
		{ value: "Ekiti", label: "Ekiti" },
		{ value: "Ondo", label: "Ondo" },
		{ value: "Abia", label: "Abia" },
		{ value: "Sokoto", label: "Sokoto" },
		{ value: "Kebbi", label: "Kebbi" },
		{ value: "Zamfara", label: "Zamfara" },
		{ value: "Taraba", label: "Taraba" },
		{ value: "Adamawa", label: "Adamawa" },
		{ value: "Bauchi", label: "Bauchi" },
		{ value: "Gombe", label: "Gombe" },
		{ value: "Jigawa", label: "Jigawa" },
		{ value: "Plateau", label: "Plateau" },
		{ value: "Ebonyi", label: "Ebonyi" },
		{ value: "FCT", label: "Federal Capital Territory (FCT)" }
	];

	return (
		<>
			<ToastContainer />
			<Card style={{ borderRadius: "12px" }} bodyStyle={{ padding: "24px" }}>
				<div className="mb-6">
					<Title level={4} className="mb-2">
						<UserOutlined className="mr-2" />
						Add Reference/Guarantor Information
					</Title>
					<Text type="secondary">
						Please provide details of a person who can serve as a reference for
						this trader.
					</Text>
				</div>

				<Form
					form={form}
					onFinish={handleCreateGuarantor}
					{...formItemLayout}
					variant="outlined"
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
								label="Full Name"
								name="name"
								rules={[
									{ required: true, message: "Please enter full name!" },
									{ min: 2, message: "Name must be at least 2 characters!" },
									{
										pattern: /^[a-zA-Z\s]+$/,
										message: "Name should only contain letters!"
									}
								]}>
								<Input
									prefix={<UserOutlined />}
									placeholder="Enter full name"
									size="large"
									style={{ textTransform: "uppercase" }}
									showCount
									maxLength={50}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label="Phone Number"
								name="phone"
								rules={[
									{ required: true, message: "Please enter phone number!" },
									{
										pattern: /^[\d-]+$/,
										message: "Please enter a valid phone number!"
									},
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
					</Row>

					<Row gutter={[16, 0]}>
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

						<Col xs={24} md={12}>
							<Form.Item
								label="Date of Birth"
								name="dob"
								rules={[
									{
										validator: (_, value) => {
											if (
												value &&
												value.isAfter(moment().subtract(18, "years"))
											) {
												return Promise.reject(
													new Error("Reference must be at least 18 years old!")
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

					<Row gutter={[16, 0]}>
						<Col xs={24} md={12}>
							<Form.Item
								label="National Identity Number (NIN)"
								name="nin"
								rules={[
									{
										pattern: /^\d{11}$/,
										message: "NIN must be exactly 11 digits!"
									}
								]}>
								<Input
									prefix={<IdcardOutlined />}
									placeholder="12345678901"
									size="large"
									onChange={(e) => {
										const formatted = formatNIN(e.target.value);
										form.setFieldsValue({ nin: formatted });
									}}
									maxLength={11}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item label="Occupation" name="occupation">
								<Input
									prefix={<BankOutlined />}
									placeholder="e.g., Teacher, Trader, etc."
									size="large"
									style={{ textTransform: "uppercase" }}
									maxLength={30}
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
								name="address"
								rules={[
									{ required: true, message: "Please enter home address!" },
									{ min: 10, message: "Please provide a detailed address!" }
								]}>
								<TextArea
									placeholder="Enter detailed home address including street, area, landmarks"
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
							<Form.Item label="City of Residence" name="city">
								<Input
									prefix={<EnvironmentOutlined />}
									placeholder="Enter city"
									size="large"
									style={{ textTransform: "uppercase" }}
									maxLength={30}
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item label="State of Residence" name="state">
								<Select
									options={statesList}
									placeholder="Select state"
									size="large"
									showSearch
									filterOption={(input, option) =>
										option?.label?.toLowerCase().includes(input.toLowerCase())
									}
									suffixIcon={<GlobalOutlined />}
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Action Buttons */}
					<div className="mt-8 text-center">
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
								icon={<UserOutlined />}>
								Add Reference
							</Button>
						</Space>
					</div>
				</Form>
			</Card>
		</>
	);
};

export default Guarantor;
