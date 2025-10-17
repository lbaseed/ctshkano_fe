import React from "react";

const TextField = () => {
	return (
		<div className="relative w-full mb-3">
			{props.label && (
				<label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
					{props.label}
				</label>
			)}
			<input
				type={props.type ? props.type : "text"}
				className={
					"border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150" +
					props.className
				}
				placeholder={props.placeholder ? props.placeholder : "abc@xyz.com"}
				value={props.value}
				onChange={props.onChange}
			/>
		</div>
	);
};

export default TextField;
