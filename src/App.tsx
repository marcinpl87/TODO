import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './index.css';

type Todo = {
	id: string;
	title: string;
	isDone: boolean;
	description: string;
	estimatedTime: number;
};

type TodoFormProps = {
	addTodo: (todo: Todo) => void;
};

type TodoItemProps = {
	todo: Todo;
	updateTodo: (todo: Todo) => void;
	removeTodo: (id: string) => void;
};

const useLocalStorage = <T,>(key: string, initialValue: T) => {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(error);
			return initialValue;
		}
	});

	const setValue = (value: T | ((val: T) => T)) => {
		try {
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);
			window.localStorage.setItem(key, JSON.stringify(valueToStore));
		} catch (error) {
			console.error(error);
		}
	};

	return [storedValue, setValue] as const;
};

const Todo: React.FC = () => {
	const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);

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
		<div>
			<h1>TODO</h1>
			<TodoForm addTodo={addTodo} />
			<ul>
				{todos
					.filter(t => !t.isDone)
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
					.filter(t => t.isDone)
					.map(todo => (
						<TodoItem
							key={todo.id}
							todo={todo}
							updateTodo={updateTodo}
							removeTodo={removeTodo}
						/>
					))}
			</ul>
		</div>
	);
};

const TodoForm: React.FC<TodoFormProps> = ({ addTodo }) => {
	const [title, setTitle] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [estimatedTime, setEstimatedTime] = useState<number>(0);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		addTodo({
			id: uuidv4(),
			title,
			description,
			estimatedTime,
			isDone: false,
		});
		setTitle('');
		setDescription('');
		setEstimatedTime(0);
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
			<input
				type="text"
				placeholder="Description"
				value={description}
				onChange={(e: ChangeEvent<HTMLInputElement>) =>
					setDescription(e.target.value)
				}
			/>{' '}
			<input
				type="number"
				placeholder="Time (is seconds)"
				value={estimatedTime || ''}
				onChange={(e: ChangeEvent<HTMLInputElement>) =>
					setEstimatedTime(Number(e.target.value))
				}
				required
			/>{' '}
			<button type="submit">Add</button>
		</form>
	);
};

const TodoItem: React.FC<TodoItemProps> = ({
	todo,
	updateTodo,
	removeTodo,
}) => {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [title, setTitle] = useState<string>(todo.title);
	const [description, setDescription] = useState<string>(todo.description);
	const [estimatedTime, setEstimatedTime] = useState<number>(
		todo.estimatedTime,
	);

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
		setIsEditing(false);
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
					<input
						value={description}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setDescription(e.target.value)
						}
					/>{' '}
					<input
						value={estimatedTime}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setEstimatedTime(Number(e.target.value))
						}
					/>{' '}
					<button onClick={handleSave}>Save</button>
				</div>
			) : (
				<div>
					<h3>{todo.title}</h3>
					<p>{todo.description}</p>
					<p>
						{todo.estimatedTime > 60 ? (
							<>{Math.round(todo.estimatedTime / 60)}m</>
						) : (
							<>{todo.estimatedTime}s</>
						)}
					</p>
					<button onClick={toggleDone}>
						{todo.isDone ? 'Un-done' : 'DONE!'}
					</button>{' '}
					<button onClick={handleEdit}>Edit</button>{' '}
					<button onClick={handleRemove}>Remove</button>
				</div>
			)}
		</li>
	);
};

const Timer = () => {
	// We need ref in this, because we are dealing
	// with JS setInterval to keep track of it and
	// stop it when needed
	const Ref = useRef<number | null>(null);

	// The state for our timer
	const [timer, setTimer] = useState('00:00:00');

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

	const startTimer = (e: Date) => {
		let { total, hours, minutes, seconds } = getTimeRemaining(e);
		if (total >= 0) {
			// update the timer
			// check if less than 10 then we need to
			// add '0' at the beginning of the variable
			setTimer(
				(hours > 9 ? hours : '0' + hours) +
					':' +
					(minutes > 9 ? minutes : '0' + minutes) +
					':' +
					(seconds > 9 ? seconds : '0' + seconds),
			);
		} else {
			alert('Time is over!');
			clearInterval(Ref?.current || undefined);
		}
	};

	const clearTimer = (e: Date) => {
		// If you adjust it you should also need to
		// adjust the Endtime formula we are about
		// to code next
		setTimer('00:00:10');

		// If you try to remove this line the
		// updating of timer Variable will be
		// after 1000ms or 1sec
		if (Ref.current) clearInterval(Ref.current);
		const id = setInterval(() => {
			startTimer(e);
		}, 1000);
		Ref.current = id;
	};

	const getDeadTime = () => {
		let deadline = new Date();

		// This is where you need to adjust if
		// you entend to add more time
		deadline.setSeconds(deadline.getSeconds() + 10);
		return deadline;
	};

	// We can use useEffect so that when the component
	// mount the timer will start as soon as possible

	// We put empty array to act as componentDid
	// mount only
	useEffect(() => {
		clearTimer(getDeadTime());
	}, []);

	// Another way to call the clearTimer() to start
	// the countdown is via action event from the
	// button first we create function to be called
	// by the button
	const onClickReset = () => {
		clearTimer(getDeadTime());
	};

	return (
		<>
			<h2>{timer}</h2>
			<button onClick={onClickReset}>Reset</button>
		</>
	);
};

function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<Todo />
			<Timer />
			<div className="card">
				<button onClick={() => setCount(count => count + 1)}>
					count is {count}
				</button>
			</div>
		</>
	);
}

export default App;
