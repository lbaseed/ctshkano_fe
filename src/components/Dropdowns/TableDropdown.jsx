import { createRef, useState } from "react";
import { Link } from "react-router-dom";

const TableDropdown = (props) => {
	// dropdown props
	const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
	const btnDropdownRef = createRef();

	const openDropdownPopover = () => {
		setDropdownPopoverShow(true);
	};
	const closeDropdownPopover = () => {
		setDropdownPopoverShow(false);
	};

	return (
		<>
			<div className="relative">
				<a
					className="text-blueGray-500 py-1 px-3"
					href="#pablo"
					onBlur={() => closeDropdownPopover()}
					ref={btnDropdownRef}
					onClick={(e) => {
						e.preventDefault();
						dropdownPopoverShow
							? closeDropdownPopover()
							: openDropdownPopover();
					}}>
					<i className="fas fa-ellipsis-v"></i>
				</a>
				<div
					className={
						(dropdownPopoverShow ? "block " : "hidden ") +
						"absolute top-0 right-0 bg-white text-base py-2 list-none text-left rounded shadow-lg min-w-48 "
					}
					style={{ position: '' }}>
					{props.view && (
						<Link
							className={
								"text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent hover:bg-blueGray-800 text-blueGray-700"
							}
							onClick={props.view}>
							View
						</Link>
					)}
					{props.edit && (
						<Link
							href="#pablo"
							className={
								"text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
							}
							onClick={props.edit}>
							Edit
						</Link>
					)}

					{props.delete && (
						<Link
							href="#pablo"
							className={
								"text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
							}
							onClick={props.delete}>
							Delete
						</Link>
					)}
				</div>
			</div>
		</>
	);
};

export default TableDropdown;
