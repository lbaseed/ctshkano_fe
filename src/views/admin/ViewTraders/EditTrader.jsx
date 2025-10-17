import React, { useContext, useEffect, useState } from "react";
import CardSession from "../../../components/Cards/Card";
import CardProfile from "../../../components/Cards/CardProfileTabs";
import { useCookies } from "react-cookie";
import { useMutation, useQuery } from "@apollo/client";
import { GET_TRADES, GET_LOCATIONS } from "../../../gql/queries/queries";
import Loading from "../../../components/Loading/Loading";
import { UPDATE_TRADER } from "../../../gql/mutations/mutations";
import context from "../../../context/context";
import { LOADING } from "../../../reducer/reducer-types";
import { Button, DatePicker, Form, Input, Select } from "antd";
import { ToastContainer, toast } from "react-toastify";

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

export const EditTrader = (props) => {
	const { state, dispatch } = useContext(context);

	// const [tradesList, setTradesList] = useState([]);
	const [updateTrader] = useMutation(UPDATE_TRADER);

	const { data: tradesData } = useQuery(GET_TRADES, {
		fetchPolicy: "cache-and-network"
	});

	const { data: locationData } = useQuery(GET_LOCATIONS, {
		fetchPolicy: "cache-and-network"
	});

	const handleUpdateTrader = async (value) => {
		const variables = {
			surname: value?.surname.toUpperCase(),
			otherNames: value?.other_names.toUpperCase(),
			phone: value.phone.trim(),
			email: value.email.toLowerCase(),
			gender: value.gender,
			dob: value.edit_dob,
			home_address: value.home_address.toUpperCase(),
			land_mark: value.land_mark.toUpperCase(),
			pvc: value.pvc.toUpperCase(),
			nin: value.nin.toUpperCase(),
			operating_capital: value.operating_capital.toUpperCase(),
			location_uuid: value.location_uuid,
			trade_uuid: value.trade_uuid
		};
		dispatch({ type: LOADING, payload: true });
		const result = await updateTrader({ variables });

		if (result.data?.updateTrader) {
			toast.success("Trader created successfully!");
			navigate(`/admin/trader/?id=${result.data.updateTrader.uuid}`);
		}
		dispatch({ type: LOADING, payload: false });
		closeModal();
	};

	const updateTableData = (trader, action) => {
		if (action === "delete") {
			setTraders((traders) =>
				traders.filter((item) => {
					return item.uuid !== trader.uuid;
				})
			);
		}

		if (action === "update") {
			const newState = traders.map((item) => {
				if (item.uuid === trader.uuid) {
					return trader;
				}

				return item;
			});

			setTraders(newState);
		}
	};

	const tradesList = tradesData?.trades?.map((trade) => {
		return {
			value: trade.uuid,
			label: trade.name
		};
	});

	const locationsList = locationData?.locations?.map((location) => {
		return {
			value: location.uuid,
			label: location.title
		};
	});
console.log(props?.trader)
	return (
		<>
			<ToastContainer />
			{state.loading && <Loading />}
			{/* {loading && <Loading />} */}

			<Form
				onFinish={handleUpdateTrader}
				initialValues={props?.trader}
				{...formItemLayout}
				variant="outlined"
				style={{
					maxWidth: "100%"
				}}>
				<Form.Item
					label="Surname"
					name="surname"
					rules={[
						{
							required: true,
							message: "Please input surname!"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				<Form.Item
					label="Other Names"
					name="other_names"
					rules={[
						{
							required: true,
							message: "Please input other names!"
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

				{/* gender */}
				<Form.Item
					label="Select Gender"
					name="gender"
					rules={[
						{
							required: true,
							message: "Please select gender!"
						}
					]}>
					<Select
						options={[
							{ value: "MALE", label: "Male" },
							{ value: "FEMALE", label: "Female" }
						]}
						placeholder="Select Gender"
					/>
				</Form.Item>

				{/* date of birth */}
				<Form.Item
					label="Pick Date of Birth"
					name="edit_dob"
					rules={[
						{
							required: true,
							message: "Please input date of birth!"
						}
					]}>
					<DatePicker />
				</Form.Item>

				<Form.Item
					label="Home Address"
					name="home_address"
					rules={[
						{
							required: true,
							message: "Please input home address"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				<Form.Item
					label="Land Mark"
					name="land_mark"
					rules={[
						{
							required: false,
							message: "Please input land mark"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				<Form.Item
					label="PVC Number"
					name="pvc"
					rules={[
						{
							required: false,
							message: "Please input PVC number!"
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
					label="Operating Capital"
					name="operating_capital"
					rules={[
						{
							required: false,
							message: "Please input operating capital!"
						}
					]}>
					<Input style={{ textTransform: "uppercase" }} />
				</Form.Item>

				<Form.Item
					label="LGA of Business Operations"
					name="location_uuid"
					rules={[
						{
							required: true,
							message: "Please select LGA of business operations!"
						}
					]}>
					<Select
						options={locationsList}
						placeholder="Select LGA of Business Operations"
					/>
				</Form.Item>

				<Form.Item
					label="Select Trade"
					name="trade_uuid"
					rules={[
						{
							required: true,
							message: "Please select trade!"
						}
					]}>
					<Select options={tradesList} placeholder="Select Trade" />
				</Form.Item>

				<Form.Item
					wrapperCol={{
						offset: 6,
						span: 16
					}}>
					<Button type="primary" htmlType="submit">
						Register Trader
					</Button>
				</Form.Item>
			</Form>
		</>
	);
};
export default EditTrader;
