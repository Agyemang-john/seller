'use client';

import { useAppSelector } from '@/redux/hooks';
import { CircularProgress } from '@mui/material';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
	children: React.ReactNode;
}

export default function RequireAuth({ children }: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { isLoading, isAuthenticated } = useAppSelector(state => state.auth);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			const qs = searchParams.toString();
			const fullPath = qs ? `${pathname}?${qs}` : pathname;
			router.push(`/auth/login?redirect=${encodeURIComponent(fullPath)}`);
		}
	}, [isLoading, isAuthenticated, router, pathname, searchParams]);

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
