import React, { useState, ChangeEvent, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import './index.css';
import { useLocalStorage } from './hooks';
import { LS_KEY_PROJECTS, LS_KEY_TODOS } from './consts';
import type { Todo } from './types';

type Project = {
	id: string;
	title: string;
};

type ProjectFormProps = {
	addProject: (project: Project) => void;
};

type ProjectItemProps = {
	project: Project;
	updateProject: (project: Project) => void;
	removeProject: (id: string) => void;
};

const ProjectForm: React.FC<ProjectFormProps> = ({ addProject }) => {
	const [title, setTitle] = useState<string>('');

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		addProject({
			id: uuidv4(),
			title,
		});
		setTitle('');
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="Title"
				value={title}
				onChange={(e: ChangeEvent<HTMLInputElement>) =>
					setTitle(e.target.value)
				}
				required
			/>{' '}
			<button type="submit">Add</button>
		</form>
	);
};

const ProjectItem: React.FC<ProjectItemProps> = ({
	project,
	updateProject,
	removeProject,
}) => {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [title, setTitle] = useState<string>(project.title);

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleSave = () => {
		updateProject({
			...project,
			title,
		});
		setIsEditing(false);
	};

	const handleCancel = () => {
		setIsEditing(false);
	};

	const handleRemove = () => {
		removeProject(project.id);
	};

	return (
		<li>
			{isEditing ? (
				<div>
					<input
						value={title}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setTitle(e.target.value)
						}
					/>{' '}
					<button onClick={handleSave}>Save</button>{' '}
					<button onClick={handleCancel}>Cancel</button>
				</div>
			) : (
				<div>
					<h3>
						<Link to={`project/${project.id}`}>
							{project.title}
						</Link>
					</h3>
					<p>
						<button onClick={handleEdit}>Edit</button>{' '}
						<button onClick={handleRemove}>Remove</button>
					</p>
				</div>
			)}
		</li>
	);
};

const App: React.FC = () => {
	const [projects, setProjects] = useLocalStorage<Project[]>(
		LS_KEY_PROJECTS,
		[],
	);
	const [todos, setTodos] = useLocalStorage<Todo[]>(LS_KEY_TODOS, []);
	const exportData: Record<string, object> = {};
	exportData[LS_KEY_PROJECTS] = projects;
	exportData[LS_KEY_TODOS] = todos;

	const addProject = (project: Project) => {
		setProjects([...projects, project]);
	};

	const updateProject = (updatedProject: Project) => {
		setProjects(
			projects.map(project =>
				project.id === updatedProject.id ? updatedProject : project,
			),
		);
	};

	const removeProject = (id: string) => {
		setProjects(projects.filter(project => project.id !== id));
	};

	const onExport = () => {
		navigator.clipboard.writeText(JSON.stringify(exportData));
	};

	const onImport = () => {
		const textEl = document?.getElementById('import') as HTMLInputElement;
		if (textEl?.value) {
			const data = JSON.parse(textEl.value);
			setProjects(data[LS_KEY_PROJECTS]);
			setTodos(data[LS_KEY_TODOS]);
		}
	};

	return (
		<>
			<h1>Projects</h1>
			<ProjectForm addProject={addProject} />
			<ul>
				{projects.map(project => (
					<ProjectItem
						key={project.id}
						project={project}
						updateProject={updateProject}
						removeProject={removeProject}
					/>
				))}
			</ul>
			<h1>Export / import</h1>
			<ul className="export-import">
				<li>
					<div>{JSON.stringify(exportData)}</div>
					<br />
					<button onClick={onExport}>Copy to clipboard</button>
				</li>
				<li>
					<textarea
						id="import"
						placeholder="Paste exported JSON data here"
					></textarea>
					<br />
					<button onClick={onImport}>Import</button>
				</li>
			</ul>
		</>
	);
};

export default App;
