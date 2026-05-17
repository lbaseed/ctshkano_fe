import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Button, Card, Space, Typography, Alert } from "antd";
import {
	CameraOutlined,
	ReloadOutlined,
	CheckOutlined,
	CloseOutlined,
	SwapOutlined
} from "@ant-design/icons";

const { Text } = Typography;

const CameraNew = ({ onCapture, onClear }) => {
	const webcamRef = useRef(null);
	const [imgSrc, setImgSrc] = useState(null);
	const [hasPermission, setHasPermission] = useState(true);
	const [isCapturing, setIsCapturing] = useState(false);

	const [facingMode, setFacingMode] = useState("user");

	const videoConstraints = {
		width: 640,
		height: 480,
		facingMode: facingMode // 'user' for front camera, 'environment' for back camera
	};

	const capture = useCallback(() => {
		setIsCapturing(true);

		setTimeout(() => {
			const imageSrc = webcamRef.current.getScreenshot();
			if (imageSrc) {
				setImgSrc(imageSrc);

				// Convert base64 to blob
				fetch(imageSrc)
					.then((res) => res.blob())
					.then((blob) => {
						onCapture(blob);
						setIsCapturing(false);
					})
					.catch((error) => {
						console.error("Error converting image:", error);
						setIsCapturing(false);
					});
			} else {
				setIsCapturing(false);
			}
		}, 100); // Small delay to ensure smooth capture
	}, [webcamRef, onCapture]);

	const retake = useCallback(() => {
		setImgSrc(null);
		onClear();
	}, [onClear]);

	const handleUserMediaError = useCallback((error) => {
		console.error("Camera access error:", error);
		setHasPermission(false);
	}, []);

	if (!hasPermission) {
		return (
			<Card style={{ textAlign: "center", marginTop: "20px" }}>
				<Alert
					message="Camera Access Required"
					description="Please allow camera access to take photos. You may need to refresh the page and grant permission."
					type="warning"
					showIcon
					action={
						<Button
							size="small"
							type="primary"
							onClick={() => window.location.reload()}>
							Refresh Page
						</Button>
					}
				/>
			</Card>
		);
	}

	return (
		<Card
			style={{
				textAlign: "center",
				marginTop: "20px",
				borderRadius: "12px"
			}}
			bodyStyle={{ padding: "20px" }}>
			<div style={{ marginBottom: "16px" }}>
				<Text strong style={{ fontSize: "16px" }}>
					{imgSrc ? "Photo Captured" : "Take Photo"}
				</Text>
			</div>

			<div
				style={{
					display: "inline-block",
					border: "2px solid #d9d9d9",
					borderRadius: "8px",
					overflow: "hidden",
					marginBottom: "16px"
				}}>
				{imgSrc ? (
					<div>
						<img
							src={imgSrc}
							alt="Captured"
							style={{
								width: "320px",
								height: "240px",
								objectFit: "cover"
							}}
						/>
					</div>
				) : (
					<Webcam
						audio={false}
						ref={webcamRef}
						screenshotFormat="image/jpeg"
						videoConstraints={videoConstraints}
						onUserMediaError={handleUserMediaError}
						style={{
							width: "320px",
							height: "240px",
							objectFit: "cover"
						}}
					/>
				)}
			</div>

			<div>
				<Space size="middle">
					{imgSrc ? (
						<>
							<Button
								type="primary"
								icon={<CheckOutlined />}
								disabled
								style={{ borderRadius: "6px" }}>
								Photo Captured
							</Button>
							<Button
								icon={<ReloadOutlined />}
								onClick={retake}
								style={{ borderRadius: "6px" }}>
								Retake
							</Button>
						</>
					) : (
						<>
							<Button
								type="primary"
								size="large"
								icon={<CameraOutlined />}
								onClick={capture}
								loading={isCapturing}
								disabled={isCapturing}
								style={{ borderRadius: "6px" }}>
								{isCapturing ? "Capturing..." : "Capture Photo"}
							</Button>
							<Button
								icon={<SwapOutlined />}
								onClick={() =>
									setFacingMode(facingMode === "user" ? "environment" : "user")
								}
								disabled={isCapturing}
								style={{ borderRadius: "6px" }}
								title="Switch Camera">
								Flip
							</Button>
						</>
					)}
				</Space>
			</div>

			<div style={{ marginTop: "12px" }}>
				<Text type="secondary" style={{ fontSize: "12px" }}>
					{imgSrc
						? 'Click "Use Photo" to confirm or "Retake" to capture again'
						: 'Position yourself in the camera frame and click "Capture Photo"'}
				</Text>
			</div>
		</Card>
	);
};

export default CameraNew;
