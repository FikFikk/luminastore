import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import Cookies from 'js-cookie';

export function useAuthGuard(redirectTo: string = '/auth/login') {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    const token = Cookies.get('token');
    
    if (!token && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);
  
  return { isAuthenticated: isAuthenticated && !!Cookies.get('token') };
}

export function useGuestGuard(redirectTo: string = '/') {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    const token = Cookies.get('token');
    
    if (token && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);
  
  return { isGuest: !isAuthenticated || !Cookies.get('token') };
}