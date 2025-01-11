export interface ItemData {
	frame: number;
	time: string;
	text: string;
	emotion: string;
	objects: string[];
	frame_filename: string;
}
export interface VideoInfo {
	title: string;
	url: string;
	file: string;
  image: string;
}

export interface VideoList {
	[key: string]: VideoInfo;
}
