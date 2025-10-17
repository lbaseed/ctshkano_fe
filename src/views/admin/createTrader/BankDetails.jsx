import React from "react";
import { Button, DatePicker, Form, Input, Modal, Select, Table } from "antd";
import { useMutation } from "@apollo/client";
import {
	CREATE_GUARANTOR,
	UPDATE_TRADER
} from "../../../gql/mutations/mutations";
import { toast, ToastContainer } from "react-toastify";

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

const BankDetails = (props) => {
	const [form] = Form.useForm();

	const [updateTrader] = useMutation(UPDATE_TRADER);

	const handleUpdateTrader = async (values) => {
		if (!props?.trader?.uuid) return toast.error("Trader ID is required");

		const variables = {
			uuid: props?.trader?.uuid,
			bank_details: JSON.stringify(values)
		};
		try {
			const result = await updateTrader({ variables });

			if (result?.data?.updateTrader) {
				toast.success("Trader Account Update successful!");
				form.resetFields();
				props?.closeModal();
        window.location.reload();
			} else {
				toast.error("Failed to update details. Please try again.");
			}
		} catch (error) {
			console.error("Error updating trader:", error);
			toast.error("Failed to update Trader. Please try again.");
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
			<Form
				onFinish={handleUpdateTrader}
				{...formItemLayout}
				variant="outlined"
				style={{
					maxWidth: "100%"
				}}>
				<Form.Item
					label="Bank Name"
					name="bank_name"
					rules={[
						{
							required: true,
							message: "Please input Full name!"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				<Form.Item
					label="Account Number"
					name="account_number"
					rules={[
						{
							required: true,
							message: "Please input account number!"
						}
					]}>
					<Input />
				</Form.Item>

				<Form.Item
					label="Account Name"
					name="account_name"
					rules={[
						{
							required: true,
							message: "Please input account name"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				<Form.Item
					wrapperCol={{
						offset: 6,
						span: 16
					}}>
					<Button type="primary" htmlType="submit">
						Save Bank Details
					</Button>
				</Form.Item>
			</Form>
		</>
	);
};

export default BankDetails;
