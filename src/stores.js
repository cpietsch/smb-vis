import { writable } from 'svelte/store';

export const dimensions = writable({ width: 70, height: 70 });



// function createUmap() {
// 	const { subscribe, set, update } = writable([]);

// 	return {
// 		subscribe,
// 		increment: () => update(n => n + 1),
// 		decrement: () => update(n => n - 1),
// 		reset: () => set(0)
// 	};
// }