import React from "react";
import { useCookies } from "react-cookie";
import { QRCode } from "react-qrcode-logo";

const OrderReceipt = (props) => {
	const [cookies, setCookie, removeCookie] = useCookies([
		import.meta.env.VITE_COOKIE_NAME
	]);

	const user = cookies?.luis?.user;

	const logo = import.meta.env.VITE_API_DATA + user?.business?.logo;
	const signature = import.meta.env.VITE_API_DATA + user?.business?.signature;

	const currency = (value) => {
		return value && value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&, ");
	};

	const orderDetails = JSON.parse(props?.order?.order_details);

	const qrObject = {
		Supplier: props?.order?.supplier?.fullname,
		date:
			props?.status === "SUPPLIED"
				? props.order.date_supplied
				: props.order.date_ordered,
		totalValue:
			props.status === "SUPPLIED"
				? currency(props?.order?.total_value_supplied)
				: currency(props?.order?.total_value_ordered),
		Ref: props?.order?.uuid,
		order_id: props?.order?.id
	};

	return (
		<div className="flex w-full item-start justify-between">
			<div className="flex-col text-center w-full">
				<div className="md:flex w-full mb-4">
					<div className="mr-4 mb-0">
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
					<div className="text-center md:text-left font-semibold text-xl">
						<p>{user?.business?.name}</p>
						<p className="text-sm">{user?.business?.address}</p>
						<p className="text-sm">{user?.business?.email}</p>
						<p className="text-sm">{user?.business?.phone}</p>
					</div>
				</div>
				<div className="w-full justify-between mb-4 text-left text-lg">
					<div>
						{props?.order?.supplier && (
							<div>
								<p>
									Full Name:{" "}
									<span className="font-semibold pl-4">
										{props?.order?.supplier?.fullname}
									</span>
								</p>
								<p>
									Address:{" "}
									<span className="font-semibold pl-4">
										{props?.order?.supplier?.address}
									</span>
								</p>
								<p>
									Phone:{" "}
									<span className="font-semibold pl-4">
										{props?.order?.supplier?.phone}
									</span>
								</p>
							</div>
						)}
					</div>
					<div>
						<p>
							Transaction Date:{" "}
							<span className="font-semibold pl-4">
								{props?.order?.status === "SUPPLIED"
									? props?.order?.date_supplied
									: props?.order?.date_ordered}
							</span>
						</p>
						<p>
							Order Status:{" "}
							<span className="font-semibold pl-4">{props?.order?.status}</span>
						</p>
						<p>
							Transaction Ref:{" "}
							<span className="font-semibold pl-4">{props?.order?.id}</span>
						</p>
					</div>
				</div>
				<div className="w-full">
					<table className="w-full border border-1 text-left p-2">
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
							{orderDetails.map((detail) => (
								<tr
									className="border border-b-1 text-sm break-words"
									key={detail?.uuid}>
									<td className="pl-4">{detail?.qty}</td>
									<td className="text-left" style={{ textWrap: "wrap" }}>
										{detail?.title}
									</td>
									<td>{currency(detail?.cost_price)}</td>
									<td>{currency(detail?.qty * detail?.cost_price)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div>
					Additional Comment: <span>{props?.order?.comment}</span>
				</div>
				<div className="flex items-center text-center justify-start">
					<div className="my-4 text-sm">
						<p>
							Total Order{" "}
							<span className="font-semibold pl-4">
								{user?.business?.currency}{" "}
								{props.status === "SUPPLIED"
									? currency(props?.order?.total_value_supplied)
									: currency(props?.order?.total_value_ordered)}
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
				<div className="text-sm">
					<p>
						Cashier: <span>{props?.order?.user?.name}</span>
					</p>
				</div>
			</div>
		</div>
	);
};

export default OrderReceipt;
