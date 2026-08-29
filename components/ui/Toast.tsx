"use client";

import { ToastContainer, ToastPosition } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastProps = {
  position?: ToastPosition;
};

const Toast = ({ position = "top-right" }: ToastProps) => {
  return <ToastContainer position={position} />;
};
export default Toast;