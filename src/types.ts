export type Project = {
	id: string;
	title: string;
	description: string;
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
