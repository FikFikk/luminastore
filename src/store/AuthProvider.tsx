"use client";

import React, { useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchUserData } from '@/store/slices/authSlice';
import Cookies from 'js-cookie';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    const token = Cookies.get("token");
    
    // Jika ada token tapi belum ada user data, fetch user data
    if (token && !user && !isLoading) {
      dispatch(fetchUserData());
    }
    
    // Jika tidak ada token, pastikan state bersih
    if (!token && isAuthenticated) {
      // dispatch(clearUser());
    }
  }, [dispatch, user, isAuthenticated, isLoading]);

  return <>{children}</>;
}