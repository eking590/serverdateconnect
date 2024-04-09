import otpGenerator from "otp-generator";

const otp = () => {
  const otpCode = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
    random: true, 
  });
  return otpCode;
};

export const generatedOtp = otp();