import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import {
	Card,
	Form,
	Input,
	Button,
	Select,
	Typography,
	Row,
	Col,
	Statistic,
	Avatar,
	Badge,
	Spin,
	Empty,
	Space,
	Divider,
	Alert,
	Tag,
	message,
	Descriptions,
	List
} from "antd";
import {
	UserAddOutlined,
	SearchOutlined,
	TeamOutlined,
	CalendarOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	ArrowLeftOutlined,
	UserOutlined,
	PhoneOutlined,
	ShopOutlined,
	ToolOutlined,
	CommentOutlined
} from "@ant-design/icons";
import { GET_EMPOWERMENT_SCHEME } from "../../../gql/queries/empowermentSchemeQueries";
import { GET_TRADERS } from "../../../gql/queries/queries";
import { APPLY_TO_EMPOWERMENT_SCHEME } from "../../../gql/mutations/empowermentSchemeMutations";
import Loading from "../../../components/Loading/Loading";
import { toast } from "react-toastify";

const AddTraderToScheme = () => {
	const navigate = useNavigate();
	const { uuid } = useParams();
	const [form] = Form.useForm();

	const [selectedTrader, setSelectedTrader] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredTraders, setFilteredTraders] = useState([]);

	// GraphQL operations
	const { data: schemeData, loading: schemeLoading } = useQuery(
		GET_EMPOWERMENT_SCHEME,
		{
			variables: { uuid }
		}
	);

	const { data: tradersData, loading: tradersLoading } = useQuery(GET_TRADERS, {
		variables: {
			orderByColumn: "full_name",
			direction: "ASC"
		}
	});

	const [applyToScheme, { loading: applying }] = useMutation(
		APPLY_TO_EMPOWERMENT_SCHEME,
		{
			onCompleted: () => {
				message.success({
					content: "🎉 Trader successfully added to empowerment scheme!",
					duration: 3
				});
				setTimeout(() => {
					navigate(`/admin/empowerment-schemes/${uuid}`);
				}, 1000);
			},
			onError: (error) => {
				console.error("Add trader error:", error);
				message.error({
					content: error.message || "❌ Error adding trader to scheme. Please try again.",
					duration: 5
				});
			}
		}
	);

	const scheme = schemeData?.empowermentScheme;
	const traders = tradersData?.traders || [];
	const loading = schemeLoading || tradersLoading;

	// Filter traders based on search term
	useEffect(() => {
		if (traders.length > 0) {
			const filtered = traders.filter(
				(trader) =>
					trader.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					trader.phone?.includes(searchTerm) ||
					trader.business_name
						?.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					trader.trade?.name?.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredTraders(filtered);
		}
	}, [traders, searchTerm]);

	// Get traders already in the scheme to avoid duplicates
	const existingTraderIds = scheme?.traders?.map((t) => t.id) || [];
	const availableTraders = filteredTraders.filter(
		(trader) => !existingTraderIds.includes(trader.id)
	);

	const handleSubmit = async (values) => {
		const { trader_id, remarks } = values;

		if (!trader_id) {
			message.error("Please select a trader");
			return;
		}

		if (!scheme) {
			message.error("Scheme not found");
			return;
		}

		// Check if scheme is still open
		if (!scheme.is_open) {
			message.error("This empowerment scheme is not open for new applications");
			return;
		}

		try {
			await applyToScheme({
				variables: {
					empowerment_scheme_id: scheme.id,
					trader_id: parseInt(trader_id),
					remarks: remarks?.trim() || null
				}
			});
		} catch (error) {
			console.error("Form submission error:", error);
		}
	};

	const handleTraderSelect = (traderId) => {
		const trader = availableTraders.find(t => t.id === traderId);
		setSelectedTrader(trader);
		form.setFieldsValue({ trader_id: traderId });
	};

	if (loading) {
		return (
			<div style={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				minHeight: '50vh' 
			}}>
				<Spin size="large" tip="Loading scheme and traders data..." />
			</div>
		);
	}

	return (
		<div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				{/* Header */}
				<Card>
					<Row align="middle" justify="space-between">
						<Col>
							<Space>
								<Button 
									icon={<ArrowLeftOutlined />} 
									onClick={() => navigate(`/admin/empowerment-schemes/${uuid}`)}
									type="text"
								/>
								<Title level={2} style={{ margin: 0 }}>
									<UserAddOutlined style={{ color: '#1890ff', marginRight: 8 }} />
									Add Trader to Scheme
								</Title>
							</Space>
						</Col>
						<Col>
							<Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
								{scheme?.name}
							</Tag>
						</Col>
					</Row>
				</Card>
			<div className="flex flex-wrap">
				<div className="w-full px-4">
					<div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
						{/* Header */}
						<div className="rounded-t mb-0 px-6 py-4 border-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
							<div className="flex flex-wrap items-center justify-between">
								<div className="relative w-auto flex-initial">
									<h3 className="font-bold text-xl text-gray-800">
										<i className="fas fa-user-plus mr-2 text-blue-600"></i>
										Add Trader to Scheme
									</h3>
									{scheme && (
										<p className="text-sm text-gray-600 mt-1">
											Scheme:{" "}
											<span className="font-medium text-indigo-600">
												{scheme.name}
											</span>
										</p>
									)}
								</div>
								<button
									onClick={() => navigate(`/admin/empowerment-schemes/${uuid}`)}
									className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-bold uppercase px-4 py-2 rounded-lg shadow-md hover:shadow-lg outline-none focus:outline-none focus:ring-2 focus:ring-gray-400 ease-linear transition-all duration-150">
									<i className="fas fa-arrow-left mr-2"></i>
									Back to Scheme
								</button>
							</div>
						</div>

						{/* Scheme Status Info */}
						{scheme && (
							<div className="px-6 py-4 border-b bg-gray-50">
								<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
									<div className="text-center bg-white p-4 rounded-lg shadow-sm">
										<div className="flex items-center justify-center mb-2">
											<i
												className={`fas fa-circle text-sm mr-1 ${
													scheme.is_open ? "text-green-500" : "text-red-500"
												}`}></i>
											<p className="text-xs text-gray-500 uppercase font-semibold">
												Status
											</p>
										</div>
										<p
											className={`font-bold text-lg ${
												scheme.is_open ? "text-green-600" : "text-red-600"
											}`}>
											{scheme.is_open ? "Open" : "Closed"}
										</p>
									</div>
									<div className="text-center bg-white p-4 rounded-lg shadow-sm">
										<div className="flex items-center justify-center mb-2">
											<i className="fas fa-users text-blue-500 text-sm mr-1"></i>
											<p className="text-xs text-gray-500 uppercase font-semibold">
												Participants
											</p>
										</div>
										<p className="font-bold text-lg text-blue-600">
											{scheme.current_participants || 0} /{" "}
											{scheme.max_participants || 0}
										</p>
									</div>
									<div className="text-center bg-white p-4 rounded-lg shadow-sm">
										<div className="flex items-center justify-center mb-2">
											<i className="fas fa-plus-circle text-green-500 text-sm mr-1"></i>
											<p className="text-xs text-gray-500 uppercase font-semibold">
												Available Slots
											</p>
										</div>
										<p className="font-bold text-lg text-green-600">
											{scheme.available_slots || 0}
										</p>
									</div>
									<div className="text-center bg-white p-4 rounded-lg shadow-sm">
										<div className="flex items-center justify-center mb-2">
											<i className="fas fa-calendar text-orange-500 text-sm mr-1"></i>
											<p className="text-xs text-gray-500 uppercase font-semibold">
												Deadline
											</p>
										</div>
										<p className="font-bold text-lg text-orange-600">
											{scheme.application_deadline
												? new Date(
														scheme.application_deadline
												  ).toLocaleDateString()
												: "Not Set"}
										</p>
									</div>
								</div>
							</div>
						)}

						<form onSubmit={handleSubmit} className="p-6">
							{/* Search Traders */}
							<div className="mb-6">
								<label className="block text-sm font-semibold text-gray-700 mb-3">
									<i className="fas fa-search mr-2 text-blue-500"></i>
									Search and Select Traders
								</label>
								<div className="relative">
									<input
										type="text"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										placeholder="Search by name, phone, business name, or trade..."
										className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-12 text-gray-700"
									/>
									<i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-lg"></i>
									{searchTerm && (
										<button
											type="button"
											onClick={() => setSearchTerm("")}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
											<i className="fas fa-times"></i>
										</button>
									)}
								</div>
							</div>

							{/* Traders List */}
							<div className="mb-6">
								<label className="block text-sm font-semibold text-gray-700 mb-3">
									<i className="fas fa-users mr-2 text-green-500"></i>
									Select Trader
									<span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs ml-2">
										{availableTraders.length} available
									</span>
								</label>

								{availableTraders.length === 0 ? (
									<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
										{traders.length === 0 ? (
											<div>
												<div className="text-gray-400 mb-4">
													<i className="fas fa-users fa-3x"></i>
												</div>
												<p className="text-gray-600 font-medium mb-2">
													No traders found in the system
												</p>
												<p className="text-sm text-gray-500">
													Please add traders first before creating applications
												</p>
											</div>
										) : existingTraderIds.length > 0 &&
										  filteredTraders.length === existingTraderIds.length ? (
											<div>
												<div className="text-gray-400 mb-4">
													<i className="fas fa-check-circle fa-3x"></i>
												</div>
												<p className="text-gray-600 font-medium mb-2">
													All matching traders are already in this scheme
												</p>
												<p className="text-sm text-gray-500">
													Try searching for other traders
												</p>
											</div>
										) : (
											<div>
												<div className="text-gray-400 mb-4">
													<i className="fas fa-search fa-3x"></i>
												</div>
												<p className="text-gray-600 font-medium mb-2">
													No traders match your search criteria
												</p>
												<p className="text-sm text-gray-500">
													Try adjusting your search terms
												</p>
											</div>
										)}
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-xl">
										{availableTraders.map((trader) => (
											<TraderCard key={trader.id} trader={trader} />
										))}
									</div>
								)}
							</div>

							{/* Remarks */}
							<div className="mb-6">
								<label className="block uppercase text-gray-600 text-xs font-bold mb-2">
									<i className="fas fa-comment mr-1"></i>
									Remarks (Optional)
								</label>
								<textarea
									value={remarks}
									onChange={(e) => setRemarks(e.target.value)}
									placeholder="Add any remarks about this application..."
									rows={3}
									className="border-0 px-3 py-3 placeholder-gray-300 text-gray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
								/>
							</div>

							{/* Submit Button */}
							<div className="flex items-center justify-end space-x-4">
								<button
									type="button"
									onClick={() => navigate(`/admin/empowerment-schemes/${uuid}`)}
									disabled={applying}
									className={`${
										applying
											? "bg-gray-300 cursor-not-allowed"
											: "bg-gray-500 hover:bg-gray-600"
									} text-white text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150`}>
									<i className="fas fa-times mr-2"></i>
									Cancel
								</button>
								<button
									type="submit"
									disabled={applying || !selectedTrader || !scheme?.is_open}
									className={`${
										applying || !selectedTrader || !scheme?.is_open
											? "bg-gray-400 cursor-not-allowed"
											: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
									} text-white text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 flex items-center space-x-2`}>
									{applying && <i className="fas fa-spinner fa-spin"></i>}
									{!applying && <i className="fas fa-user-plus"></i>}
									<span>{applying ? "Adding..." : "Add Trader"}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default AddTraderToScheme;
