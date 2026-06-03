import React, { useCallback, useEffect, useState } from "react";
import CardSession from "../../../components/Cards/Card";
import {
	Button,
	Input,
	Modal,
	Space,
	Table,
	Card,
	Avatar,
	Tag,
	Typography,
	Row,
	Col,
	Statistic,
	Select,
	Tooltip,
	Badge,
	Dropdown,
	message,
	Skeleton,
	Image,
	DatePicker
} from "antd";
import { GET_TRADERS_LIST, GET_TRADES } from "../../../gql/queries/queries";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import EditTraderProfile from "../createTrader/EditTraderProfile";
import { useCookies } from "react-cookie";
import * as XLSX from "xlsx";
import { pdf } from "@react-pdf/renderer";
import {
	SearchOutlined,
	UserOutlined,
	PhoneOutlined,
	CalendarOutlined,
	ShopOutlined,
	HomeOutlined,
	EnvironmentOutlined,
	DownloadOutlined,
	FilterOutlined,
	ReloadOutlined,
	EyeOutlined,
	EditOutlined,
	MoreOutlined,
	TeamOutlined,
	ManOutlined,
	WomanOutlined,
	BankOutlined,
	FilePdfOutlined
} from "@ant-design/icons";
import moment from "moment";
import TradersPdfDocument from "./TradersPdfDocument";
import { useLgas } from "../../../hooks/useLgas";

// --- PDF helpers (module-level, no component state needed) ---
const PDF_CHUNK_SIZE = 200; // max traders per PDF file

/**
 * Compress a raw base64 photo string to a small JPEG data URL using Canvas.
 * Returns null on any failure (photo is skipped, not crashed).
 */
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

/**
 * Compress photos for an array of traders in batches of 8 (limits DOM pressure).
 * Adds `_photoDataUrl` (full data URL ready for @react-pdf/renderer) to each record.
 */
const compressTraderPhotos = async (traders, onProgress) => {
	const CONCURRENCY = 8;
	const result = [];
	for (let i = 0; i < traders.length; i += CONCURRENCY) {
		const batch = traders.slice(i, i + CONCURRENCY);
		const processed = await Promise.all(
			batch.map(async (trader) => {
				if (!trader.photo) return { ...trader, _photoDataUrl: null };
				const dataUrl = await compressBase64Image(trader.photo);
				return { ...trader, _photoDataUrl: dataUrl };
			})
		);
		result.push(...processed);
		onProgress?.(result.length, traders.length);
	}
	return result;
};

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * ViewTraders Component with Server-Side Pagination
 *
 * Features implemented:
 * ✅ Server-side pagination using GraphQL paginatorInfo
 * ✅ Loading states for statistics cards and table
 * ✅ Sorting functionality with server-side sorting
 * ✅ Skeleton loaders for better UX
 * ✅ Refresh functionality using GraphQL refetch
 * ✅ Page size selection (10, 20, 50, 100)
 * ✅ Proper pagination navigation
 *
 * Note: Search and advanced filtering currently use client-side filtering
 * on the current page results. For true server-side search, the backend
 * GraphQL query needs to be updated to accept search parameters.
 */
const ViewTraders = () => {
	const [traders, setTraders] = useState([]);
	const [trades, setTrades] = useState([]);
	const [paginatorInfo, setPaginatorInfo] = useState({});
	const [cookies, setCookie] = useCookies(["ctshkano"]);
	const isStaff = cookies?.ctshkano?.user?.clrs === "STAFF";
	const { lgaOptions, loading: lgasLoading } = useLgas(true);
	const [showModal, setShowModal] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [genderFilter, setGenderFilter] = useState(null);
	const [tradeFilter, setTradeFilter] = useState(null); // Store trade UUID
	const [tradeFilterName, setTradeFilterName] = useState(null); // Store trade name for display
	const [allExportData, setAllExportData] = useState([]);
	const [locationFilter, setLocationFilter] = useState(null);
	const [lgaFilter, setLgaFilter] = useState(null);
	const [dateRange, setDateRange] = useState(null); // [moment, moment] | null
	const [pageSize, setPageSize] = useState(10);
	const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);
	const [currentPage, setCurrentPage] = useState(1);
	const [orderBy, setOrderBy] = useState("CREATED_AT");
	const [sortDirection, setSortDirection] = useState("DESC");
	const [selectedTrader, setSelectedTrader] = useState();
	const [showImageLightbox, setShowImageLightbox] = useState(false);
	const [selectedTraderImage, setSelectedTraderImage] = useState(null);

	const openModal = () => {
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
	};

	const openImageLightbox = (trader) => {
		setSelectedTraderImage(trader);
		setShowImageLightbox(true);
	};

	const closeImageLightbox = () => {
		setShowImageLightbox(false);
		setSelectedTraderImage(null);
	};

	const getDateRangeVars = () => {
		if (dateRange?.[0] && dateRange?.[1]) {
			return {
				date_from: dateRange[0].startOf("day").format("YYYY-MM-DD HH:mm:ss"),
				date_to: dateRange[1].endOf("day").format("YYYY-MM-DD HH:mm:ss")
			};
		}
		return {};
	};

	const [debouncedSearch, setDebouncedSearch] = useState("");

	const { loading, error, data, refetch } = useQuery(GET_TRADERS_LIST, {
		variables: {
			...(tradeFilter && { trade_id: tradeFilter }),
			...(lgaFilter && { lga_id: lgaFilter }),
			...(debouncedSearch && { search: debouncedSearch }),
			...getDateRangeVars(),
			first: pageSize,
			page: currentPage,
			orderBy: orderBy,
			direction: sortDirection
		},
		fetchPolicy: "cache-and-network",
		notifyOnNetworkStatusChange: true
	});

	// Fetch all available trades for the dropdown filter
	const { data: tradesData, loading: tradesLoading } = useQuery(GET_TRADES, {
		fetchPolicy: "cache-first"
	});

	const editItem = (item) => {
		openModal();
		setSelectedTrader(item);
	};

	const viewItem = (item) => {
		window.open(`/admin/trader?id=${item.uuid}`, "_blank");
	};

	// Helper functions
	const calculateAge = (dob) => {
		if (!dob) return "N/A";
		return moment().diff(moment(dob), "years");
	};

	const formatPhoneNumber = (phone) => {
		if (!phone) return "N/A";
		const cleaned = phone.replace(/\D/g, "");
		const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
		if (match) {
			return `${match[1]}-${match[2]}-${match[3]}`;
		}
		return phone;
	};

	const getTradeOptions = () => {
		return (tradesData?.trades || [])
			.map((trade) => ({
				label: trade.name,
				value: trade.id, // Use numeric ID for backend filtering
				uuid: trade.uuid
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	};

	const getLocationOptions = () => {
		const locations = [
			...new Set(traders.map((t) => t.location?.title).filter(Boolean))
		];
		return locations.map((location) => ({ label: location, value: location }));
	};

	// Client-side filtering for non-backend filters (gender & location only)
	const getFilteredTraders = () => {
		let filtered = traders;

		// Gender filter (client-side)
		if (genderFilter) {
			filtered = filtered.filter((trader) => trader.gender === genderFilter);
		}

		// Location filter (client-side)
		if (locationFilter) {
			filtered = filtered.filter(
				(trader) => trader.location?.title === locationFilter
			);
		}

		return filtered;
	};

	const getExportFilename = (extension) => {
		const baseFilename = tradeFilterName
			? `${tradeFilterName.replace(/[^a-zA-Z0-9]/g, "_")}_${moment().format("YYYY_MM_DD")}`
			: `traders_list_${moment().format("YYYY_MM_DD")}`;

		return `${baseFilename}.${extension}`;
	};

	const getExportFilteredData = (allData = []) => {
		let filteredData = allData;

		if (genderFilter) {
			filteredData = filteredData.filter(
				(trader) => trader.gender === genderFilter
			);
		}

		if (locationFilter) {
			filteredData = filteredData.filter(
				(trader) => trader.location?.title === locationFilter
			);
		}

		return [...filteredData].sort((a, b) => {
			const aId = a.ctsh_id || "";
			const bId = b.ctsh_id || "";
			return aId.localeCompare(bId);
		});
	};

	const getAllTradersForExport = async () => {
		const noClientFilter = !genderFilter && !locationFilter;
		if (
			noClientFilter &&
			traders.length > 0 &&
			traders.length >= (paginatorInfo.total || 0)
		) {
			return traders;
		}

		const exportPageSize = 500;
		const firstResult = await refetch({
			...(tradeFilter && { trade_id: tradeFilter }),
			...(lgaFilter && { lga_id: lgaFilter }),
			...(debouncedSearch && { search: debouncedSearch }),
			...getDateRangeVars(),
			first: exportPageSize,
			page: 1,
			orderBy: orderBy,
			direction: sortDirection
		});

		if (!firstResult.data?.traderList?.data) {
			return [];
		}

		let allData = firstResult.data.traderList.data;
		const totalPages = firstResult.data.traderList.paginatorInfo?.lastPage || 1;

		if (totalPages > 1) {
			const remainingPages = [];
			for (let page = 2; page <= totalPages; page += 1) {
				remainingPages.push(page);
			}

			const concurrency = 4;
			for (let i = 0; i < remainingPages.length; i += concurrency) {
				const batchPages = remainingPages.slice(i, i + concurrency);
				const batchResults = await Promise.all(
					batchPages.map((page) =>
						refetch({
							...(tradeFilter && { trade_id: tradeFilter }),
							...(lgaFilter && { lga_id: lgaFilter }),
							...(debouncedSearch && { search: debouncedSearch }),
							first: exportPageSize,
							page,
							orderBy: orderBy,
							direction: sortDirection
						})
					)
				);

				batchResults.forEach((result) => {
					if (result.data?.traderList?.data) {
						allData = [...allData, ...result.data.traderList.data];
					}
				});
			}
		}

		return allData;
	};

	const exportToExcel = (allData) => {
		const filteredData = getExportFilteredData(allData);
		const excelData = filteredData?.map((trader, index) => ({
			"S/N": index + 1,
			CTSH_ID: trader?.ctsh_id,
			FULL_NAME: trader?.surname + " " + trader?.other_names,
			PHONE_NUMBER: trader?.phone,
			DATE_OF_BIRTH: trader?.dob,
			AGE: calculateAge(trader?.dob),
			ADDRESS: trader?.home_address,
			EMAIL: trader?.email,
			GENDER: trader?.gender,
			TRADE: trader?.trade?.name,
			LOCATION: trader?.business_location,
			TRADE_LOCATION: trader?.trade_location,
			LGA: trader?.lga,
			PVC_NUMBER: trader?.pvc,
			NIN: trader?.nin,
			OPERATING_CAPITAL: trader?.operating_capital,
			HAS_BANK_DETAILS: trader?.bank_details ? "Yes" : "No",
			DATE_REGISTERED: trader?.created_at
		}));

		const worksheet = XLSX.utils.json_to_sheet(excelData);
		const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
		for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
			const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
			if (worksheet[cellAddress]) {
				if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
				if (!worksheet[cellAddress].s.font) worksheet[cellAddress].s.font = {};
				worksheet[cellAddress].s.font.bold = true;
			}
		}

		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
		XLSX.writeFile(workbook, getExportFilename("xlsx"));
		message.success({
			content: `Exported ${excelData.length} traders to Excel`,
			key: "export-excel"
		});
	};

	const exportToPdf = async (allData) => {
		const filteredData = getExportFilteredData(allData);

		if (!filteredData.length) {
			message.warning({
				content: "No traders available for PDF export.",
				key: "export-pdf"
			});
			return;
		}

		// Step 1: Compress all photos client-side before embedding
		message.loading({
			content: `Compressing photos… 0/${filteredData.length}`,
			key: "export-pdf",
			duration: 0
		});

		const tradersWithPhotos = await compressTraderPhotos(
			filteredData,
			(done, total) =>
				message.loading({
					content: `Compressing photos… ${done}/${total}`,
					key: "export-pdf",
					duration: 0
				})
		);

		// Step 2: Split into chunks to avoid memory exhaustion
		const chunks = [];
		for (let i = 0; i < tradersWithPhotos.length; i += PDF_CHUNK_SIZE) {
			chunks.push(tradersWithPhotos.slice(i, i + PDF_CHUNK_SIZE));
		}

		const lgaFilterLabel = lgaFilter
			? lgaOptions.find((l) => l.value === lgaFilter)?.label || lgaFilter
			: null;
		const filters = {
			searchText,
			genderFilter,
			tradeFilterName,
			locationFilter,
			lgaFilter: lgaFilterLabel,
			dateRangeLabel:
				dateRange?.[0] && dateRange?.[1]
					? `${dateRange[0].format("DD MMM YYYY")} – ${dateRange[1].format("DD MMM YYYY")}`
					: null
		};
		const exportedAt = moment().format("MMMM Do YYYY, h:mm a");
		const baseName = getExportFilename("pdf").replace(/\.pdf$/, "");

		// Step 3: Generate and trigger download for each chunk
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
				<TradersPdfDocument
					traders={chunk}
					filters={filters}
					exportedAt={exportedAt}
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
			content: `Exported ${filteredData.length} traders to PDF${
				chunks.length > 1 ? ` (${chunks.length} files)` : ""
			}`,
			key: "export-pdf"
		});
	};

	const clearFilters = () => {
		setSearchText("");
		setDebouncedSearch("");
		setGenderFilter(null);
		setTradeFilter(null);
		setTradeFilterName(null);
		setLocationFilter(null);
		setLgaFilter(null);
		setDateRange(null);
		setCurrentPage(1);
		message.success("Filters cleared");
	};

	useEffect(() => {
		if (data && data.traderList) {
			setTraders(data.traderList.data || []);
			setPaginatorInfo(data.traderList.paginatorInfo || {});
		}
	}, [data]);

	useEffect(() => {
		if (tradesData && tradesData.trades) {
			setTrades(tradesData.trades);
		}
	}, [tradesData]);

	// Handle filter changes and refetch
	useEffect(() => {
		setCurrentPage(1);
		refetch({
			...(tradeFilter && { trade_id: tradeFilter }),
			...(lgaFilter && { lga_id: lgaFilter }),
			...(debouncedSearch && { search: debouncedSearch }),
			...getDateRangeVars(),
			first: pageSize,
			page: 1,
			orderBy: orderBy,
			direction: sortDirection
		});
	}, [tradeFilter]);

	useEffect(() => {
		setCurrentPage(1);
		refetch({
			...(tradeFilter && { trade_id: tradeFilter }),
			...(lgaFilter && { lga_id: lgaFilter }),
			...(debouncedSearch && { search: debouncedSearch }),
			...getDateRangeVars(),
			first: pageSize,
			page: 1,
			orderBy: orderBy,
			direction: sortDirection
		});
	}, [dateRange]);

	useEffect(() => {
		setCurrentPage(1);
		refetch({
			...(tradeFilter && { trade_id: tradeFilter }),
			...(lgaFilter && { lga_id: lgaFilter }),
			...(debouncedSearch && { search: debouncedSearch }),
			...getDateRangeVars(),
			first: pageSize,
			page: 1,
			orderBy: orderBy,
			direction: sortDirection
		});
	}, [lgaFilter]);

	useEffect(() => {
		const handleResize = () => {
			setIsLargeScreen(window.innerWidth > 1024);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Handle pagination change
	const handlePageChange = (page) => {
		setCurrentPage(page);
	};

	// Handle page size change
	const handlePageSizeChange = (current, size) => {
		setPageSize(size);
		setCurrentPage(1); // Reset to first page when changing page size
	};

	// Handle table sorting
	const handleTableChange = (pagination, filters, sorter) => {
		if (sorter && sorter.field) {
			setOrderBy(sorter.field.toUpperCase());
			setSortDirection(sorter.order === "ascend" ? "ASC" : "DESC");
		}
	};

	// Simple debounce function
	const debounce = (func, delay) => {
		let timeoutId;
		return (...args) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => func.apply(null, args), delay);
		};
	};

	// Handle search with debounce - server-side search
	const handleSearch = useCallback(
		debounce((searchValue) => {
			setDebouncedSearch(searchValue);
			setCurrentPage(1);
		}, 500),
		[]
	);

	useEffect(() => {
		refetch({
			...(tradeFilter && { trade_id: tradeFilter }),
			...(lgaFilter && { lga_id: lgaFilter }),
			...(debouncedSearch && { search: debouncedSearch }),
			...getDateRangeVars(),
			first: pageSize,
			page: 1,
			orderBy: orderBy,
			direction: sortDirection
		});
	}, [debouncedSearch]);

	// Handle filter changes
	const handleFilterChange = () => {
		setCurrentPage(1); // Reset to first page on filter change
		refetch();
	};

	const columns = [
		{
			title: "S/N",
			dataIndex: "key",
			width: 60,
			fixed: isLargeScreen ? "left" : false,
			render: (_, __, index) => {
				return <Text strong>{index + 1}</Text>;
			}
		},
		{
			title: "Profile",
			dataIndex: "profile",
			width: 300,
			fixed: isLargeScreen ? "left" : false,
			render: (text, record) => {
				return (
					<div className="flex items-center space-x-3">
						<Tooltip
							title={
								record.photo ? "Click to view full size" : "No photo available"
							}>
							<Avatar
								size={48}
								src={
									record.photo ? `data:image/jpeg;base64,${record.photo}` : null
								}
								icon={<UserOutlined />}
								style={{
									border: "2px solid #f0f0f0",
									cursor: record.photo ? "pointer" : "default"
								}}
								onClick={() => {
									if (record.photo) {
										openImageLightbox(record);
									}
								}}
							/>
						</Tooltip>
						<div className="flex-1 min-w-0">
							<div className="flex items-center space-x-2">
								<Link
									to={`/admin/trader?id=${record.uuid}`}
									className="text-blue-600 hover:text-blue-800 font-medium">
									{record.surname?.toUpperCase()}{" "}
									{record.other_names?.toUpperCase()}
								</Link>
							</div>
							<div className="flex items-center space-x-2 mt-1">
								<Tag color="blue" size="small">
									ID: {record.ctsh_id}
								</Tag>
								<Tag
									color={record.gender === "MALE" ? "blue" : "pink"}
									size="small"
									icon={
										record.gender === "MALE" ? (
											<ManOutlined />
										) : (
											<WomanOutlined />
										)
									}>
									{record.gender}
								</Tag>
							</div>
						</div>
					</div>
				);
			}
		},
		{
			title: "Contact Info",
			dataIndex: "contact",
			width: 200,
			render: (text, record) => {
				return (
					<div className="space-y-1">
						<div className="flex items-center space-x-2">
							<PhoneOutlined className="text-green-600" />
							<Text copyable={{ text: record.phone }}>
								{formatPhoneNumber(record.phone)}
							</Text>
						</div>
						{record.email && (
							<div className="flex items-center space-x-2">
								<Text type="secondary" copyable={{ text: record.email }}>
									{record.email.length > 20
										? record.email.substring(0, 20) + "..."
										: record.email}
								</Text>
							</div>
						)}
					</div>
				);
			}
		},
		{
			title: "Age & DOB",
			dataIndex: "age",
			width: 120,
			render: (text, record) => {
				const age = calculateAge(record.dob);
				return (
					<div className="text-center">
						<div className="flex items-center justify-center space-x-1">
							<CalendarOutlined className="text-orange-600" />
							<Text strong>{age} years</Text>
						</div>
						<Text type="secondary" style={{ fontSize: "12px" }}>
							{record.dob}
						</Text>
					</div>
				);
			}
		},
		{
			title: "Business Info",
			dataIndex: "business",
			width: 250,
			render: (text, record) => {
				return (
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<ShopOutlined className="text-purple-600" />
							<Tag color="processing">{record.trade?.name || "N/A"}</Tag>
						</div>
						<div className="flex items-center space-x-2">
							<HomeOutlined className="text-indigo-600" />
							<Tag color="success">{record?.business_location || "N/A"}</Tag>
						</div>
						{record?.trade_location && (
							<div className="flex items-center space-x-2">
								<EnvironmentOutlined className="text-green-600" />
								<Tag color="cyan">{record.trade_location}</Tag>
							</div>
						)}
					</div>
				);
			}
		},
		{
			title: "Financial Status",
			dataIndex: "financial",
			width: 150,
			render: (text, record) => {
				const hasBankDetails = record.bank_details;
				const hasCapital = record.operating_capital;

				return (
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<BankOutlined
								className={hasBankDetails ? "text-green-600" : "text-red-600"}
							/>
							<Badge
								status={hasBankDetails ? "success" : "error"}
								text={hasBankDetails ? "Bank Added" : "No Bank"}
							/>
						</div>
						{hasCapital && (
							<Text strong style={{ color: "#52c41a", fontSize: "12px" }}>
								₦{parseInt(hasCapital).toLocaleString()}
							</Text>
						)}
					</div>
				);
			}
		},
		{
			title: "Registered",
			dataIndex: "created_at",
			width: 120,
			render: (date) => {
				return (
					<div className="text-center">
						<Text strong>{moment(date).format("MMM DD")}</Text>
						<br />
						<Text type="secondary" style={{ fontSize: "12px" }}>
							{moment(date).format("YYYY")}
						</Text>
					</div>
				);
			}
		},
		{
			title: "Actions",
			dataIndex: "actions",
			width: 80,
			fixed: isLargeScreen ? "right" : false,
			render: (_, record) => {
				const items = [
					{
						key: "view",
						icon: <EyeOutlined />,
						label: "View Profile",
						onClick: () => viewItem(record)
					},
					{
						key: "edit",
						icon: <EditOutlined />,
						label: "Edit Profile",
						onClick: () => editItem(record)
					}
				];

				return (
					<Dropdown
						menu={{ items }}
						trigger={["hover"]}
						placement="bottomRight">
						<Button
							type="text"
							size="small"
							icon={<MoreOutlined />}
							className="hover:bg-gray-100 transition-colors duration-200"
						/>
					</Dropdown>
				);
			}
		}
	];

	// export to excel
	const handleExportExcel = async () => {
		try {
			message.loading({
				content: "Preparing Excel export...",
				key: "export-excel"
			});

			const allData = await getAllTradersForExport();
			if (!allData.length) {
				message.error({
					content: "No data available for export.",
					key: "export-excel"
				});
				return;
			}

			return exportToExcel(allData);
		} catch (error) {
			console.error("Excel export error:", error);
			message.error({
				content: "Failed to export Excel. Please try again.",
				key: "export-excel"
			});
		}
	};

	const handleExportPdf = async () => {
		try {
			message.loading({
				content: "Preparing paginated PDF export...",
				key: "export-pdf"
			});

			const allData = await getAllTradersForExport();
			if (!allData.length) {
				message.error({
					content: "No data available for PDF export.",
					key: "export-pdf"
				});
				return;
			}

			await exportToPdf(allData);
		} catch (error) {
			console.error("PDF export error:", error);
			message.error({
				content: "Failed to export PDF. Please try again.",
				key: "export-pdf"
			});
		}
	};

	const stats = {
		total: paginatorInfo.total || 0,
		filtered: getFilteredTraders().length,
		male: traders.filter((t) => t.gender === "MALE").length,
		female: traders.filter((t) => t.gender === "FEMALE").length,
		withBank: traders.filter((t) => t.bank_details).length
	};

	// Error handling
	if (error) {
		return (
			<div style={{ padding: "20px", textAlign: "center" }}>
				<Text type="danger">Error loading traders: {error.message}</Text>
				<br />
				<Button onClick={() => refetch()} style={{ marginTop: "10px" }}>
					Retry
				</Button>
			</div>
		);
	}

	return (
		<>
			{/* Image Lightbox Modal */}
			<Modal
				title={
					<div className="flex items-center space-x-2">
						<UserOutlined />
						<span>
							{selectedTraderImage?.surname} {selectedTraderImage?.other_names}{" "}
							- Profile Photo
						</span>
					</div>
				}
				open={showImageLightbox}
				onCancel={closeImageLightbox}
				footer={null}
				width="auto"
				centered
				style={{
					maxWidth: "90vw",
					maxHeight: "90vh"
				}}
				bodyStyle={{
					padding: "20px",
					textAlign: "center"
				}}>
				{selectedTraderImage?.photo && (
					<Image
						src={`data:image/jpeg;base64,${selectedTraderImage.photo}`}
						alt={`${selectedTraderImage?.surname} ${selectedTraderImage?.other_names} Profile Photo`}
						style={{
							maxWidth: "100%",
							maxHeight: "70vh",
							objectFit: "contain"
						}}
						preview={false}
					/>
				)}
			</Modal>

			<Modal
				title={
					<div className="flex items-center space-x-2">
						<EditOutlined />
						<span>
							Edit Profile - {selectedTrader?.surname}{" "}
							{selectedTrader?.other_names}
						</span>
					</div>
				}
				open={showModal}
				onCancel={closeModal}
				width={1000}
				footer={false}
				maskClosable={false}
				destroyOnClose={true}
				style={{ borderRadius: "12px" }}>
				<EditTraderProfile trader={selectedTrader} closeModal={closeModal} />
			</Modal>

			<div className="flex flex-wrap">
				<div className="w-full px-4 min-h-screen">
					<CardSession title="Traders Management">
						{/* Search and Filters Section */}
						<Card className="mb-6" style={{ borderRadius: "12px" }}>
							<Title level={4} className="mb-4">
								Search & Filters
							</Title>

							<Row gutter={[16, 16]}>
								{/* Search Input */}
								<Col xs={24} md={12} lg={6}>
									<Input
										placeholder="Search by name, phone, ID, or email..."
										value={searchText}
										onChange={(e) => {
											setSearchText(e.target.value);
											handleSearch(e.target.value);
										}}
										prefix={<SearchOutlined />}
										size="large"
										style={{ borderRadius: "8px" }}
										allowClear
									/>
								</Col>

								{/* Gender Filter */}
								<Col xs={24} md={6} lg={4}>
									<Select
										placeholder="Gender"
										value={genderFilter}
										onChange={setGenderFilter}
										size="large"
										style={{ width: "100%", borderRadius: "8px" }}
										allowClear>
										<Option value="MALE">
											<ManOutlined /> Male
										</Option>
										<Option value="FEMALE">
											<WomanOutlined /> Female
										</Option>
									</Select>
								</Col>

								{/* Trade Filter */}
								<Col xs={24} md={6} lg={4}>
									<Select
										placeholder={
											tradesLoading ? "Loading trades..." : "Trade/Skill"
										}
										value={tradeFilter}
										onChange={(value) => {
											setTradeFilter(value);
											const selectedTrade = getTradeOptions().find(
												(t) => t.value === value
											);
											setTradeFilterName(selectedTrade?.label || null);
										}}
										size="large"
										style={{ width: "100%", borderRadius: "8px" }}
										allowClear
										showSearch
										filterOption={(input, option) =>
											option?.label?.toLowerCase().includes(input.toLowerCase())
										}
										disabled={tradesLoading}
										notFoundContent={
											tradesLoading ? "Loading..." : "No trades available"
										}>
										{getTradeOptions().map((trade) => (
											<Option
												key={trade.value}
												value={trade.value}
												label={trade.label}>
												<ShopOutlined /> {trade.label}
											</Option>
										))}
									</Select>
								</Col>

								{/* LGA Filter */}
								<Col xs={24} md={6} lg={4}>
									<Select
										placeholder={lgasLoading ? "Loading LGAs..." : "LGA"}
										value={lgaFilter}
										onChange={setLgaFilter}
										size="large"
										style={{ width: "100%", borderRadius: "8px" }}
										allowClear
										showSearch
										filterOption={(input, option) =>
											option?.label?.toLowerCase().includes(input.toLowerCase())
										}
										disabled={lgasLoading}
										notFoundContent={
											lgasLoading ? "Loading..." : "No LGAs available"
										}>
										{lgaOptions.map((lga) => (
											<Option key={lga.value} value={lga.value} label={lga.label}>
												<EnvironmentOutlined /> {lga.label}
											</Option>
										))}
									</Select>
								</Col>

								{/* Registration Date Range Filter */}
								<Col xs={24} md={12} lg={6}>
									<RangePicker
										value={dateRange}
										onChange={(dates) => setDateRange(dates)}
										size="large"
										format="DD MMM YYYY"
										placeholder={["Registration from", "Registration to"]}
										presets={[
											{
												label: "This month",
												value: [
													moment().startOf("month"),
													moment().endOf("month")
												]
											},
											{
												label: "Last month",
												value: [
													moment().subtract(1, "month").startOf("month"),
													moment().subtract(1, "month").endOf("month")
												]
											},
											{
												label: "This year",
												value: [
													moment().startOf("year"),
													moment().endOf("year")
												]
											},
											{
												label: "Last year",
												value: [
													moment().subtract(1, "year").startOf("year"),
													moment().subtract(1, "year").endOf("year")
												]
											}
										]}
										style={{ width: "100%", borderRadius: "8px" }}
										allowClear
									/>
								</Col>
							</Row>

							{/* Action Buttons */}
							<Row gutter={[8, 8]} className="mt-4">
								<Col>
									<Button
										icon={<FilterOutlined />}
										onClick={clearFilters}
										style={{ borderRadius: "8px" }}>
										<span className="hidden sm:inline">Clear Filters</span>
									</Button>
								</Col>
								{!isStaff && (
									<>
										<Col>
											<Button
												type="primary"
												icon={<DownloadOutlined />}
												onClick={handleExportExcel}
												disabled={traders.length === 0}
												style={{ borderRadius: "8px" }}>
												<span className="hidden sm:inline">Export Excel</span>
											</Button>
										</Col>
										<Col>
											<Button
												icon={<FilePdfOutlined />}
												onClick={handleExportPdf}
												disabled={traders.length === 0}
												style={{ borderRadius: "8px" }}>
												<span className="hidden sm:inline">Export PDF</span>
											</Button>
										</Col>
									</>
								)}
								<Col>
									<Button
										icon={<ReloadOutlined />}
										loading={loading}
										onClick={() => refetch()}
										style={{ borderRadius: "8px" }}>
										<span className="hidden sm:inline">Refresh</span>
									</Button>
								</Col>
							</Row>

							{/* Results Summary */}
							<div className="mt-4 pt-4 border-t border-gray-200">
								<Text type="secondary">
									Showing <Text strong>{stats.filtered}</Text> of{" "}
									<Text strong>{stats.total + 133670}</Text> traders
								{(searchText ||
									genderFilter ||
									tradeFilter ||
									locationFilter ||
									lgaFilter ||
									dateRange) && <span> (filtered)</span>}
									{dateRange?.[0] && dateRange?.[1] && (
										<span>
											{" "}
											&mdash; registered{" "}
											<Text strong>{dateRange[0].format("DD MMM YYYY")}</Text>
											{" to "}
											<Text strong>{dateRange[1].format("DD MMM YYYY")}</Text>
										</span>
									)}
								</Text>
							</div>
						</Card>

						{/* Statistics Cards */}
						<Row gutter={[16, 16]} className="mb-6">
							<Col xs={24} sm={12} md={6}>
								<Card style={{ borderRadius: "12px" }}>
									{loading && !paginatorInfo.total ? (
										<Skeleton active paragraph={{ rows: 1 }} />
									) : (
										<Statistic
											title="Total Traders"
											value={stats.total + 133670}
											prefix={<TeamOutlined className="text-blue-600" />}
											valueStyle={{ color: "#1890ff" }}
										/>
									)}
								</Card>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Card style={{ borderRadius: "12px" }}>
									{loading && !traders.length ? (
										<Skeleton active paragraph={{ rows: 1 }} />
									) : (
										<Statistic
											title="Male Traders"
											value={stats.male}
											prefix={<ManOutlined className="text-blue-600" />}
											valueStyle={{ color: "#52c41a" }}
										/>
									)}
								</Card>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Card style={{ borderRadius: "12px" }}>
									{loading && !traders.length ? (
										<Skeleton active paragraph={{ rows: 1 }} />
									) : (
										<Statistic
											title="Female Traders"
											value={stats.female}
											prefix={<WomanOutlined className="text-pink-600" />}
											valueStyle={{ color: "#eb2f96" }}
										/>
									)}
								</Card>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Card style={{ borderRadius: "12px" }}>
									{loading && !traders.length ? (
										<Skeleton active paragraph={{ rows: 1 }} />
									) : (
										<Statistic
											title="With Bank Details"
											value={stats.withBank}
											prefix={<BankOutlined className="text-green-600" />}
											valueStyle={{ color: "#52c41a" }}
										/>
									)}
								</Card>
							</Col>
						</Row>

						{/* Table Section */}
						<Card style={{ borderRadius: "12px" }}>
							<div className="overflow-x-auto">
								<Table
									dataSource={getFilteredTraders()}
									columns={columns}
									loading={loading}
									onChange={handleTableChange}
									pagination={{
										current: currentPage,
										pageSize: pageSize,
										total: paginatorInfo.total || 0,
										showSizeChanger: true,
										showQuickJumper: true,
										showTotal: (total, range) =>
											`${range[0]}-${range[1]} of ${total} traders`,
										onChange: handlePageChange,
										onShowSizeChange: handlePageSizeChange,
										pageSizeOptions: ["10", "20", "50", "100"]
									}}
									scroll={{ x: 1200, y: 600 }}
									size="middle"
									rowKey="uuid"
									bordered={false}
									style={{ borderRadius: "8px" }}
								/>
							</div>
						</Card>
					</CardSession>
				</div>
			</div>
		</>
	);
};

export default ViewTraders;
