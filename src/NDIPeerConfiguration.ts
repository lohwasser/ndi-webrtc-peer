export interface PreviewConfiguration {
	videoUrl?: string;
	audioUrl?: string;
	videoOptions?: string[];
	audioOptions?: string[];
	width?: number;
	height?: number;
	outputMode?: 'default' | 'square'; // not compatible with vertical
	separateNDISource?: boolean;
}

export interface NDIConfiguration {
	name: string;
	width?: number;
	height?: number;
	frameRate?: number;
	persistent?: boolean;
	outputMode?: 'default' | 'vertical' | 'square';
}

export interface NDIPeerConfiguration extends RTCConfiguration {
	ndi: NDIConfiguration;
	preview?: PreviewConfiguration;
	cpuAdaptation?: boolean;
}
