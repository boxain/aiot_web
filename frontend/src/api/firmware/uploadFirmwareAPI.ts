import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const uploadFirmwaresAPI = async (file: File, name: string, description: string) => {
    try{

        const requestURI = `http://${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/firmware`;
        const access_token = Cookies.get("access_token");
        const token_type = Cookies.get("token_type");
        
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("file", file);

        const headers = {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `${token_type} ${access_token}`
            }
        }

        const response = await axios.post(requestURI, formData, headers);
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

export default uploadFirmwaresAPI