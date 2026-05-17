import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
	Card,
	Table,
	Button,
	Modal,
	Form,
	Input,
	Select,
	DatePicker,
	Tag,
	Space,
	Typography,
	Avatar,
	Tooltip,
	Tabs,
	Empty,
	Popconfirm,
	Alert,
	Divider,
	Radio,
	Spin,
	Badge,
	Descriptions,
	Row,
	Col,
	Statistic,
	Grid,
	message
} from "antd";
import {
	UserAddOutlined,
	TeamOutlined,
	DeleteOutlined,
	SearchOutlined,
	ArrowLeftOutlined,
	DollarOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	UserOutlined,
	PhoneOutlined,
	IdcardOutlined,
	GiftOutlined,
	FilterOutlined,
	ReloadOutlined,
	UploadOutlined,
	FileExcelOutlined,
	DownloadOutlined,
	EnvironmentOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
	Document,
	Page,
	View,
	Text as PdfText,
	Image as PdfImage,
	StyleSheet as PdfStyleSheet,
	pdf
} from "@react-pdf/renderer";
import { GET_EMPOWERMENT_SCHEME } from "../../../gql/queries/empowermentSchemeQueries";
import { GET_EMPOWERMENT_SCHEME_APPLICATIONS } from "../../../gql/queries/empowermentSchemeQueries";
import {
	GET_TRADES,
	GET_TRADERS_LIST,
	GET_TRADERS_BY_TRADE_LOCATION
} from "../../../gql/queries/queries";
import { GET_TRADE_LOCATIONS } from "../../../gql/tradeLocation";
import {
	APPLY_TO_EMPOWERMENT_SCHEME,
	BULK_ADD_TRADERS_TO_SCHEME,
	BULK_ADD_TRADERS_BY_CTSH_IDS,
	BULK_ADD_TRADERS_BY_TRADE_GROUP,
	UPDATE_EMPOWERMENT_SCHEME_APPLICATION,
	REMOVE_TRADER_FROM_SCHEME
} from "../../../gql/mutations/empowermentSchemeMutations";
import Loading from "../../../components/Loading/Loading";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── PDF constants (hoisted to avoid re-creation on every export) ─────────────
const PDF_ROWS_PER_PAGE = 30;
const pdfStyles = PdfStyleSheet.create({
	page: { padding: 30, fontSize: 9, fontFamily: "Helvetica" },
	title: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
	subtitle: { fontSize: 9, color: "#555", marginBottom: 16 },
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#16a34a",
		color: "white",
		padding: "5 4",
		fontWeight: "bold"
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#e5e7eb",
		paddingVertical: 4,
		alignItems: "center"
	},
	tableRowAlt: { backgroundColor: "#f0fdf4" },
	col0: { width: 30 },
	col1: { width: 50 },
	col2: { width: 110 },
	col3: { width: 80 },
	col4: { width: 70 },
	col5: { width: 80 },
	col6: { width: 90 },
	col7: { flex: 1 },
	cell: { paddingHorizontal: 4 },
	photo: { width: 44, height: 56, objectFit: "cover" },
	photoPlaceholder: {
		width: 44,
		height: 56,
		backgroundColor: "#d1d5db",
		justifyContent: "center",
		alignItems: "center"
	},
	pageFooter: {
		position: "absolute",
		bottom: 14,
		right: 30,
		fontSize: 8,
		color: "#9ca3af"
	}
});

const SchemeApplicationsManagement = () => {
	const { uuid } = useParams();
	const navigate = useNavigate();
	const [addForm] = Form.useForm();
	const [disburseForm] = Form.useForm();

	// ─── UI state ───────────────────────────────────────────────────────────────
	const [activeTab, setActiveTab] = useState("prospective");
	const [showAddModal, setShowAddModal] = useState(false);
	const [showDisburseModal, setShowDisburseModal] = useState(false);
	const [addMode, setAddMode] = useState("individual"); // "individual" | "trade" | "excel"
	const [excelEntries, setExcelEntries] = useState([]); // parsed rows from excel: [{ctsh_id, phone}]
	const [excelBatchProgress, setExcelBatchProgress] = useState(null); // null | {current, total}
	const [excelFileName, setExcelFileName] = useState("");
	const [selectedTraderForDisburse, setSelectedTraderForDisburse] =
		useState(null);
	const [selectedTradeId, setSelectedTradeId] = useState(null);
	const [selectedTradeLocationName, setSelectedTradeLocationName] =
		useState(null);
	const [traderSearch, setTraderSearch] = useState("");
	const [prospectiveSearch, setProspectiveSearch] = useState("");
	const [prospectiveLocationFilter, setProspectiveLocationFilter] =
		useState(null);
	const [beneficiarySearch, setBeneficiarySearch] = useState("");
	const [prospectivePage, setProspectivePage] = useState(1);
	const [beneficiaryPage, setBeneficiaryPage] = useState(1);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [bulkRemoving, setBulkRemoving] = useState(false);
	const [pdfExporting, setPdfExporting] = useState(false);
	const screens = Grid.useBreakpoint();
	const isMobile = !screens.sm;
	const PAGE_SIZE = 20;
	// When a location filter is active, load all records so client-side filter
	// works across all pages (not just the current page).
	const prospectiveFirst = prospectiveLocationFilter ? 500 : PAGE_SIZE;
	const prospectiveQueryPage = prospectiveLocationFilter ? 1 : prospectivePage;

	// ─── Queries ─────────────────────────────────────────────────────────────────
	const {
		data: schemeData,
		loading: schemeLoading,
		error: schemeError
	} = useQuery(GET_EMPOWERMENT_SCHEME, {
		variables: { uuid },
		fetchPolicy: "cache-and-network"
	});

	const {
		data: prospectiveData,
		loading: prospectiveLoading,
		refetch: refetchProspective
	} = useQuery(GET_EMPOWERMENT_SCHEME_APPLICATIONS, {
		variables: {
			empowerment_scheme_id: schemeData?.empowermentScheme?.id,
			first: prospectiveFirst,
			page: prospectiveQueryPage
		},
		skip: !schemeData?.empowermentScheme?.id,
		fetchPolicy: "cache-and-network"
	});

	const {
		data: beneficiaryData,
		loading: beneficiaryLoading,
		refetch: refetchBeneficiaries
	} = useQuery(GET_EMPOWERMENT_SCHEME_APPLICATIONS, {
		variables: {
			empowerment_scheme_id: schemeData?.empowermentScheme?.id,
			status: "COMPLETED",
			first: PAGE_SIZE,
			page: beneficiaryPage
		},
		skip: !schemeData?.empowermentScheme?.id,
		fetchPolicy: "cache-and-network"
	});

	const { data: tradesData } = useQuery(GET_TRADES);

	const { data: traderSearchData, loading: traderSearchLoading } = useQuery(
		GET_TRADERS_LIST,
		{
			variables: {
				first: 50,
				page: 1,
				orderBy: "SURNAME",
				direction: "ASC",
				...(traderSearch && { search: traderSearch })
			},
			skip: !showAddModal || addMode !== "individual",
			fetchPolicy: "cache-and-network"
		}
	);

	// Trade-group prefetch removed — server handles slot-limiting and deduplication
	const tradersListData = null;
	const tradersListLoading = false;

	const { data: tradeLocationsData } = useQuery(GET_TRADE_LOCATIONS, {
		variables: { isActive: true },
		fetchPolicy: "cache-and-network"
	});

	const { data: tradersByLocationData, loading: tradersByLocationLoading } =
		useQuery(GET_TRADERS_BY_TRADE_LOCATION, {
			variables: {
				trade_location: selectedTradeLocationName ?? "",
				first: 1000,
				page: 1
			},
			skip: !selectedTradeLocationName || addMode !== "trade_location",
			fetchPolicy: "cache-and-network"
		});

	// ─── Mutations ───────────────────────────────────────────────────────────────
	const [applyToScheme, { loading: applyingOne }] = useMutation(
		APPLY_TO_EMPOWERMENT_SCHEME,
		{
			onCompleted: () => {
				message.success("Trader added to scheme successfully");
				addForm.resetFields();
				setShowAddModal(false);
				setTraderSearch("");
				refetchProspective();
			},
			onError: (err) =>
				message.error(err.message || "Failed to add trader to scheme")
		}
	);

	const [bulkAddTraders, { loading: bulkAdding }] = useMutation(
		BULK_ADD_TRADERS_TO_SCHEME,
		{
			onCompleted: (data) => {
				const count = data?.bulkAddTradersToScheme?.length ?? 0;
				message.success(
					`${count} trader(s) added to scheme (duplicates skipped)`
				);
				addForm.resetFields();
				setShowAddModal(false);
				setSelectedTradeId(null);
				setSelectedTradeLocationName(null);
				refetchProspective();
			},
			onError: (err) =>
				message.error(err.message || "Failed to bulk add traders")
		}
	);

	const [bulkAddByCtshIds, { loading: bulkAddingByCtsh }] = useMutation(
		BULK_ADD_TRADERS_BY_CTSH_IDS,
		{
			onError: (err) =>
				message.error(err.message || "Failed to add traders via Excel")
		}
	);

	const [bulkAddByTradeGroup, { loading: bulkAddingByTradeGroup }] =
		useMutation(BULK_ADD_TRADERS_BY_TRADE_GROUP, {
			onCompleted: (data) => {
				const count = data?.bulkAddTradersByTradeGroup?.length ?? 0;
				message.success(
					count > 0
						? `${count} trader(s) added from trade group (slots filled, duplicates skipped)`
						: "No new traders to add — all eligible traders are already in the scheme or no slots available"
				);
				addForm.resetFields();
				setShowAddModal(false);
				setSelectedTradeId(null);
				refetchProspective();
			},
			onError: (err) =>
				message.error(err.message || "Failed to add traders from trade group")
		});

	const [updateApplication, { loading: updating }] = useMutation(
		UPDATE_EMPOWERMENT_SCHEME_APPLICATION,
		{
			onCompleted: () => {
				message.success("Disbursement recorded successfully");
				disburseForm.resetFields();
				setShowDisburseModal(false);
				setSelectedTraderForDisburse(null);
				refetchProspective();
				refetchBeneficiaries();
			},
			onError: (err) =>
				message.error(err.message || "Failed to record disbursement")
		}
	);

	const [removeTrader, { loading: removing }] = useMutation(
		REMOVE_TRADER_FROM_SCHEME,
		{
			onCompleted: () => {
				message.success("Trader removed from scheme");
				refetchProspective();
			},
			onError: (err) => message.error(err.message || "Failed to remove trader")
		}
	);

	const [bulkRemoveTrader] = useMutation(REMOVE_TRADER_FROM_SCHEME);

	// ─── Derived data ─────────────────────────────────────────────────────────
	const scheme = schemeData?.empowermentScheme;
	const trades = tradesData?.trades || [];

	// All applications (PENDING + APPROVED) for prospective list
	const allApplications =
		prospectiveData?.empowermentSchemeApplications?.data || [];
	const prospectivePaginator =
		prospectiveData?.empowermentSchemeApplications?.paginatorInfo;

	// Filter out COMPLETED from prospective list
	const prospectiveList = allApplications.filter(
		(a) => a.status !== "completed" && a.status !== "COMPLETED"
	);

	const beneficiaryList =
		beneficiaryData?.empowermentSchemeApplications?.data || [];
	const beneficiaryPaginator =
		beneficiaryData?.empowermentSchemeApplications?.paginatorInfo;

	const allTraders = traderSearchData?.traderList?.data || [];
	const tradersInSelectedTrade = tradersListData?.traderList?.data || [];
	const tradeLocations = tradeLocationsData?.tradeLocations || [];
	const tradersInSelectedLocation =
		tradersByLocationData?.traderList?.data || [];

	// IDs already in the scheme
	const existingTraderIds = allApplications.map((a) => a.trader?.id);

	// ─── Search filtering (client-side on top of server result) ────────────────
	const filteredProspective = prospectiveList.filter((a) => {
		if (
			prospectiveLocationFilter &&
			a.trader?.trade_location !== prospectiveLocationFilter
		) {
			return false;
		}
		if (prospectiveSearch) {
			const s = prospectiveSearch.toLowerCase();
			const name =
				`${a.trader?.surname} ${a.trader?.other_names}`.toLowerCase();
			if (
				!name.includes(s) &&
				!a.trader?.ctsh_id?.toLowerCase().includes(s) &&
				!a.trader?.phone?.includes(prospectiveSearch)
			) {
				return false;
			}
		}
		return true;
	});

	const filteredBeneficiaries = beneficiarySearch
		? beneficiaryList.filter((a) => {
				const s = beneficiarySearch.toLowerCase();
				const name =
					`${a.trader?.surname} ${a.trader?.other_names}`.toLowerCase();
				return (
					name.includes(s) ||
					a.trader?.ctsh_id?.toLowerCase().includes(s) ||
					a.trader?.phone?.includes(beneficiarySearch)
				);
			})
		: beneficiaryList;

	// ─── Helpers ──────────────────────────────────────────────────────────────
	const formatCurrency = (amount) =>
		new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN"
		}).format(amount || 0);

	const formatDate = (d) => (d ? dayjs(d).format("DD MMM YYYY") : "—");

	const getStatusTag = (status) => {
		const map = {
			pending: { color: "orange", label: "Pending" },
			PENDING: { color: "orange", label: "Pending" },
			approved: { color: "blue", label: "Approved" },
			APPROVED: { color: "blue", label: "Approved" },
			completed: { color: "green", label: "Disbursed" },
			COMPLETED: { color: "green", label: "Disbursed" },
			rejected: { color: "red", label: "Rejected" },
			REJECTED: { color: "red", label: "Rejected" }
		};
		const cfg = map[status] || { color: "default", label: status };
		return <Tag color={cfg.color}>{cfg.label}</Tag>;
	};

	const traderFullName = (trader) =>
		`${trader?.surname || ""} ${trader?.other_names || ""}`.trim();

	// ─── Handlers ─────────────────────────────────────────────────────────────
	const handleOpenDisburse = (application) => {
		setSelectedTraderForDisburse(application);
		disburseForm.setFieldsValue({
			disbursement_date: dayjs(),
			remarks: ""
		});
		setShowDisburseModal(true);
	};

	const handleDisburse = async (values) => {
		await updateApplication({
			variables: {
				empowerment_scheme_id: scheme.id,
				trader_id: selectedTraderForDisburse.trader.id,
				status: "COMPLETED",
				approval_date: values.disbursement_date
					? values.disbursement_date.format("YYYY-MM-DD HH:mm:ss")
					: dayjs().format("YYYY-MM-DD HH:mm:ss"),
				remarks: values.remarks || null
			}
		});
	};

	const handleAddSubmit = async (values) => {
		if (addMode === "individual") {
			await applyToScheme({
				variables: {
					empowerment_scheme_id: scheme.id,
					trader_id: parseInt(values.trader_id),
					remarks: values.remarks || null
				}
			});
		} else if (addMode === "excel") {
			if (excelEntries.length === 0) {
				message.warning("Please upload an Excel file first");
				return;
			}
			const BATCH_SIZE = 50;
			const batches = [];
			for (let i = 0; i < excelEntries.length; i += BATCH_SIZE) {
				batches.push(excelEntries.slice(i, i + BATCH_SIZE));
			}
			let totalAdded = 0;
			try {
				for (let i = 0; i < batches.length; i++) {
					if (batches.length > 1) {
						setExcelBatchProgress({ current: i + 1, total: batches.length });
					}
					const batch = batches[i];
					const result = await bulkAddByCtshIds({
						variables: {
							empowerment_scheme_id: scheme.id,
							ctsh_ids: batch.filter((e) => e.ctsh_id).map((e) => e.ctsh_id),
							phone_numbers: batch.filter((e) => e.phone).map((e) => e.phone),
							remarks: values.remarks || null
						}
					});
					totalAdded += result?.data?.bulkAddTradersByCtshIds?.length ?? 0;
				}
				message.success(
					`${totalAdded} trader(s) added from Excel upload (unrecognised IDs/phones and duplicates skipped)`
				);
				addForm.resetFields();
				setShowAddModal(false);
				setExcelEntries([]);
				setExcelFileName("");
				refetchProspective();
			} finally {
				setExcelBatchProgress(null);
			}
		} else if (addMode === "trade_location") {
			const idsToAdd = tradersInSelectedLocation
				.filter((t) => !existingTraderIds.includes(t.id))
				.map((t) => t.id);
			if (idsToAdd.length === 0) {
				message.warning(
					"All traders at this trade location are already in the scheme"
				);
				return;
			}
			await bulkAddTraders({
				variables: {
					empowerment_scheme_id: scheme.id,
					trader_ids: idsToAdd,
					remarks: values.remarks || null
				}
			});
		} else {
			// bulk add traders from selected trade group (server handles slots + dedup)
			await bulkAddByTradeGroup({
				variables: {
					empowerment_scheme_id: scheme.id,
					trade_id: parseInt(values.trade_id),
					remarks: values.remarks || null
				}
			});
		}
	};

	const handleRemove = (application) => {
		removeTrader({
			variables: {
				empowerment_scheme_id: scheme.id,
				trader_id: application.trader.id
			}
		});
	};

	const handleExportPdf = async () => {
		setPdfExporting(true);
		try {
			const schemeName = scheme?.name || "Scheme";
			const amountFmt = scheme?.amount_per_participant
				? new Intl.NumberFormat("en-NG", {
						style: "currency",
						currency: "NGN"
					}).format(scheme.amount_per_participant)
				: "—";

			// Key by trader ID to avoid huge base64 strings as object keys
			const photoMap = {};
			beneficiaryList.forEach((a) => {
				if (a.trader?.photo) {
					photoMap[a.trader.id] = `data:image/jpeg;base64,${a.trader.photo}`;
				}
			});

			// Split into pages of PDF_ROWS_PER_PAGE to keep each page fast
			const chunks = [];
			for (let i = 0; i < beneficiaryList.length; i += PDF_ROWS_PER_PAGE) {
				chunks.push(beneficiaryList.slice(i, i + PDF_ROWS_PER_PAGE));
			}
			if (chunks.length === 0) chunks.push([]);

			const PdfTableHeader = () => (
				<View style={pdfStyles.tableHeader}>
					<PdfText style={[pdfStyles.col0, pdfStyles.cell]}>#</PdfText>
					<View style={pdfStyles.col1} />
					<PdfText style={[pdfStyles.col2, pdfStyles.cell]}>
						Full Name / CTSH ID
					</PdfText>
					<PdfText style={[pdfStyles.col3, pdfStyles.cell]}>Trade</PdfText>
					<PdfText style={[pdfStyles.col4, pdfStyles.cell]}>NIN</PdfText>
					<PdfText style={[pdfStyles.col5, pdfStyles.cell]}>
						Disbursement Date
					</PdfText>
					<PdfText style={[pdfStyles.col6, pdfStyles.cell]}>Amount</PdfText>
					<PdfText style={[pdfStyles.col7, pdfStyles.cell]}>Remarks</PdfText>
				</View>
			);

			const BeneficiaryPdf = () => (
				<Document>
					{chunks.map((chunk, pageIndex) => (
						<Page
							key={pageIndex}
							size="A4"
							orientation="landscape"
							style={pdfStyles.page}>
							{pageIndex === 0 && (
								<>
									<PdfText style={pdfStyles.title}>
										{schemeName} — Beneficiaries List
									</PdfText>
									<PdfText style={pdfStyles.subtitle}>
										Exported {dayjs().format("DD MMM YYYY HH:mm")} ·{" "}
										{beneficiaryList.length} beneficiar
										{beneficiaryList.length === 1 ? "y" : "ies"} · Amount per
										participant: {amountFmt}
									</PdfText>
								</>
							)}
							<PdfTableHeader />
							{chunk.map((a, rowIndex) => {
								const globalIndex = pageIndex * PDF_ROWS_PER_PAGE + rowIndex;
								return (
									<View
										key={a.id}
										wrap={false}
										style={[
											pdfStyles.tableRow,
											globalIndex % 2 === 1 ? pdfStyles.tableRowAlt : {}
										]}>
										<PdfText style={[pdfStyles.col0, pdfStyles.cell]}>
											{globalIndex + 1}
										</PdfText>
										<View style={pdfStyles.col1}>
											{photoMap[a.trader?.id] ? (
												<PdfImage
													src={photoMap[a.trader.id]}
													style={pdfStyles.photo}
												/>
											) : (
												<View style={pdfStyles.photoPlaceholder}>
													<PdfText
														style={{
															fontSize: 7,
															color: "#6b7280"
														}}>
														N/A
													</PdfText>
												</View>
											)}
										</View>
										<View style={[pdfStyles.col2, pdfStyles.cell]}>
											<PdfText style={{ fontWeight: "bold" }}>
												{traderFullName(a.trader)}
											</PdfText>
											<PdfText style={{ color: "#6b7280", fontSize: 8 }}>
												{a.trader?.ctsh_id || ""}
											</PdfText>
										</View>
										<PdfText style={[pdfStyles.col3, pdfStyles.cell]}>
											{a.trader?.trade?.name || "—"}
										</PdfText>
										<PdfText style={[pdfStyles.col4, pdfStyles.cell]}>
											{a.trader?.nin || "—"}
										</PdfText>
										<PdfText style={[pdfStyles.col5, pdfStyles.cell]}>
											{a.approval_date
												? dayjs(a.approval_date).format("DD/MM/YYYY")
												: "—"}
										</PdfText>
										<PdfText style={[pdfStyles.col6, pdfStyles.cell]}>
											{amountFmt}
										</PdfText>
										<PdfText style={[pdfStyles.col7, pdfStyles.cell]}>
											{a.remarks || "—"}
										</PdfText>
									</View>
								);
							})}
							<PdfText style={pdfStyles.pageFooter}>
								Page {pageIndex + 1} of {chunks.length}
							</PdfText>
						</Page>
					))}
				</Document>
			);

			const blob = await pdf(<BeneficiaryPdf />).toBlob();
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			const fileSlug = (scheme?.name || "scheme").replace(/[^a-z0-9]/gi, "_");
			link.download = `${fileSlug}_beneficiaries.pdf`;
			link.click();
			URL.revokeObjectURL(url);
		} finally {
			setPdfExporting(false);
		}
	};

	const handleExportBeneficiaries = () => {
		import("xlsx").then((XLSX) => {
			const rows = beneficiaryList.map((a, i) => ({
				"S/N": i + 1,
				"Full Name": traderFullName(a.trader),
				"CTSH ID": a.trader?.ctsh_id || "",
				Trade: a.trader?.trade?.name || "",
				NIN: a.trader?.nin || "",
				"Disbursement Date": a.approval_date
					? dayjs(a.approval_date).format("DD/MM/YYYY")
					: "",
				Amount: scheme?.amount_per_participant
					? formatCurrency(scheme.amount_per_participant)
					: "",
				Remarks: a.remarks || ""
			}));
			const ws = XLSX.utils.json_to_sheet(rows);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "Beneficiaries");
			const schemeName = (scheme?.name || "scheme").replace(/[^a-z0-9]/gi, "_");
			XLSX.writeFile(wb, `${schemeName}_beneficiaries.xlsx`);
		});
	};

	const handleBulkRemove = async () => {
		const selected = filteredProspective.filter((a) =>
			selectedRowKeys.includes(a.id)
		);
		if (selected.length === 0) return;
		setBulkRemoving(true);
		try {
			await Promise.all(
				selected.map((a) =>
					bulkRemoveTrader({
						variables: {
							empowerment_scheme_id: scheme.id,
							trader_id: a.trader.id
						}
					})
				)
			);
			message.success(`${selected.length} trader(s) removed from scheme`);
			setSelectedRowKeys([]);
			refetchProspective();
		} catch (err) {
			message.error(err.message || "Failed to remove some traders");
		} finally {
			setBulkRemoving(false);
		}
	};

	// ─── Table columns ────────────────────────────────────────────────────────
	const prospectiveColumns = [
		{
			title: "#",
			key: "index",
			width: 50,
			render: (_, __, i) => (prospectivePage - 1) * PAGE_SIZE + i + 1
		},
		{
			title: "Trader",
			key: "trader",
			render: (_, r) => (
				<Space>
					<Avatar
						src={
							r.trader?.photo
								? `data:image/jpeg;base64,${r.trader.photo}`
								: null
						}
						icon={<UserOutlined />}
						size={36}
					/>
					<div>
						<Text strong>{traderFullName(r.trader)}</Text>
						<br />
						<Text type="secondary" style={{ fontSize: 12 }}>
							<IdcardOutlined style={{ marginRight: 4 }} />
							{r.trader?.ctsh_id || "—"}
						</Text>
					</div>
				</Space>
			)
		},
		{
			title: "NIN",
			key: "nin",
			responsive: ["sm"],
			render: (_, r) => r.trader?.nin || "—"
		},
		{
			title: "Status",
			key: "status",
			render: (_, r) => getStatusTag(r.status)
		},
		{
			title: "Date Added",
			key: "application_date",
			responsive: ["md"],
			render: (_, r) => formatDate(r.application_date)
		},
		{
			title: "Remarks",
			dataIndex: "remarks",
			key: "remarks",
			responsive: ["lg"],
			render: (v) => v || "—"
		},
		{
			title: "Actions",
			key: "actions",
			width: 100,
			fixed: "right",
			render: (_, r) => (
				<Space size={4}>
					<Tooltip title="Record Disbursement">
						<Button
							type="primary"
							icon={<DollarOutlined />}
							size="small"
							onClick={() => handleOpenDisburse(r)}
						/>
					</Tooltip>
					<Popconfirm
						title="Remove trader from this scheme?"
						onConfirm={() => handleRemove(r)}
						okText="Remove"
						okType="danger"
						cancelText="Cancel">
						<Button
							danger
							icon={<DeleteOutlined />}
							size="small"
							loading={removing}
						/>
					</Popconfirm>
				</Space>
			)
		}
	];
	const beneficiaryColumns = [
		{
			title: "#",
			key: "index",
			width: 50,
			render: (_, __, i) => (beneficiaryPage - 1) * PAGE_SIZE + i + 1
		},
		{
			title: "Trader",
			key: "trader",
			render: (_, r) => (
				<Space>
					<Avatar
						src={
							r.trader?.photo
								? `data:image/jpeg;base64,${r.trader.photo}`
								: null
						}
						icon={<UserOutlined />}
						size={36}
					/>
					<div>
						<Text strong>{traderFullName(r.trader)}</Text>
						<br />
						<Text type="secondary" style={{ fontSize: 12 }}>
							<IdcardOutlined style={{ marginRight: 4 }} />
							{r.trader?.ctsh_id || "—"}
						</Text>
					</div>
				</Space>
			)
		},
		{
			title: "Trade",
			key: "trade",
			responsive: ["sm"],
			render: (_, r) => r.trader?.trade?.name || "—"
		},
		{
			title: "NIN",
			key: "nin",
			responsive: ["sm"],
			render: (_, r) => r.trader?.nin || "—"
		},
		{
			title: "Disbursement Date",
			key: "approval_date",
			render: (_, r) => (
				<Space>
					<CheckCircleOutlined style={{ color: "#52c41a" }} />
					{formatDate(r.approval_date)}
				</Space>
			)
		},
		{
			title: "Amount",
			key: "amount",
			responsive: ["md"],
			render: () =>
				scheme?.amount_per_participant
					? formatCurrency(scheme.amount_per_participant)
					: "—"
		},
		{
			title: "Remarks",
			dataIndex: "remarks",
			key: "remarks",
			responsive: ["lg"],
			render: (v) => v || "—"
		}
	];

	// ─── Render helpers ───────────────────────────────────────────────────────
	const renderSchemeHeader = () => (
		<Card
			bordered={false}
			style={{ marginBottom: 12 }}
			bodyStyle={{ padding: "12px 16px" }}>
			<Space direction="vertical" size={4} style={{ width: "100%" }}>
				<Button
					icon={<ArrowLeftOutlined />}
					onClick={() =>
						navigate(`/admin/empowerment-schemes/view-scheme/${uuid}`)
					}
					size="small">
					Back to Scheme
				</Button>
				<Title level={4} style={{ margin: 0 }}>
					{scheme?.name}
				</Title>
				{scheme?.description && (
					<Text type="secondary" style={{ fontSize: 13 }}>
						{scheme.description}
					</Text>
				)}
				<Row gutter={[16, 8]} style={{ marginTop: 4 }}>
					<Col xs={12} sm={6}>
						<Statistic
							title="Max Participants"
							value={scheme?.max_participants ?? "—"}
							prefix={<TeamOutlined />}
						/>
					</Col>
					<Col xs={12} sm={6}>
						<Statistic
							title="Participants List"
							value={prospectivePaginator?.total ?? 0}
							prefix={<ClockCircleOutlined />}
							valueStyle={{
								color:
									scheme?.max_participants &&
									(prospectivePaginator?.total ?? 0) >= scheme.max_participants
										? "#ff4d4f"
										: "#1677ff"
							}}
						/>
					</Col>
					<Col xs={12} sm={6}>
						<Statistic
							title="Amount / Participant"
							value={
								scheme?.amount_per_participant
									? formatCurrency(scheme.amount_per_participant)
									: "—"
							}
							prefix={<DollarOutlined />}
						/>
					</Col>
					<Col xs={12} sm={6}>
						<Statistic
							title="Beneficiaries"
							value={
								beneficiaryData?.empowermentSchemeApplications?.paginatorInfo
									?.total ?? 0
							}
							prefix={<GiftOutlined />}
							valueStyle={{ color: "#52c41a" }}
						/>
					</Col>
				</Row>
			</Space>
		</Card>
	);

	// ─── Add Traders Modal ────────────────────────────────────────────────────
	const renderAddModal = () => {
		// newInTrade not needed — backend handles slot filling

		return (
			<Modal
				title={
					<Space>
						<UserAddOutlined />
						Add Traders to Prospective Beneficiary List
					</Space>
				}
				open={showAddModal}
				onCancel={() => {
					setShowAddModal(false);
					addForm.resetFields();
					setAddMode("individual");
					setSelectedTradeId(null);
					setSelectedTradeLocationName(null);
					setTraderSearch("");
					setExcelEntries([]);
					setExcelFileName("");
				}}
				footer={null}
				width="min(560px, 96vw)"
				style={{ top: 16 }}>
				<Form
					form={addForm}
					layout="vertical"
					onFinish={handleAddSubmit}
					style={{ marginTop: 8 }}>
					{/* Mode switcher */}
					<Form.Item label="How would you like to add traders?">
						<Radio.Group
							value={addMode}
							onChange={(e) => {
								setAddMode(e.target.value);
								addForm.resetFields([
									"trader_id",
									"trade_id",
									"trade_location_name"
								]);
								setSelectedTradeId(null);
								setSelectedTradeLocationName(null);
								setExcelEntries([]);
								setExcelFileName("");
							}}
							buttonStyle="solid">
							<Radio.Button value="individual">
								<UserOutlined /> Individual Trader
							</Radio.Button>
							<Radio.Button value="trade">
								<TeamOutlined /> By Trade Group
							</Radio.Button>
							<Radio.Button value="trade_location">
								<EnvironmentOutlined /> By Trade Location
							</Radio.Button>
							<Radio.Button value="excel">
								<FileExcelOutlined /> Excel Upload
							</Radio.Button>
						</Radio.Group>
					</Form.Item>

					{addMode === "individual" && (
						<Form.Item
							name="trader_id"
							label="Select Trader"
							rules={[{ required: true, message: "Please select a trader" }]}>
							<Select
								showSearch
								placeholder="Type name, CTSH ID or phone to search…"
								filterOption={false}
								onSearch={(v) => setTraderSearch(v)}
								loading={traderSearchLoading}
								notFoundContent={
									traderSearchLoading ? (
										<span style={{ padding: "8px 12px" }}>Searching…</span>
									) : (
										<Empty
											image={Empty.PRESENTED_IMAGE_SIMPLE}
											description={
												traderSearch
													? "No traders found"
													: "Type to search traders"
											}
										/>
									)
								}
								style={{ width: "100%" }}>
								{allTraders
									.filter((t) => !existingTraderIds.includes(t.id))
									.map((t) => (
										<Option key={t.id} value={t.id}>
											{traderFullName(t)}{" "}
											<Text type="secondary" style={{ fontSize: 12 }}>
												· {t.ctsh_id} · {t.phone}
											</Text>
										</Option>
									))}
							</Select>
						</Form.Item>
					)}

					{addMode === "trade" && (
						<>
							<Form.Item
								name="trade_id"
								label="Select Trade"
								rules={[{ required: true, message: "Please select a trade" }]}>
								<Select
									showSearch
									placeholder="Select a trade group…"
									optionFilterProp="children"
									onChange={(val) => setSelectedTradeId(val)}
									style={{ width: "100%" }}>
									{trades.map((trade) => (
										<Option key={trade.id} value={trade.id}>
											{trade.name}
											{trade.countTraders != null && (
												<Text type="secondary" style={{ fontSize: 12 }}>
													{" "}
													({trade.countTraders} traders)
												</Text>
											)}
										</Option>
									))}
								</Select>
							</Form.Item>

							{selectedTradeId && (
								<Alert
									type={(scheme?.available_slots ?? 0) > 0 ? "info" : "warning"}
									style={{ marginBottom: 12 }}
									message={
										(scheme?.available_slots ?? 0) > 0
											? `Traders from this group will be added to fill the ${scheme.available_slots} available slot(s). Already-enrolled traders will be skipped.`
											: "No available slots — the scheme is already full."
									}
								/>
							)}
						</>
					)}

					{addMode === "trade_location" && (
						<>
							<Form.Item
								name="trade_location_name"
								label="Select Trade Location"
								rules={[
									{ required: true, message: "Please select a trade location" }
								]}>
								<Select
									showSearch
									placeholder="Select a trade location…"
									optionFilterProp="children"
									onChange={(val) => setSelectedTradeLocationName(val)}
									style={{ width: "100%" }}>
									{tradeLocations.map((loc) => (
										<Option key={loc.id} value={loc.name}>
											{loc.name}
											{loc.countTraders != null && (
												<Text type="secondary" style={{ fontSize: 12 }}>
													{" "}
													({loc.countTraders} traders)
												</Text>
											)}
										</Option>
									))}
								</Select>
							</Form.Item>

							{selectedTradeLocationName && (
								<>
									{tradersByLocationLoading ? (
										<Spin size="small" />
									) : (
										(() => {
											const newCount = tradersInSelectedLocation.filter(
												(t) => !existingTraderIds.includes(t.id)
											).length;
											return (
												<Alert
													type={newCount > 0 ? "info" : "warning"}
													style={{ marginBottom: 12 }}
													message={
														newCount > 0
															? `${newCount} new trader(s) will be added from this location (${
																	tradersInSelectedLocation.length - newCount
																} already in scheme)`
															: "All traders at this location are already in the scheme"
													}
												/>
											);
										})()
									)}
								</>
							)}
						</>
					)}

					{addMode === "excel" && (
						<>
							<Alert
								type="info"
								style={{ marginBottom: 12 }}
								message={
									<span>
										Upload an Excel file (.xlsx / .xls). Each row should have a
										CTSH ID and/or a phone number. Columns whose headers contain
										"ctsh" or "phone" are detected automatically.{" "}
										<a
											href="#"
											onClick={(e) => {
												e.preventDefault();
												import("xlsx").then((XLSX) => {
													const ws = XLSX.utils.aoa_to_sheet([
														["CTSH ID", "Phone"],
														["KANO/001", "08012345678"],
														["KANO/002", "08087654321"]
													]);
													const wb = XLSX.utils.book_new();
													XLSX.utils.book_append_sheet(wb, ws, "Traders");
													XLSX.writeFile(wb, "ctsh_ids_template.xlsx");
												});
											}}>
											<DownloadOutlined /> Download template
										</a>
									</span>
								}
							/>
							<Form.Item label="Upload Excel file">
								<input
									type="file"
									accept=".xlsx,.xls"
									style={{ marginBottom: 8 }}
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (!file) return;
										setExcelFileName(file.name);
										const reader = new FileReader();
										reader.onload = (evt) => {
											import("xlsx").then((XLSX) => {
												const wb = XLSX.read(evt.target.result, {
													type: "array"
												});
												const ws = wb.Sheets[wb.SheetNames[0]];
												const rows = XLSX.utils.sheet_to_json(ws, {
													header: 1
												});
												if (rows.length === 0) {
													message.error("No data found in the file");
													return;
												}
												// Detect header row
												const firstRow = rows[0].map((h) =>
													String(h ?? "").toLowerCase()
												);
												const hasHeader =
													firstRow.some((h) => h.includes("ctsh")) ||
													firstRow.some((h) => h.includes("phone"));
												const header = hasHeader ? firstRow : null;
												const dataRows = hasHeader ? rows.slice(1) : rows;

												// Detect column indices
												const ctshColIdx = header
													? header.findIndex((h) => h.includes("ctsh"))
													: 0;
												const phoneColIdx = header
													? header.findIndex((h) => h.includes("phone"))
													: -1;

												const entries = dataRows
													.map((r) => ({
														ctsh_id:
															ctshColIdx >= 0
																? String(r[ctshColIdx] ?? "").trim() || null
																: null,
														phone:
															phoneColIdx >= 0
																? String(r[phoneColIdx] ?? "").trim() || null
																: null
													}))
													.filter((e) => e.ctsh_id || e.phone);

												if (entries.length === 0) {
													message.error(
														"No CTSH IDs or phone numbers found in the file"
													);
													return;
												}
												setExcelEntries(entries);
												const ctshCount = entries.filter(
													(e) => e.ctsh_id
												).length;
												const phoneCount = entries.filter(
													(e) => e.phone
												).length;
												const parts = [];
												if (ctshCount > 0)
													parts.push(`${ctshCount} CTSH ID(s)`);
												if (phoneCount > 0)
													parts.push(`${phoneCount} phone number(s)`);
												message.success(
													`${parts.join(" and ")} extracted from file`
												);
											});
										};
										reader.readAsArrayBuffer(file);
									}}
								/>
							</Form.Item>
							{excelEntries.length > 0 &&
								(() => {
									const ctshCount = excelEntries.filter(
										(e) => e.ctsh_id
									).length;
									const phoneCount = excelEntries.filter((e) => e.phone).length;
									return (
										<Alert
											type="success"
											style={{ marginBottom: 12 }}
											message={
												<>
													<strong>
														{ctshCount > 0 && `${ctshCount} CTSH ID(s)`}
														{ctshCount > 0 && phoneCount > 0 && " · "}
														{phoneCount > 0 && `${phoneCount} phone number(s)`}
													</strong>{" "}
													ready to submit from <em>{excelFileName}</em>.
													{excelEntries.length > 50 && (
														<div
															style={{
																marginTop: 4,
																fontSize: 12,
																color: "#888"
															}}>
															Will be processed in batches of 50 rows.
														</div>
													)}
													<div
														style={{
															marginTop: 4,
															maxHeight: 80,
															overflowY: "auto",
															fontSize: 12,
															color: "#555"
														}}>
														{excelEntries
															.map((e) =>
																[e.ctsh_id, e.phone].filter(Boolean).join("/")
															)
															.join(", ")}
													</div>
												</>
											}
										/>
									);
								})()}
							{excelBatchProgress && (
								<Alert
									type="info"
									style={{ marginBottom: 12 }}
									message={`Processing batch ${excelBatchProgress.current} of ${excelBatchProgress.total}…`}
								/>
							)}
						</>
					)}

					<Form.Item name="remarks" label="Remarks (optional)">
						<TextArea
							rows={2}
							placeholder="Optional remarks for this addition…"
						/>
					</Form.Item>

					<Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
						<Space>
							<Button
								onClick={() => {
									setShowAddModal(false);
									addForm.resetFields();
								}}>
								Cancel
							</Button>
							<Button
								type="primary"
								htmlType="submit"
								loading={
									applyingOne ||
									bulkAdding ||
									bulkAddingByCtsh ||
									bulkAddingByTradeGroup
								}
								icon={<UserAddOutlined />}
								disabled={
									(addMode === "excel" && excelEntries.length === 0) ||
									(addMode === "trade_location" && !selectedTradeLocationName)
								}>
								{addMode === "trade"
									? `Add Traders from Group`
									: addMode === "trade_location"
										? `Add ${
												tradersInSelectedLocation.filter(
													(t) => !existingTraderIds.includes(t.id)
												).length || ""
											} Trader(s)`
										: addMode === "excel"
											? `Upload ${excelEntries.length || ""} Trader(s)`
											: "Add Trader"}
							</Button>
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		);
	};

	// ─── Disbursement Modal ───────────────────────────────────────────────────
	const renderDisburseModal = () => {
		const trader = selectedTraderForDisburse?.trader;
		return (
			<Modal
				title={
					<Space>
						<DollarOutlined style={{ color: "#52c41a" }} />
						Record Disbursement
					</Space>
				}
				open={showDisburseModal}
				onCancel={() => {
					setShowDisburseModal(false);
					disburseForm.resetFields();
					setSelectedTraderForDisburse(null);
				}}
				footer={null}
				width="min(500px, 96vw)"
				style={{ top: 16 }}>
				{trader && (
					<>
						{/* Trader info summary */}
						<Card
							bordered
							size="small"
							style={{
								marginBottom: 16,
								background: "#f6ffed",
								borderColor: "#b7eb8f"
							}}>
							<Space>
								<Avatar
									src={
										trader.photo
											? `data:image/jpeg;base64,${trader.photo}`
											: null
									}
									icon={<UserOutlined />}
									size={48}
								/>
								<div>
									<Text strong style={{ fontSize: 16 }}>
										{traderFullName(trader)}
									</Text>
									<br />
									<Text type="secondary">
										<IdcardOutlined style={{ marginRight: 4 }} />
										{trader.ctsh_id}
										{" · "}
										<PhoneOutlined style={{ marginRight: 4 }} />
										{trader.phone}
									</Text>
								</div>
							</Space>
						</Card>

						{scheme?.amount_per_participant && (
							<Alert
								message={`Disbursement amount: ${formatCurrency(scheme.amount_per_participant)}`}
								type="info"
								showIcon
								style={{ marginBottom: 16 }}
							/>
						)}

						<Form
							form={disburseForm}
							layout="vertical"
							onFinish={handleDisburse}>
							<Form.Item
								name="disbursement_date"
								label="Disbursement Date"
								rules={[
									{
										required: true,
										message: "Please select disbursement date"
									}
								]}>
								<DatePicker
									style={{ width: "100%" }}
									format="DD/MM/YYYY"
									disabledDate={(d) => d && d > dayjs().endOf("day")}
								/>
							</Form.Item>

							<Form.Item name="remarks" label="Remarks (optional)">
								<TextArea
									rows={3}
									placeholder="Notes about this disbursement…"
								/>
							</Form.Item>

							<Divider style={{ margin: "8px 0 16px" }} />

							<Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
								<Space>
									<Button
										onClick={() => {
											setShowDisburseModal(false);
											disburseForm.resetFields();
											setSelectedTraderForDisburse(null);
										}}>
										Cancel
									</Button>
									<Button
										type="primary"
										htmlType="submit"
										loading={updating}
										icon={<CheckCircleOutlined />}
										style={{ background: "#52c41a", borderColor: "#52c41a" }}>
										Confirm Disbursement
									</Button>
								</Space>
							</Form.Item>
						</Form>
					</>
				)}
			</Modal>
		);
	};

	// ─── Main render ──────────────────────────────────────────────────────────
	if (schemeLoading) return <Loading />;

	if (schemeError || !scheme) {
		return (
			<div className="w-full px-4 py-8 text-center">
				<Text type="danger">Scheme not found.</Text>
				<br />
				<Link to="/admin/empowerment-schemes">Back to Schemes</Link>
			</div>
		);
	}

	const tabItems = [
		{
			key: "prospective",
			label: (
				<Space size={4}>
					<ClockCircleOutlined />
					{isMobile ? "Prospective" : "Prospective Beneficiary List"}
					<Badge
						count={
							(prospectivePaginator?.total ?? 0) -
							(beneficiaryPaginator?.total ?? 0)
						}
						style={{ backgroundColor: "#fa8c16" }}
						overflowCount={999}
					/>
				</Space>
			),
			children: (
				<div>
					{/* Toolbar */}
					<Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
						<Col xs={24} sm={12} md={10}>
							<Input
								prefix={<SearchOutlined />}
								placeholder="Search name, CTSH ID or phone…"
								value={prospectiveSearch}
								onChange={(e) => setProspectiveSearch(e.target.value)}
								allowClear
								style={{ width: "100%" }}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Select
								showSearch
								allowClear
								placeholder={
									<span>
										<EnvironmentOutlined /> Filter by trade location
									</span>
								}
								optionFilterProp="children"
								value={prospectiveLocationFilter}
								onChange={(val) => {
									setProspectiveLocationFilter(val ?? null);
									setProspectivePage(1);
								}}
								style={{ width: "100%" }}>
								{tradeLocations.map((loc) => (
									<Option key={loc.id} value={loc.name}>
										{loc.name}
									</Option>
								))}
							</Select>
						</Col>
						<Col xs={24} md={6}>
							<Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
								{selectedRowKeys.length > 0 && (
									<Popconfirm
										title={`Remove ${selectedRowKeys.length} selected trader(s) from this scheme?`}
										onConfirm={handleBulkRemove}
										okText="Remove"
										okType="danger"
										cancelText="Cancel">
										<Button
											danger
											icon={<DeleteOutlined />}
											loading={bulkRemoving}>
											Delete ({selectedRowKeys.length})
										</Button>
									</Popconfirm>
								)}
								<Tooltip title="Refresh">
									<Button
										icon={<ReloadOutlined />}
										onClick={() => refetchProspective()}
									/>
								</Tooltip>
								<Button
									type="primary"
									icon={<UserAddOutlined />}
									onClick={() => setShowAddModal(true)}>
									Add Traders
								</Button>
							</Space>
						</Col>
					</Row>

					<Table
						columns={prospectiveColumns}
						dataSource={filteredProspective}
						rowKey="id"
						loading={prospectiveLoading}
						rowSelection={{
							selectedRowKeys,
							onChange: (keys) => setSelectedRowKeys(keys),
							preserveSelectedRowKeys: false
						}}
						locale={{
							emptyText: (
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									description="No traders in the prospective list yet. Click 'Add Traders' to get started."
								/>
							)
						}}
						pagination={{
							current: prospectivePage,
							pageSize: PAGE_SIZE,
							total: prospectiveLocationFilter
								? filteredProspective.length
								: prospectivePaginator?.total,
							showSizeChanger: false,
							showTotal: (total) => `${total} trader(s) in prospective list`,
							onChange: (page) => setProspectivePage(page)
						}}
						scroll={{ x: 800 }}
					/>
				</div>
			)
		},
		{
			key: "beneficiaries",
			label: (
				<Space size={4}>
					<GiftOutlined />
					{isMobile ? "Disbursed" : "Beneficiaries (Disbursed)"}
					<Badge
						count={beneficiaryPaginator?.total ?? 0}
						style={{ backgroundColor: "#52c41a" }}
						overflowCount={999}
					/>
				</Space>
			),
			children: (
				<div>
					{/* Toolbar */}
					<Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
						<Col xs={24} sm={14} md={12}>
							<Input
								prefix={<SearchOutlined />}
								placeholder="Search name, CTSH ID or phone…"
								value={beneficiarySearch}
								onChange={(e) => setBeneficiarySearch(e.target.value)}
								allowClear
								style={{ width: "100%" }}
							/>
						</Col>
						<Col xs={24} sm={10} md={12}>
							<Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
								<Button
									icon={<DownloadOutlined />}
									onClick={handleExportBeneficiaries}
									disabled={beneficiaryList.length === 0}>
									Export Excel
								</Button>
								<Button
									icon={<FileExcelOutlined />}
									onClick={handleExportPdf}
									loading={pdfExporting}
									disabled={beneficiaryList.length === 0}>
									{pdfExporting ? "Generating…" : "Export PDF"}
								</Button>
								<Tooltip title="Refresh">
									<Button
										icon={<ReloadOutlined />}
										onClick={() => refetchBeneficiaries()}
									/>
								</Tooltip>
							</Space>
						</Col>
					</Row>

					<Table
						columns={beneficiaryColumns}
						dataSource={filteredBeneficiaries}
						rowKey="id"
						loading={beneficiaryLoading}
						locale={{
							emptyText: (
								<Empty
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									description="No disbursements recorded yet."
								/>
							)
						}}
						pagination={{
							current: beneficiaryPage,
							pageSize: PAGE_SIZE,
							total: beneficiaryPaginator?.total,
							showSizeChanger: false,
							showTotal: (total) =>
								`${total} beneficiar${total === 1 ? "y" : "ies"} have received disbursement`,
							onChange: (page) => setBeneficiaryPage(page)
						}}
						scroll={{ x: 800 }}
					/>
				</div>
			)
		}
	];

	return (
		<div
			style={{
				padding: "12px 8px",
				backgroundColor: "#f5f5f5",
				minHeight: "100vh"
			}}
			className="app-management-root">
			<style>{`
				@media (max-width: 575px) {
					.app-management-root .ant-tabs-tab {
						font-size: 11px;
						padding: 6px 8px;
					}
					.app-management-root .ant-tabs-tab .ant-space {
						gap: 4px !important;
					}
					.app-management-root .ant-tabs-tab .anticon {
						font-size: 12px;
					}
				}
			`}</style>
			{renderSchemeHeader()}

			<Card bordered={false} bodyStyle={{ padding: "16px 24px" }}>
				<Tabs
					activeKey={activeTab}
					onChange={setActiveTab}
					items={tabItems}
					size="large"
				/>
			</Card>

			{renderAddModal()}
			{renderDisburseModal()}
		</div>
	);
};

export default SchemeApplicationsManagement;
