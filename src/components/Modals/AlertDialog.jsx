import React from "react";

const AlertDialog = (props) => {
	return (
		<div
			id="myModal"
			className="fixed top-0 left-0 w-full h-full bg-gray-400  z-40 md:flex justify-center items-center overflow-y-auto">
			<div className="bg-white px-6 py-6 rounded-lg w-full md:w-8/12 mx-20">
				{props.title && (
					<div className="flex items-start justify-between pb-4 border-b rounded-t">
						<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
							{props.title}
						</h3>
					</div>
				)}
				<div className="p-6 space-y-6">{props.children}</div>
				<div className="flex items-center justify-between p-6 space-x-2 mt-4">
					{props.cancel && (
						<button
							onClick={props.cancel}
							type="button"
							className="bg-red-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150">
							Close
						</button>
					)}
					{props.confirm && (
						<button
							onClick={props.confirm}
							type="button"
							className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150">
							Proceed
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default AlertDialog;
