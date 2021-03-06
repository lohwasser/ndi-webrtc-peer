export interface PreviewConfiguration {
	name?: string; // auto-creating from main ndi name if undefined
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

type Codecs = 'vp8' | 'vp9' | 'h264' | 'h265';

export interface DecoderConfiguration {
	hardware: 'none' | 'vaapi';
	software?: Codecs[]; // forced software codecs (not supported by hardware)
}

export interface EncoderConfiguration {
	hardware: 'none' | 'vaapi' | 'mfx' | 'videotoolbox';
	software?: Codecs[]; // forced software codecs (not supported by hardware)
	disableH264HighProfile?: boolean;
}

export interface NDIPeerConfiguration extends RTCConfiguration {
	ndi?: NDIConfiguration;
	preview?: PreviewConfiguration;
	cpuAdaptation?: boolean;
	useNonDefaultRoutes?: boolean;
	decoder?: DecoderConfiguration;
	encoder?: EncoderConfiguration;
}
