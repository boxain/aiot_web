import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";


const verificationAPI = async (access_token: string, token_type: string) => {
    try{

        const requestURI = `http://${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/user/verification`;
        
        const headers = {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `${token_type} ${access_token}`
            }
        }

        const response = await axios.get(requestURI, headers);
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

export default verificationAPI