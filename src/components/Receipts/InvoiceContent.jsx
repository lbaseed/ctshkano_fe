import React from "react";
import { useCookies } from "react-cookie";
import { QRCode } from "react-qrcode-logo";

const InvoiceContent = (props) => {
	const [cookies, setCookie, removeCookie] = useCookies([
		import.meta.env.VITE_COOKIE_NAME
	]);
	const user = cookies?.luis?.user;

	const logo = import.meta.env.VITE_API_DATA + user?.business?.logo;
	const signature = import.meta.env.VITE_API_DATA + user?.business?.signature;

	const currency = (value) => {
		return value && value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&, ");
	};

	const salesDetails = JSON.parse(props?.transaction?.sales_details);

	const qrObject = {
		fullname: props?.transaction?.customer?.fullname,
		account: props?.transaction?.customer?.account,
		date: props?.transaction?.date,
		totalSales: props?.transaction.total_amount,
		transRef: props?.transaction?.uuid,
		transaction_id: props?.transaction?.id
	};

	return (
		<div className="flex w-full item-start justify-between">
			<div className="flex-col text-center w-full">
				<div className="md:flex w-full mb-4">
					<div className="mr-4 mb-8">
						<img
							src={
								user?.business?.logo
									? logo
									: "https://placehold.co/400x400?text=LUIS"
							}
							alt="logo"
							className="rounded-full mx-auto"
							style={{ width: "150px", height: "150px" }}
							width="100"
						/>
					</div>

					<div className="md:text-left font-semibold text-xl">
						<p>{user?.business?.name}</p>
						<p className="text-sm">{user?.business?.address}</p>
						<p className="text-sm">{user?.business?.email}</p>
						<p className="text-sm mb-4">{user?.business?.phone}</p>
						<p className="text-md">SALES INVOICE</p>
					</div>
				</div>
				<div className="w-full justify-between mb-4 text-left text-lg">
					<div>
						{props?.transaction?.customer && (
							<div>
								Invoice for:-
								<p>
									Full Name:{" "}
									<span className="font-semibold pl-4">
										{props?.transaction?.customer?.fullname}
									</span>
								</p>
								<p>
									Address:{" "}
									<span className="font-semibold pl-4">
										{props?.transaction?.customer?.address}
									</span>
								</p>
								<p>
									Phone:{" "}
									<span className="font-semibold pl-4">
										{props?.transaction?.customer?.phone}
									</span>
								</p>
							</div>
						)}
					</div>
					<div>
						<p>
							Transaction Date:{" "}
							<span className="font-semibold pl-4">
								{props?.transaction?.date}
							</span>
						</p>
						<p>
							Transaction Ref:{" "}
							<span className="font-semibold pl-4">
								{props?.transaction?.id}
							</span>
						</p>
					</div>
				</div>
				<div className="w-full">
					<table className="w-full border border-1 text-left">
						<thead>
							<tr className="text-sm">
								<th style={{ width: "10%" }} className="text-left">
									Qty
								</th>
								<th style={{ width: "50%" }} className="text-left">
									Item
								</th>
								<th style={{ width: "20%" }} className="text-left">
									Price ({user?.business?.currency})
								</th>
								<th style={{ width: "20%" }} className="text-left">
									Sub-Total ({user?.business?.currency})
								</th>
							</tr>
						</thead>
						<tbody>
							{salesDetails.map((detail) => (
								<tr
									className="border border-b-1 text-sm break-words"
									key={detail?.uuid}>
									<td className="pl-4">{detail?.qty}</td>
									<td className="text-left" style={{ textWrap: "wrap" }}>
										{detail?.title}

										{detail?.serial && (
											<span>
												<br></br>
												{detail?.serial}
											</span>
										)}
									</td>
									<td>{currency(parseFloat(detail?.salePrice))}</td>
									<td>
										{currency(parseFloat(detail?.qty * detail?.salePrice))}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="flex items-center text-center justify-start">
					<div className="my-4 text-sm">
						<p>
							Total Value:{" "}
							<span className="font-semibold pl-4">
								{" "}
								{user?.business?.currency}{" "}
								{currency(props?.transaction?.total_amount)}
							</span>
						</p>
					</div>
					<div className="p-8">
						<div className="shadow-lg">
							<QRCode
								value={btoa(JSON.stringify(qrObject))}
								logoImage={logo}
								logoPaddingStyle="circle"
								qrStyle="dots"
								size={150}
							/>
						</div>
					</div>
				</div>
				<div className="justify-between w-full flex mb-4 text-lg">
					<table className="w-full">
						<tr>
							<td>
								<div className="flex pl-4">
									{user?.business?.signature && (
										<img
											alt="..."
											src={signature}
											className="align-middle"
											style={{ width: "100px", height: "50px" }}
										/>
									)}
								</div>
							</td>
							<td></td>
						</tr>
						<tr>
							<td>
								<div style={{ borderTop: "1px solid #000", width: "200px" }}>
									{" "}
									Manager{" "}
								</div>
							</td>
							<td className="w-full flex justify-end">
								<div style={{ borderTop: "1px solid #000", width: "200px" }}>
									{" "}
									Customer{" "}
								</div>
							</td>
						</tr>
					</table>
				</div>
				<div className="w-full border"></div>
				<div className="text-sm mt-4">
					<p>
						Cashier: <span>{props?.transaction?.cashier?.name}</span>
					</p>
				</div>
			</div>
		</div>
	);
};

export default InvoiceContent;
