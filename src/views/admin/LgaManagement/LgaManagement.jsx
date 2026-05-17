import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import {
	Card as AntCard,
	Row,
	Col,
	Statistic,
	Table,
	Progress,
	Tag,
	Space,
	Alert,
	Spin,
	Empty
} from "antd";
import {
	TeamOutlined,
	UsergroupAddOutlined,
	UserDeleteOutlined,
	BarChartOutlined,
	RiseOutlined,
	FallOutlined,
	DollarOutlined,
	ShopOutlined
} from "@ant-design/icons";
import Card from "../../../components/Cards/Card";
import { GET_LGA_MANAGEMENT_DATA } from "../../../gql/queries/queries";
import { toast } from "react-toastify";

export const LgaManagement = () => {
	const [summaryData, setSummaryData] = useState(null);
	const [lgaStats, setLgaStats] = useState([]);
	const [tablePage, setTablePage] = useState({ current: 1, pageSize: 20 });

	const {
		data: lgaData,
		loading: lgaLoading,
		error: lgaError,
		refetch: refetchLgaData
	} = useQuery(GET_LGA_MANAGEMENT_DATA, {
		fetchPolicy: "cache-and-network",
		onCompleted: (data) => {
			if (data?.lgaManagementData) {
				setSummaryData({
					totalLgas: data.lgaManagementData.totalLgas,
					totalActiveTraders: data.lgaManagementData.totalActiveTraders,
					totalInactiveTraders: data.lgaManagementData.totalInactiveTraders,
					avgTradersPerLga: data.lgaManagementData.avgTradersPerLga
				});
				setLgaStats(data.lgaManagementData.lgaStats);
			}
		},
		onError: (error) => {
			console.error("LGA management data error:", error);
			toast.error("Failed to load LGA management data");
		}
	});

	const columns = [
		{
			title: "S/N",
			key: "sn",
			width: 55,
			fixed: "left",
			render: (_, __, index) =>
				(tablePage.current - 1) * tablePage.pageSize + index + 1
		},
		{
			title: "LGA Name",
			dataIndex: "name",
			key: "name",
			width: 200,
			fixed: "left",
			render: (text, record) => (
				<div>
					<div className="font-semibold text-gray-900">{text}</div>
					<div className="text-sm text-gray-500">Code: {record.code}</div>
				</div>
			)
		},
		{
			title: "State",
			dataIndex: "state",
			key: "state",
			width: 120
		},
		{
			title: "Total Traders",
			dataIndex: "tradersCount",
			key: "tradersCount",
			width: 130,
			sorter: (a, b) => a.tradersCount - b.tradersCount,
			render: (count) => (
				<div className="text-center">
					<div className="text-lg font-bold text-blue-600">{count}</div>
				</div>
			)
		},
		{
			title: "Gender Split",
			key: "genderSplit",
			width: 200,
			render: (_, record) => {
				const total = record.tradersCount;
				const malePercentage =
					total > 0 ? Math.round((record.maleTraders / total) * 100) : 0;
				const femalePercentage =
					total > 0 ? Math.round((record.femaleTraders / total) * 100) : 0;

				return (
					<div>
						<div className="flex justify-between text-sm mb-1">
							<span>Male: {record.maleTraders}</span>
							<span>Female: {record.femaleTraders}</span>
						</div>
						<Progress
							percent={malePercentage}
							success={{ percent: femalePercentage }}
							size="small"
							showInfo={false}
						/>
						<div className="flex justify-between text-xs text-gray-500 mt-1">
							<span>{malePercentage}%</span>
							<span>{femalePercentage}%</span>
						</div>
					</div>
				);
			}
		},
		{
			title: "Active Status",
			key: "activeStatus",
			width: 150,
			render: (_, record) => (
				<div>
					<div className="flex justify-between text-sm">
						<Tag color="green">Active: {record.activeTradersCount}</Tag>
					</div>
					<div className="flex justify-between text-sm mt-1">
						<Tag color="red">Inactive: {record.inactiveTradersCount}</Tag>
					</div>
				</div>
			)
		},
		{
			title: "Trades",
			dataIndex: "tradesCount",
			key: "tradesCount",
			width: 100,
			sorter: (a, b) => a.tradesCount - b.tradesCount,
			render: (count) => (
				<div className="text-center">
					<ShopOutlined className="text-purple-500 mr-1" />
					<span className="font-semibold">{count}</span>
				</div>
			)
		},
		{
			title: "Avg Capital",
			dataIndex: "avgOperatingCapital",
			key: "avgOperatingCapital",
			width: 130,
			sorter: (a, b) => a.avgOperatingCapital - b.avgOperatingCapital,
			render: (capital) => (
				<div className="text-center">
					<DollarOutlined className="text-green-500 mr-1" />
					<span className="font-semibold">
						{capital > 0 ? `₦${capital.toLocaleString()}` : "N/A"}
					</span>
				</div>
			)
		},
		{
			title: "Recent (30d)",
			dataIndex: "recentTradersCount",
			key: "recentTradersCount",
			width: 120,
			sorter: (a, b) => a.recentTradersCount - b.recentTradersCount,
			render: (count) => (
				<Tag color={count > 0 ? "blue" : "default"}>
					<RiseOutlined /> {count}
				</Tag>
			)
		},
		{
			title: "Top Trades",
			dataIndex: "topTrades",
			key: "topTrades",
			width: 250,
			render: (topTrades) => (
				<div className="space-y-1">
					{topTrades?.slice(0, 3).map((trade, index) => (
						<div key={index} className="flex justify-between text-xs">
							<span className="truncate mr-2">{trade.tradeName}</span>
							<Tag size="small" color="blue">
								{trade.traderCount}
							</Tag>
						</div>
					))}
					{(!topTrades || topTrades.length === 0) && (
						<span className="text-gray-400 text-xs">No trades</span>
					)}
				</div>
			)
		}
	];

	if (lgaError) {
		return (
			<div className="flex flex-wrap">
				<div className="w-full px-4">
					<Card title="LGA Management">
						<Alert
							message="Error Loading Data"
							description={
								lgaError.message || "Unable to load LGA management data"
							}
							type="error"
							showIcon
							action={
								<button
									onClick={() => refetchLgaData()}
									className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
									Retry
								</button>
							}
						/>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-wrap">
			<div className="w-full px-4">
				<Card title="LGA Management Dashboard">
					{/* Summary Cards */}
					<div className="mb-8 mt-8">
						<Row gutter={[16, 16]}>
							<Col xs={24} sm={12} lg={6}>
								<AntCard>
									<Statistic
										title="Total LGAs"
										value={summaryData?.totalLgas || 0}
										prefix={<BarChartOutlined className="text-blue-500" />}
										loading={lgaLoading}
									/>
								</AntCard>
							</Col>
							<Col xs={24} sm={12} lg={6}>
								<AntCard>
									<Statistic
										title="Active Traders"
										value={summaryData?.totalActiveTraders || 0}
										prefix={<UsergroupAddOutlined className="text-green-500" />}
										loading={lgaLoading}
									/>
								</AntCard>
							</Col>
							<Col xs={24} sm={12} lg={6}>
								<AntCard>
									<Statistic
										title="Inactive Traders"
										value={summaryData?.totalInactiveTraders || 0}
										prefix={<UserDeleteOutlined className="text-red-500" />}
										loading={lgaLoading}
									/>
								</AntCard>
							</Col>
							<Col xs={24} sm={12} lg={6}>
								<AntCard>
									<Statistic
										title="Avg Traders/LGA"
										value={summaryData?.avgTradersPerLga || 0}
										precision={1}
										prefix={<TeamOutlined className="text-purple-500" />}
										loading={lgaLoading}
									/>
								</AntCard>
							</Col>
						</Row>
					</div>

					{/* LGA Statistics Table */}
					<div className="mb-6">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold text-gray-800">
								LGA Statistics & Metrics
							</h3>
							<Space>
								<button
									onClick={() => refetchLgaData()}
									disabled={lgaLoading}
									className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
									{lgaLoading ? <Spin size="small" /> : "Refresh Data"}
								</button>
							</Space>
						</div>

						<Table
							columns={columns}
							dataSource={lgaStats}
							rowKey="id"
							loading={lgaLoading}
							scroll={{ x: 1200, y: 600 }}
							pagination={{
								current: tablePage.current,
								pageSize: tablePage.pageSize,
								showSizeChanger: true,
								pageSizeOptions: ["10", "20", "50", "100"],
								showTotal: (total, range) =>
									`${range[0]}-${range[1]} of ${total} LGAs`,
								onChange: (page, size) =>
									setTablePage({ current: page, pageSize: size })
							}}
							locale={{
								emptyText: (
									<Empty
										description="No LGA data available"
										image={Empty.PRESENTED_IMAGE_SIMPLE}
									/>
								)
							}}
						/>
					</div>

					{/* Additional Insights */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<AntCard title="Performance Insights" size="small">
							<ul className="space-y-2 text-sm">
								<li className="flex justify-between">
									<span>Top performing LGA:</span>
									<span className="font-semibold text-green-600">
										{lgaStats?.[0]?.name || "N/A"}
									</span>
								</li>
								<li className="flex justify-between">
									<span>Most traders:</span>
									<span className="font-semibold text-blue-600">
										{lgaStats?.[0]?.tradersCount || 0}
									</span>
								</li>
								<li className="flex justify-between">
									<span>Lowest performers:</span>
									<span className="font-semibold text-red-600">
										{lgaStats?.filter((lga) => lga.tradersCount === 0).length ||
											0}{" "}
										LGAs
									</span>
								</li>
							</ul>
						</AntCard>

						<AntCard title="Gender Distribution" size="small">
							<div className="space-y-3">
								<div>
									<div className="flex justify-between text-sm mb-1">
										<span>Male Traders</span>
										<span className="font-semibold">
											{lgaStats?.reduce(
												(sum, lga) => sum + lga.maleTraders,
												0
											) || 0}
										</span>
									</div>
								</div>
								<div>
									<div className="flex justify-between text-sm mb-1">
										<span>Female Traders</span>
										<span className="font-semibold">
											{lgaStats?.reduce(
												(sum, lga) => sum + lga.femaleTraders,
												0
											) || 0}
										</span>
									</div>
								</div>
								<div className="pt-2 border-t">
									<span className="text-xs text-gray-500">
										Gender ratio varies by region
									</span>
								</div>
							</div>
						</AntCard>

						<AntCard title="Recent Activity" size="small">
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span>New registrations (30d):</span>
									<span className="font-semibold text-blue-600">
										{lgaStats?.reduce(
											(sum, lga) => sum + lga.recentTradersCount,
											0
										) || 0}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Active LGAs:</span>
									<span className="font-semibold text-green-600">
										{lgaStats?.filter((lga) => lga.recentTradersCount > 0)
											.length || 0}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Dormant LGAs:</span>
									<span className="font-semibold text-red-600">
										{lgaStats?.filter((lga) => lga.recentTradersCount === 0)
											.length || 0}
									</span>
								</div>
							</div>
						</AntCard>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default LgaManagement;
