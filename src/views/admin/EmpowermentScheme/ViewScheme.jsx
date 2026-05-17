import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { useCookies } from "react-cookie";
import { pdf } from "@react-pdf/renderer";
import moment from "moment";
import * as XLSX from "xlsx";
import BeneficiariesPdfDocument from "./BeneficiariesPdfDocument";
import {
	Card,
	Form,
	Input,
	Button,
	Typography,
	Row,
	Col,
	Statistic,
	Avatar,
	Badge,
	Spin,
	Empty,
	Space,
	Alert,
	Tag,
	message,
	Descriptions,
	List,
	Select,
	Steps,
	Divider,
	Table,
	Popconfirm,
	Modal,
	Radio
} from "antd";
import {
	DeleteOutlined,
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
	CommentOutlined,
	FileTextOutlined,
	RightOutlined,
	UnorderedListOutlined,
	FilePdfOutlined,
	PlusOutlined,
	EnvironmentOutlined,
	DownloadOutlined
} from "@ant-design/icons";
import {
	GET_EMPOWERMENT_SCHEME,
	GET_EMPOWERMENT_SCHEMES,
	GET_EMPOWERMENT_SCHEME_APPLICATIONS,
	GET_TRADERS_NOT_IN_SCHEME
} from "../../../gql/queries/empowermentSchemeQueries";
import { GET_TRADERS_LIST, GET_TRADES } from "../../../gql/queries/queries";
import { GET_TRADE_LOCATIONS } from "../../../gql/tradeLocation";
import {
	APPLY_TO_EMPOWERMENT_SCHEME,
	BULK_ADD_TRADERS_TO_SCHEME,
	REMOVE_TRADER_FROM_SCHEME
} from "../../../gql/mutations/empowermentSchemeMutations";
import { CREATE_TRADE_LOCATION } from "../../../gql/tradeLocation";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

// --- PDF helpers ---
const PDF_CHUNK_SIZE = 200;

const compressBase64Image = (base64Str, maxSize = 90, quality = 0.65) =>
	new Promise((resolve) => {
		try {
			const img = new window.Image();
			img.onload = () => {
				try {
					const canvas = document.createElement("canvas");
					const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
					canvas.width = Math.max(1, Math.round(img.width * scale));
					canvas.height = Math.max(1, Math.round(img.height * scale));
					const ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
					resolve(canvas.toDataURL("image/jpeg", quality));
				} catch {
					resolve(null);
				}
			};
			img.onerror = () => resolve(null);
			img.src = `data:image/jpeg;base64,${base64Str}`;
		} catch {
			resolve(null);
		}
	});

const compressApplicationPhotos = async (applications, onProgress) => {
	const CONCURRENCY = 8;
	const result = [];
	for (let i = 0; i < applications.length; i += CONCURRENCY) {
		const batch = applications.slice(i, i + CONCURRENCY);
		const processed = await Promise.all(
			batch.map(async (record) => {
				const photo = record.trader?.photo;
				if (!photo)
					return {
						...record,
						trader: { ...record.trader, _photoDataUrl: null }
					};
				const dataUrl = await compressBase64Image(photo);
				return {
					...record,
					trader: { ...record.trader, _photoDataUrl: dataUrl }
				};
			})
		);
		result.push(...processed);
		if (onProgress)
			onProgress(
				Math.min(i + CONCURRENCY, applications.length),
				applications.length
			);
	}
	return result;
};

const ViewScheme = () => {
	const navigate = useNavigate();
	const { uuid } = useParams();
	const location = useLocation();
	const [form] = Form.useForm();
	const [cookies] = useCookies(["ctshkano"]);
	const currentUser = cookies?.ctshkano?.user;
	const isSuperAdmin = currentUser?.clrs === "SUPER_ADMIN";

	// Base path (strips uuid segment if already present)
	const basePath = uuid
		? location.pathname.replace(`/${uuid}`, "")
		: location.pathname;

	// State management
	const [currentStep, setCurrentStep] = useState(uuid ? 1 : 0); // Skip scheme selection if uuid provided
	const [selectedScheme, setSelectedScheme] = useState(null);
	const [selectedTraders, setSelectedTraders] = useState([]);
	const [selectedParticipants, setSelectedParticipants] = useState([]);
	const [bulkRemoving, setBulkRemoving] = useState(false);
	const [pdfExporting, setPdfExporting] = useState(false);
	const [excelExporting, setExcelExporting] = useState(false);
	const [locationModalVisible, setLocationModalVisible] = useState(false);
	const [locationForm] = Form.useForm();
	const [participantSearch, setParticipantSearch] = useState("");
	const [participantLocationFilter, setParticipantLocationFilter] =
		useState(null);
	const [participantTradeFilter, setParticipantTradeFilter] = useState(null);
	const [participantPage, setParticipantPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [filteredTraders, setFilteredTraders] = useState([]);
	const [schemeSearchTerm, setSchemeSearchTerm] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [addMode, setAddMode] = useState("individual"); // "individual" | "trade"
	const [selectedTradeId, setSelectedTradeId] = useState(null);
	const [addProgress, setAddProgress] = useState(null); // { done, total } | null

	// GraphQL operations
	const { data: schemesData, loading: schemesLoading } = useQuery(
		GET_EMPOWERMENT_SCHEMES,
		{
			variables: {
				first: 50, // Get more schemes for selection
				status: "ACTIVE" // Only get active schemes
			}
		}
	);

	const {
		data: schemeData,
		loading: schemeLoading,
		refetch: refetchScheme
	} = useQuery(GET_EMPOWERMENT_SCHEME, {
		variables: { uuid: selectedScheme?.uuid || uuid },
		skip: !selectedScheme && !uuid // Skip if no scheme selected
	});

	const { data: tradersData, loading: tradersLoading } = useQuery(
		GET_TRADERS_LIST,
		{
			variables: {
				search: debouncedSearch || undefined,
				first: 30,
				orderBy: "SURNAME",
				direction: "ASC"
			},
			skip: !debouncedSearch
		}
	);

	const { data: tradeLocationsData } = useQuery(GET_TRADE_LOCATIONS, {
		variables: { isActive: true },
		fetchPolicy: "cache-and-network"
	});
	const tradeLocations = tradeLocationsData?.tradeLocations || [];

	const { data: tradesData } = useQuery(GET_TRADES);
	const resolvedSchemeId =
		schemeData?.empowermentScheme?.id || selectedScheme?.id;
	const { data: tradeGroupData, loading: tradeGroupLoading } = useQuery(
		GET_TRADERS_NOT_IN_SCHEME,
		{
			variables: {
				empowerment_scheme_id: resolvedSchemeId,
				trade_id: selectedTradeId,
				first: 200,
				page: 1
			},
			skip: !selectedTradeId || !resolvedSchemeId || addMode !== "trade",
			fetchPolicy: "network-only"
		}
	);

	const [createTradeLocation, { loading: creatingLocation }] = useMutation(
		CREATE_TRADE_LOCATION
	);

	const [applyToScheme] = useMutation(APPLY_TO_EMPOWERMENT_SCHEME);
	const [bulkAddTraders] = useMutation(BULK_ADD_TRADERS_TO_SCHEME);

	const [removeTrader] = useMutation(REMOVE_TRADER_FROM_SCHEME, {
		onCompleted: () => {
			message.success({
				content: "Participant removed from scheme.",
				duration: 2
			});
			refetchApplications();
		},
		onError: (err) => {
			message.error({
				content: err.message || "Failed to remove participant.",
				duration: 4
			});
		}
	});

	const schemes = schemesData?.empowermentSchemes?.data || [];
	const scheme = schemeData?.empowermentScheme || selectedScheme;
	const traders = tradersData?.traderList?.data || [];
	const loading = schemesLoading || schemeLoading;

	const {
		data: applicationsData,
		loading: applicationsLoading,
		refetch: refetchApplications
	} = useQuery(GET_EMPOWERMENT_SCHEME_APPLICATIONS, {
		variables: {
			empowerment_scheme_id: scheme?.id,
			first: 500
		},
		skip: !scheme?.id
	});

	// Initialize selected scheme if uuid provided
	useEffect(() => {
		if (uuid && schemes.length > 0) {
			const schemeFromUrl = schemes.find((s) => s.uuid === uuid);
			if (schemeFromUrl) {
				setSelectedScheme(schemeFromUrl);
				setCurrentStep(1);
			}
		}
	}, [uuid, schemes]);

	// Debounce search term — fires server query 500ms after user stops typing
	useEffect(() => {
		if (!searchTerm || searchTerm.trim() === "") {
			setIsSearching(false);
			setDebouncedSearch("");
			return;
		}
		setIsSearching(true);
		const t = setTimeout(() => {
			setDebouncedSearch(searchTerm.trim());
			setIsSearching(false);
		}, 500);
		return () => clearTimeout(t);
	}, [searchTerm]);

	// Sync server results into filteredTraders
	useEffect(() => {
		if (!debouncedSearch) {
			setFilteredTraders([]);
			return;
		}
		setFilteredTraders(traders);
	}, [traders, debouncedSearch]);

	const filteredSchemes = schemes.filter(
		(scheme) =>
			scheme.name?.toLowerCase().includes(schemeSearchTerm.toLowerCase()) ||
			scheme.description?.toLowerCase().includes(schemeSearchTerm.toLowerCase())
	);

	// Get traders already in the scheme to avoid duplicates
	const existingTraderIds =
		applicationsData?.empowermentSchemeApplications?.data?.map(
			(a) => a.trader?.id
		) || [];
	const availableTraders = filteredTraders.filter(
		(trader) => !existingTraderIds.includes(trader.id)
	);
	const trades = tradesData?.trades || [];
	const tradersInGroup = tradeGroupData?.tradersNotInScheme?.data || [];
	const availableTradersInGroup = tradersInGroup; // already server-filtered

	const handleCreateLocation = async (values) => {
		try {
			await createTradeLocation({
				variables: {
					name: values.name.trim().toUpperCase(),
					description: values.description?.trim() || null,
					is_active: true
				}
			});
			message.success(
				`Trade location "${values.name.trim().toUpperCase()}" created!`
			);
			locationForm.resetFields();
			setLocationModalVisible(false);
		} catch (err) {
			message.error(err.message || "Failed to create trade location.");
		}
	};

	const applyParticipantFilters = (records) =>
		records.filter((record) => {
			if (
				participantLocationFilter &&
				record.trader?.trade_location !== participantLocationFilter
			) {
				return false;
			}
			if (
				participantTradeFilter &&
				record.trader?.trade?.name !== participantTradeFilter
			) {
				return false;
			}
			if (participantSearch.trim()) {
				const name =
					`${record.trader?.surname || ""} ${record.trader?.other_names || ""}`.toLowerCase();
				const phone = (record.trader?.phone || "").toLowerCase();
				const ctshId = (record.trader?.ctsh_id || "").toLowerCase();
				const term = participantSearch.trim().toLowerCase();
				if (
					!name.includes(term) &&
					!phone.includes(term) &&
					!ctshId.includes(term)
				) {
					return false;
				}
			}
			return true;
		});

	const exportToPdf = async () => {
		// Ensure all participants are loaded before applying filters
		const serverTotal =
			applicationsData?.empowermentSchemeApplications?.paginatorInfo?.total ??
			allApplications.length;
		let sourceRecords = allApplications;
		if (serverTotal > allApplications.length) {
			message.loading({
				content: "Please wait, loading participants…",
				key: "export-pdf",
				duration: 0
			});
			try {
				const result = await refetchApplications({
					empowerment_scheme_id: scheme.id,
					first: serverTotal
				});
				sourceRecords =
					result.data?.empowermentSchemeApplications?.data || allApplications;
			} catch {
				// fall back to whatever is already loaded
			}
		}

		const data = applyParticipantFilters(sourceRecords);
		if (!data.length) {
			message.warning({
				content: "No participants match the current filters.",
				key: "export-pdf"
			});
			return;
		}

		setPdfExporting(true);
		message.loading({
			content: `Compressing photos… 0/${data.length}`,
			key: "export-pdf",
			duration: 0
		});

		const appsWithPhotos = await compressApplicationPhotos(
			data,
			(done, total) =>
				message.loading({
					content: `Compressing photos… ${done}/${total}`,
					key: "export-pdf",
					duration: 0
				})
		);

		const chunks = [];
		for (let i = 0; i < appsWithPhotos.length; i += PDF_CHUNK_SIZE) {
			chunks.push(appsWithPhotos.slice(i, i + PDF_CHUNK_SIZE));
		}

		const exportedAt = moment().format("MMMM Do YYYY, h:mm a");
		const schemeName = scheme?.name || "";
		const safeName = schemeName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
		const baseName = `beneficiaries_${safeName || "export"}_${moment().format("YYYYMMDD")}`;

		for (let idx = 0; idx < chunks.length; idx++) {
			const chunk = chunks[idx];
			const partLabel =
				chunks.length > 1 ? ` (part ${idx + 1}/${chunks.length})` : "";

			message.loading({
				content: `Generating PDF${partLabel}…`,
				key: "export-pdf",
				duration: 0
			});

			const blob = await pdf(
				<BeneficiariesPdfDocument
					applications={chunk}
					schemeName={schemeName}
					exportedAt={exportedAt}
					tradeLocation={participantLocationFilter || undefined}
					part={
						chunks.length > 1
							? { current: idx + 1, total: chunks.length }
							: null
					}
				/>
			).toBlob();

			const partSuffix =
				chunks.length > 1 ? `_part${idx + 1}of${chunks.length}` : "";
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${baseName}${partSuffix}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}

		message.success({
			content: `Exported ${data.length} beneficiar${data.length === 1 ? "y" : "ies"} to PDF${chunks.length > 1 ? ` (${chunks.length} files)` : ""}`,
			key: "export-pdf",
			duration: 3
		});
		setPdfExporting(false);
	};

	const handleExportToExcel = async () => {
		const serverTotal =
			applicationsData?.empowermentSchemeApplications?.paginatorInfo?.total ??
			allApplications.length;
		if (serverTotal === 0) return;
		setExcelExporting(true);
		try {
			let sourceRecords = allApplications;
			if (serverTotal > allApplications.length) {
				message.loading({
					content: "Please wait, loading participants…",
					key: "export-excel",
					duration: 0
				});
				try {
					const result = await refetchApplications({
						empowerment_scheme_id: scheme.id,
						first: serverTotal
					});
					sourceRecords =
						result.data?.empowermentSchemeApplications?.data || allApplications;
				} catch {
					// fall back to whatever is loaded
				}
				message.destroy("export-excel");
			}
			const data = applyParticipantFilters(sourceRecords);
			if (!data.length) {
				message.warning("No participants match the current filters.");
				return;
			}
			const exportData = data.map((record, index) => ({
				"S/N": index + 1,
				"CTSH ID": record.trader?.ctsh_id || "",
				Surname: record.trader?.surname || "",
				"Other Names": record.trader?.other_names || "",
				NIN: record.trader?.nin || "",
				"Trade Location": record.trader?.trade_location || "",
				Status: record.status || "",
				"Application Date": record.application_date
					? new Date(record.application_date).toLocaleDateString()
					: "",
				"Approval Date": record.approval_date
					? new Date(record.approval_date).toLocaleDateString()
					: ""
			}));
			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
			const schemeName = (selectedScheme?.name || "scheme").replace(
				/\s+/g,
				"_"
			);
			const date = new Date().toISOString().split("T")[0];
			XLSX.writeFile(workbook, `Participants_${schemeName}_${date}.xlsx`);
			message.success(`Exported ${data.length} participants.`);
		} finally {
			setExcelExporting(false);
		}
	};

	const applying = addProgress !== null;

	const handleSubmit = async (values) => {
		const { remarks } = values;

		if (selectedTraders.length === 0) {
			message.error("Please select at least one trader");
			return;
		}

		if (!scheme) {
			message.error("Scheme not found");
			return;
		}

		// Send all selected traders — the backend silently skips any already enrolled
		const tradersToAdd = selectedTraders;

		const BATCH_SIZE = 20;
		const batches = [];
		for (let i = 0; i < tradersToAdd.length; i += BATCH_SIZE) {
			batches.push(tradersToAdd.slice(i, i + BATCH_SIZE));
		}

		let successCount = 0;
		let failedCount = 0;
		setAddProgress({ done: 0, total: tradersToAdd.length });

		try {
			for (const batch of batches) {
				try {
					const result = await bulkAddTraders({
						variables: {
							empowerment_scheme_id: scheme.id,
							trader_ids: batch.map((t) => t.id),
							remarks: remarks?.trim() || null
						}
					});
					const added = result?.data?.bulkAddTradersToScheme?.length ?? 0;
					successCount += added;
					// don't count as "failed" — backend simply skips already-enrolled
				} catch (err) {
					console.error("Batch add error:", err);
					failedCount += batch.length;
				}
				setAddProgress((prev) => ({
					done: (prev?.done ?? 0) + batch.length,
					total: tradersToAdd.length
				}));
			}
		} finally {
			setAddProgress(null);
		}

		if (successCount === 0 && failedCount === 0) {
			message.info({
				content: "All selected traders are already enrolled in this scheme.",
				duration: 3
			});
			return;
		}

		if (successCount > 0) {
			message.success({
				content: `🎉 ${successCount} trader${successCount > 1 ? "s" : ""} successfully added to the scheme!`,
				duration: 3
			});
		}
		if (failedCount > 0) {
			message.warning({
				content: `⚠️ ${failedCount} trader${failedCount > 1 ? "s" : ""} could not be added (server error)`,
				duration: 4
			});
		}

		// Refresh scheme stats (traders_count) and applications list
		await Promise.all([
			refetchScheme({ uuid: scheme.uuid }),
			refetchApplications()
		]);

		// Clear selection and search state
		setSelectedTraders([]);
		setSearchTerm("");
		setDebouncedSearch("");
		setFilteredTraders([]);
		form.resetFields();
	};

	const handleSchemeSelect = (scheme) => {
		setSelectedScheme(scheme);
		setCurrentStep(1);
		navigate(`${basePath}/${scheme.uuid}`, { replace: true });
		// Refetch scheme details
		if (refetchScheme) {
			refetchScheme({ uuid: scheme.uuid });
		}
	};

	const handleTraderSelect = (trader) => {
		setSelectedTraders((prev) => {
			const exists = prev.find((t) => t.id === trader.id);
			if (exists) return prev.filter((t) => t.id !== trader.id);
			return [...prev, trader];
		});
	};

	const handleBackToSchemeSelection = () => {
		setCurrentStep(0);
		setSelectedScheme(null);
		setSelectedTraders([]);
		setSelectedParticipants([]);
		form.resetFields();
		navigate(basePath, { replace: true });
	};

	const handleBulkRemove = async () => {
		if (selectedParticipants.length === 0) return;
		setBulkRemoving(true);
		let successCount = 0;
		const applications =
			applicationsData?.empowermentSchemeApplications?.data || [];
		for (const id of selectedParticipants) {
			const record = applications.find((a) => a.id === id);
			if (!record) continue;
			try {
				await removeTrader({
					variables: {
						empowerment_scheme_id: record.empowerment_scheme?.id || scheme?.id,
						trader_id: record.trader?.id
					}
				});
				successCount++;
			} catch (err) {
				console.error("Bulk remove error:", err);
			}
		}
		setBulkRemoving(false);
		setSelectedParticipants([]);
		if (successCount > 0) {
			message.success({
				content: `${successCount} participant${successCount > 1 ? "s" : ""} removed.`,
				duration: 3
			});
		}
	};

	// Filtered participants list
	const allApplications =
		applicationsData?.empowermentSchemeApplications?.data || [];
	const filteredParticipants = allApplications.filter((record) => {
		if (
			participantLocationFilter &&
			record.trader?.trade_location !== participantLocationFilter
		) {
			return false;
		}
		if (
			participantTradeFilter &&
			record.trader?.trade?.name !== participantTradeFilter
		) {
			return false;
		}
		if (participantSearch.trim()) {
			const name =
				`${record.trader?.surname || ""} ${record.trader?.other_names || ""}`.toLowerCase();
			const phone = (record.trader?.phone || "").toLowerCase();
			const ctshId = (record.trader?.ctsh_id || "").toLowerCase();
			const term = participantSearch.trim().toLowerCase();
			if (
				!name.includes(term) &&
				!phone.includes(term) &&
				!ctshId.includes(term)
			) {
				return false;
			}
		}
		return true;
	});

	// Helper function to highlight search terms
	const highlightSearchTerm = (text, searchTerm) => {
		if (!searchTerm || !text) return text;

		const regex = new RegExp(
			`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
			"gi"
		);
		const parts = text.split(regex);

		return parts.map((part, index) =>
			regex.test(part) ? (
				<span
					key={index}
					style={{ backgroundColor: "#fff566", fontWeight: "bold" }}>
					{part}
				</span>
			) : (
				part
			)
		);
	};

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "50vh"
				}}>
				<Spin size="large" tip="Loading scheme and traders data..." />
			</div>
		);
	}

	// Scheme Selection Step
	const renderSchemeSelection = () => (
		<Card>
			<Title level={4} style={{ marginBottom: 16 }}>
				<FileTextOutlined style={{ color: "#1890ff", marginRight: 8 }} />
				Select Empowerment Scheme
			</Title>

			{/* Search Schemes */}
			<Space direction="vertical" size="large" style={{ width: "100%" }}>
				<Input
					placeholder="Search schemes by name or description..."
					value={schemeSearchTerm}
					onChange={(e) => setSchemeSearchTerm(e.target.value)}
					prefix={<SearchOutlined />}
					size="large"
					allowClear
				/>

				{/* Schemes List */}
				{filteredSchemes.length === 0 ? (
					<Empty
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						description="No empowerment schemes found"
					/>
				) : (
					<List
						grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
						dataSource={filteredSchemes}
						renderItem={(scheme) => (
							<List.Item>
								<Card
									hoverable
									onClick={() => handleSchemeSelect(scheme)}
									style={{
										border: "1px solid #d9d9d9",
										cursor: "pointer"
									}}
									actions={[
										<Button
											type="primary"
											icon={<RightOutlined />}
											onClick={(e) => {
												e.stopPropagation();
												handleSchemeSelect(scheme);
											}}>
											Select Scheme
										</Button>
									]}>
									<Card.Meta
										title={
											<Space>
												<Text strong>{scheme.name}</Text>
												<Tag color={scheme.is_open ? "green" : "red"}>
													{scheme.is_open ? "Open" : "Closed"}
												</Tag>
											</Space>
										}
										description={
											<Space
												direction="vertical"
												size={4}
												style={{ width: "100%" }}>
												<Text type="secondary" ellipsis>
													{scheme.description || "No description available"}
												</Text>
												<div>
													<Text type="secondary" style={{ fontSize: "12px" }}>
														<TeamOutlined /> {scheme.traders_count || 0} /{" "}
														{scheme.max_participants || 0} participants
													</Text>
													<Divider type="vertical" />
													<Text type="secondary" style={{ fontSize: "12px" }}>
														<CalendarOutlined />
														{scheme.application_deadline
															? new Date(
																	scheme.application_deadline
																).toLocaleDateString()
															: "No deadline"}
													</Text>
												</div>
											</Space>
										}
									/>
								</Card>
							</List.Item>
						)}
					/>
				)}
			</Space>
		</Card>
	);

	return (
		<div className="flex flex-wrap mt-4">
			<div className="w-full mb-12 px-4">
				<div
					style={{
						padding: "12px",
						minHeight: "100vh",
						backgroundColor: "#f5f5f5"
					}}>
					<Space direction="vertical" size="large" style={{ width: "100%" }}>
						{/* Header */}
						<Card bodyStyle={{ padding: "12px 16px" }}>
							<Row align="middle" justify="space-between" gutter={[8, 8]} wrap>
								<Col xs={24} sm="auto">
									<Space size={4}>
										<Button
											icon={<ArrowLeftOutlined />}
											onClick={() => {
												if (currentStep === 0 || !selectedScheme) {
													navigate("/admin/empowerment-schemes");
												} else {
													handleBackToSchemeSelection();
												}
											}}
											type="text"
											size="small"
										/>
										<Title level={5} style={{ margin: 0, fontSize: "14px" }}>
											<UserAddOutlined
												style={{ color: "#1890ff", marginRight: 6 }}
											/>
											Scheme & Trader Management
										</Title>
									</Space>
								</Col>
								<Col xs={24} sm="auto">
									<Space wrap size={4}>
										{(selectedScheme || uuid) && (
											<Button
												type="primary"
												size="small"
												icon={<UnorderedListOutlined />}
												onClick={() =>
													navigate(
														`/admin/empowerment-schemes/${selectedScheme?.uuid || uuid}/applications`
													)
												}>
												View All Applications
											</Button>
										)}
										{selectedScheme && (
											<Tag
												color="blue"
												style={{ fontSize: "12px", padding: "2px 8px" }}>
												{selectedScheme.name}
											</Tag>
										)}
									</Space>
								</Col>
							</Row>
						</Card>

						{/* Steps */}

						{/* Step Content */}
						{currentStep === 0 ? renderSchemeSelection() : null}

						{/* Trader Addition Step */}
						{currentStep === 1 && (
							<>
								{/* Scheme Status Info */}
								{scheme && (
									<Card bodyStyle={{ padding: "12px" }}>
										<Text
											strong
											style={{
												fontSize: "13px",
												display: "block",
												marginBottom: 8
											}}>
											<CheckCircleOutlined
												style={{ color: "#52c41a", marginRight: 6 }}
											/>
											Scheme Overview
										</Text>
										<Row gutter={[8, 8]}>
											<Col xs={12} sm={6}>
												<Card
													size="small"
													style={{ textAlign: "center" }}
													bodyStyle={{ padding: "8px 4px" }}>
													<div
														style={{
															fontSize: "11px",
															color: "#888",
															marginBottom: 2
														}}>
														Status
													</div>
													<div
														style={{
															fontSize: "15px",
															fontWeight: 600,
															color: scheme.is_open ? "#52c41a" : "#ff4d4f"
														}}>
														{scheme.is_open ? "Open" : "Closed"}
													</div>
												</Card>
											</Col>
											<Col xs={12} sm={6}>
												<Card
													size="small"
													style={{ textAlign: "center" }}
													bodyStyle={{ padding: "8px 4px" }}>
													<div
														style={{
															fontSize: "11px",
															color: "#888",
															marginBottom: 2
														}}>
														Participants
													</div>
													<div
														style={{
															fontSize: "15px",
															fontWeight: 600,
															color: "#1890ff"
														}}>
														{scheme.traders_count || 0} /{" "}
														{scheme.max_participants || 0}
													</div>
												</Card>
											</Col>
											<Col xs={12} sm={6}>
												<Card
													size="small"
													style={{ textAlign: "center" }}
													bodyStyle={{ padding: "8px 4px" }}>
													<div
														style={{
															fontSize: "11px",
															color: "#888",
															marginBottom: 2
														}}>
														Available
													</div>
													<div
														style={{
															fontSize: "15px",
															fontWeight: 600,
															color: "#52c41a"
														}}>
														{Math.max(
															0,
															(scheme.max_participants || 0) -
																(scheme.traders_count || 0)
														)}
													</div>
												</Card>
											</Col>
											<Col xs={12} sm={6}>
												<Card
													size="small"
													style={{ textAlign: "center" }}
													bodyStyle={{ padding: "8px 4px" }}>
													<div
														style={{
															fontSize: "11px",
															color: "#888",
															marginBottom: 2
														}}>
														Deadline
													</div>
													<div
														style={{
															fontSize: "12px",
															fontWeight: 600,
															color: "#fa8c16"
														}}>
														{scheme.application_deadline
															? new Date(
																	scheme.application_deadline
																).toLocaleDateString()
															: "Not Set"}
													</div>
												</Card>
											</Col>
										</Row>
									</Card>
								)}

								{/* Main Form */}
								<Card>
									{/* {!scheme?.is_open && (
								<Alert
									message="Scheme Closed"
									description="This empowerment scheme is not open for new applications."
									type="warning"
									showIcon
									style={{ marginBottom: 16 }}
								/>
							)} */}

									<Form
										form={form}
										layout="vertical"
										onFinish={handleSubmit}
										onSubmitCapture={(e) => e.preventDefault()}
										size="large">
										{/* Add Mode Switcher */}
										<Form.Item label={<Text strong>Add Traders By</Text>}>
											<Radio.Group
												value={addMode}
												onChange={(e) => {
													setAddMode(e.target.value);
													setSelectedTradeId(null);
													setSelectedTraders([]);
													setSearchTerm("");
													setDebouncedSearch("");
													setFilteredTraders([]);
												}}
												buttonStyle="solid">
												<Radio.Button value="individual">
													<SearchOutlined /> Individual Search
												</Radio.Button>
												<Radio.Button value="trade">
													<TeamOutlined /> By Trade Group
												</Radio.Button>
											</Radio.Group>
										</Form.Item>

										{addMode === "individual" && (
											<>
												{/* Search Traders */}
												<Form.Item
													label={
														<Space>
															<SearchOutlined style={{ color: "#1890ff" }} />
															<Text strong>Search Traders</Text>
															<Text
																type="secondary"
																style={{ fontSize: "12px" }}>
																(Search by phone number, full name, or CTSH ID)
															</Text>
														</Space>
													}>
													<Input
														placeholder="Search by phone number, full name, or CTSH ID..."
														value={searchTerm}
														onChange={(e) => setSearchTerm(e.target.value)}
														prefix={
															isSearching ? (
																<Spin size="small" />
															) : (
																<SearchOutlined />
															)
														}
														suffix={
															searchTerm && (
																<Button
																	type="text"
																	size="small"
																	onClick={() => setSearchTerm("")}
																	icon={<CloseCircleOutlined />}
																/>
															)
														}
														allowClear
													/>
												</Form.Item>

												{/* Trader Selection */}
												<Form.Item
													label={
														<Space>
															<TeamOutlined style={{ color: "#52c41a" }} />
															<Text strong>Select Trader</Text>
															<Badge
																count={availableTraders.length}
																showZero
																color="#1890ff"
															/>
														</Space>
													}
													extra={
														<div>
															{isSearching || tradersLoading ? (
																<Text
																	type="secondary"
																	style={{ fontSize: "13px" }}>
																	<Spin
																		size="small"
																		style={{ marginRight: 6 }}
																	/>{" "}
																	Searching...
																</Text>
															) : searchTerm ? (
																<Alert
																	message={`${availableTraders.length} trader${availableTraders.length !== 1 ? "s" : ""} found matching "${searchTerm}"`}
																	type={
																		availableTraders.length > 0
																			? "success"
																			: "info"
																	}
																	showIcon
																	style={{ marginBottom: 8 }}
																/>
															) : (
																<Text
																	type="secondary"
																	style={{ fontSize: "13px" }}>
																	💡 Type a name, phone number or CTSH ID to
																	search traders
																</Text>
															)}
														</div>
													}>
													<div>
														{!searchTerm ? (
															<Empty
																image={Empty.PRESENTED_IMAGE_SIMPLE}
																description={
																	<Text type="secondary">
																		Search above to find and select a trader
																	</Text>
																}
															/>
														) : tradersLoading ? (
															<div
																style={{
																	textAlign: "center",
																	padding: "32px"
																}}>
																<Spin size="large" tip="Searching traders..." />
															</div>
														) : availableTraders.length === 0 ? (
															<Empty
																image={Empty.PRESENTED_IMAGE_SIMPLE}
																description={
																	<div>
																		{traders.length === 0 ? (
																			<Text type="secondary">
																				No traders found in the system
																			</Text>
																		) : existingTraderIds.length > 0 &&
																		  filteredTraders.length ===
																				existingTraderIds.length ? (
																			<Text type="secondary">
																				All matching traders are already in this
																				scheme
																			</Text>
																		) : (
																			<Text type="secondary">
																				No traders match your search criteria
																			</Text>
																		)}
																	</div>
																}
															/>
														) : (
															<List
																grid={{
																	gutter: 16,
																	xs: 1,
																	sm: 1,
																	md: 2,
																	lg: 2,
																	xl: 3,
																	xxl: 3
																}}
																dataSource={availableTraders}
																renderItem={(trader) => {
																	const isSelected = selectedTraders.some(
																		(t) => t.id === trader.id
																	);
																	return (
																		<List.Item>
																			<Card
																				size="small"
																				hoverable
																				onClick={() =>
																					handleTraderSelect(trader)
																				}
																				style={{
																					border: isSelected
																						? "2px solid #1890ff"
																						: "1px solid #d9d9d9",
																					backgroundColor: isSelected
																						? "#f0f8ff"
																						: "white",
																					transition: "all 0.3s ease",
																					cursor: "pointer",
																					transform: isSelected
																						? "scale(1.02)"
																						: "scale(1)",
																					boxShadow: isSelected
																						? "0 4px 12px rgba(24, 144, 255, 0.15)"
																						: "0 2px 8px rgba(0, 0, 0, 0.06)"
																				}}
																				bodyStyle={{
																					padding: "16px"
																				}}>
																				<Card.Meta
																					avatar={
																						<Badge
																							count={
																								isSelected ? (
																									<CheckCircleOutlined
																										style={{ color: "#1890ff" }}
																									/>
																								) : (
																									0
																								)
																							}
																							offset={[-5, 5]}>
																							<Avatar
																								size={54}
																								src={
																									trader.photo
																										? `data:image/jpeg;base64,${trader.photo}`
																										: null
																								}
																								style={{
																									border: isSelected
																										? "3px solid #1890ff"
																										: "2px solid transparent",
																									boxShadow: isSelected
																										? "0 0 0 2px rgba(24, 144, 255, 0.2)"
																										: "none"
																								}}
																								icon={<UserOutlined />}>
																								{!trader.photo &&
																									(
																										(trader.surname || "") +
																										" " +
																										(trader.other_names || "")
																									)
																										.trim()
																										?.charAt(0)
																										?.toUpperCase()}
																							</Avatar>
																						</Badge>
																					}
																					title={
																						<div>
																							<Text
																								strong
																								style={{
																									color: isSelected
																										? "#1890ff"
																										: "inherit",
																									fontSize: "16px"
																								}}>
																								{searchTerm
																									? highlightSearchTerm(
																											`${trader.surname || ""} ${
																												trader.other_names || ""
																											}`.trim() || "No Name",
																											searchTerm
																										)
																									: `${trader.surname || ""} ${
																											trader.other_names || ""
																										}`.trim() || "No Name"}
																							</Text>
																							{trader.ctsh_id && (
																								<div
																									style={{ marginTop: "4px" }}>
																									<Tag
																										color="purple"
																										size="small">
																										ID:{" "}
																										{searchTerm
																											? highlightSearchTerm(
																													trader.ctsh_id,
																													searchTerm
																												)
																											: trader.ctsh_id}
																									</Tag>
																								</div>
																							)}
																						</div>
																					}
																					description={
																						<Space
																							direction="vertical"
																							size={6}
																							style={{ width: "100%" }}>
																							<Text
																								type="secondary"
																								style={{ fontSize: "13px" }}>
																								<PhoneOutlined
																									style={{ color: "#1890ff" }}
																								/>{" "}
																								{searchTerm
																									? highlightSearchTerm(
																											trader.phone ||
																												"No Phone",
																											searchTerm
																										)
																									: trader.phone || "No Phone"}
																							</Text>
																							{trader.business_name && (
																								<Text
																									type="secondary"
																									style={{ fontSize: "13px" }}>
																									<ShopOutlined
																										style={{ color: "#52c41a" }}
																									/>{" "}
																									{trader.business_name}
																								</Text>
																							)}
																							<div>
																								{trader.trade?.name && (
																									<Tag
																										color="blue"
																										style={{
																											margin: "2px 4px 2px 0"
																										}}>
																										<ToolOutlined />{" "}
																										{trader.trade.name}
																									</Tag>
																								)}
																								{trader.location?.name && (
																									<Tag
																										color="geekblue"
																										style={{ margin: "2px 0" }}>
																										📍 {trader.location.name}
																									</Tag>
																								)}
																							</div>
																						</Space>
																					}
																				/>
																			</Card>
																		</List.Item>
																	);
																}}
															/>
														)}
													</div>
												</Form.Item>
											</>
										)}

										{addMode === "trade" && (
											<>
												<Form.Item
													label={
														<Space>
															<TeamOutlined style={{ color: "#52c41a" }} />
															<Text strong>Select Trade Group</Text>
														</Space>
													}>
													<Select
														showSearch
														placeholder="Select a trade group..."
														optionFilterProp="children"
														value={selectedTradeId}
														onChange={(val) => {
															setSelectedTradeId(val ?? null);
															setSelectedTraders([]);
														}}
														allowClear
														style={{ width: "100%" }}>
														{trades.map((trade) => (
															<Option key={trade.id} value={trade.id}>
																{trade.name}
																{trade.countTraders != null && (
																	<Text
																		type="secondary"
																		style={{ fontSize: 12 }}>
																		{" "}
																		({trade.countTraders} traders)
																	</Text>
																)}
															</Option>
														))}
													</Select>
												</Form.Item>

												{selectedTradeId && (
													<>
														{tradeGroupLoading ? (
															<div style={{ textAlign: "center", padding: 24 }}>
																<Spin tip="Loading traders in group..." />
															</div>
														) : availableTradersInGroup.length === 0 ? (
															<Alert
																type="warning"
																showIcon
																style={{ marginBottom: 16 }}
																message="All traders in this trade group are already in the scheme"
															/>
														) : (
															<>
																<div
																	style={{
																		display: "flex",
																		alignItems: "center",
																		justifyContent: "space-between",
																		marginBottom: 8
																	}}>
																	<Text
																		type="secondary"
																		style={{ fontSize: 13 }}>
																		{availableTradersInGroup.length} traders
																		available to add
																	</Text>
																	<Space size={4}>
																		{selectedTraders.length ===
																		availableTradersInGroup.length ? (
																			<Button
																				size="small"
																				onClick={() => setSelectedTraders([])}>
																				Deselect All
																			</Button>
																		) : (
																			<Button
																				type="primary"
																				size="small"
																				onClick={() =>
																					setSelectedTraders([
																						...availableTradersInGroup
																					])
																				}>
																				Select All (
																				{availableTradersInGroup.length})
																			</Button>
																		)}
																	</Space>
																</div>
																<List
																	grid={{
																		gutter: 16,
																		xs: 1,
																		sm: 1,
																		md: 2,
																		lg: 2,
																		xl: 3,
																		xxl: 3
																	}}
																	dataSource={availableTradersInGroup}
																	renderItem={(trader) => {
																		const isSelected = selectedTraders.some(
																			(t) => t.id === trader.id
																		);
																		return (
																			<List.Item>
																				<Card
																					size="small"
																					hoverable
																					onClick={() =>
																						handleTraderSelect(trader)
																					}
																					style={{
																						border: isSelected
																							? "2px solid #1890ff"
																							: "1px solid #d9d9d9",
																						backgroundColor: isSelected
																							? "#f0f8ff"
																							: "white",
																						cursor: "pointer"
																					}}
																					bodyStyle={{ padding: 12 }}>
																					<Card.Meta
																						avatar={
																							<Badge
																								count={
																									isSelected ? (
																										<CheckCircleOutlined
																											style={{
																												color: "#1890ff"
																											}}
																										/>
																									) : (
																										0
																									)
																								}
																								offset={[-5, 5]}>
																								<Avatar
																									size={40}
																									src={
																										trader.photo
																											? `data:image/jpeg;base64,${trader.photo}`
																											: null
																									}
																									style={{
																										border: isSelected
																											? "2px solid #1890ff"
																											: "2px solid transparent"
																									}}
																									icon={<UserOutlined />}
																								/>
																							</Badge>
																						}
																						title={
																							<Text
																								strong
																								style={{
																									color: isSelected
																										? "#1890ff"
																										: "inherit",
																									fontSize: 14
																								}}>
																								{`${trader.surname || ""} ${trader.other_names || ""}`.trim() ||
																									"No Name"}
																							</Text>
																						}
																						description={
																							<Space
																								direction="vertical"
																								size={2}>
																								{trader.ctsh_id && (
																									<Tag
																										color="purple"
																										style={{ fontSize: 11 }}>
																										{trader.ctsh_id}
																									</Tag>
																								)}
																								<Text
																									type="secondary"
																									style={{ fontSize: 12 }}>
																									<PhoneOutlined
																										style={{
																											color: "#1890ff"
																										}}
																									/>{" "}
																									{trader.phone || "No Phone"}
																								</Text>
																							</Space>
																						}
																					/>
																				</Card>
																			</List.Item>
																		);
																	}}
																/>
															</>
														)}
													</>
												)}
											</>
										)}

										{/* Remarks */}
										<Form.Item
											name="remarks"
											label={
												<Space>
													<CommentOutlined style={{ color: "#722ed1" }} />
													<Text strong>Remarks (Optional)</Text>
												</Space>
											}>
											<TextArea
												rows={4}
												placeholder="Add any remarks about this application..."
												showCount
												maxLength={500}
											/>
										</Form.Item>

										{/* Selected Traders Summary */}
										{selectedTraders.length > 0 && (
											<Alert
												message={
													<Space>
														<CheckCircleOutlined />
														<Text strong>
															{selectedTraders.length} Trader
															{selectedTraders.length > 1 ? "s" : ""} Selected
														</Text>
														<Button
															type="text"
															size="small"
															danger
															onClick={() => setSelectedTraders([])}>
															Clear All
														</Button>
													</Space>
												}
												description={
													<Space wrap style={{ marginTop: 8 }}>
														{selectedTraders.map((trader) => (
															<Tag
																key={trader.id}
																closable
																onClose={() =>
																	setSelectedTraders((prev) =>
																		prev.filter((t) => t.id !== trader.id)
																	)
																}
																color="blue">
																{`${trader.surname || ""} ${trader.other_names || ""}`.trim() ||
																	"Unknown"}
															</Tag>
														))}
													</Space>
												}
												type="success"
												showIcon
												style={{
													marginBottom: 16,
													backgroundColor: "#f6ffed",
													border: "1px solid #b7eb8f"
												}}
											/>
										)}

										{/* Action Buttons */}
										<Form.Item>
											<Card
												size="small"
												style={{
													backgroundColor: "#fafafa",
													border: "1px dashed #d9d9d9"
												}}>
												<Row justify="space-between" align="middle">
													<Col>
														<Button
															size="large"
															onClick={() =>
																navigate(`/admin/empowerment-schemes/${uuid}`)
															}
															disabled={applying}
															icon={<ArrowLeftOutlined />}
															style={{
																minWidth: "120px",
																borderColor: "#d9d9d9"
															}}>
															Cancel
														</Button>
													</Col>
													<Col>
														<Space direction="vertical" align="end">
															{selectedTraders.length > 0 && (
																<Text
																	type="secondary"
																	style={{ fontSize: "12px" }}>
																	Ready to add {selectedTraders.length} trader
																	{selectedTraders.length > 1 ? "s" : ""} to
																	scheme
																</Text>
															)}
															<Button
																type="primary"
																size="large"
																htmlType="button"
																onClick={() => form.submit()}
																loading={applying}
																disabled={selectedTraders.length === 0}
																icon={
																	applying ? undefined : <UserAddOutlined />
																}
																style={{
																	minWidth: "160px",
																	background:
																		selectedTraders.length > 0
																			? "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)"
																			: undefined,
																	border: "none",
																	boxShadow:
																		selectedTraders.length > 0
																			? "0 4px 12px rgba(24, 144, 255, 0.3)"
																			: undefined
																}}>
																{applying
																	? `Adding ${addProgress?.done ?? 0} / ${addProgress?.total ?? selectedTraders.length}...`
																	: `Add ${selectedTraders.length > 0 ? selectedTraders.length + " " : ""}Trader${selectedTraders.length !== 1 ? "s" : ""} to Scheme`}
															</Button>
														</Space>
													</Col>
												</Row>
											</Card>
										</Form.Item>
									</Form>
								</Card>

								{/* Participants List */}
								<Card
									title={
										<Row
											justify="space-between"
											align="middle"
											gutter={[8, 8]}
											wrap>
											<Col>
												<Space>
													<TeamOutlined style={{ color: "#1890ff" }} />
													<span>
														Scheme Participants
														{applicationsData?.empowermentSchemeApplications
															?.paginatorInfo?.total !== undefined && (
															<Badge
																count={
																	applicationsData.empowermentSchemeApplications
																		.paginatorInfo.total
																}
																showZero
																color="#1890ff"
																style={{ marginLeft: 8 }}
															/>
														)}
													</span>
												</Space>
											</Col>
											{selectedParticipants.length > 0 && (
												<Col>
													<Popconfirm
														title={`Remove ${selectedParticipants.length} participant${selectedParticipants.length > 1 ? "s" : ""}?`}
														description="This will remove all selected participants from the scheme."
														okText="Remove All"
														okType="danger"
														cancelText="Cancel"
														onConfirm={handleBulkRemove}>
														<Button
															danger
															size="small"
															loading={bulkRemoving}
															icon={<DeleteOutlined />}>
															Remove Selected ({selectedParticipants.length})
														</Button>
													</Popconfirm>
												</Col>
											)}
											<Col>
												<Button
													size="small"
													icon={<FilePdfOutlined />}
													loading={pdfExporting}
													disabled={filteredParticipants.length === 0}
													onClick={exportToPdf}
													style={{ color: "#cf1322", borderColor: "#ffa39e" }}>
													Export PDF
												</Button>
											</Col>
											<Col>
												<Button
													size="small"
													icon={<DownloadOutlined />}
													loading={excelExporting}
													disabled={filteredParticipants.length === 0}
													onClick={handleExportToExcel}
													style={{ color: "#389e0d", borderColor: "#b7eb8f" }}>
													Export Excel
												</Button>
											</Col>
										</Row>
									}
									extra={
										<Space wrap>
											<Input
												placeholder="Search participants..."
												value={participantSearch}
												onChange={(e) => {
													setParticipantSearch(e.target.value);
													setParticipantPage(1);
												}}
												prefix={<SearchOutlined />}
												allowClear
												size="small"
												style={{ width: 200 }}
											/>
											<Select
												showSearch
												allowClear
												size="small"
												placeholder={
													<span>
														<EnvironmentOutlined /> Location
													</span>
												}
												optionFilterProp="children"
												value={participantLocationFilter}
												onChange={(val) => {
													setParticipantLocationFilter(val ?? null);
													setParticipantPage(1);
												}}
												style={{ width: 190 }}>
												{tradeLocations.map((loc) => (
													<Option key={loc.id} value={loc.name}>
														{loc.name}
													</Option>
												))}
											</Select>
											{isSuperAdmin && (
												<Select
													showSearch
													allowClear
													size="small"
													placeholder={
														<span>
															<ToolOutlined /> Trade
														</span>
													}
													optionFilterProp="children"
													value={participantTradeFilter}
													onChange={(val) => {
														setParticipantTradeFilter(val ?? null);
														setParticipantPage(1);
													}}
													style={{ width: 190 }}>
													{trades.map((trade) => (
														<Option key={trade.id} value={trade.name}>
															{trade.name}
														</Option>
													))}
												</Select>
											)}
										</Space>
									}>
									<Table
										loading={applicationsLoading || bulkRemoving}
										rowSelection={{
											selectedRowKeys: selectedParticipants,
											onChange: (keys) => setSelectedParticipants(keys)
										}}
										dataSource={filteredParticipants}
										rowKey="id"
										size="small"
										scroll={{ x: 600 }}
										pagination={{
											pageSize: 15,
											showSizeChanger: false,
											current: participantPage,
											onChange: (page) => setParticipantPage(page)
										}}
										locale={{
											emptyText: <Empty description="No participants yet" />
										}}
										columns={[
											{
												title: "S/N",
												key: "sn",
												width: 55,
												render: (_, __, index) =>
													(participantPage - 1) * 15 + index + 1
											},
											{
												title: "Name",
												key: "name",
												render: (_, record) => (
													<Space>
														<Avatar
															size="small"
															src={
																record.trader?.photo
																	? `data:image/jpeg;base64,${record.trader.photo}`
																	: null
															}
															style={{ backgroundColor: "#1890ff" }}
															icon={<UserOutlined />}
														/>
														<div>
															<div className="font-medium">
																{`${record.trader?.surname || ""} ${record.trader?.other_names || ""}`.trim() ||
																	"—"}
															</div>
															{record.trader?.ctsh_id && (
																<Tag
																	color="purple"
																	style={{ fontSize: "11px" }}>
																	{record.trader.ctsh_id}
																</Tag>
															)}
														</div>
													</Space>
												)
											},
											{
												title: "NIN",
												key: "nin",
												render: (_, record) => record.trader?.nin || "—"
											},
											{
												title: "Trade Location",
												key: "trade_location",
												render: (_, record) =>
													record.trader?.trade_location ? (
														<Tag color="cyan">
															{record.trader.trade_location}
														</Tag>
													) : (
														"—"
													)
											},
											{
												title: "Status",
												dataIndex: "status",
												key: "status",
												render: (status) => {
													const colorMap = {
														pending: "orange",
														approved: "green",
														rejected: "red",
														disbursed: "blue",
														completed: "cyan"
													};
													return (
														<Tag color={colorMap[status] || "default"}>
															{status?.toUpperCase()}
														</Tag>
													);
												},
												filters: [
													{ text: "Pending", value: "pending" },
													{ text: "Approved", value: "approved" },
													{ text: "Rejected", value: "rejected" },
													{ text: "Disbursed", value: "disbursed" },
													{ text: "Completed", value: "completed" }
												],
												onFilter: (value, record) => record.status === value
											},
											{
												title: "Application Date",
												dataIndex: "application_date",
												key: "application_date",
												render: (date) =>
													date ? new Date(date).toLocaleDateString() : "—"
											},
											{
												title: "Approval Date",
												dataIndex: "approval_date",
												key: "approval_date",
												render: (date) =>
													date ? new Date(date).toLocaleDateString() : "—"
											},
											{
												title: "Action",
												key: "action",
												width: 90,
												render: (_, record) => (
													<Popconfirm
														title="Remove participant"
														description="Are you sure you want to remove this participant from the scheme?"
														okText="Remove"
														okType="danger"
														cancelText="Cancel"
														onConfirm={() =>
															removeTrader({
																variables: {
																	empowerment_scheme_id:
																		record.empowerment_scheme?.id || scheme?.id,
																	trader_id: record.trader?.id
																}
															})
														}>
														<Button
															type="text"
															danger
															size="small"
															icon={<DeleteOutlined />}>
															Remove
														</Button>
													</Popconfirm>
												)
											}
										]}
									/>
								</Card>
							</>
						)}
					</Space>
				</div>

				{/* ── Quick Add Trade Location Modal ────────────────────────── */}
				<Modal
					title={
						<Space>
							<PlusOutlined style={{ color: "#1890ff" }} />
							Add Trade Location
						</Space>
					}
					open={locationModalVisible}
					onCancel={() => {
						setLocationModalVisible(false);
						locationForm.resetFields();
					}}
					footer={null}
					destroyOnClose>
					<Form
						form={locationForm}
						layout="vertical"
						onFinish={handleCreateLocation}>
						<Form.Item
							name="name"
							label="Location Name"
							rules={[
								{ required: true, message: "Please enter a location name" }
							]}>
							<Input placeholder="e.g. TARAUNI MARKET" />
						</Form.Item>
						<Form.Item name="description" label="Description">
							<Input.TextArea
								rows={3}
								placeholder="Optional description..."
								showCount
								maxLength={500}
							/>
						</Form.Item>
						<Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
							<Space>
								<Button
									onClick={() => {
										setLocationModalVisible(false);
										locationForm.resetFields();
									}}>
									Cancel
								</Button>
								<Button
									type="primary"
									htmlType="submit"
									loading={creatingLocation}
									icon={<PlusOutlined />}>
									Create
								</Button>
							</Space>
						</Form.Item>
					</Form>
				</Modal>
			</div>
		</div>
	);
};

export default ViewScheme;
