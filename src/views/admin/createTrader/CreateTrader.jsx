import React, { useContext, useEffect, useState } from "react";
import CardSession from "../../../components/Cards/Card";
import CardProfile from "../../../components/Cards/CardProfileTabs";
import { useCookies } from "react-cookie";
import { useMutation, useQuery } from "@apollo/client";
import {
	GET_TRADERS_LIST,
	GET_TRADES,
	GET_LOCATIONS
} from "../../../gql/queries/queries";
import CustomModal from "../../../components/Modals/CustomModal";
import Loading from "../../../components/Loading/Loading";
import { CREATE_TRADE, CREATE_TRADER } from "../../../gql/mutations/mutations";
import context from "../../../context/context";
import { LOADING } from "../../../reducer/reducer-types";
import { Button, DatePicker, Form, Input, Modal, Select, Table } from "antd";
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

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

export const CreateTrader = () => {
	const { state, dispatch } = useContext(context);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [showModal, setShowModal] = useState(false);
	const [trade, setTrade] = useState("");
	const [dob, setDob] = useState();
	const [locationList, setLocationList] = useState([]);
	const navigate = useNavigate();

	// const [tradesList, setTradesList] = useState([]);
	const [createTrader] = useMutation(CREATE_TRADER);

	const openModal = () => {
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
	};

	const { data: tradesData } = useQuery(GET_TRADES, {
		fetchPolicy: "cache-and-network"
	});

	const { data: locationData } = useQuery(GET_LOCATIONS, {
		fetchPolicy: "cache-and-network"
	});

	const handleCreateTrader = async (value) => {
		if (!value) return toast.error("Please fill in all required fields!");

		const variables = {
			surname: value?.surname.toUpperCase(),
			otherNames: value?.other_names.toUpperCase(),
			phone: value.phone,
			email: value.email.toLowerCase(),
			gender: value.gender,
			dob: dob,
			lga: value.lga.toUpperCase(),
			home_address: value.home_address.toUpperCase(),
			land_mark: value.land_mark.toUpperCase(),
			pvc: value.pvc.toUpperCase(),
			nin: value.nin.toUpperCase(),
			operating_capital: value.operating_capital.toUpperCase(),
			location_uuid: value.location_uuid,
			trade_uuid: value.trade_uuid
		};

		dispatch({ type: LOADING, payload: true });

		const result = await createTrader({ variables });

		if (result.data?.createTrader) {
			toast.success("Trader created successfully!");
			navigate(`/admin/trader/?id=${result.data.createTrader.uuid}`);
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

	useEffect(() => {
		setLocationList(
			locationData?.locations?.map((location) => {
				return {
					value: location.uuid,
					label: location.title
				};
			})
		);
	}, [locationData]);

	const lgas = [
		{ value: "KNO", label: "KANO" },
		{ value: "AJG", label: "AJINGI" },
		{ value: "FGE", label: "FAGE" },
		{ value: "DLA", label: "DALA" },
		{ value: "KRY", label: "KARAYE" },
		{ value: "KBY", label: "KIBIYA" },
		{ value: "KNC", label: "KUNCHI" },
		{ value: "MDO", label: "MADOBI" },
		{ value: "MKD", label: "MAKODA" },
		{ value: "MJB", label: "MINJIBIR" },
		{ value: "RNO", label: "RANO" },
		{ value: "TRN", label: "TARAUNI" },
		{ value: "TDW", label: "TUDUN WADA" },
		{ value: "BKR", label: "BUNKURE" },
		{ value: "DWK", label: "DAWAKI" },
		{ value: "DBT", label: "DANBATTA" },
		{ value: "DGT", label: "DOGO TUKU" },
		{ value: "GBA", label: "GABASAWA" },
		{ value: "GRK", label: "GARKO" },
		{ value: "GRM", label: "GARUN MALAM" },
		{ value: "GYA", label: "GAYA" },
		{ value: "GBR", label: "GOBIRAWA" },
		{ value: "GWL", label: "GWALE" },
		{ value: "KBO", label: "KABO" },
		{ value: "KBL", label: "KABULI" },
		{ value: "KMC", label: "KANO MUNICIPAL" },
		{ value: "KRS", label: "KARASUWA" },
		{ value: "KRU", label: "KARU" },
		{ value: "KIR", label: "KIRU" },
		{ value: "KBT", label: "KUMBOTSO" },
		{ value: "KNC", label: "KUNCHI" },
		{ value: "KUR", label: "KURA" },
		{ value: "MDO", label: "MADOBI" },
		{ value: "MKD", label: "MAKODA" },
		{ value: "NSS", label: "NASSARAWA" },
		{ value: "RNO", label: "RANO" },
		{ value: "RMG", label: "RIMIN GADO" },
		{ value: "SHN", label: "SHANONO" },
		{ value: "SML", label: "SUMAILA" },
		{ value: "TKI", label: "TAKAI" },
		{ value: "TRN", label: "TARAUNI" },
		{ value: "WDL", label: "WUDIL" },
		{ value: "TFA", label: "TOFA" },
		{ value: "UGG", label: "UNGOGGO" },
		{ value: "WRW", label: "WARAWA" }
	];

	const handleFilterLocation = (lga) => {
		const filteredLocations = locationData?.locations?.filter((lgaItem) => {
			return lgaItem.lga.toLowerCase() === lga.toLowerCase();
		});

		setLocationList(
			filteredLocations.map((location) => {
				return {
					value: location.uuid,
					label: location.title
				};
			})
		);
	};

	return (
		<>
			<ToastContainer />
			{state.loading && <Loading />}
			{/* {loading && <Loading />} */}
			{/* {showModal && (
				<Modal
					title={`Add New Trader`}
					open={showModal}
					onCancel={closeModal}
					width={1000}
					footer={false}
					maskClosable={false}
					destroyOnHidden={true}>
					
				</Modal>
			)} */}
			<div className="flex flex-wrap">
				<div className="w-full md:w-12/12 px-4 min-h-screen">
					<CardSession title="Enroll Traders">
						<div className="block overflow-x-auto w-full mt-6">
							<div style={{ minWidth: "900px" }}>
								<Form
									onFinish={handleCreateTrader}
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
										name="dob"
										rules={[
											{
												required: true,
												message: "Please input date of birth!"
											}
										]}>
										<DatePicker
											onChange={(_, dateValue) => setDob(dateValue)}
										/>
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
										label="LGA"
										name="lga"
										rules={[
											{
												required: true,
												message: "Please input Location LGA!"
											}
										]}>
										<Select
											options={lgas}
											placeholder="Select Location LGA"
											showSearch
											onChange={handleFilterLocation}
											filterOption={(input, option) =>
												(option?.label ?? "")
													.toLowerCase()
													.includes(input.toLowerCase())
											}
										/>
									</Form.Item>

									<Form.Item
										label="Select Location"
										name="location_uuid"
										rules={[
											{
												required: true,
												message: "Please select Location!"
											}
										]}>
										<Select
											options={locationList}
											placeholder="Select Location"
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
										<Select
											options={tradesList}
											placeholder="Select Trade"
											showSearch
											filterOption={(input, option) =>
												(option?.label ?? "")
													.toLowerCase()
													.includes(input.toLowerCase())
											}
										/>
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
							</div>
						</div>
					</CardSession>
				</div>
				{/* <div className="w-full lg:w-4/12 px-4 hidden">
					<CardProfile />
				</div> */}
			</div>
		</>
	);
};
export default CreateTrader;
