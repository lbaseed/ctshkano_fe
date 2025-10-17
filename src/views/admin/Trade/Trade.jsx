import React, { useContext, useEffect, useState } from "react";
import CardSession from "../../../components/Cards/Card";
import CardProfile from "../../../components/Cards/CardProfileTabs";
import { useCookies } from "react-cookie";
import { useMutation, useQuery } from "@apollo/client";
import { GET_TRADES } from "../../../gql/queries/queries";
import CustomModal from "../../../components/Modals/CustomModal";
import Loading from "../../../components/Loading/Loading";
import { CREATE_TRADE } from "../../../gql/mutations/mutations";
import context from "../../../context/context";
import { LOADING } from "../../../reducer/reducer-types";
import { Button, Form, Input, Modal, Select, Table } from "antd";
import { ToastContainer, toast } from "react-toastify";

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

export const Trade = () => {
	const { state, dispatch } = useContext(context);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [showModal, setShowModal] = useState(false);
	const [trade, setTrade] = useState("");
	const [trades, setTrades] = useState([]);
	const [createTrade, { createloading, createError }] =
		useMutation(CREATE_TRADE);

	const openModal = () => {
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
	};

	const { loading, error, data } = useQuery(GET_TRADES, {
		fetchPolicy: "cache-and-network"
	});

	useEffect(() => {
		if (data) {
			setTrades(data?.trades);
		}
	}, [loading]);

	const handleCreateTrade = async (value) => {
		if (!value) return toast.error("Please fill in all required fields!");

		const variables = {
			name: value.name.trim().toUpperCase(),
			businessNature: value.business_nature
		};
		dispatch({ type: LOADING, payload: true });
		const result = await createTrade({ variables });

		if (result.data) {
			// const newState = trades.map((item) => {
			// 	return item;
			// });

			setTrades([result.data.createTrade, ...trades]);
			toast.success("Trade created successfully!");
		}
		dispatch({ type: LOADING, payload: false });
		closeModal();
	};

	const updateTableData = (trade, action) => {
		if (action === "delete") {
			setTrades((trades) =>
				trades.filter((item) => {
					return item.uuid !== trade.uuid;
				})
			);
		}

		if (action === "update") {
			const newState = trades.map((item) => {
				if (item.uuid === trade.uuid) {
					return trade;
				}

				return item;
			});

			setTrades(newState);
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
			title: "Trade Title",
			dataIndex: "name",
			key: "name"
		},
		{
			title: "Total Traders",
			dataIndex: "countTraders",
			key: "countTraders"
		},
		{
			title: "Business Nature",
			dataIndex: "business_nature",
			key: "business_nature"
		},
		{
			title: "Actions",
			dataIndex: "",
			render: (_, record) => {
				return null;
			}
		}
	];

	const businessNatures = [
		{ value: "MANUFACTURING", label: "Manufacturing" },
		{ value: "RETAIL", label: "Retail" },
		{ value: "TRADE", label: "Trade" }
	];

	const category = [
		{ value: "ARTISAN", label: "Artisan" },
		{ value: "BODY CARE & FASHION", label: "Bodycare and Fashion" },
		{ value: "RETAIL", label: "Retail" },
		{ value: "FOOD & CONFECTIONARIES", label: "Food and Confectioneries" },
		{
			value: "TAILORING/SEWING, SHOE MAKING & FABRICS",
			label: "Tailoring/Sewing, Shoe Making, and Fabrics"
		},
		{ value: "MECHANICS & REPAIRS", label: "Mechanics and Repairs" },
		{
			value: "PRODUCTION AND SERVICES",
			label: "Production and Services (Others)"
		},
		{ value: "OTHERS", label: "Others" }
	];
	return (
		<>
			<ToastContainer />
			{state.loading && <Loading />}
			{/* {loading && <Loading />} */}
			{showModal && (
				<Modal
					title={`Add New Trade`}
					open={showModal}
					onCancel={closeModal}
					width={1000}
					footer={false}
					maskClosable={false}
					destroyOnHidden={true}>
					<Form
						onFinish={handleCreateTrade}
						{...formItemLayout}
						variant="outlined"
						style={{
							maxWidth: "100%"
						}}>
						<Form.Item
							label="Trade Title"
							name="name"
							rules={[
								{
									required: true,
									message: "Please input trade title!"
								}
							]}>
							<Input style={{ textTransform: "uppercase" }} />
						</Form.Item>

						<Form.Item
							label="Business Category"
							name="category"
							rules={[
								{
									required: true,
									message: "Please select business category!"
								}
							]}>
							<Select
								options={category}
								placeholder="Select Category of Business"
							/>
						</Form.Item>

						<Form.Item
							label="Business Nature"
							name="business_nature"
							rules={[
								{
									required: true,
									message: "Please select business Nature!"
								}
							]}>
							<Select
								options={businessNatures}
								placeholder="Select Nature of Business"
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
								<Table dataSource={trades} columns={columns} />
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
export default Trade;
