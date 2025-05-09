import axios, { AxiosError } from "axios";


const registerAPI = async (userName: string, email: string, password: string) => {
    try{

        const requestURI = `http://${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/user/register`;

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


    }catch(error: any){

        if(error.response){
            return error.response.data
        }else {
            return {
                success: false,
                message: error.message
            }
        }

    }
}

export default registerAPI