import React from "react";

const SideBarItem = (props) => {
	return (
		<li className="items-center">
			<Link
				className="text-blueGray-700 hover:text-blueGray-500 text-xs uppercase py-3 font-bold block"
				to={props.link}>
				{props.icon} {props.title}
			</Link>
		</li>
	);
};

export default SideBarItem;
