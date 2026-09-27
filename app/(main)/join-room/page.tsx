"use client";

import ActionButton from "@/components/ActionButton/ActionButton";
import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { PostData } from "@/services/api.service";
import { ApiResponse } from "@/types";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const page = () => {
  const [code, setCode] = useState("");
  const handleSub = async () => {
    const result: ApiResponse<{ roomCode: string }> =
      (await PostData(`/api/rooms/${code}/join`)) || API_ERROR_RESPONSE;
    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    console.log(result.data);

    result.data &&
      redirect(`/rooms/${result.data.roomCode.toLocaleLowerCase()}`);
  };
  return (
    <div>
      <form action={handleSub}>
        <input type="text" onChange={(e) => setCode(e.currentTarget.value)} />
        <ActionButton title="Go"/>
      </form>
    </div>
  );
};

export default page;
