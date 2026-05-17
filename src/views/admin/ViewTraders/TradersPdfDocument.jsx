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
	filters: {
		fontSize: 8.5,
		color: "#374151"
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

const formatValue = (value) => {
	if (value === null || value === undefined || value === "") {
		return "N/A";
	}
	return String(value);
};

const calculateAge = (dob) => {
	if (!dob) return "N/A";
	return `${moment().diff(moment(dob), "years")} yrs`;
};

const formatFilters = ({
	searchText,
	genderFilter,
	tradeFilterName,
	locationFilter,
	dateRangeLabel
}) => {
	const activeFilters = [];

	if (searchText) activeFilters.push(`Search: ${searchText}`);
	if (genderFilter) activeFilters.push(`Gender: ${genderFilter}`);
	if (tradeFilterName) activeFilters.push(`Trade: ${tradeFilterName}`);
	if (locationFilter) activeFilters.push(`Location: ${locationFilter}`);
	if (dateRangeLabel) activeFilters.push(`Registered: ${dateRangeLabel}`);

	return activeFilters.length > 0 ? activeFilters.join(" | ") : "All traders";
};

const TradersPdfDocument = ({
	traders = [],
	filters = {},
	exportedAt,
	part
}) => {
	const totalWithPhotos = traders.filter(
		(trader) => trader?._photoDataUrl
	).length;
	const totalWithBank = traders.filter((trader) => trader?.bank_details).length;

	return (
		<Document title="CTSH Kano Traders">
			<Page size="A4" style={styles.page} wrap>
				<View style={styles.header}>
					<Text style={styles.title}>
						{"CTSH Kano Traders"}
						{part ? ` \u2014 Part ${part.current} of ${part.total}` : ""}
					</Text>
					<Text style={styles.subtitle}>
						{"Generated on "}
						{exportedAt || moment().format("MMMM Do YYYY, h:mm a")}
					</Text>
					<Text style={styles.filters}>
						{"Filters: "}
						{formatFilters(filters)}
					</Text>

					<View style={styles.summary}>
						<View style={styles.summaryItem}>
							<Text style={styles.summaryLabel}>Total Traders</Text>
							<Text style={styles.summaryValue}>{traders.length}</Text>
						</View>
						<View style={styles.summaryItem}>
							<Text style={styles.summaryLabel}>With Photos</Text>
							<Text style={styles.summaryValue}>{totalWithPhotos}</Text>
						</View>
						<View style={styles.summaryItem}>
							<Text style={styles.summaryLabel}>With Bank Details</Text>
							<Text style={styles.summaryValue}>{totalWithBank}</Text>
						</View>
					</View>
				</View>

				{traders.length === 0 ? (
					<Text style={styles.emptyState}>
						No traders available for this export.
					</Text>
				) : (
					<View style={styles.grid}>
						{traders.map((trader, index) => (
							<View
								key={trader?.uuid || index}
								style={styles.card}
								wrap={false}>
								<View style={styles.photoContainer}>
									{trader?._photoDataUrl ? (
										<Image style={styles.photo} src={trader._photoDataUrl} />
									) : (
										<Text style={styles.noPhotoText}>No Photo</Text>
									)}
								</View>

								<View style={styles.info}>
									<Text style={styles.name}>
										{formatValue(
											`${trader?.surname || ""} ${trader?.other_names || ""}`.trim()
										)}
									</Text>
									<Text style={styles.idTag}>
										{"CTSH ID: "}
										{formatValue(trader?.ctsh_id)}
									</Text>
									<Text style={styles.infoLine}>
										<Text style={styles.label}>{"Phone: "}</Text>
										{formatValue(trader?.phone)}
									</Text>
									<Text style={styles.infoLine}>
										<Text style={styles.label}>{"Gender/Age: "}</Text>
										{formatValue(trader?.gender)}
										{" / "}
										{calculateAge(trader?.dob)}
									</Text>
									<Text style={styles.infoLine}>
										<Text style={styles.label}>{"Trade: "}</Text>
										{formatValue(trader?.trade?.name)}
									</Text>
									<Text style={styles.infoLine}>
										<Text style={styles.label}>{"Location: "}</Text>
										{formatValue(
											trader?.business_location || trader?.location?.title
										)}
									</Text>
									<Text style={styles.infoLine}>
										<Text style={styles.label}>{"Email: "}</Text>
										{formatValue(trader?.email)}
									</Text>
									<Text style={styles.infoLine}>
										<Text style={styles.label}>{"Registered: "}</Text>
										{trader?.created_at
											? moment(trader.created_at).format("DD MMM YYYY")
											: "N/A"}
									</Text>
								</View>
							</View>
						))}
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

export default TradersPdfDocument;
