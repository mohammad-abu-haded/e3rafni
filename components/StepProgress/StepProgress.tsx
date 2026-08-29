import React from "react";
import { Flex, Steps } from "antd";
import type { StepsProps } from "antd";

interface StepProgressProps {
  contents: string[];
  current: number;
}
const StepProgress: React.FC<StepProgressProps> = ({ contents, current }) => {
  const items = contents.map((content, index) => ({
    content,
  }));
  const sharedProps: StepsProps = {
    type: "dot",
    current,
    items,
  };
  return (
    <Flex vertical gap="medium">
      <Steps {...sharedProps} />
    </Flex>
  );
};

export default StepProgress;
