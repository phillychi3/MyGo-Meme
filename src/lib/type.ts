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

export interface ImageData {
  title: string;
	imagepath: string;
  itemdata: ItemData;
}

export interface ImageList {
	[key: string]: ImageData;
}

export const emotionList = {
	normal: '一般',
	concerned: '關心',
	happy: '開心',
	anger: '生氣',
	sad: '難過',
	question: '疑問',
	surprise: '驚訝',
	disgusting: '厭惡'
};
