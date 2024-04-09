import pkg from "sib-api-v3-sdk";
import { config } from "dotenv";
const { TransactionalEmailsApi, ApiClient } = pkg;

config();

const client = ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new TransactionalEmailsApi();

export const sendEmail = (mail, name) => {
  const sender = {
    email: process.env.MAIL_SENDER,
  };
  const receivers = [
    {
      email: mail,
    },
  ];
  tranEmailApi
    .sendTransacEmail({
      sender,
      to: receivers,
      subject: "Welcome to DateConnect",
      textContent: `
      Dear ${name},

      Welcome to Onboard!!: 
      DateConnect is a versatile dating app that caters to a wide range of user needs, from casual connections, to serious dating 
      and marriage, We prioritize authenticity through various Know Your Customer levels, ensuring a secure and genuine environment for all Users.
      
      Thank you for choosing our services.
      
      Best regards,
      Admin at DateConnect`,
    })
    .then(console.log)
    .catch(console.log);
};
