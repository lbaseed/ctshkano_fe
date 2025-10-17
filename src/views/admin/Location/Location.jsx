import React, { useContext, useEffect, useState } from "react";
import CardSession from "../../../components/Cards/Card";
import CardProfile from "../../../components/Cards/CardProfileTabs";
import { useCookies } from "react-cookie";
import { useMutation, useQuery } from "@apollo/client";
import { GET_LOCATIONS } from "../../../gql/queries/queries";
import Loading from "../../../components/Loading/Loading";
import { CREATE_LOCATION } from "../../../gql/mutations/mutations";
import context from "../../../context/context";
import { LOADING } from "../../../reducer/reducer-types";
import { Button, Form, Input, Modal, Select, Table } from "antd";
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

export const Location = () => {
	const { state, dispatch } = useContext(context);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [showModal, setShowModal] = useState(false);
	const [locations, setLocations] = useState([]);
	const [createLocation, { createloading, createError }] =
		useMutation(CREATE_LOCATION);

	const openModal = () => {
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
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
			title: value.lga.trim().toUpperCase(),
			description: value?.description
				? value.description.trim().toUpperCase()
				: "",
			lga: value.lga.trim().toUpperCase(),
			type: value.type
		};
		dispatch({ type: LOADING, payload: true });
		const result = await createLocation({ variables });

		if (result.data) {
			setLocations([result?.data?.createLocation, ...locations]);
			toast.success("Trade created successfully!");
		}
		dispatch({ type: LOADING, payload: false });
		closeModal();
	};

	const updateTableData = (trade, action) => {
		if (action === "delete") {
			setLocations((trades) =>
				trades.filter((item) => {
					return item.uuid !== trade.uuid;
				})
			);
		}

		if (action === "update") {
			const newState = locations.map((item) => {
				if (item.uuid === trade.uuid) {
					return trade;
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
			render: (_, record) => {
				return null;
			}
		}
	];

	// array of Local Government Areas (LGAs) for Kano State with values as lga codes

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
						onFinish={handleCreateLocation}
						{...formItemLayout}
						variant="outlined"
						style={{
							maxWidth: "100%"
						}}>
						{/* <Form.Item
							label="Location Title"
							name="title"
							rules={[
								{
									required: true,
									message: "Please input trade title!"
								}
							]}>
							<Input style={{ textTransform: "uppercase" }} />
						</Form.Item> */}

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
								options={lgas}
								placeholder="Select Location LGA"
								showSearch
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
			<div className="flex flex-wrap">
				<div className="w-full md:w-12/12 px-4 min-h-screen">
					<CardSession title="Manage Trades" addNew={openModal}>
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
