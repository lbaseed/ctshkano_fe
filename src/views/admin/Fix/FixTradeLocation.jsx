import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useMutation } from "@apollo/client";
import { BULK_UPDATE_TRADE_LOCATION } from "../../../gql/mutations/mutations";
import {
	Card,
	Upload,
	Button,
	Table,
	Select,
	Alert,
	Typography,
	Space,
	Divider,
	message,
	Statistic,
	Row,
	Col,
	Tag
} from "antd";
import {
	UploadOutlined,
	ToolOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	WarningOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const FixTradeLocation = () => {
	const [fileName, setFileName] = useState(null);
	const [headers, setHeaders] = useState([]);
	const [parsedData, setParsedData] = useState([]);
	const [identifierCol, setIdentifierCol] = useState(null);
	const [identifierType, setIdentifierType] = useState("ctsh_id");
	const [locationCol, setLocationCol] = useState(null);
	const [preview, setPreview] = useState([]);
	const [result, setResult] = useState(null);

	const [bulkUpdate, { loading }] = useMutation(BULK_UPDATE_TRADE_LOCATION);

	// Parse uploaded file
	const handleFile = (file) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target.result);
				const workbook = XLSX.read(data, { type: "array" });
				const sheet = workbook.Sheets[workbook.SheetNames[0]];
				const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

				if (rows.length < 2) {
					message.error("File appears empty or has no data rows.");
					return;
				}

				const hdrs = (rows[0] || []).map((h) => String(h ?? "").trim());
				const dataRows = rows
					.slice(1)
					.filter((row) =>
						row.some(
							(cell) => cell !== null && cell !== undefined && cell !== ""
						)
					);

				setHeaders(hdrs);
				setParsedData(dataRows);
				setFileName(file.name);
				setResult(null);

				// Auto-detect columns
				const idxCtshId = hdrs.findIndex((h) => /ctsh.?id/i.test(h));
				const idxPhone = hdrs.findIndex((h) => /phone|mobile/i.test(h));
				const idxLocation = hdrs.findIndex((h) =>
					/trade.?loc|trade_loc|location/i.test(h)
				);

				if (idxCtshId >= 0) {
					setIdentifierCol(idxCtshId);
					setIdentifierType("ctsh_id");
				} else if (idxPhone >= 0) {
					setIdentifierCol(idxPhone);
					setIdentifierType("phone");
				} else {
					setIdentifierCol(null);
				}

				setLocationCol(idxLocation >= 0 ? idxLocation : null);
			} catch {
				message.error("Failed to parse file. Please check the format.");
			}
		};
		reader.readAsArrayBuffer(file);
		return false; // prevent ant-design auto-upload
	};

	// Rebuild preview whenever column selection changes
	useEffect(() => {
		if (identifierCol === null || locationCol === null) {
			setPreview([]);
			return;
		}
		const rows = parsedData.slice(0, 10).map((row, i) => ({
			key: i,
			identifier: String(row[identifierCol] ?? "").trim(),
			trade_location: String(row[locationCol] ?? "")
				.trim()
				.toUpperCase()
		}));
		setPreview(rows);
	}, [identifierCol, locationCol, parsedData]);

	const validRowCount =
		identifierCol !== null && locationCol !== null
			? parsedData.filter(
					(row) =>
						String(row[identifierCol] ?? "").trim() !== "" &&
						String(row[locationCol] ?? "").trim() !== ""
				).length
			: 0;

	const handleSubmit = async () => {
		if (identifierCol === null || locationCol === null) {
			message.error(
				"Please map both the identifier column and trade location column."
			);
			return;
		}

		const updates = parsedData
			.map((row) => ({
				identifier: String(row[identifierCol] ?? "").trim(),
				trade_location: String(row[locationCol] ?? "")
					.trim()
					.toUpperCase()
			}))
			.filter((u) => u.identifier !== "" && u.trade_location !== "");

		if (!updates.length) {
			message.error("No valid rows found after filtering empty values.");
			return;
		}

		try {
			const { data } = await bulkUpdate({
				variables: { updates, identifier_type: identifierType }
			});
			setResult(data.bulkUpdateTradeLocation);
		} catch (err) {
			message.error(
				err.message || "Update failed. Check the console for details."
			);
		}
	};

	const resetForm = () => {
		setFileName(null);
		setHeaders([]);
		setParsedData([]);
		setIdentifierCol(null);
		setLocationCol(null);
		setPreview([]);
		setResult(null);
	};

	return (
		<div style={{ padding: 24 }}>
			{/* Header */}
			<Card bodyStyle={{ padding: "12px 16px" }} style={{ marginBottom: 16 }}>
				<Space>
					<ToolOutlined style={{ color: "#fa8c16", fontSize: 20 }} />
					<Title level={4} style={{ margin: 0 }}>
						Fix: Bulk Update Trade Location
					</Title>
					<Tag color="orange">Temporary Tool</Tag>
				</Space>
			</Card>

			<Alert
				type="warning"
				showIcon
				icon={<WarningOutlined />}
				message="This is a temporary fix tool intended to be removed after use."
				description="Upload an Excel or CSV file that contains a trader identifier (CTSH ID or phone number) and the corresponding trade location value. The tool will update each matched trader's trade_location field in bulk."
				style={{ marginBottom: 16 }}
			/>

			{/* Step 1 — File upload */}
			<Card title="Step 1 — Upload File" style={{ marginBottom: 16 }}>
				<Dragger
					beforeUpload={handleFile}
					accept=".xlsx,.xls,.csv"
					maxCount={1}
					showUploadList={false}>
					<p className="ant-upload-drag-icon">
						<UploadOutlined style={{ fontSize: 32, color: "#1890ff" }} />
					</p>
					<p className="ant-upload-text">
						Click or drag an Excel / CSV file here
					</p>
					<p className="ant-upload-hint">
						Supported formats: .xlsx, .xls, .csv
					</p>
				</Dragger>

				{fileName && (
					<div className="mt-3 flex items-center gap-2">
						<CheckCircleOutlined style={{ color: "#52c41a" }} />
						<Text strong>{fileName}</Text>
						<Text type="secondary">
							— {parsedData.length} data rows, {headers.length} columns
						</Text>
						<Button size="small" onClick={resetForm} danger>
							Clear
						</Button>
					</div>
				)}
			</Card>

			{/* Step 2 — Column mapping */}
			{headers.length > 0 && (
				<Card title="Step 2 — Map Columns" style={{ marginBottom: 16 }}>
					<Row gutter={16}>
						<Col xs={24} sm={8}>
							<div className="mb-1">
								<Text strong>Identifier Column</Text>
							</div>
							<Select
								style={{ width: "100%" }}
								value={identifierCol}
								onChange={setIdentifierCol}
								placeholder="Select column">
								{headers.map((h, i) => (
									<Option key={i} value={i}>
										{h || `Column ${i + 1}`}
									</Option>
								))}
							</Select>
						</Col>
						<Col xs={24} sm={8}>
							<div className="mb-1">
								<Text strong>Identifier Type</Text>
							</div>
							<Select
								style={{ width: "100%" }}
								value={identifierType}
								onChange={setIdentifierType}>
								<Option value="ctsh_id">CTSH ID</Option>
								<Option value="phone">Phone Number</Option>
							</Select>
						</Col>
						<Col xs={24} sm={8}>
							<div className="mb-1">
								<Text strong>Trade Location Column</Text>
							</div>
							<Select
								style={{ width: "100%" }}
								value={locationCol}
								onChange={setLocationCol}
								placeholder="Select column">
								{headers.map((h, i) => (
									<Option key={i} value={i}>
										{h || `Column ${i + 1}`}
									</Option>
								))}
							</Select>
						</Col>
					</Row>
				</Card>
			)}

			{/* Step 3 — Preview & run */}
			{preview.length > 0 && (
				<Card title="Step 3 — Preview & Run" style={{ marginBottom: 16 }}>
					<Text type="secondary" className="block mb-3">
						Showing first {preview.length} of{" "}
						<Text strong>{parsedData.length}</Text> rows.{" "}
						<Text strong style={{ color: "#52c41a" }}>
							{validRowCount}
						</Text>{" "}
						valid rows will be submitted.
					</Text>

					<Table
						dataSource={preview}
						size="small"
						pagination={false}
						bordered
						columns={[
							{
								title: "#",
								render: (_, __, i) => i + 1,
								width: 50
							},
							{
								title:
									identifierType === "ctsh_id" ? "CTSH ID" : "Phone Number",
								dataIndex: "identifier",
								render: (v) => <Text code>{v}</Text>
							},
							{
								title: "Trade Location",
								dataIndex: "trade_location",
								render: (v) =>
									v ? (
										<Tag color="cyan">{v}</Tag>
									) : (
										<Text type="secondary">—</Text>
									)
							}
						]}
					/>

					<Divider />

					<div className="text-right">
						<Button
							type="primary"
							size="large"
							danger
							loading={loading}
							disabled={validRowCount === 0}
							onClick={handleSubmit}>
							{loading
								? "Updating..."
								: `Run Update (${validRowCount} records)`}
						</Button>
					</div>
				</Card>
			)}

			{/* Result */}
			{result && (
				<Card
					title={
						<Space>
							{result.success ? (
								<CheckCircleOutlined style={{ color: "#52c41a" }} />
							) : (
								<CloseCircleOutlined style={{ color: "#ff4d4f" }} />
							)}
							<span>Result</span>
						</Space>
					}
					style={{ marginBottom: 16 }}>
					<Alert
						type={result.success ? "success" : "warning"}
						message={result.message}
						showIcon
						style={{ marginBottom: 16 }}
					/>

					<Row gutter={16} className="mb-4">
						<Col xs={12} sm={6}>
							<Statistic
								title="Total Processed"
								value={result.total_processed}
							/>
						</Col>
						<Col xs={12} sm={6}>
							<Statistic
								title="Updated"
								value={result.success_count}
								valueStyle={{ color: "#3f8600" }}
							/>
						</Col>
						<Col xs={12} sm={6}>
							<Statistic
								title="Not Found"
								value={result.not_found_count}
								valueStyle={{ color: "#cf1322" }}
							/>
						</Col>
						<Col xs={12} sm={6}>
							<Statistic
								title="Failed"
								value={result.failed_count}
								valueStyle={{ color: "#faad14" }}
							/>
						</Col>
					</Row>

					{result.errors.length > 0 && (
						<Alert
							type="error"
							showIcon
							message={`${result.errors.length} error${result.errors.length > 1 ? "s" : ""}`}
							description={
								<ul className="list-disc pl-4 mt-1 max-h-48 overflow-y-auto">
									{result.errors.slice(0, 50).map((e, i) => (
										<li key={i} className="text-sm">
											{e}
										</li>
									))}
									{result.errors.length > 50 && (
										<li className="text-sm text-gray-500">
											…and {result.errors.length - 50} more
										</li>
									)}
								</ul>
							}
						/>
					)}

					<div className="mt-4">
						<Button onClick={resetForm}>Upload Another File</Button>
					</div>
				</Card>
			)}
		</div>
	);
};

export default FixTradeLocation;
