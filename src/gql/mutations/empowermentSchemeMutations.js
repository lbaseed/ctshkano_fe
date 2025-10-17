import { gql } from "@apollo/client";
import {
	CORE_EMPOWERMENT_SCHEME_FIELDS,
	CORE_EMPOWERMENT_SCHEME_TRADER_FIELDS,
	CORE_LOCATION_FIELDS,
	CORE_USER_FIELDS,
	CORE_TRADER_FIELDS
} from "../fragments";

export const CREATE_EMPOWERMENT_SCHEME = gql`
	${CORE_EMPOWERMENT_SCHEME_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_USER_FIELDS}

	mutation gqlCreateEmpowermentScheme($input: CreateEmpowermentSchemeInput!) {
		createEmpowermentScheme(input: $input) {
			...coreEmpowermentSchemeFields
		}
	}
`;

export const UPDATE_EMPOWERMENT_SCHEME = gql`
	${CORE_EMPOWERMENT_SCHEME_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_USER_FIELDS}

	mutation gqlUpdateEmpowermentScheme($input: UpdateEmpowermentSchemeInput!) {
		updateEmpowermentScheme(input: $input) {
			...coreEmpowermentSchemeFields
		}
	}
`;

export const DELETE_EMPOWERMENT_SCHEME = gql`
	${CORE_EMPOWERMENT_SCHEME_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_USER_FIELDS}
	mutation gqlDeleteEmpowermentScheme($id: ID!) {
		deleteEmpowermentScheme(id: $id) {
			...coreEmpowermentSchemeFields
		}
	}
`;

export const APPLY_TO_EMPOWERMENT_SCHEME = gql`
	${CORE_EMPOWERMENT_SCHEME_TRADER_FIELDS}
	${CORE_EMPOWERMENT_SCHEME_FIELDS}
	${CORE_TRADER_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_USER_FIELDS}
	mutation gqlApplyToEmpowermentScheme(
		$empowerment_scheme_id: ID!
		$trader_id: ID!
		$remarks: String
	) {
		applyToEmpowermentScheme(
			input: {
				empowerment_scheme_id: $empowerment_scheme_id
				trader_id: $trader_id
				remarks: $remarks
			}
		) {
			...coreEmpowermentSchemeTraderFields
		}
	}
`;

export const UPDATE_EMPOWERMENT_SCHEME_APPLICATION = gql`
	${CORE_EMPOWERMENT_SCHEME_TRADER_FIELDS}
	${CORE_EMPOWERMENT_SCHEME_FIELDS}
	${CORE_TRADER_FIELDS}
	${CORE_LOCATION_FIELDS}
	${CORE_USER_FIELDS}
	mutation gqlUpdateEmpowermentSchemeApplication(
		$empowerment_scheme_id: ID!
		$trader_id: ID!
		$status: EmpowermentSchemeTraderStatus!
		$approval_date: DateTime
		$remarks: String
	) {
		updateEmpowermentSchemeApplication(
			input: {
				empowerment_scheme_id: $empowerment_scheme_id
				trader_id: $trader_id
				status: $status
				approval_date: $approval_date
				remarks: $remarks
			}
		) {
			...coreEmpowermentSchemeTraderFields
		}
	}
`;

export const REMOVE_TRADER_FROM_SCHEME = gql`
	mutation gqlRemoveTraderFromScheme(
		$empowerment_scheme_id: ID!
		$trader_id: ID!
	) {
		removeTraderFromScheme(
			empowerment_scheme_id: $empowerment_scheme_id
			trader_id: $trader_id
		)
	}
`;
