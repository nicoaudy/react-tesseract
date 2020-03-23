import React, { useState, useRef } from "react";
import { createWorker, PSM } from "tesseract.js";
import "./App.css";

import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImagePreview);

function App() {
	const [ocr, setOcr] = useState("Recognizing...");
	const [percentage, setPercentage] = useState("0.00");
	const pond = useRef();

	const worker = createWorker({
		logger: m => updateProgress(m)
	});

	const doOCR = async attachment => {
		const fileType = attachment.fileType;
		if (!fileType.includes("image/")) {
			alert("This file is not an image");
			setOcr("");
			setPercentage("0.00");
			window.location.reload();
		}

		await worker.load();
		await worker.loadLanguage("eng");
		await worker.initialize("eng");
		await worker.setParameters({
			tessedit_pageseg_mode: PSM.AUTO
		});

		const {
			data: { text }
		} = await worker.recognize(attachment.file);

		await worker.terminate();

		setOcr(text);
	};

	const updateProgress = m => {
		let MAX_PERCENTAGE = 1;
		let DECIMAL_COUNT = 2;
		if (m.status === "recognizing text") {
			const result = (m.progress / MAX_PERCENTAGE) * 100;
			setPercentage(result.toFixed(DECIMAL_COUNT));
		}
	};

	return (
		<div className="App">
			<FilePond
				ref={pond}
				onaddfile={(err, attachment) => {
					doOCR(attachment);
				}}
				onremovefile={() => {
					setOcr("");
					setPercentage("0.00");
				}}
			></FilePond>
			<p>{ocr}</p>
			<p>{`${percentage} %`}</p>
		</div>
	);
}

export default App;
