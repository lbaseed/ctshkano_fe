import React from "react";
import { Link } from "react-router-dom";

export default function CardRecentEnrollment({ transactions }) {
	return (
		<>
			<div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
				<div className="rounded-t mb-0 px-4 py-3 border-0">
					<div className="flex flex-wrap items-center">
						<div className="relative w-full px-4 max-w-full flex-grow flex-1">
							<h3 className="font-semibold text-base text-blueGray-700">
								Recent Enrollment
							</h3>
						</div>
						<div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
							<Link
								to="/admin/view-traders"
								className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
								type="button">
								See all
							</Link>
						</div>
					</div>
				</div>
				<div className="block w-full overflow-x-auto">
					{/* Projects table */}
					<table className="items-center w-full bg-transparent border-collapse">
						<thead>
							<tr>
								<th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
									Fullname
								</th>
								<th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
									Trade
								</th>
								<th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
									Address
								</th>
								<th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
									Phone
								</th>
								<th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
									Gender
								</th>
								<th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
									PVC
								</th>
							</tr>
						</thead>
						<tbody>
							{transactions?.length > 0 &&
								transactions?.slice(0, 10)?.map((sale) => (
									<tr key={sale?.uuid}>
										<th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
											{JSON.parse(sale?.sales_details).map((item) => (
												<p key={item?.uuid}>{item?.title}, </p>
											))}
										</th>
										<td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
											{sale?.customer?.fullname}
										</td>
										<td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
											{sale?.total_amount}
										</td>
										<td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
											<i className="fas fa-check text-emerald-500 mr-4"></i>
											{sale?.status}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}
