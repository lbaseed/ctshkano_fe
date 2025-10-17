import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import {
	CREATE_EMPOWERMENT_SCHEME,
	UPDATE_EMPOWERMENT_SCHEME
} from "../../../gql/mutations/empowermentSchemeMutations";
import { GET_EMPOWERMENT_SCHEME } from "../../../gql/queries/empowermentSchemeQueries";
import { GET_LOCATIONS } from "../../../gql/queries/queries";
import Loading from "../../../components/Loading/Loading";
import { ToastContainer, toast } from "react-toastify";

const EmpowermentSchemeForm = () => {
	const navigate = useNavigate();
	const { uuid } = useParams();
	const isEdit = Boolean(uuid);

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		duration_months: "",
		max_participants: "",
		amount_per_participant: "",
		total_budget: "",
		start_date: "",
		end_date: "",
		application_deadline: "",
		requirements: [""],
		benefits: [""],
		eligibility_criteria: [""],
		contact_person: "",
		contact_email: "",
		contact_phone: "",
		location_id: "",
		status: "DRAFT"
	});

	// GraphQL operations
	const { data: locationsData } = useQuery(GET_LOCATIONS);
	const { data: schemeData, loading: schemeLoading } = useQuery(
		GET_EMPOWERMENT_SCHEME,
		{
			variables: { uuid },
			skip: !isEdit
		}
	);

	const [createScheme, { loading: createLoading }] = useMutation(
		CREATE_EMPOWERMENT_SCHEME,
		{
			onCompleted: (data) => {
				toast.success("🎉 Empowerment scheme created successfully!");
				// Small delay to show success message before navigation
				setTimeout(() => {
					navigate(
						`/admin/empowerment-schemes/${data.createEmpowermentScheme.uuid}`
					);
				}, 1000);
			},
			onError: (error) => {
				console.error("Create scheme error:", error);
				toast.error(
					error.message ||
						"❌ Error creating empowerment scheme. Please try again."
				);
			}
		}
	);

	const [updateScheme, { loading: updateLoading }] = useMutation(
		UPDATE_EMPOWERMENT_SCHEME,
		{
			onCompleted: (data) => {
				toast.success("✅ Empowerment scheme updated successfully!");
				// Small delay to show success message before navigation
				setTimeout(() => {
					navigate(
						`/admin/empowerment-schemes/${data.updateEmpowermentScheme.uuid}`
					);
				}, 1000);
			},
			onError: (error) => {
				console.error("Update scheme error:", error);
				toast.error(
					error.message ||
						"❌ Error updating empowerment scheme. Please try again."
				);
			}
		}
	);

	const locations = locationsData?.locations || [];
	const loading = createLoading || updateLoading || schemeLoading;

	// Load existing scheme data for editing
	useEffect(() => {
		if (schemeData?.empowermentScheme && isEdit) {
			const scheme = schemeData.empowermentScheme;
			setFormData({
				name: scheme.name || "",
				description: scheme.description || "",
				duration_months: scheme.duration_months || "",
				max_participants: scheme.max_participants || "",
				amount_per_participant: scheme.amount_per_participant || "",
				total_budget: scheme.total_budget || "",
				start_date: scheme.start_date ? scheme.start_date.split("T")[0] : "",
				end_date: scheme.end_date ? scheme.end_date.split("T")[0] : "",
				application_deadline: scheme.application_deadline
					? scheme.application_deadline.split("T")[0]
					: "",
				requirements: scheme.requirements || [""],
				benefits: scheme.benefits || [""],
				eligibility_criteria: scheme.eligibility_criteria || [""],
				contact_person: scheme.contact_person || "",
				contact_email: scheme.contact_email || "",
				contact_phone: scheme.contact_phone || "",
				location_id: scheme.location?.id || "",
				status: scheme.status || "DRAFT"
			});
		}
	}, [schemeData, isEdit]);

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));

		// Auto-calculate total budget
		if (name === "amount_per_participant" || name === "max_participants") {
			const amount =
				name === "amount_per_participant"
					? parseFloat(value) || 0
					: parseFloat(formData.amount_per_participant) || 0;
			const participants =
				name === "max_participants"
					? parseInt(value) || 0
					: parseInt(formData.max_participants) || 0;

			if (amount > 0 && participants > 0) {
				setFormData((prev) => ({
					...prev,
					total_budget: (amount * participants).toString()
				}));
			}
		}
	};

	// Handle array field changes (requirements, benefits, eligibility_criteria)
	const handleArrayChange = (field, index, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: prev[field].map((item, i) => (i === index ? value : item))
		}));
	};

	const addArrayField = (field) => {
		setFormData((prev) => ({
			...prev,
			[field]: [...prev[field], ""]
		}));
	};

	const removeArrayField = (field, index) => {
		if (formData[field].length > 1) {
			setFormData((prev) => ({
				...prev,
				[field]: prev[field].filter((_, i) => i !== index)
			}));
		}
	};

	// Form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate required fields
		if (
			!formData.name ||
			!formData.duration_months ||
			!formData.max_participants ||
			!formData.start_date ||
			!formData.end_date ||
			!formData.application_deadline
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		// Validate dates
		const startDate = new Date(formData.start_date);
		const endDate = new Date(formData.end_date);
		const deadline = new Date(formData.application_deadline);

		if (deadline >= startDate) {
			toast.error("Application deadline must be before the start date");
			return;
		}

		if (endDate.getTime() <= startDate.getTime()) {
			toast.error("End date must be after the start date");
			return;
		}

		// Prepare form data - filter out null/empty values
		const inputData = {
			name: formData.name,
			duration_months: parseInt(formData.duration_months),
			max_participants: parseInt(formData.max_participants),
			start_date: formData.start_date,
			end_date: formData.end_date,
			application_deadline: formData.application_deadline
		};

		// Add optional fields only if they have values
		if (formData.description?.trim()) {
			inputData.description = formData.description;
		}

		if (formData.amount_per_participant) {
			inputData.amount_per_participant = parseFloat(
				formData.amount_per_participant
			);
		}

		if (formData.total_budget) {
			inputData.total_budget = parseFloat(formData.total_budget);
		}

		// Handle arrays - only include if they have non-empty values
		const requirements = formData.requirements.filter(
			(req) => req.trim() !== ""
		);
		if (requirements.length > 0) {
			inputData.requirements = requirements;
		}

		const benefits = formData.benefits.filter((ben) => ben.trim() !== "");
		if (benefits.length > 0) {
			inputData.benefits = benefits;
		}

		const eligibility = formData.eligibility_criteria.filter(
			(cri) => cri.trim() !== ""
		);
		if (eligibility.length > 0) {
			inputData.eligibility_criteria = eligibility;
		}

		// Contact information
		if (formData.contact_person?.trim()) {
			inputData.contact_person = formData.contact_person;
		}

		if (formData.contact_email?.trim()) {
			inputData.contact_email = formData.contact_email;
		}

		if (formData.contact_phone?.trim()) {
			inputData.contact_phone = formData.contact_phone;
		}

		if (formData.location_id) {
			inputData.location_id = parseInt(formData.location_id);
		}

		// Show loading feedback and submit
		try {
			if (isEdit) {
				toast.info("🔄 Updating empowerment scheme...", { autoClose: 2000 });
				inputData.id = schemeData.empowermentScheme.id;
				inputData.status = formData.status;

				console.log("Update variables:", { input: inputData });
				await updateScheme({ variables: { input: inputData } });
			} else {
				toast.info("🔄 Creating empowerment scheme...", { autoClose: 2000 });

				console.log("Create variables:", { input: inputData });
				await createScheme({ variables: { input: inputData } });
			}
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error(`❌ Error: ${error.message}`);
		}
	};

	return (
		<>
			{loading && <Loading />}
			<ToastContainer />
			<div className="flex flex-wrap">
				<div className="w-full px-4">
					<div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
						{/* Header */}
						<div className="rounded-t mb-0 px-4 py-3 border-0">
							<div className="flex flex-wrap items-center">
								<div className="relative w-full px-4 max-w-full flex-grow flex-1">
									<h3 className="font-semibold text-lg text-blueGray-700">
										{isEdit
											? "Edit Empowerment Scheme"
											: "Create New Empowerment Scheme"}
									</h3>
								</div>
								<div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
									<button
										onClick={() => navigate("/admin/empowerment-schemes")}
										className="bg-gray-500 text-white active:bg-gray-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
										Back to List
									</button>
								</div>
							</div>
						</div>

						{/* Form */}
						<div className="flex-auto px-4 lg:px-10 py-10 pt-0">
							<form onSubmit={handleSubmit}>
								<div className="flex flex-wrap">
									{/* Basic Information */}
									<div className="w-full mb-6">
										<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
											Basic Information
										</h4>
									</div>

									{/* Scheme Name */}
									<div className="w-full lg:w-6/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Scheme Name *
											</label>
											<input
												type="text"
												name="name"
												value={formData.name}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												placeholder="Enter scheme name"
												required
											/>
										</div>
									</div>

									{/* Duration */}
									<div className="w-full lg:w-6/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Duration (Months) *
											</label>
											<input
												type="number"
												name="duration_months"
												value={formData.duration_months}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												placeholder="Enter duration in months"
												min="1"
												required
											/>
										</div>
									</div>

									{/* Description */}
									<div className="w-full px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Description
											</label>
											<textarea
												name="description"
												value={formData.description}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												placeholder="Enter scheme description"
												rows="4"
											/>
										</div>
									</div>

									{/* Participants and Budget */}
									<div className="w-full mb-6">
										<hr className="mt-6 border-b-1 border-blueGray-300" />
										<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
											Participants and Budget
										</h4>
									</div>

									{/* Max Participants */}
									<div className="w-full lg:w-4/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Max Participants *
											</label>
											<input
												type="number"
												name="max_participants"
												value={formData.max_participants}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												placeholder="Maximum participants"
												min="1"
												required
											/>
										</div>
									</div>

									{/* Amount per Participant */}
									<div className="w-full lg:w-4/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Amount per Participant (₦)
											</label>
											<input
												type="number"
												name="amount_per_participant"
												value={formData.amount_per_participant}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												placeholder="Amount per participant"
												min="0"
												step="0.01"
											/>
										</div>
									</div>

									{/* Total Budget */}
									<div className="w-full lg:w-4/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Total Budget (₦)
											</label>
											<input
												type="number"
												name="total_budget"
												value={formData.total_budget}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												placeholder="Total budget"
												min="0"
												step="0.01"
											/>
										</div>
									</div>

									{/* Dates */}
									<div className="w-full mb-6">
										<hr className="mt-6 border-b-1 border-blueGray-300" />
										<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
											Important Dates
										</h4>
									</div>

									{/* Application Deadline */}
									<div className="w-full lg:w-4/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Application Deadline *
											</label>
											<input
												type="date"
												name="application_deadline"
												value={formData.application_deadline}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												required
											/>
										</div>
									</div>

									{/* Start Date */}
									<div className="w-full lg:w-4/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Start Date *
											</label>
											<input
												type="date"
												name="start_date"
												value={formData.start_date}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												required
											/>
										</div>
									</div>

									{/* End Date */}
									<div className="w-full lg:w-4/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												End Date *
											</label>
											<input
												type="date"
												name="end_date"
												value={formData.end_date}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												required
											/>
										</div>
									</div>

									{/* Additional Information */}
									<div className="w-full mb-6">
										<hr className="mt-6 border-b-1 border-blueGray-300" />
										<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
											Additional Information
										</h4>
									</div>

									{/* Location */}
									<div className="w-full lg:w-6/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Location
											</label>
											<select
												name="location_id"
												value={formData.location_id}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
												<option value="">Select Location</option>
												{locations.map((location) => (
													<option key={location.id} value={location.id}>
														{location.title}
													</option>
												))}
											</select>
										</div>
									</div>

									{/* Status (Edit only) */}
									{isEdit && (
										<div className="w-full lg:w-6/12 px-4">
											<div className="relative w-full mb-3">
												<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
													Status
												</label>
												<select
													name="status"
													value={formData.status}
													onChange={handleInputChange}
													className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150">
													<option value="DRAFT">Draft</option>
													<option value="ACTIVE">Active</option>
													<option value="SUSPENDED">Suspended</option>
													<option value="COMPLETED">Completed</option>
													<option value="CANCELLED">Cancelled</option>
												</select>
											</div>
										</div>
									)}

									{/* Requirements */}
									<div className="w-full px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Requirements
											</label>
											{formData.requirements.map((req, index) => (
												<div key={index} className="flex items-center mb-2">
													<input
														type="text"
														value={req}
														onChange={(e) =>
															handleArrayChange(
																"requirements",
																index,
																e.target.value
															)
														}
														className="border-0 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring flex-1 ease-linear transition-all duration-150"
														placeholder="Enter requirement"
													/>
													<button
														type="button"
														onClick={() =>
															removeArrayField("requirements", index)
														}
														className="ml-2 px-2 py-2 text-red-600 hover:text-red-800">
														<i className="fas fa-trash"></i>
													</button>
												</div>
											))}
											<button
												type="button"
												onClick={() => addArrayField("requirements")}
												className="text-indigo-600 hover:text-indigo-800 text-sm">
												+ Add Requirement
											</button>
										</div>
									</div>

									{/* Contact Information */}
									<div className="w-full mb-6">
										<hr className="mt-6 border-b-1 border-blueGray-300" />
										<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
											Contact Information
										</h4>
									</div>

									{/* Contact Person */}
									<div className="w-full lg:w-4/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Contact Person
											</label>
											<input
												type="text"
												name="contact_person"
												value={formData.contact_person}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												placeholder="Contact person name"
											/>
										</div>
									</div>

									{/* Contact Email */}
									<div className="w-full lg:w-4/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Contact Email
											</label>
											<input
												type="email"
												name="contact_email"
												value={formData.contact_email}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												placeholder="contact@example.com"
											/>
										</div>
									</div>

									{/* Contact Phone */}
									<div className="w-full lg:w-4/12 px-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Contact Phone
											</label>
											<input
												type="tel"
												name="contact_phone"
												value={formData.contact_phone}
												onChange={handleInputChange}
												className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
												placeholder="Phone number"
											/>
										</div>
									</div>

									{/* Loading Progress Indicator */}
									{loading && (
										<div className="w-full px-4 mb-4">
											<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
												<div className="flex items-center space-x-3">
													<div className="flex-shrink-0">
														<i className="fas fa-cog fa-spin text-blue-500"></i>
													</div>
													<div className="flex-1">
														<p className="text-sm font-medium text-blue-800">
															{isEdit
																? "Updating empowerment scheme..."
																: "Creating empowerment scheme..."}
														</p>
														<p className="text-xs text-blue-600 mt-1">
															Please wait while we process your request. This
															may take a few moments.
														</p>
													</div>
												</div>
												{/* Progress bar */}
												<div className="mt-3">
													<div className="bg-blue-200 rounded-full h-2">
														<div
															className="bg-blue-500 h-2 rounded-full animate-pulse"
															style={{ width: "70%" }}></div>
													</div>
												</div>
											</div>
										</div>
									)}

									{/* Submit Buttons */}
									<div className="w-full px-4">
										<div className="flex items-center justify-between mt-6">
											{/* Loading status text */}
											{loading && (
												<div className="flex items-center text-indigo-600 animate-pulse">
													<i className="fas fa-clock mr-2"></i>
													<span className="text-sm font-medium">
														{isEdit
															? "Saving changes..."
															: "Creating new scheme..."}
													</span>
												</div>
											)}

											<div
												className={`flex items-space-between space-x-4 ${
													loading ? "ml-auto" : ""
												}`}>
												<button
													type="button"
													onClick={() => navigate("/admin/empowerment-schemes")}
													disabled={loading}
													className={`${
														loading
															? "bg-red-400 text-gray-500 cursor-not-allowed"
															: "bg-red-500 hover:bg-gray-600 text-white"
													} active:bg-gray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150`}>
													<i className="fas fa-times mr-2"></i>
													Cancel
												</button>
												<button
													type="submit"
													disabled={loading}
													className={`${
														loading
															? "bg-emerald-400 cursor-not-allowed opacity-70 transform scale-95"
															: "bg-emerald-500 hover:bg-indigo-600 active:bg-indigo-700 hover:transform hover:scale-105"
													} text-white text-sm ml-3 font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-200 flex items-center space-x-2`}>
													{loading && (
														<i className="fas fa-spinner fa-spin text-white"></i>
													)}
													{!loading && !isEdit && (
														<i className="fas fa-plus text-white"></i>
													)}
													{!loading && isEdit && (
														<i className="fas fa-save text-white"></i>
													)}
													<span>
														{loading
															? isEdit
																? "Updating..."
																: "Creating..."
															: isEdit
															? "Update Scheme"
															: "Create Scheme"}
													</span>
												</button>
											</div>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default EmpowermentSchemeForm;
