import React, {
	useRef,
	useState,
	FormEvent,
	useReducer,
	forwardRef,
	ChangeEvent,
	useImperativeHandle,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import TimeAgo from 'react-timeago';
import { Link, useParams } from 'react-router-dom';
import './index.css';
import { useLocalStorage } from './hooks';
import { LS_KEY_PROJECTS, LS_KEY_TODOS } from './consts';
import type { Todo } from './types';

type TodoFormProps = {
	addTodo: (todo: Todo) => void;
};

type TodoItemProps = {
	todo: Todo;
	updateTodo: (todo: Todo) => void;
	removeTodo: (id: string) => void;
};

const Todos: React.FC = () => {
	const { projectId } = useParams();

	const [todos, setTodos] = useLocalStorage<Todo[]>(LS_KEY_TODOS, []);
	const [projects] = useLocalStorage<Todo[]>(LS_KEY_PROJECTS, []);

	const addTodo = (todo: Todo) => {
		setTodos([...todos, todo]);
	};

	const updateTodo = (updatedTodo: Todo) => {
		setTodos(
			todos.map(todo =>
				todo.id === updatedTodo.id ? updatedTodo : todo,
			),
		);
	};

	const removeTodo = (id: string) => {
		setTodos(todos.filter(todo => todo.id !== id));
	};

	return (
		<>
			{projectId && (
				<>
					<h1>
						<Link to="/">🗂️</Link>
					</h1>
					<h1>
						{projects.filter(p => p.id === projectId)[0]?.title}
					</h1>
					<TodoForm addTodo={addTodo} />
					<ul>
						{todos
							.filter(t => t.projectId === projectId && !t.isDone)
							.sort(
								(a, b) =>
									b.creationTimestamp ||
									0 - a.creationTimestamp ||
									0,
							)
							.map(todo => (
								<TodoItem
									key={todo.id}
									todo={todo}
									updateTodo={updateTodo}
									removeTodo={removeTodo}
								/>
							))}
					</ul>
					<h1>DONE</h1>
					<ul>
						{todos
							.filter(t => t.projectId === projectId && t.isDone)
							.sort(
								(a, b) =>
									b.creationTimestamp ||
									0 - a.creationTimestamp ||
									0,
							)
							.map(todo => (
								<TodoItem
									key={todo.id}
									todo={todo}
									updateTodo={updateTodo}
									removeTodo={removeTodo}
								/>
							))}
					</ul>
				</>
			)}
		</>
	);
};

const TodoForm: React.FC<TodoFormProps> = ({ addTodo }) => {
	const { projectId } = useParams();
	const [isOpened, setIsOpened] = useState<boolean>(false);
	const [title, setTitle] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [estimatedTime, setEstimatedTime] = useState<number>(0);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		addTodo({
			id: uuidv4(),
			projectId: projectId || '',
			title,
			description,
			estimatedTime,
			isDone: false,
			creationTimestamp: Date.now(),
		});
		setTitle('');
		setDescription('');
		setEstimatedTime(0);
		setIsOpened(false);
	};

	return (
		<>
			{isOpened ? (
				<form onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="Title"
						value={title}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setTitle(e.target.value)
						}
						required
					/>
					<br />
					<textarea
						placeholder="Description"
						value={description}
						onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
							setDescription(e.target.value)
						}
					/>
					<br />
					<input
						type="number"
						placeholder="Time (is seconds)"
						value={estimatedTime || ''}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setEstimatedTime(Number(e.target.value))
						}
						required
					/>
					<br />
					<button type="submit">Save</button>{' '}
					<button onClick={() => setIsOpened(false)}>Cancel</button>
				</form>
			) : (
				<button onClick={() => setIsOpened(true)}>New TODO</button>
			)}
		</>
	);
};

const TodoItem: React.FC<TodoItemProps> = ({
	todo,
	updateTodo,
	removeTodo,
}) => {
	const [, forceUpdate] = useReducer(x => x + 1, 0);
	const timerComponentRef = useRef(null);
	const intervalRef = useRef<number | null>(null); // because dealing with JS setInterval to keep track of it
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [title, setTitle] = useState<string>(todo.title);
	const [description, setDescription] = useState<string>(todo.description);
	const [estimatedTime, setEstimatedTime] = useState<number>(
		todo.estimatedTime,
	);

	const getDeadTime = (seconds: number) => {
		const deadline = new Date();
		deadline.setSeconds(deadline.getSeconds() + seconds);
		return deadline;
	};

	const getTimeRemaining = (e: Date) => {
		const total =
			Date.parse(e.toString()) - Date.parse(new Date().toString());
		const seconds = Math.floor((total / 1000) % 60);
		const minutes = Math.floor((total / 1000 / 60) % 60);
		const hours = Math.floor((total / 1000 / 60 / 60) % 24);
		return {
			total,
			hours,
			minutes,
			seconds,
		};
	};

	const getTimeRemainingToTimerString = (e: Date) => {
		const { total, hours, minutes, seconds } = getTimeRemaining(e);
		// check if less than 10 then we need to
		// add '0' at the beginning of the variable
		return total >= 0
			? (hours > 9 ? hours : '0' + hours) +
					':' +
					(minutes > 9 ? minutes : '0' + minutes) +
					':' +
					(seconds > 9 ? seconds : '0' + seconds)
			: '00:00:00';
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleSave = () => {
		updateTodo({
			...todo,
			title,
			description,
			estimatedTime,
		});
		if (
			timer !== getTimeRemainingToTimerString(getDeadTime(estimatedTime))
		) {
			setTimer(getTimeRemainingToTimerString(getDeadTime(estimatedTime)));
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setIsEditing(false);
	};

	const handleStart = () => {
		if (timerComponentRef.current) {
			(timerComponentRef.current as any).onClickStart();
		}
	};

	const handlePause = () => {
		if (timerComponentRef.current) {
			(timerComponentRef.current as any).onClickPause();
		}
		forceUpdate();
	};

	const handleStop = () => {
		if (timerComponentRef.current) {
			(timerComponentRef.current as any).onClickStop();
		}
	};

	const toggleDone = () => {
		updateTodo({
			...todo,
			isDone: !todo.isDone,
		});
		setIsEditing(false);
	};

	const handleRemove = () => {
		removeTodo(todo.id);
	};

	const [timer, setTimer] = useState<string>(
		getTimeRemainingToTimerString(getDeadTime(todo.estimatedTime)),
	);

	return (
		<li>
			{isEditing ? (
				<div>
					<input
						value={title}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setTitle(e.target.value)
						}
					/>
					<br />
					<textarea
						value={description}
						onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
							setDescription(e.target.value)
						}
					/>
					<br />
					<input
						value={estimatedTime}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setEstimatedTime(Number(e.target.value))
						}
					/>
					<br />
					<button onClick={handleSave}>Save</button>{' '}
					<button onClick={handleCancel}>Cancel</button>
				</div>
			) : (
				<div>
					<h3>{todo.title}</h3>
					<p>
						{!todo.isDone && (
							<>
								{!intervalRef.current ? (
									<button onClick={handleStart}>▶️</button>
								) : (
									<button onClick={handlePause}>⏸️</button>
								)}{' '}
								<button
									disabled={
										!(
											timer !==
											getTimeRemainingToTimerString(
												getDeadTime(todo.estimatedTime),
											)
										)
									}
									onClick={handleStop}
								>
									⏹️
								</button>{' '}
							</>
						)}
						<button onClick={toggleDone}>
							{todo.isDone ? '❎' : '✔️'}
						</button>{' '}
						<button onClick={handleEdit}>✏️</button>{' '}
						<button onClick={handleRemove}>🗑️</button>{' '}
						{todo.creationTimestamp && (
							<>
								(
								<TimeAgo
									date={new Date(todo.creationTimestamp)}
								/>
								)
							</>
						)}
					</p>
					{!todo.isDone && (
						<Timer
							ref={timerComponentRef}
							intervalRef={intervalRef}
							getDeadTime={getDeadTime}
							getTimeRemaining={getTimeRemaining}
							getTimeRemainingToTimerString={
								getTimeRemainingToTimerString
							}
							timer={timer}
							setTimer={setTimer}
							sec={todo.estimatedTime}
							toggleDone={toggleDone}
						/>
					)}
					<p>{todo.description}</p>
				</div>
			)}
		</li>
	);
};

const Timer = forwardRef<
	| HTMLDivElement
	| {
			onClickStart: () => void;
			onClickPause: () => void;
			onClickStop: () => void;
	  },
	{
		intervalRef: React.MutableRefObject<number | null>;
		getDeadTime: (seconds: number) => Date;
		getTimeRemaining: (e: Date) => Record<string, number>;
		getTimeRemainingToTimerString: (e: Date) => string;
		timer: string;
		setTimer: React.Dispatch<React.SetStateAction<string>>;
		sec: number;
		toggleDone: () => void;
	}
>(
	(
		{
			intervalRef,
			getDeadTime,
			getTimeRemaining,
			getTimeRemainingToTimerString,
			timer,
			setTimer,
			sec,
			toggleDone,
		},
		ref,
	) => {
		const getTimerStringToSeconds = (timeString: string) => {
			const parts = timeString.split(':');
			const hours = parseInt(parts[0], 10);
			const minutes = parseInt(parts[1], 10);
			const seconds = parseInt(parts[2], 10);
			return hours * 3600 + minutes * 60 + seconds;
		};

		const startTimer = (e: Date) => {
			const { total } = getTimeRemaining(e);
			if (total >= 0) {
				// update the timer
				setTimer(getTimeRemainingToTimerString(e));
			} else {
				if (
					confirm(
						'Time is over! Would you like to mark TODO as done?',
					)
				) {
					onClickStop();
					toggleDone();
				} else {
					onClickStop();
				}
			}
		};

		const onClickStart = () => {
			const timerDateTime = getDeadTime(
				(timer === getTimeRemainingToTimerString(getDeadTime(sec))
					? sec // if timer is not started yet (not un-paused), then use default amount of seconds
					: getTimerStringToSeconds(timer)) - 1, // -1 because we want to see timer starts immediately after click on a button
			);
			setTimer(getTimeRemainingToTimerString(timerDateTime)); // if remove this line the updating of timer Variable will be after 1000ms or 1sec
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			const id = setInterval(() => {
				startTimer(timerDateTime);
			}, 1000);
			intervalRef.current = id;
		};

		const onClickPause = () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			intervalRef.current = null;
		};

		const onClickStop = () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			intervalRef.current = null;
			setTimer(getTimeRemainingToTimerString(getDeadTime(sec)));
		};

		useImperativeHandle(ref, () => ({
			onClickStart,
			onClickPause,
			onClickStop,
		}));

		return <h2>{timer}</h2>;
	},
);

export default Todos;
