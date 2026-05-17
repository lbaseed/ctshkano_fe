import { gql } from "@apollo/client";

export const CORE_PAGINATOR_INFO_FIELDS = gql`
	fragment corePaginatorInfoFields on PaginatorInfo {
		count
		currentPage
		firstItem
		lastItem
		lastPage
		hasMorePages
		perPage
		total
	}
`;

export const CORE_LOGIN_FIELDS = gql`
	fragment coreLoginFields on AuthPayload {
		access_token
		refresh_token
		expires_in
		token_type
	}
`;

export const CORE_USER_FIELDS = gql`
	fragment coreUserFields on User {
		id
		uuid
		name
		email
		avatar
		phone
		clrs
		user_type
		is_active
		traders_count
		email_verified_at
		created_at
		updated_at
	}
`;

export const CORE_TRADE_FIELDS = gql`
	fragment coreTradeFields on Trade {
		id
		uuid
		name
		business_nature
		category
		description
		countTraders
		options
		created_at
		updated_at
	}
`;

export const CORE_LOCATION_FIELDS = gql`
	fragment coreLocationFields on Location {
		id
		uuid
		title
		description
		lga
		type
		created_at
		updated_at
	}
`;

export const CORE_TRADER_FIELDS = gql`
	${CORE_USER_FIELDS}
	fragment coreTraderFields on Trader {
		id
		uuid
		ctsh_id
		surname
		other_names
		phone
		email
		gender
		dob
		home_address
		pvc
		nin
		land_mark
		lga
		business_location
		trade_location
		operating_capital
		bank_details
		options
		photo
		trade {
			id
			name
		}
		creator {
			...coreUserFields
		}
		created_at
		updated_at
	}
`;

export const CORE_EMPOWERMENT_SCHEME_FIELDS = gql`
	fragment coreEmpowermentSchemeFields on EmpowermentScheme {
		id
		uuid
		name
		description
		duration_months
		status
		max_participants
		current_participants
		amount_per_participant
		total_budget
		start_date
		end_date
		application_deadline
		requirements
		benefits
		eligibility_criteria
		contact_person
		contact_email
		contact_phone
		is_open
		available_slots
		progress_percentage
		traders_count
		location {
			...coreLocationFields
		}
		created_by_user {
			...coreUserFields
		}
		created_at
		updated_at
	}
`;

export const CORE_EMPOWERMENT_SCHEME_TRADER_FIELDS = gql`
	fragment coreEmpowermentSchemeTraderFields on EmpowermentSchemeTrader {
		id
		application_date
		approval_date
		status
		remarks
		empowerment_scheme {
			...coreEmpowermentSchemeFields
		}
		trader {
			...coreTraderFields
		}
		created_at
		updated_at
	}
`;

export const CORE_NEXTOFKIN_FIELDS = gql`
	fragment coreNextofkinFields on NextOfKin {
		id
		uuid
		name
		email
		phone
		address
		nin
		relationship
		options
		created_at
		updated_at
	}
`;

export const CORE_GUARANTOR_FIELDS = gql`
	fragment coreGuarantorFields on Guarantor {
		id
		uuid
		name
		email
		phone
		address
		city
		state
		country
		occupation
		dob
		nin
		options
		created_at
		updated_at
	}
`;

export const CORE_LGA_FIELDS = gql`
	fragment coreLgaFields on Lga {
		id
		uuid
		code
		name
		state
		is_active
		created_at
		updated_at
	}
`;

export const CORE_LGA_STATS_FIELDS = gql`
	fragment coreLgaStatsFields on LgaStats {
		id
		uuid
		code
		name
		state
		is_active
		tradersCount
		maleTraders
		femaleTraders
		activeTradersCount
		inactiveTradersCount
		tradesCount
		avgOperatingCapital
		recentTradersCount
		topTrades {
			tradeName
			traderCount
		}
		created_at
		updated_at
	}
`;
