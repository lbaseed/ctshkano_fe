import React, {
	useContext,
	useEffect,
	useRef,
	useState,
	Fragment
} from "react";
import context from "../../../context/context";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router";
import CardSession from "../../../components/Cards/Card";

import { toast, ToastContainer } from "react-toastify";
import { GET_TRADER, SEARCH_TRADER } from "../../../gql/queries/queries";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Input, Button, Modal } from "antd";
import { Camera } from "./Camera";
import { Root, Preview, Footer, GlobalStyle } from "./mainStyle";
import Guarantor from "./Guarantor";
import { UPLOAD_TRADER_PHOTO } from "../../../gql/mutations/mutations";
import { PlusOutlined } from "@ant-design/icons";
import BankDetails from "./BankDetails";

const Trader = () => {
	const { state, dispatch } = useContext(context);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [showModal, setShowModal] = useState(false);
	const [trader, setTrader] = useState();

	const [param, setParam] = useState();
	const camera = useRef(null);
	const [image, setImage] = useState(null);

	const [openBankDetails, setOpenBankDetails] = useState(false);

	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const ownerId = queryParams.get("id");

	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const [cardImage, setCardImage] = useState();

	const [performSearch] = useLazyQuery(SEARCH_TRADER);

	// const { data, loading, error } = useQuery(GET_TRADER, {
	// 	variables: { uuid: ownerId },
	// 	onCompleted: (data) => {
	// 		if (data?.trader) {
	// 			setTrader(data.trader);
	// 		}
	// 	},
	// 	onError: (error) => {
	// 		console.error("Error fetching trader data:", error);
	// 	}
	// });

	const [uploadPhoto] = useMutation(UPLOAD_TRADER_PHOTO);

	const handleSearch = async () => {
		try {
			const result = await performSearch({ variables: { param } });

			if (result?.data?.searchTrader) {
				setTrader(result?.data?.searchTrader);
				toast.success("Trader record found");
			} else {
				toast.error("No record Found");
			}
		} catch (error) {
			toast.error(error);
		}
	};

	const uploadImage = async () => {
		const file = new File([cardImage], trader?.uuid + ".jpeg", {
			type: "image/jpeg"
		});

		try {
			const result = await uploadPhoto({
				variables: { trader_uuid: trader?.uuid, file: file }
			});

			if (result?.data?.uploadTraderPhoto)
				toast.success("Photo Saved Successfully");
		} catch (error) {
			toast.error(error);
		}
	};

	useEffect(() => {
		if (ownerId) {
			setParam(ownerId);
			performSearch({ variables: { param: ownerId } })
				.then((result) => {
					if (result?.data?.searchTrader) {
						setTrader(result?.data?.searchTrader);
					} else {
						toast.error("No record Found");
					}
				})
				.catch((error) => {
					toast.error(error.message);
				});
		}
	}, [ownerId]);

	const lgas = [
		{ value: "KNO", label: "KANO" },
		{ value: "FGE", label: "FAGE" },
		{ value: "KRY", label: "KARAYE" },
		{ value: "KBY", label: "KIBIYA" },
		{ value: "KNC", label: "KUNCHI" },
		{ value: "MDO", label: "MADOBI" },
		{ value: "MKD", label: "MAKODA" },
		{ value: "MJB", label: "MINJIBIR" },
		{ value: "RNO", label: "RANO" },
		{ value: "TRN", label: "TARAUNI" },
		{ value: "TDW", label: "TUDUN WADA" },
		{ value: "WDL", label: "WUDIL" },
		{ value: "BKR", label: "BUNKURE" },
		{ value: "DWK", label: "DAWAKI" },
		{ value: "DGT", label: "DOGO TUKU" },
		{ value: "FGE", label: "FAGGE" },
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
		{ value: "MJB", label: "MINJIBIR" },
		{ value: "NSS", label: "NASSARAWA" },
		{ value: "RNO", label: "RANO" },
		{ value: "RMG", label: "RIMIN GADO" },
		{ value: "SHN", label: "SHANONO" },
		{ value: "SML", label: "SUMAILA" },
		{ value: "TKI", label: "TAKAI" },
		{ value: "TRN", label: "TARAUNI" },
		{ value: "TDW", label: "TUDUN WADA" },
		{ value: "WDL", label: "WUDIL" }
	];

	return (
		<>
			<ToastContainer />
			<div className="flex flex-wrap">
				<div className="w-full md:w-12/12 px-4 min-h-screen">
					<CardSession title="View Trader Profile">
						<div className="block overflow-x-auto w-full mt-6 flex flex-wrap">
							<Input
								placeholder="search by phone number or ID"
								value={param}
								onChange={(e) => setParam(e.target.value)}
								onKeyUp={(e) => {
									if (e.key === "Enter") handleSearch(e);
								}}
							/>
							<div style={{ width: "310px" }}>
								<div style={{ width: "100%" }} className="mt-5">
									{trader && (
										<Fragment>
											{isCameraOpen && (
												<Camera
													onCapture={(blob) => setCardImage(blob)}
													onClear={() => setCardImage(undefined)}
												/>
											)}

											{cardImage && (
												<div
													style={{
														width: "300px",
														height: "300px",
														padding: "10px"
													}}>
													<Preview
														src={cardImage && URL.createObjectURL(cardImage)}
														id="traderImage"
													/>
													<Button
														onClick={uploadImage}
														style={{ marginTop: "5px" }}>
														Save Photo
													</Button>
												</div>
											)}

											{/* <Footer> */}
											<>
												<Button onClick={() => setIsCameraOpen(true)}>
													Open Camera
												</Button>
												<Button
													onClick={() => {
														setIsCameraOpen(false);
														setCardImage(undefined);
													}}>
													Close Camera
												</Button>
											</>
											{/* </Footer> */}

											<GlobalStyle />
										</Fragment>
									)}
								</div>
							</div>
							<div className="w-full md:w-8/12 px-4">
								{/* create a vertical table with 5 five rows */}
								<table className="table-auto w-full mt-5 overflow-x-auto">
									<thead>
										<tr>
											<th className="px-4 py-2">Field</th>
											<th className="px-4 py-2">Value</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td className="border px-4 py-2">Trader Photo</td>
											<td style={{ padding: "5px" }}>
												<img
													src={
														trader?.photo
															? `data:image/jpeg;base64,${trader?.photo}`
															: ""
													}
													width="250"
													height="300"
													style={{ borderRadius: "10px" }}
												/>
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Trader ID</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.ctsh_id}{" "}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Full Name</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.surname},{" "}
												{trader && trader?.other_names}{" "}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Phone</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.phone}{" "}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Email</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.email}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Gender</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.gender}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Date of Birth</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.dob}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Home Address</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.home_address}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Land Mark</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.land_mark}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">PVC</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.pvc}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">NIN</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.nin}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Business Location</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.location?.title}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Trade</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.trade?.name}
											</td>
										</tr>
										<tr>
											<td className="border px-4 py-2">Bank Details</td>
											<td className="border px-4 py-2">
												{" "}
												{trader && trader?.bank_details ? (
													()=>{
														const parsedDetails = JSON.parse(trader?.bank_details)
														return (
															<div>
																<p>{parsedDetails?.bank_name}</p>
																<p>{parsedDetails?.account_number}</p>
																<p>{parsedDetails?.account_name}</p>
															</div>
														)
													}
												)() : (
													<Button
														type="primary"
														icon={<PlusOutlined />}
														onClick={() => setOpenBankDetails(true)}
														shape="circle"
													/>
												)}
											</td>
										</tr>
									</tbody>
								</table>
								{trader && (
									<div className="flex justify-end mt-5">
										<Button type="primary" onClick={() => setShowModal(true)}>
											Add Reference
										</Button>

										{/* <Button>
										Add Next of Kin
									</Button> */}
									</div>
								)}
							</div>
						</div>
					</CardSession>
				</div>
			</div>
			<Modal
				title={`Add Reference for ${trader?.surname} ${trader?.other_names}`}
				open={showModal}
				onCancel={() => setShowModal(false)}
				footer={false}
				mask={true}
				maskClosable={false}
				width={1000}>
				<Guarantor closeModal={() => setShowModal(false)} trader={trader} />
			</Modal>

			<Modal
				title={`Add Bank Details for ${trader?.surname} ${trader?.other_names}`}
				open={openBankDetails}
				onCancel={() => setOpenBankDetails(false)}
				footer={false}
				mask={true}
				maskClosable={false}
				destroyOnHidden={true}>
				<BankDetails
					closeModal={() => setOpenBankDetails(false)}
					trader={trader}
				/>
			</Modal>
		</>
	);
};

export default Trader;
