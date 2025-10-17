import React, { useContext, useEffect, useState, useCallback } from "react";
import CardSession from "../../../components/Cards/Card";
import CardProfile from "../../../components/Cards/CardProfileTabs";
import { useCookies } from "react-cookie";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import {
	GET_TRADERS_LIST,
	GET_TRADES,
	GET_LOCATIONS,
	SEARCH_TRADER
} from "../../../gql/queries/queries";
import CustomModal from "../../../components/Modals/CustomModal";
import Loading from "../../../components/Loading/Loading";
import { CREATE_TRADE, CREATE_TRADER } from "../../../gql/mutations/mutations";
import context from "../../../context/context";
import { LOADING } from "../../../reducer/reducer-types";
import {
	Button,
	DatePicker,
	Form,
	Input,
	Modal,
	Select,
	Table,
	InputNumber,
	Steps,
	Card,
	Alert,
	Tooltip,
	Progress
} from "antd";
import {
	CheckCircleOutlined,
	ExclamationCircleOutlined,
	InfoCircleOutlined,
	UserOutlined,
	PhoneOutlined,
	BankOutlined,
	ShopOutlined
} from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";

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
	const [tradesList, setTradesList] = useState([]);
	const [currentStep, setCurrentStep] = useState(0);
	const [formProgress, setFormProgress] = useState(0);
	const [duplicateCheck, setDuplicateCheck] = useState({
		phone: null,
		nin: null
	});
	const [formData, setFormData] = useState({});
	const [age, setAge] = useState(null);
	const navigate = useNavigate();

	const [form] = Form.useForm();
	const [createTrader] = useMutation(CREATE_TRADER);
	const [searchTrader] = useLazyQuery(SEARCH_TRADER);

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

	// Load saved form data on component mount
	useEffect(() => {
		const savedData = localStorage.getItem("traderFormData");
		if (savedData) {
			try {
				const parsedData = JSON.parse(savedData);
				// Convert saved date string back to moment object for DatePicker
				if (parsedData.dob) {
					const momentDate = moment(parsedData.dob);
					if (momentDate.isValid()) {
						parsedData.dob = momentDate;
						setDob(parsedData.dob.format("YYYY-MM-DD"));
						setAge(calculateAge(parsedData.dob.format("YYYY-MM-DD")));
					}
				}
				form.setFieldsValue(parsedData);
				setFormData(parsedData);
				if (parsedData.lga) {
					handleFilterLocation(parsedData.lga);
				}
			} catch (error) {
				console.error("Error loading saved form data:", error);
			}
		}
	}, [form]);

	// Auto-calculate age when DOB changes
	useEffect(() => {
		if (dob) {
			const calculatedAge = calculateAge(dob);
			setAge(calculatedAge);
		}
	}, [dob]);

	// Use useEffect to populate tradesList when tradesData changes
	useEffect(() => {
		if (tradesData?.trades) {
			const mappedTrades = tradesData.trades.map((trade) => ({
				value: trade.uuid,
				label: trade.name
			}));
			setTradesList(mappedTrades);
		}
	}, [tradesData]);

	// Set initial locationList when locationData changes
	useEffect(() => {
		if (locationData?.locations) {
			setLocationList(
				locationData.locations.map((location) => ({
					value: location.uuid,
					label: location.title
				}))
			);
		}
	}, [locationData]);

	// Smart validation functions
	const formatPhoneNumber = (value) => {
		const cleaned = value.replace(/\D/g, "");
		if (cleaned.length <= 3) return cleaned;
		if (cleaned.length <= 6)
			return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
		if (cleaned.length <= 10)
			return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
				6
			)}`;
		return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
			6,
			10
		)}`;
	};

	const validateNIN = (nin) => {
		const cleaned = nin.replace(/\D/g, "");
		return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
	};

	const validatePhone = (phone) => {
		const cleaned = phone.replace(/\D/g, "");
		return cleaned.length >= 10 && cleaned.length <= 14;
	};

	const calculateAge = (birthDate) => {
		if (!birthDate) return null;
		const dateToCalculate = moment.isMoment(birthDate)
			? birthDate
			: moment(birthDate);
		if (!dateToCalculate.isValid()) return null;
		const age = moment().diff(dateToCalculate, "years");
		return age;
	};

	const checkDuplicate = useCallback(
		async (field, value) => {
			if (!value || value.length < 3) return;

			try {
				const result = await searchTrader({
					variables: {
						param: field === "phone" ? value.replace(/\D/g, "") : value
					}
				});

				if (result.data?.searchTrader) {
					setDuplicateCheck((prev) => ({
						...prev,
						[field]: {
							exists: true,
							trader: result.data.searchTrader
						}
					}));
				} else {
					setDuplicateCheck((prev) => ({
						...prev,
						[field]: { exists: false, trader: null }
					}));
				}
			} catch (error) {
				console.error("Duplicate check error:", error);
			}
		},
		[searchTrader]
	);

	// Auto-save form data to localStorage
	const autoSaveForm = useCallback(
		(changedValues) => {
			const currentData = form.getFieldsValue();
			// Convert moment date object to string for storage
			const dataToSave = { ...currentData };
			if (dataToSave.dob && moment.isMoment(dataToSave.dob)) {
				dataToSave.dob = dataToSave.dob.format("YYYY-MM-DD");
			}
			setFormData(currentData);
			localStorage.setItem("traderFormData", JSON.stringify(dataToSave));

			// Calculate form progress
			const totalFields = 13; // Total required fields
			const filledFields = Object.values(currentData).filter(
				(value) =>
					value && value !== "" && value !== null && value !== undefined
			).length;
			setFormProgress(Math.round((filledFields / totalFields) * 100));
		},
		[form]
	);

	const handleCreateTrader = async (value) => {
		if (!value) return toast.error("Please fill in all required fields!");

		// Final duplicate check before submission
		if (duplicateCheck.phone?.exists || duplicateCheck.nin?.exists) {
			toast.error("Duplicate trader detected. Please verify the information.");
			return;
		}

		// Handle date properly - convert moment object to string if needed
		let dobValue = value.dob;
		if (moment.isMoment(dobValue)) {
			dobValue = dobValue.format("YYYY-MM-DD");
		}

		const variables = {
			surname: value?.surname.toUpperCase(),
			otherNames: value?.other_names.toUpperCase(),
			phone: value.phone.replace(/\D/g, ""), // Remove formatting
			email: value.email?.toLowerCase() || "",
			gender: value.gender,
			dob: dobValue,
			lga: value.lga.toUpperCase(),
			home_address: value.home_address.toUpperCase(),
			land_mark: value.land_mark?.toUpperCase() || "",
			pvc: value.pvc?.toUpperCase() || "",
			nin: value.nin?.replace(/\D/g, "") || "",
			operating_capital: value.operating_capital?.toString() || "",
			location_uuid: value.location_uuid,
			trade_uuid: value.trade_uuid
		};

		dispatch({ type: LOADING, payload: true });

		try {
			const result = await createTrader({ variables });

			if (result.data?.createTrader) {
				toast.success("Trader created successfully!");
				// Clear localStorage
				localStorage.removeItem("traderFormData");
				navigate(`/admin/trader/?id=${result.data.createTrader.uuid}`);
			}
		} catch (error) {
			toast.error(error.message || "Failed to create trader");
		}

		dispatch({ type: LOADING, payload: false });
	};

	// Use useEffect to populate tradesList when tradesData changes
	useEffect(() => {
		if (tradesData?.trades) {
			const mappedTrades = tradesData.trades.map((trade) => ({
				value: trade.uuid,
				label: trade.name
			}));
			setTradesList(mappedTrades);
		}
	}, [tradesData]);

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

	const formSteps = [
		{
			title: "Personal Info",
			icon: <UserOutlined />,
			fields: ["surname", "other_names", "phone", "email", "gender", "dob"]
		},
		{
			title: "Address & ID",
			icon: <InfoCircleOutlined />,
			fields: ["home_address", "land_mark", "lga", "pvc", "nin"]
		},
		{
			title: "Business Info",
			icon: <ShopOutlined />,
			fields: ["location_uuid", "trade_uuid", "operating_capital"]
		}
	];

	const nextStep = () => {
		form
			.validateFields(formSteps[currentStep].fields)
			.then(() => {
				setCurrentStep(currentStep + 1);
			})
			.catch(() => {
				toast.error("Please complete all required fields in this section");
			});
	};

	const prevStep = () => {
		setCurrentStep(currentStep - 1);
	};

	return (
		<>
			<ToastContainer />
			{state.loading && <Loading />}

			<div className="flex flex-wrap">
				<div className="w-full md:w-12/12 px-4 min-h-screen">
					<CardSession title="Smart Trader Enrollment">
						{/* Progress and Steps */}
						<div className="mb-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold">Registration Progress</h3>
								<div className="flex items-center gap-2">
									<Progress
										percent={formProgress}
										size="small"
										style={{ width: 200 }}
										status={formProgress === 100 ? "success" : "active"}
									/>
									<span className="text-sm text-gray-600">{formProgress}%</span>
								</div>
							</div>

							<Steps current={currentStep} items={formSteps} className="mb-6" />
						</div>

						<div className="block overflow-x-auto w-full">
							<div style={{ minWidth: "900px" }}>
								<Form
									form={form}
									onFinish={handleCreateTrader}
									onValuesChange={autoSaveForm}
									{...formItemLayout}
									variant="outlined"
									style={{
										maxWidth: "100%"
									}}>
									{/* Personal Information Step */}
									{currentStep === 0 && (
										<Card title="Personal Information" className="mb-4">
											<Form.Item
												label="Surname"
												name="surname"
												rules={[
													{
														required: true,
														message: "Please input surname!"
													},
													{
														min: 2,
														message: "Surname must be at least 2 characters"
													}
												]}
												hasFeedback>
												<Input
													placeholder="Enter surname"
													style={{ textTransform: "uppercase" }}
													suffix={
														<Tooltip title="Enter trader's surname">
															<InfoCircleOutlined
																style={{ color: "rgba(0,0,0,.45)" }}
															/>
														</Tooltip>
													}
												/>
											</Form.Item>

											<Form.Item
												label="Other Names"
												name="other_names"
												rules={[
													{
														required: true,
														message: "Please input other names!"
													},
													{
														min: 2,
														message: "Other names must be at least 2 characters"
													}
												]}
												hasFeedback>
												<Input
													placeholder="Enter other names"
													style={{ textTransform: "uppercase" }}
													suffix={
														<Tooltip title="Enter trader's other names">
															<InfoCircleOutlined
																style={{ color: "rgba(0,0,0,.45)" }}
															/>
														</Tooltip>
													}
												/>
											</Form.Item>

											<Form.Item
												label="Phone Number"
												name="phone"
												rules={[
													{
														required: true,
														message: "Please input phone number!"
													},
													{
														validator: (_, value) => {
															if (value && !validatePhone(value)) {
																return Promise.reject(
																	"Please enter a valid phone number"
																);
															}
															return Promise.resolve();
														}
													}
												]}
												validateStatus={
													duplicateCheck.phone?.exists === true
														? "error"
														: duplicateCheck.phone?.exists === false
														? "success"
														: ""
												}
												help={
													duplicateCheck.phone?.exists === true
														? `Phone number already exists for ${duplicateCheck.phone.trader?.surname} ${duplicateCheck.phone.trader?.other_names}`
														: duplicateCheck.phone?.exists === false
														? "Phone number available"
														: ""
												}
												hasFeedback>
												<Input
													placeholder="080-1234-5678"
													prefix={<PhoneOutlined />}
													onChange={(e) => {
														const formatted = formatPhoneNumber(e.target.value);
														form.setFieldValue("phone", formatted);
														checkDuplicate("phone", formatted);
													}}
												/>
											</Form.Item>

											<Form.Item
												label="Email"
												name="email"
												rules={[
													{
														type: "email",
														message: "Please enter a valid email address"
													}
												]}
												hasFeedback>
												<Input
													placeholder="trader@example.com"
													style={{ textTransform: "lowercase" }}
													suffix={
														<Tooltip title="Optional: Enter email address">
															<InfoCircleOutlined
																style={{ color: "rgba(0,0,0,.45)" }}
															/>
														</Tooltip>
													}
												/>
											</Form.Item>
										</Card>
									)}

									{currentStep === 0 && (
										<Card className="mb-4">
											<Form.Item
												label="Select Gender"
												name="gender"
												rules={[
													{
														required: true,
														message: "Please select gender!"
													}
												]}
												hasFeedback>
												<Select
													options={[
														{ value: "MALE", label: "Male" },
														{ value: "FEMALE", label: "Female" }
													]}
													placeholder="Select Gender"
												/>
											</Form.Item>

											<Form.Item
												label="Date of Birth"
												name="dob"
												rules={[
													{
														required: true,
														message: "Please input date of birth!"
													},
													{
														validator: (_, value) => {
															if (value) {
																const dateToCheck = moment.isMoment(value)
																	? value
																	: moment(value);
																if (!dateToCheck.isValid()) {
																	return Promise.reject(
																		"Please enter a valid date"
																	);
																}
																const age = moment().diff(dateToCheck, "years");
																if (age < 18) {
																	return Promise.reject(
																		"Trader must be at least 18 years old"
																	);
																}
																if (age > 65) {
																	return Promise.reject(
																		"Please verify the date of birth"
																	);
																}
															}
															return Promise.resolve();
														}
													}
												]}
												hasFeedback
												extra={age ? `Age: ${age} years` : ""}>
												<DatePicker
													placeholder="Select date of birth"
													style={{ width: "100%" }}
													disabledDate={(current) =>
														current && current > moment().endOf("day")
													}
													onChange={(date, dateString) => {
														if (date && date.isValid()) {
															setDob(dateString);
															form.setFieldValue("dob", date);
														}
													}}
												/>
											</Form.Item>
										</Card>
									)}

									{/* Address & Identification Step */}
									{currentStep === 1 && (
										<>
											<Card title="Address Information" className="mb-4">
												<Form.Item
													label="Home Address"
													name="home_address"
													rules={[
														{
															required: true,
															message: "Please input home address"
														},
														{
															min: 10,
															message: "Please provide a detailed address"
														}
													]}
													hasFeedback>
													<Input.TextArea
														rows={3}
														placeholder="Enter detailed home address"
														style={{ textTransform: "uppercase" }}
													/>
												</Form.Item>

												<Form.Item
													label="Land Mark"
													name="land_mark"
													hasFeedback>
													<Input
														placeholder="Enter nearby landmark (optional)"
														style={{ textTransform: "uppercase" }}
														suffix={
															<Tooltip title="Optional: Enter a nearby landmark">
																<InfoCircleOutlined
																	style={{ color: "rgba(0,0,0,.45)" }}
																/>
															</Tooltip>
														}
													/>
												</Form.Item>

												<Form.Item
													label="LGA"
													name="lga"
													rules={[
														{
															required: true,
															message: "Please select LGA!"
														}
													]}
													hasFeedback>
													<Select
														options={lgas}
														placeholder="Select Local Government Area"
														showSearch
														onChange={handleFilterLocation}
														filterOption={(input, option) =>
															(option?.label ?? "")
																.toLowerCase()
																.includes(input.toLowerCase())
														}
													/>
												</Form.Item>
											</Card>

											<Card title="Identification Documents" className="mb-4">
												<Alert
													message="Identification documents help verify trader identity"
													type="info"
													showIcon
													className="mb-4"
												/>

												<Form.Item
													label="PVC Number"
													name="pvc"
													rules={[
														{
															pattern: /^[A-Z0-9]{19}$/,
															message:
																"PVC should be 19 characters (letters and numbers)"
														}
													]}
													hasFeedback>
													<Input
														placeholder="90F5B4F94487310DC4C6 (Optional)"
														style={{ textTransform: "uppercase" }}
														maxLength={19}
														suffix={
															<Tooltip title="Optional: 19-character PVC number">
																<InfoCircleOutlined
																	style={{ color: "rgba(0,0,0,.45)" }}
																/>
															</Tooltip>
														}
													/>
												</Form.Item>

												<Form.Item
													label="NIN"
													name="nin"
													rules={[
														{
															validator: (_, value) => {
																if (value && !validateNIN(value)) {
																	return Promise.reject(
																		"NIN must be exactly 11 digits"
																	);
																}
																return Promise.resolve();
															}
														}
													]}
													validateStatus={
														duplicateCheck.nin?.exists === true
															? "error"
															: duplicateCheck.nin?.exists === false
															? "success"
															: ""
													}
													help={
														duplicateCheck.nin?.exists === true
															? `NIN already exists for ${duplicateCheck.nin.trader?.surname} ${duplicateCheck.nin.trader?.other_names}`
															: duplicateCheck.nin?.exists === false
															? "NIN available"
															: ""
													}
													hasFeedback>
													<Input
														placeholder="12345678901 (Optional)"
														maxLength={11}
														onChange={(e) => {
															const value = e.target.value.replace(/\D/g, "");
															form.setFieldValue("nin", value);
															if (value.length === 11) {
																checkDuplicate("nin", value);
															}
														}}
														suffix={
															<Tooltip title="Optional: 11-digit National Identification Number">
																<InfoCircleOutlined
																	style={{ color: "rgba(0,0,0,.45)" }}
																/>
															</Tooltip>
														}
													/>
												</Form.Item>
											</Card>
										</>
									)}

									{/* Business Information Step */}
									{currentStep === 2 && (
										<Card title="Business Information" className="mb-4">
											<Alert
												message="Business information helps match traders with appropriate schemes"
												type="info"
												showIcon
												className="mb-4"
											/>

											<Form.Item
												label="Business Location"
												name="location_uuid"
												rules={[
													{
														required: true,
														message: "Please select business location!"
													}
												]}
												hasFeedback>
												<Select
													options={locationList}
													placeholder="Select business location"
													disabled={locationList.length === 0}
													notFoundContent={
														locationList.length === 0
															? "Please select an LGA first"
															: "No locations found"
													}
												/>
											</Form.Item>

											<Form.Item
												label="Trade/Skill"
												name="trade_uuid"
												rules={[
													{
														required: true,
														message: "Please select trade/skill!"
													}
												]}
												hasFeedback>
												<Select
													options={tradesList}
													placeholder="Select trade or skill"
													showSearch
													filterOption={(input, option) =>
														(option?.label ?? "")
															.toLowerCase()
															.includes(input.toLowerCase())
													}
												/>
											</Form.Item>

											<Form.Item
												label="Operating Capital"
												name="operating_capital"
												rules={[
													{
														validator: (_, value) => {
															if (value && (isNaN(value) || value < 0)) {
																return Promise.reject(
																	"Please enter a valid amount"
																);
															}
															return Promise.resolve();
														}
													}
												]}
												hasFeedback>
												<InputNumber
													placeholder="0"
													style={{ width: "100%" }}
													formatter={(value) =>
														`₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
													}
													parser={(value) => value.replace(/₦\s?|(,*)/g, "")}
													min={0}
													precision={2}
												/>
											</Form.Item>
										</Card>
									)}

									{/* Form Navigation */}
									<Form.Item
										wrapperCol={{
											offset: 6,
											span: 16
										}}>
										<div className="flex justify-between">
											<div>
												{currentStep > 0 && (
													<Button onClick={prevStep}>Previous</Button>
												)}
											</div>
											<div>
												{currentStep < formSteps.length - 1 ? (
													<Button type="primary" onClick={nextStep}>
														Next Step
													</Button>
												) : (
													<Button
														type="primary"
														htmlType="submit"
														disabled={
															duplicateCheck.phone?.exists ||
															duplicateCheck.nin?.exists ||
															formProgress < 80
														}
														loading={state.loading}>
														{duplicateCheck.phone?.exists ||
														duplicateCheck.nin?.exists
															? "Duplicate Detected"
															: "Register Trader"}
													</Button>
												)}
											</div>
										</div>
									</Form.Item>
								</Form>

								{/* Auto-save notification */}
								{formProgress > 0 && (
									<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
										<div className="flex items-center gap-2">
											<CheckCircleOutlined style={{ color: "#1890ff" }} />
											<span className="text-sm text-blue-700">
												Form auto-saved • Progress: {formProgress}%
												{formProgress < 100 &&
													` • ${Math.round(
														13 - (formProgress / 100) * 13
													)} fields remaining`}
											</span>
										</div>
									</div>
								)}

								{/* Helpful tips */}
								<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
									<Card
										size="small"
										title="💡 Tips"
										headStyle={{ fontSize: "14px" }}>
										<ul className="text-xs space-y-1">
											<li>• Form is auto-saved as you type</li>
											<li>• Phone numbers are checked for duplicates</li>
											<li>• Age is calculated automatically</li>
											<li>• All required fields must be completed</li>
										</ul>
									</Card>

									<Card
										size="small"
										title="📋 Requirements"
										headStyle={{ fontSize: "14px" }}>
										<ul className="text-xs space-y-1">
											<li>• Minimum age: 18 years</li>
											<li>• Valid phone number required</li>
											<li>• Business location must be selected</li>
											<li>• Trade/skill must be specified</li>
										</ul>
									</Card>

									<Card
										size="small"
										title="🔒 Data Protection"
										headStyle={{ fontSize: "14px" }}>
										<ul className="text-xs space-y-1">
											<li>• All data is encrypted</li>
											<li>• Duplicate checking prevents errors</li>
											<li>• Form data is temporarily saved locally</li>
											<li>• Information is used only for registration</li>
										</ul>
									</Card>
								</div>
							</div>
						</div>
					</CardSession>
				</div>
			</div>
		</>
	);
};
export default CreateTrader;
