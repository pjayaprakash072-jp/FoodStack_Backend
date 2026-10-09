const sendWhatsAppMessage = async(phone,name)=>{
    const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}`+`/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url,{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify(
            {
                messaging_product:"whatsapp",
                to:`91${phone}`,
                type:"template",
                template:{
                    name:"welcome_message",
                    language:{
                        code:"en"
                    },
                    components:[
                        {
                            type:"body",
                            parameters:[
                                {
                                    type:"text",
                                    parameter_name:"user_name",
                                    text:name
                                }
                            ]
                        }
                    ]
                }
            }
        )
    })
    const data = await response.json();
    console.log(data);
    if(!response.ok){
        // throw new Error(
        //     data.error?.message || "WhatsApp message failed"
        // )
        console.log("Whatsapp API error:",data.error);
        throw new Error(
            JSON.stringify(data.error)
        )
    }
    return data;
}
module.exports =  sendWhatsAppMessage;