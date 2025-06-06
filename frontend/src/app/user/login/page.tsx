"use client"

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import loginAPI from '@/api/user/login';

export default function Login() {
    const { login, user } = useAuth();
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [isSignIn, setIsSignIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if(user){
            router.push("/device")
        }
    }, [])

    const handleSubmit = async () => {
        
        if(isSignIn)return;
        try{

            setIsSignIn(true);
            const result = await loginAPI(userName, password);
            if(result.success){
                const { access_token, token_type, data } = result;
                const { user_id, username, email } = data;
                login(user_id, username, email, access_token, token_type);
            }else{
                alert("Login failed");
            }

        }finally{
            setIsSignIn(false);
        }          
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Head>
            <title>Login</title>
            <meta name="description" content="Login page" />
            <link rel="icon" href="/favicon.ico" /> {/* 根據您的專案調整 */}
            </Head>

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
            
                {/* Title */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign In
                    </h2>
                </div>
                
                {/* Login Form */}
                <div className="mt-8 space-y-6">

                    {/* Username & Password Input */}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="user-name" className="sr-only" />
                            <input
                                id="user-name"
                                name="user name"
                                type="text"
                                autoComplete="user name"
                                required
                                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="user name"
                                value={userName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => { setUserName(e.target.value) }}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="password"
                                value={password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value) }}
                            />
                        </div>
                    </div>
                
                    {/* Remeber me & Forgot password */}
                    <div className="flex items-center justify-between">
                    {/* <div className="flex items-center">

                        <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remeber me
                        </label>
                    </div> */}

                    {/* <div className="text-sm">
                        <Link href="/forgot-password">
                        <a className="font-medium text-blue-600 hover:text-blue-500">
                            Forgot password？
                        </a>
                        </Link>
                    </div> */}

                    </div>

                    {/* Submit Buttom */}
                    <div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md cursor-pointer text-white bg-[#005EA2] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </div>

                </div>
                
                <div className="text-center text-sm text-gray-600">
                    Not have account？{' '}
                    <Link href="/user/register" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign Up
                    </Link>
                </div>

            </div>
        </div>
    );
}