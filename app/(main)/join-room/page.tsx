'use client';

import { API_ERROR_RESPONSE } from "@/constant/api.constants";
import { PostData } from "@/services/api.service";
import { ApiResponse } from "@/types";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const page = () => {
    const [code, setCode] = useState('');
    const handleSub = async () => {
        const result: ApiResponse<{ roomCode: string }> = await PostData<{ roomCode: string }>('/api/rooms/join', { roomCode: code }) || API_ERROR_RESPONSE;
        if (!result.success) {
            toast.error(result.message);
            return;
        }

        toast.success(result.message);
        console.log(result.data);

        result.data && redirect(`/rooms/${result.data.roomCode.toLocaleLowerCase()}`);
    }
    return (
        <div>
            <input type="text" onChange={(e) => setCode(e.currentTarget.value)} />
            <button onClick={() => handleSub()}>Go</button>
        </div>
    )
}

export default page