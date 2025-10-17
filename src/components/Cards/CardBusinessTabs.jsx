import { useMutation } from "@apollo/client";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { CHANGE_PASSWORD } from "../../gql/mutations/mutations";
import { LOADING } from "../../reducer/reducer-types";
import context from "../../context/context";

const CardBusinessTabs = ({ business }) => {
	const [openTab, setOpenTab] = React.useState(1);
	const { state, dispatch } = useContext(context);

	return (
		<>
			<div className="flex flex-wrap">
				<div className="w-full">
					<ul
						className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row"
						role="tablist">
						<li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
							<a
								className={
									"text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
									(openTab === 1
										? "text-white bg-emerald-500"
										: "text-emerald-600 bg-white")
								}
								onClick={(e) => {
									e.preventDefault();
									setOpenTab(1);
								}}
								data-toggle="tab"
								href="#link1"
								role="tablist">
								<i className="fas fa-space-shuttle text-base mr-1"></i>
								Business Profile
							</a>
						</li>
						<li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
							<a
								className={
									"text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
									(openTab === 2
										? "text-white bg-emerald-500"
										: "text-emerald-600 bg-white")
								}
								onClick={(e) => {
									e.preventDefault();
									setOpenTab(2);
								}}
								data-toggle="tab"
								href="#link2"
								role="tablist">
								<i className="fas fa-key text-base mr-1"></i>
								Subscription
							</a>
						</li>
						<li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
							<a
								className={
									"text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
									(openTab === 3
										? "text-white bg-emerald-500"
										: "text-emerald-600 bg-white")
								}
								onClick={(e) => {
									e.preventDefault();
									setOpenTab(3);
								}}
								data-toggle="tab"
								href="#link2"
								role="tablist">
								<i className="fa fa-user text-base mr-1"></i>
								Wallet
							</a>
						</li>
					</ul>
					<div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6">
						<div className="px-4 py-5 flex-auto">
							<div className="tab-content tab-space">
								<div className={openTab === 1 ? "block" : "hidden"} id="link1">
									<div className="text-center">
										<h3 className="text-4xl font-semibold leading-norma text-blueGray-700 mb-2">
											<i className="fas fa-briefcase mr-2 text-4xl text-blueGray-400"></i>
											{business?.name}
										</h3>
										<div className="text-sm leading-normal mt-2 mb-2 text-blueGray-400 font-semi-bold">
											<i className="fas fa-envelope mr-2 text-lg text-blueGray-400"></i>{" "}
											{business?.email}
										</div>
										<div className="mb-2 text-blueGray-600 mt-2">
											<i className="fas fa-phone mr-2 text-lg text-blueGray-400"></i>
											{business?.phone}
										</div>
										<div className="mb-2 text-blueGray-600">
											<i className="fas fa-university mr-2 text-lg text-blueGray-400"></i>
											{business?.address}
										</div>
									</div>
								</div>
								<div className={openTab === 2 ? "block" : "hidden"} id="link2">
									<div className="text-center">subscriptions list</div>
								</div>
								<div className={openTab === 3 ? "block" : "hidden"} id="link2">
									<div className="block overflow-x-auto w-full ">Wallet</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default CardBusinessTabs;
