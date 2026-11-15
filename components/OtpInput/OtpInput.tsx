import React, { Dispatch, SetStateAction } from "react";
import { Flex, Input } from "antd";
import type { GetProps } from "antd";
import styles from "./OtpInput.module.css";

type OTPProps = GetProps<typeof Input.OTP>;

interface IProps {
  setOtp: Dispatch<SetStateAction<string>>;
}

const OtpInput: React.FC<IProps> = ({ setOtp }) => {
  const onChange: OTPProps["onChange"] = (text) => {
    setOtp(text);
  };

  return (
    <Flex gap="medium" align="flex-start" vertical>
      <Input.OTP
        className={styles["custom-otp"]}
        dir="ltr"
        autoFocus
        length={6}
        onChange={onChange}
        separator={(i) => <span style={{ color: "blue" }}>—</span>}
      />
    </Flex>
  );
};

export default OtpInput;
