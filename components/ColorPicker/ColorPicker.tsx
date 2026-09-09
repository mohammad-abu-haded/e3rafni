import { ColorPicker } from "antd";
import { Dispatch, SetStateAction } from "react";

interface IProps {
  color: string;
  setColor: Dispatch<SetStateAction<string>>;
}
const ColorPickerC = ({ color, setColor }: IProps) => {
  return (
    <ColorPicker
      value={color}
      onChange={(color) => setColor(color.toHexString())}
      size="large"
      styles={{
        root: {
          width: 120,
        },
      }}
      showText
    />
  );
};

export default ColorPickerC;
