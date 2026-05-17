import React, { useContext, useEffect, useState, useCallback } from "react";
import CardSession from "../../../components/Cards/Card";
import { useCookies } from "react-cookie";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import {
	GET_TRADES,
	GET_LOCATIONS,
	SEARCH_TRADER
} from "../../../gql/queries/queries";
import { useLgas } from "../../../hooks/useLgas";
import Loading from "../../../components/Loading/Loading";
import { CREATE_TRADER } from "../../../gql/mutations/mutations";
import context from "../../../context/context";
import { LOADING } from "../../../reducer/reducer-types";
import {
	Button,
	DatePicker,
	Form,
	Input,
	Select,
	InputNumber,
	Card,
	Alert,
	Tooltip,
	Progress
} from "antd";
import {
	CheckCircleOutlined,
	InfoCircleOutlined,
	UserOutlined,
	PhoneOutlined,
	ShopOutlined,
	HomeOutlined,
	IdcardOutlined,
	BankOutlined
} from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export const CreateTrader = () => {
	const { state, dispatch } = useContext(context);
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const [dob, setDob] = useState();
	const [locationList, setLocationList] = useState([]);
	const [tradesList, setTradesList] = useState([]);
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

	const {
		data: tradesData,
		loading: tradesLoading,
		error: tradesError
	} = useQuery(GET_TRADES, {
		fetchPolicy: "cache-and-network"
	});

	const {
		data: locationData,
		loading: locationsLoading,
		error: locationsError
	} = useQuery(GET_LOCATIONS, {
		fetchPolicy: "cache-and-network"
	});

	// Use dynamic LGA data
	const {
		lgaOptions,
		loading: lgasLoading,
		error: lgasError,
		getLgaById
	} = useLgas(true);

	// Smart validation functions
	const formatPhoneNumber = (value) => {
		const cleaned = value.replace(/\D/g, "");
		if (cleaned.length <= 3) return cleaned;
		if (cleaned.length <= 6)
			return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
		if (cleaned.length <= 11)
			return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
				6
			)}`;
		return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
			6,
			11
		)}`;
	};

	const validateNIN = (nin) => {
		const cleaned = nin.replace(/\D/g, "");
		return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
	};

	const validatePhone = (phone) => {
		const cleaned = phone.replace(/\D/g, "");
		return cleaned.length >= 11 && cleaned.length <= 14;
	};

	const validateCurrency = (value) => {
		if (!value) return true; // Optional field
		const cleaned = value.toString().replace(/[₦,\s]/g, "");
		return !isNaN(cleaned) && parseFloat(cleaned) >= 0;
	};

	const calculateAge = useCallback((birthDate) => {
		if (!birthDate) return null;

		// Handle different date formats
		let dateToCalculate;
		if (moment.isMoment(birthDate)) {
			dateToCalculate = birthDate;
		} else if (typeof birthDate === "string") {
			// Try multiple date formats
			dateToCalculate = moment(birthDate, [
				"YYYY-MM-DD",
				"MM/DD/YYYY",
				"DD/MM/YYYY"
			]);
		} else {
			dateToCalculate = moment(birthDate);
		}

		if (!dateToCalculate.isValid()) return null;

		const today = moment();
		const age = today.diff(dateToCalculate, "years");

		return age;
	}, []);

	const handleFilterLocation = useCallback(
		(lgaId) => {
			if (!locationData?.locations || !lgaId) return;

			// Get LGA details by ID
			const selectedLga = getLgaById(lgaId);
			if (!selectedLga) return;

			const filteredLocations = locationData.locations.filter(
				(locationItem) => {
					return (
						locationItem.lga.toLowerCase() === selectedLga.code.toLowerCase()
					);
				}
			);

			setLocationList(
				filteredLocations.map((location) => ({
					value: location.uuid,
					label: location.title
				}))
			);
		},
		[locationData, getLgaById]
	);

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

			// Calculate form progress based on required fields only
			const requiredFields = [
				"surname",
				"other_names",
				"phone",
				"gender",
				"dob",
				"home_address",
				"lga",
				"business_location",
				"trade_uuid"
			];
			const filledRequiredFields = requiredFields.filter((field) => {
				const value = currentData[field];
				return value && value !== "" && value !== null && value !== undefined;
			}).length;
			setFormProgress(
				Math.round((filledRequiredFields / requiredFields.length) * 100)
			);
		},
		[form]
	);

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
						const dobString = momentDate.format("YYYY-MM-DD");
						const calculatedAge = calculateAge(dobString);
						setDob(dobString);
						setAge(calculatedAge);
					} else {
						delete parsedData.dob; // Remove invalid date
					}
				}
				form.setFieldsValue(parsedData);
				setFormData(parsedData);
				if (parsedData.lga) {
					handleFilterLocation(parsedData.lga);
				}
			} catch (error) {
				console.error("Error loading saved form data:", error);
				// Clear corrupted data
				localStorage.removeItem("traderFormData");
			}
		}
	}, [form, calculateAge, handleFilterLocation]);

	// Auto-calculate age when DOB changes
	useEffect(() => {
		if (dob) {
			const calculatedAge = calculateAge(dob);
			setAge(calculatedAge);
		} else {
			setAge(null);
		}
	}, [dob, calculateAge]);

	// Populate tradesList when tradesData changes
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

	const handleCreateTrader = async (values) => {
		try {
			// Validate all required fields
			const requiredFields = [
				"surname",
				"other_names",
				"phone",
				"gender",
				"dob",
				"home_address",
				"lga",
				"business_location",
				"trade_uuid"
			];

			const missingFields = requiredFields.filter((field) => !values[field]);
			if (missingFields.length > 0) {
				toast.error(
					`Please fill in all required fields: ${missingFields.join(", ")}`
				);
				return;
			}

			// Final duplicate check before submission
			if (duplicateCheck.phone?.exists || duplicateCheck.nin?.exists) {
				toast.error(
					"Duplicate trader detected. Please verify the information."
				);
				return;
			}

			// Handle date properly - convert moment object to string if needed
			let dobValue = values.dob;
			if (moment.isMoment(dobValue)) {
				dobValue = dobValue.format("YYYY-MM-DD");
			}

			// Prepare mutation variables
			const variables = {
				surname: values.surname?.toUpperCase() || "",
				otherNames: values.other_names?.toUpperCase() || "",
				phone: values.phone.replace(/\D/g, ""), // Remove formatting
				email: values.email?.toLowerCase() || "",
				gender: values.gender,
				dob: dobValue,
				lga_id: values.lga || null, // Now using LGA ID
				home_address: values.home_address?.toUpperCase() || "",
				land_mark: values.land_mark?.toUpperCase() || "",
				pvc: values.pvc?.toUpperCase() || "",
				nin: values.nin?.replace(/\D/g, "") || "",
				operating_capital: values.operating_capital
					? values.operating_capital.toString().replace(/[₦,\s]/g, "")
					: "0",
				business_location: values.business_location?.toUpperCase() || "",
				trade_location: values.trade_location?.toUpperCase() || null,
				trade_uuid: values.trade_uuid
			};

			dispatch({ type: LOADING, payload: true });

			const result = await createTrader({ variables });

			if (result.data?.createTrader) {
				toast.success("Trader created successfully!");
				// Clear localStorage
				localStorage.removeItem("traderFormData");
				navigate(`/admin/trader/?id=${result.data.createTrader.uuid}`);
			} else {
				throw new Error("Failed to create trader - no data returned");
			}
		} catch (error) {
			console.error("Create trader error:", error);
			toast.error(
				error.message || "Failed to create trader. Please try again."
			);
		} finally {
			dispatch({ type: LOADING, payload: false });
		}
	};

	const handleCancelForm = () => {
		// Reset form fields
		form.resetFields();

		// Clear all state variables
		setDob(null);
		setAge(null);
		setFormProgress(0);
		setFormData({});
		setDuplicateCheck({
			phone: null,
			nin: null
		});
		setLocationList(
			locationData?.locations?.map((location) => ({
				value: location.uuid,
				label: location.title
			})) || []
		);

		// Clear localStorage
		localStorage.removeItem("traderFormData");

		// Show success message
		toast.info("Form has been reset successfully!");
	};

	return (
		<>
			<ToastContainer />
			{state.loading && <Loading />}

			<div className="flex flex-wrap">
				<div className="w-full md:w-12/12 px-4 min-h-screen">
					<CardSession title="Trader Registration Form">
						{/* Error handling for required data */}
						{(tradesError || locationsError || lgasError) && (
							<Alert
								message="Error Loading Required Data"
								description={`Unable to load ${tradesError ? "trades" : ""} ${
									tradesError && (locationsError || lgasError) ? ", " : ""
								} ${locationsError ? "locations" : ""} ${
									locationsError && lgasError ? ", " : ""
								} ${lgasError ? "LGAs" : ""}. Please refresh the page.`}
								type="error"
								showIcon
								className="mb-4"
							/>
						)}

						{/* Loading state for required data */}
						{(tradesLoading || locationsLoading || lgasLoading) && (
							<div className="mb-4">
								<Alert
									message="Loading Data"
									description="Please wait while we load trades, locations, and LGAs..."
									type="info"
									showIcon
								/>
							</div>
						)}

						{/* Only show form if data is loaded successfully */}
						{!tradesLoading &&
							!locationsLoading &&
							!lgasLoading &&
							!tradesError &&
							!locationsError &&
							!lgasError && (
								<>
									{/* Progress Bar */}
									<div className="mb-6">
										<div className="flex justify-between items-center mb-4">
											<h3 className="text-lg font-semibold">
												Registration Progress
											</h3>
											<div className="flex items-center gap-2">
												<Progress
													percent={formProgress}
													size="small"
													style={{ width: 200 }}
													status={formProgress === 100 ? "success" : "active"}
												/>
												<span className="text-sm text-gray-600">
													{formProgress}%
												</span>
											</div>
										</div>
									</div>

									{/* Single Vertical Form */}
									<Form
										form={form}
										onFinish={handleCreateTrader}
										onValuesChange={autoSaveForm}
										layout="vertical"
										variant="outlined"
										style={{ maxWidth: "100%" }}>
										{/* Personal Information Section */}
										<Card
											title={
												<div className="flex items-center gap-2">
													<UserOutlined className="text-blue-600" />
													<span className="text-lg font-medium">
														Personal Information
													</span>
												</div>
											}
											className="mb-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
															message:
																"Other names must be at least 2 characters"
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
															? `Phone number already exists`
															: duplicateCheck.phone?.exists === false
																? "Phone number available"
																: ""
													}
													hasFeedback>
													<Input
														placeholder="080-1234-5678"
														prefix={<PhoneOutlined />}
														onChange={(e) => {
															const formatted = formatPhoneNumber(
																e.target.value
															);
															form.setFieldValue("phone", formatted);
															checkDuplicate("phone", formatted);
														}}
													/>
												</Form.Item>

												<Form.Item
													label="Email (Optional)"
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

												<Form.Item
													label="Gender"
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
																	// The value from DatePicker is already a moment object
																	let dateToCheck = value;

																	// Ensure it's a valid moment object
																	if (!moment.isMoment(value)) {
																		dateToCheck = moment(value);
																	}

																	if (!dateToCheck.isValid()) {
																		return Promise.reject(
																			"Please enter a valid date"
																		);
																	}

																	const today = moment();
																	const calculatedAge = today.diff(
																		dateToCheck,
																		"years"
																	);

																	if (age < 18) {
																		return Promise.reject(
																			"Trader must be at least 18 years old"
																		);
																	}
																	if (age > 85) {
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
															if (date && dateString) {
																// Use the dateString which is more reliable for age calculation
																const birthDate = moment(
																	dateString,
																	"YYYY-MM-DD"
																);
																const today = moment();
																const calculatedAge = today.diff(
																	birthDate,
																	"years"
																);

																setDob(dateString);
																setAge(calculatedAge);
																form.setFieldValue("dob", date);

																// Trigger validation
																setTimeout(() => {
																	form.validateFields(["dob"]);
																}, 100);
															} else {
																setDob(null);
																setAge(null);
															}
														}}
													/>
												</Form.Item>
											</div>
										</Card>

										{/* Address & Identification Section */}
										<Card
											title={
												<div className="flex items-center gap-2">
													<HomeOutlined className="text-green-600" />
													<span className="text-lg font-medium">
														Address & Identification
													</span>
												</div>
											}
											className="mb-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
													hasFeedback
													className="md:col-span-2">
													<Input.TextArea
														rows={3}
														placeholder="Enter detailed home address"
														style={{ textTransform: "uppercase" }}
													/>
												</Form.Item>

												<Form.Item
													label="Land Mark (Optional)"
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
													label="Local Government Area"
													name="lga"
													rules={[
														{
															required: true,
															message: "Please select LGA!"
														}
													]}
													hasFeedback>
													<Select
														options={lgaOptions}
														placeholder="Select Local Government Area"
														showSearch
														loading={lgasLoading}
														onChange={handleFilterLocation}
														filterOption={(input, option) =>
															(option?.label ?? "")
																.toLowerCase()
																.includes(input.toLowerCase())
														}
													/>
												</Form.Item>

												<Form.Item
													label="PVC Number (Optional)"
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
																<IdcardOutlined
																	style={{ color: "rgba(0,0,0,.45)" }}
																/>
															</Tooltip>
														}
													/>
												</Form.Item>

												<Form.Item
													label="NIN (Optional)"
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
																<IdcardOutlined
																	style={{ color: "rgba(0,0,0,.45)" }}
																/>
															</Tooltip>
														}
													/>
												</Form.Item>
											</div>
										</Card>

										{/* Business Information Section */}
										<Card
											title={
												<div className="flex items-center gap-2">
													<ShopOutlined className="text-purple-600" />
													<span className="text-lg font-medium">
														Business Information
													</span>
												</div>
											}
											className="mb-6">
											<Alert
												message="Business information helps match traders with appropriate schemes and programs"
												type="info"
												showIcon
												className="mb-4"
											/>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<Form.Item
													label="Business Location"
													name="business_location"
													rules={[
														{
															required: true,
															message: "Please enter business location!"
														},
														{
															min: 3,
															message:
																"Business location must be at least 3 characters"
														}
													]}
													hasFeedback>
													<Input
														placeholder="Enter business location (e.g., Sabon Gari Market)"
														style={{ textTransform: "uppercase" }}
														suffix={
															<Tooltip title="Enter the specific location where business is conducted">
																<InfoCircleOutlined
																	style={{ color: "rgba(0,0,0,.45)" }}
																/>
															</Tooltip>
														}
													/>
												</Form.Item>

												<Form.Item label="Trade Location" name="trade_location">
													<Input
														placeholder="Enter trade location (e.g., Kantin Kwari Market)"
														style={{ textTransform: "uppercase" }}
														suffix={
															<Tooltip title="Enter the specific location where the trade/skill is practiced">
																<InfoCircleOutlined
																	style={{ color: "rgba(0,0,0,.45)" }}
																/>
															</Tooltip>
														}
													/>
												</Form.Item>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
													label="Operating Capital (Optional)"
													name="operating_capital"
													rules={[
														{
															validator: (_, value) => {
																if (value) {
																	// Remove currency symbols and commas for validation
																	const cleanValue = value
																		.toString()
																		.replace(/[₦,\s]/g, "");

																	// Check if it's a valid number
																	if (isNaN(cleanValue) || cleanValue === "") {
																		return Promise.reject(
																			"Please enter a valid currency amount"
																		);
																	}

																	// Check if it's positive
																	if (parseFloat(cleanValue) < 0) {
																		return Promise.reject(
																			"Operating capital cannot be negative"
																		);
																	}

																	// Check for reasonable maximum (e.g., 1 billion naira)
																	if (parseFloat(cleanValue) > 1000000000) {
																		return Promise.reject(
																			"Please enter a reasonable amount"
																		);
																	}
																}
																return Promise.resolve();
															}
														}
													]}
													hasFeedback>
													<InputNumber
														placeholder="Enter amount (e.g., 50000)"
														style={{ width: "100%" }}
														formatter={(value) => {
															if (!value) return "";
															// Format with naira symbol and thousand separators
															return `₦ ${value}`.replace(
																/\B(?=(\d{3})+(?!\d))/g,
																","
															);
														}}
														parser={(value) => {
															if (!value) return "";
															// Remove naira symbol, spaces, and commas
															return value.replace(/₦\s?|(,*)/g, "");
														}}
														min={0}
														max={1000000000}
														precision={2}
														step={1000}
														prefix={<BankOutlined />}
														addonAfter="NGN"
													/>
												</Form.Item>
											</div>
										</Card>

										{/* Form Submission */}
										<div className="flex justify-center gap-4 mb-6">
											<Button
												type="default"
												size="large"
												onClick={handleCancelForm}
												disabled={state.loading}
												style={{
													minWidth: "150px",
													height: "50px",
													fontSize: "16px"
												}}>
												Cancel / Reset
											</Button>
											<Button
												type="primary"
												htmlType="submit"
												size="large"
												disabled={
													duplicateCheck.phone?.exists ||
													duplicateCheck.nin?.exists ||
													formProgress < 100
												}
												loading={state.loading}
												style={{
													minWidth: "200px",
													height: "50px",
													fontSize: "16px"
												}}>
												{duplicateCheck.phone?.exists ||
												duplicateCheck.nin?.exists
													? "Duplicate Detected"
													: formProgress < 100
														? `Complete Required Fields (${formProgress}%)`
														: "Register Trader"}
											</Button>
										</div>

										{/* Auto-save notification */}
										{formProgress > 0 && (
											<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
												<div className="flex items-center gap-2">
													<CheckCircleOutlined style={{ color: "#1890ff" }} />
													<span className="text-sm text-blue-700">
														Form auto-saved • Progress: {formProgress}%
														{formProgress < 100 &&
															` • ${Math.round(
																9 - (formProgress / 100) * 9
															)} required fields remaining`}
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
									</Form>
								</>
							)}
					</CardSession>
				</div>
			</div>
		</>
	);
};

export default CreateTrader;
