"use client";

import { toast } from "react-toastify";

type Props = {
  message: string;
};

const FlashToast = ({ message }: Props) => {
  return toast.error(message);
};

export default FlashToast;