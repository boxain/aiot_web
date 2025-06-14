import axios, { AxiosError } from "axios";

const registerAPI = async (userName: string, email: string, password: string) => {
    const requestURI = `${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}/api/user/register`;

    const jsonBody = {
        name: userName,
        email: email,
        password: password
    };

    const headers = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    const response = await axios.post(requestURI, jsonBody, headers);
    return response.data;
}

export default registerAPI