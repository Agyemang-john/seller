'use client';

import { useAppSelector } from '@/redux/hooks';
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
	children: React.ReactNode;
}

export default function RequireAuth({ children }: Props) {
	const router = useRouter();
	const { isLoading, isAuthenticated } = useAppSelector(state => state.auth);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/auth/login');
		}
	}, [isLoading, isAuthenticated, router]);

	if (isLoading) {
		return (
			<div className='flex justify-center my-8'>
				<CircularProgress />
			</div>
		);
	}

	if (!isAuthenticated) return null;

	return <>{children}</>;
}
