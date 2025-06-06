"use client"

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import verificationAPI from "@/api/user/verifyToken";
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";


interface UserType {
    id: string;
    name: string;
    email: string;
};

interface AuthContextType {
    user: UserType | null;
    isSignIn: boolean;
    setIsSignIn: React.Dispatch<React.SetStateAction<boolean>>;
    login: (id: string, name: string, email: string, access_token: string, token_type: string) => void;
    logout: () => void;
};

// Provide init value
const AuthContext = createContext<AuthContextType>({
    user: null,
    isSignIn: false,
    setIsSignIn: () => {},
    login: (id: string, name: string, email: string, access_token: string, token_type: string) => {},
    logout: () => {}
});


export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [isSignIn, setIsSignIn] = useState(false);
    const router = useRouter();

    const IsLogin = async () => {
        const access_token = Cookies.get("access_token");
        const token_type = Cookies.get("token_type");

        if (!access_token || !token_type) {
            router.push("/user/login")
        }else{
            const result = await verificationAPI(access_token, token_type);
            if(result.success){
                setUser({
                    id: result.data.user_id,
                    name: result.data.username,
                    email: result.data.email
                });
            }else{
                router.push("/user/login")
            }

        }
    }


    useEffect(() => {
        IsLogin()
    },[])


    const login = (id: string, name: string, email: string, access_token: string, token_type: string) => {
        setUser({id,name,email});
        Cookies.set("access_token", access_token);
        Cookies.set("token_type", token_type);
        router.push("/");
    }

    const logout = () => {
        setUser(null);
        Cookies.remove("access_token")
        Cookies.remove("token_type")
        router.push("/user/login")
    }

    return (
        <AuthContext.Provider value={{ user, isSignIn, setIsSignIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
};


export const useAuth = () => {
    return useContext(AuthContext);
}