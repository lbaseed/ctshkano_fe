import { gql } from "@apollo/client";

export const GET_DASHBOARD_STATS = gql`
	query GetDashboardStats {
		dashboardStats {
			totalTraders
			totalActiveTraders
			totalTrades
			totalLocations
			totalEmpowermentSchemes
			activeEmpowermentSchemes
			totalApplications
			approvedApplications
			pendingApplications
			rejectedApplications
			totalSchemeAmount
			totalDisbursedAmount
			recentTraders {
				id
				ctsh_id
				surname
				other_names
				phone
				created_at
			}
			recentApplications {
				id
				trader {
					ctsh_id
					surname
					other_names
					phone
				}
				empowermentScheme {
					name
					amount_per_participant
				}
				status
				created_at
			}
			schemesByStatus {
				status
				count
			}
			tradersByTrade {
				trade {
					name
				}
				count
			}
		}
	}
`;

export const GET_DASHBOARD_CHARTS = gql`
	query GetDashboardCharts($period: String = "monthly") {
		dashboardCharts(period: $period) {
			tradersRegistration {
				period
				count
			}
			schemeApplications {
				period
				count
			}
			schemeCreation {
				period
				count
			}
		}
	}
`;
