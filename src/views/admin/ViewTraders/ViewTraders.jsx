import React, { useCallback, useEffect, useState } from "react";
import CardSession from "../../../components/Cards/Card";
import { Button, Input, Modal, Space, Table } from "antd";
import { GET_TRADERS_LIST } from "../../../gql/queries/queries";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import Action from "../../../components/Action/Action";
import EditTrader from "./EditTrader";
import { useCookies } from "react-cookie";
import * as XLSX from "xlsx";

const ViewTraders = () => {
	const [traders, setTraders] = useState([]);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [showModal, setShowModal] = useState(false);

	const [page, setPage] = useState(1);
	const [selectedTrader, setSelectedTrader] = useState();

	const openModal = () => {
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
	};

	const { loading, error, data } = useQuery(GET_TRADERS_LIST, {
		variables: {
			first: 20,
			page: page,
			orderBy: "CREATED_AT",
			direction: "ASC"
		},
		fetchPolicy: "cache-and-network"
	});

	const editItem = (item) => {
		openModal();
		setSelectedTrader(item);
	};

	const viewItem = (item) => {};

	useEffect(() => {
		if (data) {
			setTraders(data?.traderList?.data);
		}
	}, [loading]);

	const columns = [
		{
			title: "S/N",
			dataIndex: "key",
			render: (_, __, index) => {
				return index + 1;
			}
		},
		{
			title: "CTSH ID",
			dataIndex: "ctsh_id",
			key: "ctsh_id",
			render: (text, record) => {
				return (
					<Link key={record.uuid} to={`/admin/trader?id=${record.uuid}`}>
						{record.ctsh_id}
					</Link>
				);
			}
		},
		{
			title: "Full Name",
			dataIndex: "name",
			key: "name",
			render: (text, record) => {
				return (
					<Link key={record.uuid} to={`/admin/trader?id=${record.uuid}`}>
						{record.surname?.toUpperCase()} {record.other_names?.toUpperCase()}
					</Link>
				);
			}
		},
		{
			title: "Phone Number",
			dataIndex: "phone",
			key: "phone"
		},
		{
			title: "Date of Birth",
			dataIndex: "dob",
			key: "dob"
		},
		{
			title: "Gender",
			dataIndex: "gender",
			key: "gender"
		},
		{
			title: "Trade",
			dataIndex: "trade",
			key: "trade",
			render: (text, record) => {
				return record.trade ? record.trade.name : "N/A";
			}
		},
		{
			title: "Location",
			dataIndex: "location",
			key: "location",
			render: (text, record) => {
				return record.location ? record.location.title : "N/A";
			}
		},
		{
			title: "PVC Number",
			dataIndex: "pvc",
			key: "pvc"
		},
		{
			title: "Actions",
			dataIndex: "",
			render: (_, record) => (
				<Action item={record} viewItem={viewItem} editItem={editItem} />
			)
		}
	];

	const [val, setVal] = useState("");
	const [filteredTraders, setFilteredTraders] = useState(traders);

	const filterVals = useCallback(
		(e) => {
			const currValue = e.target.value;
			setVal(currValue);

			if (!currValue.trim()) {
				setFilteredTraders(traders); // Reset when input is cleared
				return;
			}

			const filtered = traders.filter((entry) => {
				if (
					entry?.name?.toLowerCase().includes(currValue?.toLowerCase()) ||
					entry?.phone?.toLowerCase().includes(currValue?.toLowerCase())
					// entry?.location?.toLowerCase().includes(currValue?.toLowerCase())
				) {
					return entry;
				}
			});

			setFilteredTraders(filtered);
		},
		[traders]
	);

	useEffect(() => {
		setFilteredTraders(traders); // Update filtered tickets when `tickets` change
	}, [traders]);

	// export to excel
	const handleExportExcel = () => {
		const excelData = traders?.map((trader) => {
			return {
				CTSH_ID: trader?.ctsh_id,
				FULL_NAME: trader?.surname + " " + trader?.other_names,
				PHONE_NUMBER: trader?.phone,
				DATE_OF_BIRTH: trader?.dob,
				ADDRESS: trader?.home_address,
				EMAIL: trader?.email,
				GENDER: trader?.gender,
				TRADE: trader?.trade?.name,
				LOCATION: trader?.location?.title,
				LGA: trader?.lga,
				PVC_NUMBER: trader?.pvc,
				NIN: trader?.nin,
				DATE_REGISTERED: trader?.created_at
			};
		});

		const worksheet = XLSX.utils.json_to_sheet(excelData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
		XLSX.writeFile(workbook, "traders" + ".xlsx");
	};

	return (
		<>
			<Modal
				title={`Edit Trader`}
				open={showModal}
				onCancel={closeModal}
				width={1000}
				footer={false}
				maskClosable={false}
				destroyOnHidden={true}>
				<EditTrader trader={selectedTrader} closeModal={closeModal} />
			</Modal>

			<div className="flex flex-wrap">
				<div className="w-full md:w-12/12 px-4 min-h-screen">
					<CardSession title="View Traders">
						<div className="block overflow-x-auto w-full mt-6">
							<div style={{ minWidth: "900px" }}>
								<Space style={{ marginBottom: 16 }}>
									<Input
										placeholder="search"
										value={val}
										onChange={filterVals}
										className="rounded"
										style={{ width: 250 }}
									/>

									{traders?.length > 0 && (
										<div>
											<Button onClick={handleExportExcel} type="primary">
												Excel
											</Button>
										</div>
									)}
								</Space>
								<Table dataSource={filteredTraders} columns={columns} />
							</div>
						</div>
					</CardSession>
				</div>
			</div>
		</>
	);
};

export default ViewTraders;
