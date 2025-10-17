import React, { useState, useEffect } from "react";
import { classNames } from "primereact/utils";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Tag } from "primereact/tag";
import { TriStateCheckbox } from "primereact/tristatecheckbox";

const MyDataTable = ({ data }) => {
	const [rows, setRows] = useState();
	const [filters, setFilters] = useState({
		global: { value: null, matchMode: FilterMatchMode.CONTAINS },
		name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
		"country.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
		representative: { value: null, matchMode: FilterMatchMode.IN },
		status: { value: null, matchMode: FilterMatchMode.EQUALS },
		verified: { value: null, matchMode: FilterMatchMode.EQUALS },
	});
	const [loading, setLoading] = useState(true);
	const [globalFilterValue, setGlobalFilterValue] = useState("");
	const [representatives] = useState([
		{ name: "Amy Elsner", image: "amyelsner.png" },
		{ name: "Anna Fali", image: "annafali.png" },
		{ name: "Asiya Javayant", image: "asiyajavayant.png" },
		{ name: "Bernardo Dominic", image: "bernardodominic.png" },
		{ name: "Elwin Sharvill", image: "elwinsharvill.png" },
		{ name: "Ioni Bowcher", image: "ionibowcher.png" },
		{ name: "Ivan Magalhaes", image: "ivanmagalhaes.png" },
		{ name: "Onyama Limba", image: "onyamalimba.png" },
		{ name: "Stephen Shaw", image: "stephenshaw.png" },
		{ name: "XuXue Feng", image: "xuxuefeng.png" },
	]);
	const [statuses] = useState([
		"unqualified",
		"qualified",
		"new",
		"negotiation",
		"renewal",
	]);

	const getSeverity = (status) => {
		switch (status) {
			case "unqualified":
				return "danger";

			case "qualified":
				return "success";

			case "new":
				return "info";

			case "negotiation":
				return "warning";

			case "renewal":
				return null;
		}
	};

	// useEffect(() => {
	// 	CustomerService.getCustomersMedium().then((data) => {
	// 		rows(getCustomers(data));
	// 		setLoading(false);
	// 	});
	// }, []); // eslint-disable-line react-hooks/exhaustive-deps

	// const getCustomers = (data) => {
	// 	return [...(data || [])].map((d) => {
	// 		d.date = new Date(d.date);

	// 		return d;
	// 	});
	// };

	const onGlobalFilterChange = (e) => {
		const value = e.target.value;
		let _filters = { ...filters };

		_filters["global"].value = value;

		setFilters(_filters);
		setGlobalFilterValue(value);
	};

	const renderHeader = () => {
		return (
			<div className="flex justify-content-end">
				<span className="p-input-icon-left">
					<i className="pi pi-search" />
					<InputText
						value={globalFilterValue}
						onChange={onGlobalFilterChange}
						placeholder="Keyword Search"
					/>
				</span>
			</div>
		);
	};

	const titleBodyTemplate = (rowData) => {
		console.log(rowData)
		return (
			<div className="flex align-items-center gap-2">
				{/* <img
					alt="flag"
					src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
					// className={`flag flag-${rowData.country.code}`}
					style={{ width: "24px" }}
				/> */}
				<span>{rowData.title}</span>
			</div>
		);
	};

	// const representativeBodyTemplate = (rowData) => {
	// 	const representative = rowData.representative;

	// 	return (
	// 		<div className="flex align-items-center gap-2">
	// 			<img
	// 				alt={representative.name}
	// 				src={`https://primefaces.org/cdn/primereact/images/avatar/${representative.image}`}
	// 				width="32"
	// 			/>
	// 			<span>{representative.name}</span>
	// 		</div>
	// 	);
	// };

	// const representativesItemTemplate = (option) => {
	// 	return (
	// 		<div className="flex align-items-center gap-2">
	// 			<img
	// 				alt={option.name}
	// 				src={`https://primefaces.org/cdn/primereact/images/avatar/${option.image}`}
	// 				width="32"
	// 			/>
	// 			<span>{option.name}</span>
	// 		</div>
	// 	);
	// };

	// const statusBodyTemplate = (rowData) => {
	// 	return (
	// 		<Tag value={rowData.status} severity={getSeverity(rowData.status)} />
	// 	);
	// };

	// const statusItemTemplate = (option) => {
	// 	return <Tag value={option} severity={getSeverity(option)} />;
	// };

	// const verifiedBodyTemplate = (rowData) => {
	// 	return (
	// 		<i
	// 			className={classNames("pi", {
	// 				"true-icon pi-check-circle": rowData.verified,
	// 				"false-icon pi-times-circle": !rowData.verified,
	// 			})}></i>
	// 	);
	// };



	// const statusRowFilterTemplate = (options) => {
	// 	return (
	// 		<Dropdown
	// 			value={options.value}
	// 			options={statuses}
	// 			onChange={(e) => options.filterApplyCallback(e.value)}
	// 			itemTemplate={statusItemTemplate}
	// 			placeholder="Select One"
	// 			className="p-column-filter"
	// 			showClear
	// 			style={{ minWidth: "12rem" }}
	// 		/>
	// 	);
	// };

	// const verifiedRowFilterTemplate = (options) => {
	// 	return (
	// 		<TriStateCheckbox
	// 			value={options.value}
	// 			onChange={(e) => options.filterApplyCallback(e.value)}
	// 		/>
	// 	);
	// };

	const header = renderHeader();
	// console.log(data)
	return (
		<div className="card">
			<DataTable
				value={data}
				paginator
				rows={10}
				dataKey="id"
				filters={filters}
				filterDisplay="row"
				// loading={loading}
				globalFilterFields={[
					"name",
					"country.name",
					"representative.name",
					"status",
				]}
				header={header}
				emptyMessage="No record found.">
				<Column
					field="sn"
					header="SN"
					// filter
					// filterPlaceholder="Search by name"
					style={{ minWidth: "12rem" }}
					body = {(data) => 1}
				/>
				<Column
					header="item"
					filterField="Item"
					style={{ minWidth: "12rem" }}
					body={titleBodyTemplate}
					// filter
					// filterPlaceholder="Search by country"
				/>
				<Column
					field="qty"
					header="QTY in Stock"
					filterField="Qty in Stock"
					// showFilterMenu={false}
					// filterMenuStyle={{ width: "14rem" }}
					style={{ minWidth: "14rem" }}
					// body={(data) => data.qty}
					// filter
					// filterElement={representativeRowFilterTemplate}
				/>
				{/* <Column
					field="status"
					header="Status"
					showFilterMenu={false}
					filterMenuStyle={{ width: "14rem" }}
					style={{ minWidth: "12rem" }}
					body={statusBodyTemplate}
					filter
					filterElement={statusRowFilterTemplate}
				/>
				<Column
					field="verified"
					header="Verified"
					dataType="boolean"
					style={{ minWidth: "6rem" }}
					body={verifiedBodyTemplate}
					filter
					filterElement={verifiedRowFilterTemplate}
				/> */}
			</DataTable>
		</div>
	);
};
export default MyDataTable;
