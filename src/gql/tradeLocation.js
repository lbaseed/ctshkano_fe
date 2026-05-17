import { gql } from "@apollo/client";

// Queries
export const GET_TRADE_LOCATIONS = gql`
	query getTradeLocations($isActive: Boolean) {
		tradeLocations(
			is_active: $isActive
			orderBy: [{ column: NAME, order: ASC }]
		) {
			id
			uuid
			name
			description
			is_active
			countTraders
			created_at
			updated_at
		}
	}
`;

export const GET_TRADE_LOCATION = gql`
	query getTradeLocation($uuid: ID!) {
		tradeLocation(uuid: $uuid) {
			id
			uuid
			name
			description
			is_active
			countTraders
			created_at
			updated_at
		}
	}
`;

// Mutations
export const CREATE_TRADE_LOCATION = gql`
	mutation createTradeLocation(
		$name: String!
		$description: String
		$is_active: Boolean
	) {
		createTradeLocation(
			name: $name
			description: $description
			is_active: $is_active
		) {
			id
			uuid
			name
			description
			is_active
			countTraders
			created_at
			updated_at
		}
	}
`;

export const UPDATE_TRADE_LOCATION = gql`
	mutation updateTradeLocation(
		$uuid: ID!
		$name: String
		$description: String
		$is_active: Boolean
	) {
		updateTradeLocation(
			uuid: $uuid
			name: $name
			description: $description
			is_active: $is_active
		) {
			id
			uuid
			name
			description
			is_active
			countTraders
			created_at
			updated_at
		}
	}
`;

export const DELETE_TRADE_LOCATION = gql`
	mutation deleteTradeLocation($uuid: ID!) {
		deleteTradeLocation(uuid: $uuid) {
			id
			uuid
			name
		}
	}
`;
