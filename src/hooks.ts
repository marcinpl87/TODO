export const useLocalStorage = <T>(key: string, forceUpdate: () => void) => {
	const getStoredArr = (): T => {
		const storedData = window.localStorage.getItem(key);
		return storedData ? JSON.parse(storedData) || [] : [];
	};
	const setStoredArr = (data: T): void => {
		window.localStorage.setItem(key, JSON.stringify(data));
		forceUpdate();
	};

	return [getStoredArr, setStoredArr] as const;
};
