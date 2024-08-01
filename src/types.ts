export type Project = {
	id: string;
	title: string;
	description: string;
	creationTimestamp: number;
};

export type Todo = {
	id: string;
	date: Date | null;
	title: string;
	isDone: boolean;
	projectId: string;
	description: string;
	estimatedTime: number;
	doneTimestamp: number;
	creationTimestamp: number;
};
