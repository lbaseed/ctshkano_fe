import React from "react";

const CustomModal = (props) => {
	return (
		<>
			<div className="fixed top-0 left-0 justify-center items-center flex overflow-x-hidden overflow-y-auto w-full h-full inset-0 z-40 outline-none focus:outline-none">
				<div className="relative w-full md:w-8/12 my-6 mx-auto max-w-6xl">
					{/*content*/}
					<div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
						{/*header*/}
						<div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
							<h3 className="text-2xl font-semibold">{props.title}</h3>
							<button
								className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
								onClick={props.cancel}>
								<span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
									<i className="fa fa-times" aria-hidden="true"></i>
								</span>
							</button>
						</div>
						{/*body*/}
						<div className="relative px-6 py-6 space-y-6">{props.children}</div>
						{/*footer*/}
						<div className="flex items-center justify-between px-6 py-6 border-t border-solid border-blueGray-200 rounded-b">
							{props.cancel && (
								<button
									className="bg-red-500 text-white background-transparent font-bold uppercase px-6 py-2 text-sm rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
									type="button"
									onClick={props.cancel}>
									{props.cancelText ? props.cancelText : "Close"}
								</button>
							)}
							{props.confirm && (
								<button
									className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
									type="button"
									onClick={props.confirm}>
									{props.okText ? props.okText : "Proceed"}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
		</>
	);
};

export default CustomModal;
