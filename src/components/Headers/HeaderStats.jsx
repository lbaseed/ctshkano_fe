import React, { useEffect, useState } from "react";
import CardStats from "../Cards/CardStats";
import moment from "moment";

export default function HeaderStats({ dailySales, monthlySales, items }) {
	const [totalDailySales, setTotalDailySales] = useState(0.0);
	const [totalMonthlySales, setTotalMonthlySales] = useState(0.0);

	const [totalDailyProfit, setTotalDailyProfit] = useState(0.0);
	const [totalMonthlyProfit, setTotalMonthlyProfit] = useState(0.0);

	const [dailyItems, setDailyItems] = useState(0);

	useEffect(() => {
		calculateDailySales(dailySales, "daily");
		calculateDailySales(monthlySales, "monthly");

		calculateTotalProfit(dailySales, "daily");
		calculateTotalProfit(monthlySales, "monthly");

		calculateDailyItems();
	}, [dailySales, monthlySales]);

	const currency = (value, dp = 2) => {
		return value && value.toFixed(dp).replace(/\d(?=(\d{3})+\.)/g, "$&,");
	};

	const calculateDailySales = (sales, type) => {
		let total = 0;

		if (sales?.length > 0) {
			sales?.map((sale) => {
				return (total += sale?.total_amount);
			});

			type === "daily" && setTotalDailySales(total);
			type === "monthly" && setTotalMonthlySales(total);
		}
	};

	const calculateTotalProfit = (transactions, type) => {
		let total = 0;

		if (transactions?.length > 0) {
			transactions?.map((sale) => {
				const salesDetail = JSON.parse(sale?.sales_details);
				let subTotal = 0;
				salesDetail?.map((detail) => {
					const saleTotal = detail?.qty * (detail?.salePrice - detail?.costPrice);
					subTotal += saleTotal;
				});
				total += subTotal;
			});

			type === "daily" && setTotalDailyProfit(total);
			type === "monthly" && setTotalMonthlyProfit(total);
		}
	};

	const calculateDailyItems = () => {
		let quantities = 0;

		if (dailySales?.length > 0) {
			dailySales?.map((sale) => {
				const salesDetail = JSON.parse(sale?.sales_details);
				salesDetail?.map((detail) => {
					quantities += detail.qty;
				});
			});

			setDailyItems({ items: dailySales?.length, quantities });
		}
	};

	return (
		<>
			{/* Header */}
			<div className="relative bg-lightBlue-600 md:pt-16 md:pb-16 rounded pt-12">
				<div className="px-4 md:px-10 mx-auto w-full">
					<div>
						{/* Card stats */}
						<div className="flex flex-wrap">
							<div className="w-full md:w-6/12 px-4 mb-8">
								<CardStats
									statSubtitle="Total Traders"
									statTitle={totalDailySales}
									statArrow="up"
									statPercent={totalDailyProfit}
									statPercentColor="text-emerald-500"
									statDescripiron="Registered Today"
									statIconName="far fa-chart-bar"
									statIconColor="bg-purple-500"
								/>
							</div>
							<div className="w-full md:w-6/12 px-4 mb-8">
								<CardStats
									statSubtitle="Trades"
									statTitle={dailyItems.items}
									statArrow="up"
									statPercent={dailyItems.quantities}
									statPercentColor="text-emerald-500"
									statDescripiron="Quantities sold"
									statIconName="fas fa-chart-pie"
									statIconColor="bg-emerald-500"
								/>
							</div>
							<div className="w-full md:w-6/12 px-4 mb-8">
								<CardStats
									statSubtitle="Staff"
									statTitle={"NGN " + currency(totalMonthlySales)}
									statArrow="up"
									statPercent={"NGN " + currency(totalMonthlyProfit, 1)}
									statPercentColor="text-emerald-500"
									statDescripiron={`${moment().format("MMMM")} profit`}
									statIconName="fa fa-cart-arrow-down"
									statIconColor="bg-indigo-500"
								/>
							</div>
							<div className="w-full md:w-6/12 px-4 mb-8">
								<CardStats
									statSubtitle="Enrollement Centers"
									statTitle={currency(items?.length, 1)}
									statArrow=""
									statPercent=""
									statPercentColor="text-emerald-500"
									statDescripiron=""
									statIconName="fas fa-percent"
									statIconColor="bg-lightBlue-500"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
