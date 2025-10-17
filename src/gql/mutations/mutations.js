import { gql } from "@apollo/client";
import {
	CORE_LOGIN_FIELDS,
	CORE_USER_FIELDS,
	CORE_TRADE_FIELDS,
	CORE_TRADER_FIELDS,
	CORE_LOCATION_FIELDS,
	CORE_GUARANTOR_FIELDS,
	CORE_NEXTOFKIN_FIELDS
} from "../fragments";

export const REGISTER_USER = gql`
	${CORE_LOGIN_FIELDS}
	${CORE_USER_FIELDS}
	mutation gqlRegisterUser(
		$name: String!
		$email: String!
		$password: String!
		$confirmPassword: String!
	) {
		register(
			input: {
				name: $name
				email: $email
				password: $password
				password_confirmation: $confirmPassword
			}
		) {
			status
			tokens {
				...coreLoginFields
				user {
					...coreUserFields
				}
			}
		}
	}
`;

export const LOGIN_USER = gql`
	${CORE_LOGIN_FIELDS}
	${CORE_USER_FIELDS}
	mutation gqlLoginUser($email: String!, $password: String!) {
		login(input: { username: $email, password: $password }) {
			...coreLoginFields
			user {
				...coreUserFields
			}
		}
	}
`;

export const CHANGE_PASSWORD = gql`
	mutation gqlUpdatePassword(
		$oldPassword: String!
		$newPassword: String!
		$confirmNewPassword: String!
	) {
		updatePassword(
			input: {
				old_password: $oldPassword
				password: $newPassword
				password_confirmation: $confirmNewPassword
			}
		) {
			message
			status
		}
	}
`;

export const FORGOT_PASSWORD = gql`
	mutation gqlForgotPassword($email: String!) {
		forgotPassword(input: { email: $email }) {
			message
			status
		}
	}
`;

export const UPDATE_FORGOT_PASSWORD = gql`
	mutation gqlUpdateForgotPassword(
		$email: String!
		$token: String!
		$password: String!
		$password_confirmation: String!
	) {
		updateForgottenPassword(
			input: {
				email: $email
				token: $token
				password: $password
				password_confirmation: $password_confirmation
			}
		) {
			message
			status
		}
	}
`;

export const CREATE_TRADE = gql`
	${CORE_TRADE_FIELDS}
	mutation gqlCreateTrade(
		$name: String!
		$businessNature: BusinessNature!
		$category: String
		$options: String
	) {
		createTrade(
			name: $name
			business_nature: $businessNature
			category: $category
			options: $options
		) {
			...coreTradeFields
		}
	}
`;

export const UPDATE_TRADE = gql`
	${CORE_TRADE_FIELDS}
	mutation gqlUpdateTrade(
		$uuid: ID!
		$name: String
		$businessNature: BusinessNature
		$category: String
		$options: String
	) {
		updateTrade(
			uuid: $uuid
			name: $name
			business_nature: $businessNature
			category: $category
			options: $options
		) {
			...coreTradeFields
		}
	}
`;

export const DELETE_TRADE = gql`
	${CORE_TRADE_FIELDS}
	mutation gqlDeleteTrade($uuid: ID!) {
		deleteTrade(uuid: $uuid) {
			...coreTradeFields
		}
	}
`;

export const CREATE_TRADER = gql`
	${CORE_TRADER_FIELDS}
	mutation gqlCreateTrader(
		$surname: String!
		$otherNames: String
		$phone: String
		$email: String
		$gender: String
		$dob: String
		$home_address: String
		$pvc: String
		$nin: String
		$land_mark: String
		$operating_capital: String
		$location_uuid: ID
		$trade_uuid: ID
		$options: String
		$lga: String
	) {
		createTrader(
			surname: $surname
			other_names: $otherNames
			phone: $phone
			email: $email
			gender: $gender
			dob: $dob
			home_address: $home_address
			pvc: $pvc
			nin: $nin
			land_mark: $land_mark
			operating_capital: $operating_capital
			trade_uuid: $trade_uuid
			location_uuid: $location_uuid
			lga: $lga
			options: $options
		) {
			...coreTraderFields
		}
	}
`;

export const UPDATE_TRADER = gql`
	${CORE_TRADER_FIELDS}
	mutation gqlUpdateTrader(
		$uuid: ID!
		$surname: String
		$other_names: String
		$phone: String
		$email: String
		$gender: String
		$dob: String
		$home_address: String
		$pvc: String
		$nin: String
		$land_mark: String
		$operating_capital: Float
		$bank_details: String
		$location_uuid: ID
		$trade_uuid: ID
		$options: String
		$lga: String
	) {
		updateTrader(
			uuid: $uuid
			surname: $surname
			other_names: $other_names
			phone: $phone
			email: $email
			gender: $gender
			dob: $dob
			home_address: $home_address
			pvc: $pvc
			nin: $nin
			land_mark: $land_mark
			operating_capital: $operating_capital
			trade_uuid: $trade_uuid
			location_uuid: $location_uuid
			options: $options
			lga: $lga
			bank_details: $bank_details
		) {
			...coreTraderFields
		}
	}
`;

export const DELETE_TRADER = gql`
	${CORE_TRADER_FIELDS}
	mutation gqlDeleteTrader($uuid: ID!) {
		deleteTrader(uuid: $uuid) {
			...coreTraderFields
		}
	}
`;

export const UPDATE_TRADER_IMAGE = gql`
	${CORE_TRADER_FIELDS}
	mutation gqlUpdateTraderImage($file: Upload!) {
		updateTraderImage(file: $file) {
			...coreTraderFields
		}
	}
`;

export const CREATE_LOCATION = gql`
	${CORE_LOCATION_FIELDS}
	mutation gqlCreateLocation(
		$title: String!
		$description: String
		$lga: String!
		$type: LocationType!
	) {
		createLocation(
			title: $title
			description: $description
			lga: $lga
			type: $type
		) {
			...coreLocationFields
		}
	}
`;

export const UPDATE_LOCATION = gql`
	${CORE_LOCATION_FIELDS}
	mutation gqlUpdateLocation(
		$uuid: ID!
		$title: String
		$description: String
		$lga: String
		$location: String
	) {
		updateLocation(
			uuid: $uuid
			title: $title
			description: $description
			lga: $lga
			location: $location
		) {
			...coreLocationFields
		}
	}
`;

export const DELETE_LOCATION = gql`
	${CORE_LOCATION_FIELDS}
	mutation gqlDeleteLocation($uuid: ID!) {
		deleteLocation(uuid: $uuid) {
			...coreLocationFields
		}
	}
`;

export const CREATE_GUARANTOR = gql`
	${CORE_GUARANTOR_FIELDS}
	${CORE_TRADER_FIELDS}
	mutation gqlCreateGuarantor(
		$name: String!
		$email: String
		$phone: String!
		$address: String
		$city: String
		$state: String
		$country: String
		$occupation: String
		$dob: String
		$nin: String
		$options: String
		$trader_id: ID!
	) {
		createGuarantor(
			name: $name
			email: $email
			phone: $phone
			address: $address
			city: $city
			state: $state
			country: $country
			occupation: $occupation
			dob: $dob
			nin: $nin
			options: $options
			trader_id: $trader_id
		) {
			...coreGuarantorFields
			trader {
				...coreTraderFields
			}
		}
	}
`;

export const UPDATE_GUARANTOR = gql`
	${CORE_GUARANTOR_FIELDS}
	${CORE_TRADER_FIELDS}
	mutation gqlUpdateGuarantor(
		$uuid: ID!
		$name: String
		$email: String
		$phone: String
		$address: String
		$city: String
		$state: String
		$country: String
		$occupation: String
		$dob: String
		$nin: String
		$options: String
		$trader_uuid: ID
	) {
		updateGuarantor(
			uuid: $uuid
			name: $name
			email: $email
			phone: $phone
			address: $address
			city: $city
			state: $state
			country: $country
			occupation: $occupation
			dob: $dob
			nin: $nin
			options: $options
			trader_uuid: $trader_uuid
		) {
			...coreGuarantorFields
			trader {
				...coreTraderFields
			}
		}
	}
`;

export const DELETE_GUARANTOR = gql`
	${CORE_GUARANTOR_FIELDS}
	mutation gqlDeleteGuarantor($uuid: ID!) {
		deleteGuarantor(uuid: $uuid) {
			...coreGuarantorFields
		}
	}
`;

export const CREATE_NEXTOFKIN = gql`
	${CORE_NEXTOFKIN_FIELDS}
	${CORE_TRADER_FIELDS}
	mutation gqlCreateNextOfKin(
		$name: String!
		$email: String
		$phone: String!
		$address: String
		$relationship: String
		$nin: String
		$options: String
		$trader_id: ID!
	) {
		createNextOfKin(
			name: $name
			email: $email
			phone: $phone
			address: $address
			relationship: $relationship
			nin: $nin
			options: $options
			trader_id: $trader_id
		) {
			...coreNextofkinFields
			trader {
				...coreTraderFields
			}
		}
	}
`;

export const UPDATE_NEXTOFKIN = gql`
	${CORE_NEXTOFKIN_FIELDS}
	${CORE_TRADER_FIELDS}
	mutation gqlUpdateNextOfKin(
		$uuid: ID!
		$name: String
		$email: String
		$phone: String
		$address: String
		$relationship: String
		$nin: String
		$options: String
		$trader_uuid: ID
	) {
		updateNextOfKin(
			uuid: $uuid
			name: $name
			email: $email
			phone: $phone
			address: $address
			relationship: $relationship
			nin: $nin
			options: $options
			trader_uuid: $trader_uuid
		) {
			...coreNextofkinFields
			trader {
				...coreTraderFields
			}
		}
	}
`;

export const DELETE_NEXTOFKIN = gql`
	${CORE_NEXTOFKIN_FIELDS}
	mutation gqlDeleteNextOfKin($uuid: ID!) {
		deleteNextOfKin(uuid: $uuid) {
			...coreNextofkinFields
		}
	}
`;

export const CREATE_USER = gql`
	${CORE_USER_FIELDS}
	mutation gqlCreateUser(
		$name: String!
		$email: String!
		$password: String!
		$confirmPassword: String!
		$clrs: UserClrs!
		$phone: String
	) {
		createUser(
			name: $name
			email: $email
			password: $password
			password_confirm: $confirmPassword
			clrs: $clrs
			phone: $phone
		) {
			...coreUserFields
		}
	}
`;

export const UPDATE_USER_AVATAR = gql`
	${CORE_USER_FIELDS}
	mutation gqlUpdateUserAvatar($file: Upload!) {
		updateUserAvatar(file: $file) {
			...coreUserFields
		}
	}
`;

export const UPLOAD_TRADER_PHOTO = gql`
	${CORE_TRADER_FIELDS}
	mutation gqlUploadTraderPhoto($file: Upload!, $trader_uuid: ID!) {
		uploadTraderPhoto(file: $file, trader_uuid: $trader_uuid) {
			...coreTraderFields
		}
	}
`;
