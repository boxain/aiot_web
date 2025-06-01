import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const deleteModelsAPI = async (model_id: string) => {
    try{

        const requestURI = `http://${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/model/${model_id}`;
        const access_token = Cookies.get("access_token");
        const token_type = Cookies.get("token_type");
        
        const headers = {
            headers: {
                "Authorization": `${token_type} ${access_token}`
            }
        }

        const response = await axios.delete(requestURI, headers);
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

export default deleteModelsAPI