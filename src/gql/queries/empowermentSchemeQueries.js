import { gql } from "@apollo/client";
import {
	CORE_EMPOWERMENT_SCHEME_FIELDS,
	CORE_EMPOWERMENT_SCHEME_TRADER_FIELDS,
	CORE_LOCATION_FIELDS,
	CORE_USER_FIELDS,
	CORE_TRADER_FIELDS,
	CORE_PAGINATOR_INFO_FIELDS
} from "../fragments";

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

export const GET_EMPOWERMENT_SCHEME_APPLICATIONS = gql`
	${CORE_EMPOWERMENT_SCHEME_TRADER_FIELDS}
	${CORE_EMPOWERMENT_SCHEME_FIELDS}
	${CORE_TRADER_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_USER_FIELDS}
	${CORE_PAGINATOR_INFO_FIELDS}
	query gqlGetEmpowermentSchemeApplications(
		$empowerment_scheme_id: ID!
		$status: EmpowermentSchemeTraderStatus
		$first: Int = 15
		$page: Int
	) {
		empowermentSchemeApplications(
			empowerment_scheme_id: $empowerment_scheme_id
			status: $status
			first: $first
			page: $page
		) {
			data {
				...coreEmpowermentSchemeTraderFields
			}
			paginatorInfo {
				...corePaginatorInfoFields
			}
		}
	}
`;

export const GET_TRADER_APPLICATIONS = gql`
	${CORE_EMPOWERMENT_SCHEME_TRADER_FIELDS}
	${CORE_EMPOWERMENT_SCHEME_FIELDS}
	${CORE_TRADER_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_USER_FIELDS}
	${CORE_PAGINATOR_INFO_FIELDS}
	query gqlGetTraderApplications(
		$trader_id: ID!
		$status: EmpowermentSchemeTraderStatus
		$first: Int = 15
		$page: Int
	) {
		traderApplications(
			trader_id: $trader_id
			status: $status
			first: $first
			page: $page
		) {
			data {
				...coreEmpowermentSchemeTraderFields
			}
			paginatorInfo {
				...corePaginatorInfoFields
			}
		}
	}
`;
