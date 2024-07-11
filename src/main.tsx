import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import App from './App';
import Project from './Project';

const router = createHashRouter([
	{
		path: '/',
		element: <App />,
	},
	{
		path: 'project/:projectId',
		element: <Project />,
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
);
