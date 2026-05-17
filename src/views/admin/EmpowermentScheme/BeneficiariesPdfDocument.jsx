import React from "react";
import {
	Document,
	Page,
	Text,
	View,
	Image,
	StyleSheet
} from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
	page: {
		paddingTop: 24,
		paddingBottom: 32,
		paddingHorizontal: 24,
		fontSize: 9,
		fontFamily: "Helvetica",
		color: "#111827"
	},
	header: {
		marginBottom: 14,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#d1d5db"
	},
	title: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 4
	},
	subtitle: {
		fontSize: 9,
		color: "#4b5563",
		marginBottom: 3
	},
	schemeName: {
		fontSize: 10,
		color: "#1d4ed8",
		marginBottom: 3,
		fontWeight: "bold"
	},
	summary: {
		marginTop: 8,
		flexDirection: "row",
		flexWrap: "wrap"
	},
	summaryItem: {
		marginRight: 16,
		marginBottom: 4
	},
	summaryLabel: {
		fontSize: 8,
		color: "#6b7280"
	},
	summaryValue: {
		fontSize: 10,
		fontWeight: "bold"
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between"
	},
	card: {
		width: "48.5%",
		borderWidth: 1,
		borderColor: "#d1d5db",
		borderRadius: 6,
		padding: 8,
		marginBottom: 10,
		flexDirection: "row"
	},
	photoContainer: {
		width: 76,
		height: 76,
		borderRadius: 4,
		backgroundColor: "#f3f4f6",
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
		marginRight: 8,
		borderWidth: 1,
		borderColor: "#e5e7eb"
	},
	photo: {
		width: "100%",
		height: "100%",
		objectFit: "cover"
	},
	noPhotoText: {
		fontSize: 8,
		color: "#6b7280",
		textAlign: "center",
		paddingHorizontal: 4
	},
	info: {
		flexGrow: 1,
		flexShrink: 1,
		flexBasis: 0
	},
	name: {
		fontSize: 10,
		fontWeight: "bold",
		marginBottom: 4,
		textTransform: "uppercase"
	},
	idTag: {
		fontSize: 8,
		color: "#1d4ed8",
		marginBottom: 4
	},
	infoLine: {
		marginBottom: 2,
		lineHeight: 1.3
	},
	label: {
		fontWeight: "bold"
	},
	statusBadge: {
		marginTop: 4,
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
		alignSelf: "flex-start"
	},
	statusText: {
		fontSize: 8,
		fontWeight: "bold",
		textTransform: "uppercase"
	},
	emptyState: {
		marginTop: 40,
		textAlign: "center",
		fontSize: 11,
		color: "#6b7280"
	},
	footer: {
		position: "absolute",
		bottom: 12,
		left: 24,
		right: 24,
		fontSize: 8,
		color: "#6b7280",
		textAlign: "center"
	}
});

const STATUS_COLORS = {
	pending: "#fa8c16",
	approved: "#52c41a",
	rejected: "#ff4d4f",
	disbursed: "#1890ff",
	completed: "#13c2c2"
};

const formatValue = (value) => {
	if (value === null || value === undefined || value === "") return "N/A";
	return String(value);
};

const getStatusColor = (status) =>
	STATUS_COLORS[status?.toLowerCase()] || "#6b7280";

const BeneficiariesPdfDocument = ({
	applications = [],
	schemeName,
	exportedAt,
	part,
	tradeLocation
}) => {
	const total = applications.length;
	const approved = applications.filter((a) =>
		["approved", "disbursed", "completed"].includes(a.status?.toLowerCase())
	).length;
	const disbursed = applications.filter(
		(a) => a.status?.toLowerCase() === "disbursed"
	).length;
	const pending = applications.filter(
		(a) => a.status?.toLowerCase() === "pending"
	).length;

	return (
		<Document title="List of Empowerment Beneficiaries">
			<Page size="A4" style={styles.page} wrap>
				<View style={styles.header}>
					<Text style={styles.title}>
						{"List of Empowerment Beneficiaries"}
						{part ? ` \u2014 Part ${part.current} of ${part.total}` : ""}
					</Text>
					{schemeName ? (
						<Text style={styles.schemeName}>Scheme: {schemeName}</Text>
					) : null}{" "}
					{tradeLocation ? (
						<Text style={styles.schemeName}>
							Trade Location: {tradeLocation}
						</Text>
					) : null}{" "}
					<Text style={styles.subtitle}>
						{"Generated on "}
						{exportedAt || moment().format("MMMM Do YYYY, h:mm a")}
					</Text>
					<View style={styles.summary}>
						<View style={styles.summaryItem}>
							<Text style={styles.summaryLabel}>Total Beneficiaries</Text>
							<Text style={styles.summaryValue}>{total}</Text>
						</View>
						<View style={styles.summaryItem}>
							<Text style={styles.summaryLabel}>Approved / Disbursed</Text>
							<Text style={styles.summaryValue}>
								{approved} / {disbursed}
							</Text>
						</View>
						<View style={styles.summaryItem}>
							<Text style={styles.summaryLabel}>Pending</Text>
							<Text style={styles.summaryValue}>{pending}</Text>
						</View>
					</View>
				</View>

				{applications.length === 0 ? (
					<Text style={styles.emptyState}>
						No beneficiaries available for this export.
					</Text>
				) : (
					<View style={styles.grid}>
						{applications.map((record, index) => {
							const trader = record.trader || {};
							return (
								<View
									key={record?.id || index}
									style={styles.card}
									wrap={false}>
									<View style={styles.photoContainer}>
										{trader._photoDataUrl ? (
											<Image style={styles.photo} src={trader._photoDataUrl} />
										) : (
											<Text style={styles.noPhotoText}>No Photo</Text>
										)}
									</View>

									<View style={styles.info}>
										<Text style={styles.name}>
											{formatValue(
												`${trader.surname || ""} ${trader.other_names || ""}`.trim()
											)}
										</Text>
										<Text style={styles.idTag}>
											{"CTSH ID: "}
											{formatValue(trader.ctsh_id)}
										</Text>
										<Text style={styles.infoLine}>
											<Text style={styles.label}>{"Phone: "}</Text>
											{formatValue(trader.phone)}
										</Text>
										<Text style={styles.infoLine}>
											<Text style={styles.label}>{"Trade: "}</Text>
											{formatValue(trader.trade?.name)}
										</Text>
										<Text style={styles.infoLine}>
											<Text style={styles.label}>{"Location: "}</Text>
											{formatValue(
												trader.business_location || trader.location?.title
											)}
										</Text>
										{trader.trade_location ? (
											<Text style={styles.infoLine}>
												<Text style={styles.label}>{"Trade Location: "}</Text>
												{formatValue(trader.trade_location)}
											</Text>
										) : null}
										<Text style={styles.infoLine}>
											<Text style={styles.label}>{"Applied: "}</Text>
											{record.application_date
												? moment(record.application_date).format("DD MMM YYYY")
												: "N/A"}
										</Text>
										<View
											style={[
												styles.statusBadge,
												{
													backgroundColor: getStatusColor(record.status) + "20",
													borderWidth: 1,
													borderColor: getStatusColor(record.status)
												}
											]}>
											<Text
												style={[
													styles.statusText,
													{ color: getStatusColor(record.status) }
												]}>
												{record.status?.toUpperCase() || "N/A"}
											</Text>
										</View>
									</View>
								</View>
							);
						})}
					</View>
				)}

				<Text
					style={styles.footer}
					fixed
					render={({ pageNumber, totalPages }) =>
						`Page ${pageNumber} of ${totalPages}`
					}
				/>
			</Page>
		</Document>
	);
};

export default BeneficiariesPdfDocument;
