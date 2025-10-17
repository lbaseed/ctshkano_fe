import React from "react";

// components

export const Card = (props) => {
	return (
		<>
			<div className="flex flex-col min-w-0 break-words w-full mt-6 shadow-lg mb-6 rounded-lg bg-blueGray-100 border-0">
				<div className="rounded-t bg-white mb-0 px-6 py-6">
					<div className="text-center flex justify-between">
						<h6 className="text-blueGray-700 text-xl font-bold">
							{props.title}
						</h6>
						{props.addNew && (
							<button
								onClick={props.addNew}
								className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
								type="button">
								{props.textBtn ? props.textBtn : "Add New"}
							</button>
						)}
					</div>
				</div>
				<div className="flex-auto px-4 lg:px-10 py-10 pt-0">
					{props.children}
				</div>
			</div>
		</>
	);
};

export default Card;
