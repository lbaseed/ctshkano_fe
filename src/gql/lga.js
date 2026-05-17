import { gql } from "@apollo/client";

// LGA Queries
export const GET_LGAS = gql`
	query getLgas(
		$isActive: Boolean
		# $orderBy: QueryLgasOrderByColumn!
		# $direction: SortOrder = ASC
	) {
		lgas(
			is_active: $isActive
			# orderBy: { column: $orderBy, order: $direction }
		) {
			id
			uuid
			code
			name
			state
			is_active
			traders_count
			created_at
			updated_at
		}
	}
`;

export const GET_LGA = gql`
	query getLga($uuid: ID!) {
		lga(uuid: $uuid) {
			id
			uuid
			code
			name
			state
			is_active
			traders_count
			created_at
			updated_at
		}
	}
`;

export const GET_LGA_LIST = gql`
	query getLgaList(
		$first: Int
		$page: Int
		$isActive: Boolean
		$orderBy: String
		$direction: SortOrder = ASC
	) {
		lgaList(
			first: $first
			page: $page
			is_active: $isActive
			orderBy: { columns: $orderBy, order: $direction }
		) {
			id
			uuid
			code
			name
			state
			is_active
			traders_count
			created_at
			updated_at
		}
	}
`;

// LGA Mutations
export const CREATE_LGA = gql`
	mutation createLga(
		$code: String!
		$name: String!
		$state: String
		$isActive: Boolean
	) {
		createLga(code: $code, name: $name, state: $state, is_active: $isActive) {
			id
			uuid
			code
			name
			state
			is_active
			created_at
			updated_at
		}
	}
`;

export const UPDATE_LGA = gql`
	mutation updateLga(
		$uuid: ID!
		$code: String
		$name: String
		$state: String
		$isActive: Boolean
	) {
		updateLga(
			uuid: $uuid
			code: $code
			name: $name
			state: $state
			is_active: $isActive
		) {
			id
			uuid
			code
			name
			state
			is_active
			created_at
			updated_at
		}
	}
`;

export const DELETE_LGA = gql`
	mutation deleteLga($uuid: ID!) {
		deleteLga(uuid: $uuid) {
			id
			uuid
			code
			name
		}
	}
`;

export const UPLOAD_LGAS = gql`
	mutation uploadLgas($file: Upload!) {
		uploadLgas(file: $file) {
			success
			message
			imported_count
			errors
		}
	}
`;

export const BULK_UPDATE_LGAS = gql`
	mutation bulkUpdateLgas($lgas: [LgaInput!]!) {
		bulkUpdateLgas(lgas: $lgas) {
			success
			message
			imported_count
			errors
		}
	}
`;
