import axios, { AxiosError } from "axios";


const loginAPI = async (userName: string, password: string) => {
    try{

        const requestURI = `http://${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/user/login`;

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


    }catch(error: AxiosError){

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

export default loginAPI