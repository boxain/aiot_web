import axios, { AxiosError } from "axios";


const loginAPI = async (userName: string, password: string) => {
    const requestURI = `${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}/api/user/login`;

    const formData = new FormData();
    formData.append("username", userName);
    formData.append("password", password);
    
    const headers = {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }

    const response = await axios.post(requestURI, formData, headers);
    return response.data;
}

export default loginAPI