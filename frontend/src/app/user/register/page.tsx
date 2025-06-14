'use client'

import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import registerAPI from '@/api/user/register';
import { processApiError } from '@/lib/error'; 


export default function Register() {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);


    const handleSubmit = async () => {
        
        if(isSignUp)return;
        try{

            setIsSignUp(true);
            const result = await registerAPI(userName, email, password);
            toast.success("Registration successful! Redirecting to login...");
            router.push("/user/login");

        }catch(error){
            const processedError = processApiError(error);
            const displayMessage = `[${processedError.code}] ${processedError.message}`;
            toast.error(displayMessage);

            if (processedError.details) {
                console.error("API Error Details:", processedError.details);
            } else {
                console.error("Caught Error:", error);
            }

        }finally{
            setIsSignUp(false);
        }          
    };

    const isPasswordSame = () => {
        return password === confirmPassword
    }


    return (
        <div className="w-full h-full flex items-center justify-center">
            <Head>
                <title>Register</title>
                <meta name="description" content="Register page" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
            
                {/* Title */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign Up
                    </h2>
                </div>

                {/* Submit Form */}
                <div className="mt-8 space-y-6">
                    
                    {/* Input */}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only" />
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="user name"
                                value={userName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => { setUserName(e.target.value) }}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only"/>
                            <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            placeholder="email"
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value) }}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only"/>
                            <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            placeholder="password"
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value) }}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="sr-only"/>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:z-10 sm:text-sm ${isPasswordSame() ? "focus:border-blue-500":"focus:border-red-500"}`}
                                placeholder="confirm password"
                                value={confirmPassword}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => { setConfirmPassword(e.target.value) }}
                            />
                        </div>
                    </div>

                    {/* Submit Buttom */}   
                    <div>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md cursor-pointer text-white bg-[#005EA2] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            // disabled={isPasswordSame}
                        >
                            Submit
                        </button>
                    </div>

                </div>

                {/* Redirect */}
                <div className="text-center text-sm text-gray-600">
                Have account？{' '}
                <Link href="/user/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign In
                </Link>
                </div>

            </div>
        </div>
    );
}