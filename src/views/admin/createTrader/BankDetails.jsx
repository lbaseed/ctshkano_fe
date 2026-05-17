import React, { useState, useEffect } from "react";
import {
	Button,
	Form,
	Input,
	Select,
	Card,
	Row,
	Col,
	Typography,
	Space,
	Divider,
	Alert
} from "antd";
import {
	BankOutlined,
	CreditCardOutlined,
	UserOutlined,
	CheckCircleOutlined,
	SafetyOutlined
} from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { UPDATE_TRADER } from "../../../gql/mutations/mutations";
import { toast, ToastContainer } from "react-toastify";

const { Title, Text } = Typography;

const BankDetails = (props) => {
	const [form] = Form.useForm();
	const [updateTrader, { loading }] = useMutation(UPDATE_TRADER);
	const [selectedBank, setSelectedBank] = useState(null);

	// Format account number
	const formatAccountNumber = (value) => {
		if (!value) return value;
		// Remove all non-numeric characters
		const accountNumber = value.replace(/[^\d]/g, "");
		// Limit to 10 digits (standard Nigerian account number length)
		return accountNumber.slice(0, 10);
	};

	// Verify account number format
	const validateAccountNumber = (_, value) => {
		if (!value) return Promise.resolve();
		if (value.length !== 10) {
			return Promise.reject(
				new Error("Account number must be exactly 10 digits!")
			);
		}
		return Promise.resolve();
	};

	// Handle form submission
	const handleUpdateTrader = async (values) => {
		if (!props?.trader?.uuid) return toast.error("Trader ID is required");

		try {
			const variables = {
				uuid: props?.trader?.uuid,
				bank_details: JSON.stringify({
					bank_name: values.bank_name.trim().toUpperCase(),
					account_number: values.account_number.trim(),
					account_name: values.account_name.trim().toUpperCase(),
					bank_code: selectedBank?.value || values.bank_name
				})
			};

			const result = await updateTrader({ variables });

			if (result?.data?.updateTrader) {
				toast.success("Bank details saved successfully!");
				form.resetFields();
				props?.closeModal();
				window.location.reload();
			} else {
				toast.error("Failed to save bank details. Please try again.");
			}
		} catch (error) {
			console.error("Error updating trader:", error);
			toast.error("Failed to save bank details. Please try again.");
		}
	};

	// Nigerian banks list
	const nigerianBanks = [
		{ value: "ACCESS", label: "Access Bank" },
		{ value: "CITIBANK", label: "Citibank Nigeria" },
		{ value: "ECOBANK", label: "Ecobank Nigeria" },
		{ value: "FIDELITY", label: "Fidelity Bank" },
		{ value: "FCMB", label: "First City Monument Bank" },
		{ value: "FBN", label: "First Bank of Nigeria" },
		{ value: "GTB", label: "Guaranty Trust Bank" },
		{ value: "HERITAGE", label: "Heritage Banking Company" },
		{ value: "KEYSTONE", label: "Keystone Bank" },
		{ value: "POLARIS", label: "Polaris Bank" },
		{ value: "PROVIDUS", label: "Providus Bank" },
		{ value: "STANBIC", label: "Stanbic IBTC Bank" },
		{ value: "STANDARD", label: "Standard Chartered Bank" },
		{ value: "STERLING", label: "Sterling Bank" },
		{ value: "UBA", label: "United Bank for Africa" },
		{ value: "UBN", label: "Union Bank of Nigeria" },
		{ value: "UNITY", label: "Unity Bank" },
		{ value: "WEMA", label: "Wema Bank" },
		{ value: "ZENITH", label: "Zenith Bank" },
		{ value: "JAIZ", label: "Jaiz Bank" },
		{ value: "SUNTRUST", label: "SunTrust Bank" },
		{ value: "TITAN", label: "Titan Trust Bank" },
		{ value: "PARALLEX", label: "Parallex Bank" },
		{ value: "PREMIUM", label: "Premium Trust Bank" }
	].sort((a, b) => a.label.localeCompare(b.label));

	// Pre-fill form if bank details exist
	useEffect(() => {
		if (props?.trader?.bank_details) {
			try {
				const bankDetails = JSON.parse(props.trader.bank_details);
				form.setFieldsValue({
					bank_name: bankDetails.bank_name,
					account_number: bankDetails.account_number,
					account_name: bankDetails.account_name
				});
				setSelectedBank(
					nigerianBanks.find(
						(bank) =>
							bank.value === bankDetails.bank_code ||
							bank.label.toUpperCase() === bankDetails.bank_name
					)
				);
			} catch (error) {
				console.error("Error parsing bank details:", error);
			}
		}
	}, [props?.trader?.bank_details, form]);

	return (
		<>
			<ToastContainer />
			<Card style={{ borderRadius: "12px" }} bodyStyle={{ padding: "24px" }}>
				<div className="mb-6">
					<Title level={4} className="mb-2">
						<BankOutlined className="mr-2" />
						Bank Account Information
					</Title>
					<Text type="secondary">
						Add bank account details for {props?.trader?.surname}{" "}
						{props?.trader?.other_names}
					</Text>
				</div>

				<Alert
					message="Security Notice"
					description="Your bank information is encrypted and stored securely. Only authorized personnel can access this information."
					type="info"
					icon={<SafetyOutlined />}
					className="mb-6"
					showIcon
				/>

				<Form
					form={form}
					onFinish={handleUpdateTrader}
					layout="vertical"
					style={{ maxWidth: "100%" }}
					scrollToFirstError>
					<Row gutter={[16, 0]}>
						<Col xs={24}>
							<Form.Item
								label="Bank Name"
								name="bank_name"
								rules={[{ required: true, message: "Please select a bank!" }]}>
								<Select
									placeholder="Select your bank"
									size="large"
									showSearch
									options={nigerianBanks}
									filterOption={(input, option) =>
										option?.label?.toLowerCase().includes(input.toLowerCase())
									}
									onChange={(value, option) => {
										setSelectedBank(option);
										form.setFieldsValue({ bank_name: option.label });
									}}
									suffixIcon={<BankOutlined />}
								/>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={[16, 0]}>
						<Col xs={24} md={12}>
							<Form.Item
								label="Account Number"
								name="account_number"
								rules={[
									{ required: true, message: "Please enter account number!" },
									{ validator: validateAccountNumber }
								]}>
								<Input
									prefix={<CreditCardOutlined />}
									placeholder="1234567890"
									size="large"
									onChange={(e) => {
										const formatted = formatAccountNumber(e.target.value);
										form.setFieldsValue({ account_number: formatted });
									}}
									maxLength={10}
									showCount
								/>
							</Form.Item>
						</Col>

						<Col xs={24} md={12}>
							<Form.Item
								label="Account Name"
								name="account_name"
								rules={[
									{ required: true, message: "Please enter account name!" },
									{
										min: 2,
										message: "Account name must be at least 2 characters!"
									}
								]}>
								<Input
									prefix={<UserOutlined />}
									placeholder="Account holder name"
									size="large"
									style={{ textTransform: "uppercase" }}
									showCount
									maxLength={50}
								/>
							</Form.Item>
						</Col>
					</Row>

					{/* Account Verification Notice */}
					<Alert
						message="Account Verification"
						description="Please ensure the account name matches exactly with your bank records. This information will be used for future transactions."
						type="warning"
						className="mb-6"
						showIcon
					/>

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
								icon={<CheckCircleOutlined />}>
								Save Bank Details
							</Button>
						</Space>
					</div>
				</Form>
			</Card>
		</>
	);
};

export default BankDetails;
