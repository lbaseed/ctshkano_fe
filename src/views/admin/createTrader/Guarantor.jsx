import React from "react";
import { Button, DatePicker, Form, Input, Modal, Select, Table } from "antd";
import { useMutation } from "@apollo/client";
import { CREATE_GUARANTOR } from "../../../gql/mutations/mutations";
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

const Guarantor = (props) => {
  const [form] = Form.useForm();

  const [createGuarantor] = useMutation(CREATE_GUARANTOR)

  const handleCreateGuarantor =async (values) => {

    const variables = {
      name: values.name.trim().toUpperCase(),
      email: values.email ? values.email.trim().toLowerCase() : null,
      phone: values.phone.trim(),
      address: values.address ? values.address.trim().toUpperCase() : null,
      city: values.city ? values.city.trim().toUpperCase() : null,
      state: values.state ? values.state.trim().toUpperCase() : null,
      country: "Nigeria", // Assuming country is fixed as Nigeria
      occupation: values.occupation ? values.occupation.trim().toUpperCase() : null,
      dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      nin: values.nin ? values.nin.trim().toUpperCase() : null,
      trader_id: props?.trader?.id, // Assuming traderId is passed as a prop
    }
      try {
        
        const result = await createGuarantor({variables})

        if(result?.data?.createGuarantor) {
          toast.success("Guarantor created successfully!");
          form.resetFields();
          props?.closeModal();
        }
        else {
          toast.error("Failed to create guarantor. Please try again.");
        }
      } catch (error) {
        console.error("Error creating guarantor:", error);
        toast.error("Failed to create guarantor. Please try again.");
      }
  }

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
				onFinish={handleCreateGuarantor}
				{...formItemLayout}
				variant="outlined"
				style={{
					maxWidth: "100%"
				}}>
				<Form.Item
					label="Full Name"
					name="name"
					rules={[
						{
							required: true,
							message: "Please input Full name!"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				<Form.Item
					label="Phone Number"
					name="phone"
					rules={[
						{
							required: true,
							message: "Please input phone number!"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				<Form.Item
					label="Email"
					name="email"
					rules={[
						{
							required: false,
							message: "Please input email"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				{/* date of birth */}
				<Form.Item
					label="Pick Date of Birth"
					name="dob"
					rules={[
						{
							required: false,
							message: "Please input date of birth!"
						}
					]}>
					<DatePicker />
				</Form.Item>

				<Form.Item
					label="Home Address"
					name="address"
					rules={[
						{
							required: true,
							message: "Please input home address"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				<Form.Item
					label="NIN"
					name="nin"
					rules={[
						{
							required: false,
							message: "Please input NIN!"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

        <Form.Item
					label="Occupation"
					name="occupation"
					rules={[
						{
							required: false,
							message: "Please input Occupation!"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				<Form.Item
					label="City of Residence"
					name="city"
					rules={[
						{
							required: false,
							message: "Please select city of residence!"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} placeholder="City" />
				</Form.Item>

				<Form.Item
					label="State of Residence"
					name="state"
					rules={[
						{
							required: false,
							message: "Please select State!"
						}
					]}>
					<Select options={statesList} placeholder="Select State" />
				</Form.Item>

				<Form.Item
					wrapperCol={{
						offset: 6,
						span: 16
					}}>
					<Button type="primary" htmlType="submit">
						Add Reference
					</Button>
				</Form.Item>
			</Form>
		</>
	);
};

export default Guarantor;
