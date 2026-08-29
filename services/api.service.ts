import { toast } from "react-toastify";

const PostData = async <T>(uri: string, data: T) => {
  try {
    const response = await fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response) {
      toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
      return;
    }

    return response.json();
  } catch (error) {
    toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
    console.error("Error fetching data: ", error);
  }
};

const GetData = async (uri: string) => {
  try {
    const response = await fetch(uri, { method: "GET" });

    if (!response) {
      toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
      return;
    }

    return response.json();
  } catch (error) {
    toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
    console.error("Error fetching data: ", error);
  }
};

export { PostData, GetData };
