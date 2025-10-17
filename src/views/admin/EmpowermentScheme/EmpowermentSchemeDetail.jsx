import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_EMPOWERMENT_SCHEME } from "../../../gql/queries/empowermentSchemeQueries";
import { DELETE_EMPOWERMENT_SCHEME } from "../../../gql/mutations/empowermentSchemeMutations";
import Loading from "../../../components/Loading/Loading";
import { toast } from "react-toastify";

const EmpowermentSchemeDetail = () => {
	const { uuid } = useParams();
	const navigate = useNavigate();

	const { data, loading, error } = useQuery(GET_EMPOWERMENT_SCHEME, {
		variables: { uuid },
		fetchPolicy: "cache-and-network"
	});

	const [deleteScheme, { loading: deleteLoading }] = useMutation(
		DELETE_EMPOWERMENT_SCHEME,
		{
			onCompleted: () => {
				toast.success("Empowerment scheme deleted successfully!");
				navigate("/admin/empowerment-schemes");
			},
			onError: (error) => {
				toast.error(error.message || "Error deleting empowerment scheme");
			}
		}
	);

	const scheme = data?.empowermentScheme;

	const handleDelete = () => {
		if (
			window.confirm(
				"Are you sure you want to delete this empowerment scheme? This action cannot be undone."
			)
		) {
			deleteScheme({ variables: { id: scheme.id } });
		}
	};

	const getStatusBadge = (status) => {
		const statusClasses = {
			DRAFT: "bg-gray-100 text-gray-800",
			ACTIVE: "bg-green-100 text-green-800",
			SUSPENDED: "bg-yellow-100 text-yellow-800",
			COMPLETED: "bg-blue-100 text-blue-800",
			CANCELLED: "bg-red-100 text-red-800"
		};

		return (
			<span
				className={`px-3 py-1 text-sm font-semibold rounded-full ${
					statusClasses[status] || "bg-gray-100 text-gray-800"
				}`}>
				{status?.replace("_", " ")}
			</span>
		);
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN"
		}).format(amount || 0);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
	};

	if (loading || deleteLoading) return <Loading />;

	if (error) {
		toast.error("Error loading empowerment scheme");
		return (
			<div className="flex flex-wrap">
				<div className="w-full px-4">
					<div className="text-center py-8">
						<p className="text-red-600">Error loading empowerment scheme</p>
						<Link
							to="/admin/empowerment-schemes"
							className="text-indigo-600 hover:text-indigo-900">
							Back to List
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!scheme) {
		return (
			<div className="flex flex-wrap">
				<div className="w-full px-4">
					<div className="text-center py-8">
						<p className="text-gray-500">Empowerment scheme not found</p>
						<Link
							to="/admin/empowerment-schemes"
							className="text-indigo-600 hover:text-indigo-900">
							Back to List
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="flex flex-wrap">
				<div className="w-full px-4">
					<div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
						{/* Header */}
						<div className="rounded-t mb-0 px-4 py-3 border-0">
							<div className="flex flex-wrap items-center">
								<div className="relative w-full px-4 max-w-full flex-grow flex-1">
									<h3 className="font-semibold text-lg text-blueGray-700">
										{scheme.name}
									</h3>
									<div className="mt-2">{getStatusBadge(scheme.status)}</div>
								</div>
								<div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
									<div className="space-x-2">
										<Link
											to="/admin/empowerment-schemes"
											className="bg-gray-500 text-white active:bg-gray-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
											Back to List
										</Link>
										<Link
											to={`/admin/empowerment-schemes/${scheme.uuid}/edit`}
											className="bg-yellow-500 text-white active:bg-yellow-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
											Edit
										</Link>
										<Link
											to={`/admin/empowerment-schemes/${scheme.uuid}/applications`}
											className="bg-green-500 text-white active:bg-green-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
											Manage Applications
										</Link>
										<button
											onClick={handleDelete}
											className="bg-red-500 text-white active:bg-red-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
											Delete
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Content */}
						<div className="flex-auto px-4 lg:px-10 py-10 pt-0">
							<div className="flex flex-wrap">
								{/* Basic Information */}
								<div className="w-full mb-6">
									<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
										Basic Information
									</h4>
								</div>

								<div className="w-full lg:w-6/12 px-4 mb-4">
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
											Scheme Name
										</label>
										<div className="text-blueGray-700 text-sm">
											{scheme.name}
										</div>
									</div>
								</div>

								<div className="w-full lg:w-6/12 px-4 mb-4">
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
											Duration
										</label>
										<div className="text-blueGray-700 text-sm">
											{scheme.duration_months} months
										</div>
									</div>
								</div>

								{scheme.description && (
									<div className="w-full px-4 mb-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Description
											</label>
											<div className="text-blueGray-700 text-sm">
												{scheme.description}
											</div>
										</div>
									</div>
								)}

								{/* Participants and Budget */}
								<div className="w-full mb-6">
									<hr className="mt-6 border-b-1 border-blueGray-300" />
									<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
										Participants and Budget
									</h4>
								</div>

								<div className="w-full lg:w-4/12 px-4 mb-4">
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
											Participants
										</label>
										<div className="text-blueGray-700 text-sm">
											<div className="flex items-center">
												<span>
													{scheme.current_participants} /{" "}
													{scheme.max_participants}
												</span>
												<div className="ml-3 flex-1 bg-gray-200 rounded-full h-2">
													<div
														className="bg-indigo-600 h-2 rounded-full"
														style={{
															width: `${scheme.progress_percentage}%`
														}}></div>
												</div>
												<span className="ml-2 text-xs">
													({scheme.progress_percentage}%)
												</span>
											</div>
											<div className="mt-1 text-xs text-gray-500">
												{scheme.available_slots} slots available
											</div>
										</div>
									</div>
								</div>

								{scheme.amount_per_participant && (
									<div className="w-full lg:w-4/12 px-4 mb-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Amount per Participant
											</label>
											<div className="text-blueGray-700 text-sm">
												{formatCurrency(scheme.amount_per_participant)}
											</div>
										</div>
									</div>
								)}

								{scheme.total_budget && (
									<div className="w-full lg:w-4/12 px-4 mb-4">
										<div className="relative w-full mb-3">
											<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
												Total Budget
											</label>
											<div className="text-blueGray-700 text-sm">
												{formatCurrency(scheme.total_budget)}
											</div>
										</div>
									</div>
								)}

								{/* Important Dates */}
								<div className="w-full mb-6">
									<hr className="mt-6 border-b-1 border-blueGray-300" />
									<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
										Important Dates
									</h4>
								</div>

								<div className="w-full lg:w-4/12 px-4 mb-4">
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
											Application Deadline
										</label>
										<div
											className={`text-sm ${
												new Date(scheme.application_deadline) < new Date()
													? "text-red-600"
													: "text-blueGray-700"
											}`}>
											{formatDate(scheme.application_deadline)}
										</div>
									</div>
								</div>

								<div className="w-full lg:w-4/12 px-4 mb-4">
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
											Start Date
										</label>
										<div className="text-blueGray-700 text-sm">
											{formatDate(scheme.start_date)}
										</div>
									</div>
								</div>

								<div className="w-full lg:w-4/12 px-4 mb-4">
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
											End Date
										</label>
										<div className="text-blueGray-700 text-sm">
											{formatDate(scheme.end_date)}
										</div>
									</div>
								</div>

								{/* Location */}
								{scheme.location && (
									<>
										<div className="w-full mb-6">
											<hr className="mt-6 border-b-1 border-blueGray-300" />
											<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
												Location
											</h4>
										</div>

										<div className="w-full px-4 mb-4">
											<div className="relative w-full mb-3">
												<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
													Location
												</label>
												<div className="text-blueGray-700 text-sm">
													{scheme.location.title}
													{scheme.location.lga && (
														<span className="text-gray-500">
															{" "}
															- {scheme.location.lga}
														</span>
													)}
												</div>
											</div>
										</div>
									</>
								)}

								{/* Requirements, Benefits, Eligibility */}
								{(scheme.requirements?.length > 0 ||
									scheme.benefits?.length > 0 ||
									scheme.eligibility_criteria?.length > 0) && (
									<>
										<div className="w-full mb-6">
											<hr className="mt-6 border-b-1 border-blueGray-300" />
											<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
												Details
											</h4>
										</div>

										{scheme.requirements?.length > 0 && (
											<div className="w-full lg:w-4/12 px-4 mb-4">
												<div className="relative w-full mb-3">
													<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
														Requirements
													</label>
													<ul className="text-blueGray-700 text-sm list-disc list-inside">
														{scheme.requirements.map((req, index) => (
															<li key={index}>{req}</li>
														))}
													</ul>
												</div>
											</div>
										)}

										{scheme.benefits?.length > 0 && (
											<div className="w-full lg:w-4/12 px-4 mb-4">
												<div className="relative w-full mb-3">
													<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
														Benefits
													</label>
													<ul className="text-blueGray-700 text-sm list-disc list-inside">
														{scheme.benefits.map((benefit, index) => (
															<li key={index}>{benefit}</li>
														))}
													</ul>
												</div>
											</div>
										)}

										{scheme.eligibility_criteria?.length > 0 && (
											<div className="w-full lg:w-4/12 px-4 mb-4">
												<div className="relative w-full mb-3">
													<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
														Eligibility Criteria
													</label>
													<ul className="text-blueGray-700 text-sm list-disc list-inside">
														{scheme.eligibility_criteria.map(
															(criteria, index) => (
																<li key={index}>{criteria}</li>
															)
														)}
													</ul>
												</div>
											</div>
										)}
									</>
								)}

								{/* Contact Information */}
								{(scheme.contact_person ||
									scheme.contact_email ||
									scheme.contact_phone) && (
									<>
										<div className="w-full mb-6">
											<hr className="mt-6 border-b-1 border-blueGray-300" />
											<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
												Contact Information
											</h4>
										</div>

										{scheme.contact_person && (
											<div className="w-full lg:w-4/12 px-4 mb-4">
												<div className="relative w-full mb-3">
													<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
														Contact Person
													</label>
													<div className="text-blueGray-700 text-sm">
														{scheme.contact_person}
													</div>
												</div>
											</div>
										)}

										{scheme.contact_email && (
											<div className="w-full lg:w-4/12 px-4 mb-4">
												<div className="relative w-full mb-3">
													<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
														Contact Email
													</label>
													<div className="text-blueGray-700 text-sm">
														<a
															href={`mailto:${scheme.contact_email}`}
															className="text-indigo-600 hover:text-indigo-900">
															{scheme.contact_email}
														</a>
													</div>
												</div>
											</div>
										)}

										{scheme.contact_phone && (
											<div className="w-full lg:w-4/12 px-4 mb-4">
												<div className="relative w-full mb-3">
													<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
														Contact Phone
													</label>
													<div className="text-blueGray-700 text-sm">
														<a
															href={`tel:${scheme.contact_phone}`}
															className="text-indigo-600 hover:text-indigo-900">
															{scheme.contact_phone}
														</a>
													</div>
												</div>
											</div>
										)}
									</>
								)}

								{/* Metadata */}
								<div className="w-full mb-6">
									<hr className="mt-6 border-b-1 border-blueGray-300" />
									<h4 className="text-blueGray-500 text-sm mt-3 mb-6 font-bold uppercase">
										Additional Information
									</h4>
								</div>

								<div className="w-full lg:w-6/12 px-4 mb-4">
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
											Created By
										</label>
										<div className="text-blueGray-700 text-sm">
											{scheme.created_by_user?.name || "Unknown"}
										</div>
									</div>
								</div>

								<div className="w-full lg:w-6/12 px-4 mb-4">
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
											Created At
										</label>
										<div className="text-blueGray-700 text-sm">
											{formatDate(scheme.created_at)}
										</div>
									</div>
								</div>

								<div className="w-full lg:w-6/12 px-4 mb-4">
									<div className="relative w-full mb-3">
										<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
											Scheme Open for Applications
										</label>
										<div className="text-blueGray-700 text-sm">
											<span
												className={`px-2 py-1 text-xs font-semibold rounded ${
													scheme.is_open
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}>
												{scheme.is_open ? "Yes" : "No"}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default EmpowermentSchemeDetail;
