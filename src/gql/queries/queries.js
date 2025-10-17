import { gql } from "@apollo/client";
import {
	CORE_USER_FIELDS,
	CORE_TRADE_FIELDS,
	CORE_PAGINATOR_INFO_FIELDS,
	CORE_LOCATION_FIELDS,
	CORE_TRADER_FIELDS,
	CORE_GUARANTOR_FIELDS,
	CORE_NEXTOFKIN_FIELDS,
	CORE_EMPOWERMENT_SCHEME_FIELDS,
	CORE_EMPOWERMENT_SCHEME_TRADER_FIELDS
} from "../fragments";

export const GET_TRADES = gql`
	${CORE_TRADE_FIELDS}
	query gqlGetTraders {
		trades {
			...coreTradeFields
		}
	}
`;

export const GET_TRADE_LIST = gql`
	${CORE_TRADE_FIELDS}
	${CORE_PAGINATOR_INFO_FIELDS}
	query gqlGetTradeList(
		$first: Int
		$page: Int
		$orderBy: String
		$direction: SortOrder = ASC
	) {
		trades(
			first: $first
			page: $page
			orderBy: { columns: $orderBy, order: $direction }
		) {
			...coreTradeFields
			paginatorInfo {
				...corePaginatorInfoFields
			}
		}
	}
`;

export const GET_TRADE = gql`
	${CORE_TRADE_FIELDS}
	query gqlGetTrade($uuid: ID!) {
		trade(uuid: $uuid) {
			...coreTradeFields
		}
	}
`;

export const GET_LOCATION = gql`
	${CORE_LOCATION_FIELDS}
	query gqlGetLocation($uuid: ID!) {
		location(uuid: $uuid) {
			...coreLocationFields
		}
	}
`;

export const GET_LOCATIONS = gql`
	${CORE_LOCATION_FIELDS}
	query gqlGetLocations {
		locations {
			...coreLocationFields
		}
	}
`;

export const GET_LOCATION_LIST = gql`
	${CORE_LOCATION_FIELDS}
	${CORE_PAGINATOR_INFO_FIELDS}
	query gqlGetLocationList(
		$first: Int
		$page: Int
		$orderBy: String
		$direction: SortOrder = ASC
	) {
		locationList(
			first: $first
			page: $page
			orderBy: { column: $orderBy, order: $direction }
		) {
			data {
				...coreLocationFields
			}
			paginatorInfo {
				...corePaginatorInfoFields
			}
		}
	}
`;

export const GET_TRADER = gql`
	${CORE_TRADER_FIELDS}
	${CORE_GUARANTOR_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_NEXTOFKIN_FIELDS}
	${CORE_TRADE_FIELDS}
	query gqlGetTrader($uuid: ID!) {
		trader(uuid: $uuid) {
			...coreTraderFields
			trade {
				...coreTradeFields
			}
			guarantor {
				...coreGuarantorFields
			}
			location {
				...coreLocationFields
			}
			nextOfKin {
				...coreNextofkinFields
			}
		}
	}
`;

export const GET_TRADERS = gql`
	${CORE_TRADER_FIELDS}
	query gqlGetTraders($orderByColumn: String, $direction: SortOrder = ASC) {
		traders(orderBy: { columns: $orderByColumn, order: $direction }) {
			...coreTraderFields
		}
	}
`;

export const GET_TRADERS_LIST = gql`
	${CORE_TRADER_FIELDS}
	${CORE_PAGINATOR_INFO_FIELDS}
	${CORE_TRADE_FIELDS}
	${CORE_LOCATION_FIELDS}
	query gqlGetTradersList(
		$trade_id: ID
		$first: Int!
		$page: Int
		$orderBy: QueryTraderListOrderByColumn!
		$direction: SortOrder = ASC
	) {
		traderList(
			trade_id: $trade_id
			first: $first
			page: $page
			orderBy: { column: $orderBy, order: $direction }
		) {
			data {
				...coreTraderFields
				trade {
					...coreTradeFields
				}
				location {
					...coreLocationFields
				}
			}
			paginatorInfo {
				...corePaginatorInfoFields
			}
		}
	}
`;

export const GET_USERS = gql`
	${CORE_USER_FIELDS}
	query gqlGetUsers {
		myStaff {
			...coreUserFields
		}
	}
`;

export const SEARCH_TRADER = gql`
	${CORE_TRADER_FIELDS}
	${CORE_GUARANTOR_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_NEXTOFKIN_FIELDS}
	${CORE_TRADE_FIELDS}
	query gqlSearchTrader($param: String) {
		searchTrader(param: $param) {
			...coreTraderFields
			trade {
				...coreTradeFields
			}
			guarantor {
				...coreGuarantorFields
			}
			location {
				...coreLocationFields
			}
			nextOfKin {
				...coreNextofkinFields
			}
		}
	}
`;

// Empowerment Scheme Queries
export const GET_EMPOWERMENT_SCHEMES = gql`
	${CORE_EMPOWERMENT_SCHEME_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_USER_FIELDS}
	${CORE_PAGINATOR_INFO_FIELDS}
	query gqlGetEmpowermentSchemes(
		$first: Int = 15
		$page: Int
		$status: EmpowermentSchemeStatus
		$location_id: ID
	) {
		empowermentSchemes(
			first: $first
			page: $page
			status: $status
			location_id: $location_id
		) {
			data {
				...coreEmpowermentSchemeFields
			}
			paginatorInfo {
				...corePaginatorInfoFields
			}
		}
	}
`;

export const GET_EMPOWERMENT_SCHEME = gql`
	${CORE_EMPOWERMENT_SCHEME_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_USER_FIELDS}
	query gqlGetEmpowermentScheme($uuid: ID!) {
		empowermentScheme(uuid: $uuid) {
			...coreEmpowermentSchemeFields
		}
	}
`;

export const GET_OPEN_EMPOWERMENT_SCHEMES = gql`
	${CORE_EMPOWERMENT_SCHEME_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_USER_FIELDS}
	${CORE_PAGINATOR_INFO_FIELDS}
	query gqlGetOpenEmpowermentSchemes(
		$first: Int = 15
		$page: Int
		$location_id: ID
	) {
		openEmpowermentSchemes(
			first: $first
			page: $page
			location_id: $location_id
		) {
			data {
				...coreEmpowermentSchemeFields
			}
			paginatorInfo {
				...corePaginatorInfoFields
			}
		}
	}
`;
