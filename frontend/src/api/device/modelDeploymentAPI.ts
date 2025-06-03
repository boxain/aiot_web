import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const modelDeploymentAPI = async (device_ids: string[], model_id: string) => {
    try{

        const requestURI = `${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}/api/device/model/deployment`;
        const access_token = Cookies.get("access_token");
        const token_type = Cookies.get("token_type");
        
        const headers = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token_type} ${access_token}`
            }
        }

        const requestBody = { 
            device_id: device_ids[0],
            model_id: model_id
        }     

        const response = await axios.post(requestURI, requestBody, headers);
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

export default modelDeploymentAPI