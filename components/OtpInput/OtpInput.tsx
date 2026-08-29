import React, { Dispatch, SetStateAction } from "react";
import { Flex, Input } from "antd";
import type { GetProps } from "antd";

type OTPProps = GetProps<typeof Input.OTP>;

interface IProps {
  setOtp: Dispatch<SetStateAction<string>>;
}

const OtpInput: React.FC<IProps> = ({ setOtp }) => {
  const onChange: OTPProps["onChange"] = (text) => {    
    setOtp(text);
  };

  const onInput: OTPProps["onInput"] = (value) => {
    //console.log("onInput:", value);
  };

  const sharedProps: OTPProps = {
    onChange,
    onInput,
  };

  return (
    <Flex gap="medium" align="flex-start" vertical>
      <Input.OTP
        dir="ltr"
        separator={(i) => (
          <span style={{ color: "blue" }}>—</span>
        )}
        {...sharedProps}
      />
    </Flex>
  );
};

export default OtpInput;
