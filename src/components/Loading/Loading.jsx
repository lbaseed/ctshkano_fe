import React from "react";
import { SpinnerDotted } from "spinners-react";

const Loading = () => {
	return (
		<div className="flex fixed top-0 left-0 z-50 h-full w-full p-4 justify-center">
			<div className="flex w-full bg-transparent justify-center rounded-lg">
				<SpinnerDotted thickness={150} />
			</div>
		</div>
	);
};

export default Loading;
