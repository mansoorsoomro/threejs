import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

// Fallback for older TypeScript versions if withTypes is not available
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector = <TSelected = unknown>(selector: (state: RootState) => TSelected) => useSelector<RootState, TSelected>(selector);
// export const useAppStore = () => useStore<AppStore>();

