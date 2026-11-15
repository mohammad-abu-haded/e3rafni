import ActionButton from "@/components/ActionButton/ActionButton";
import ProfileImageUploader from "@/components/ProfileImageUploader/ProfileImageUploader";
import { ApiResponse } from "@/types";
import { UploadFile } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import styles from "../signup.module.css";

const PhotoStep = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const router = useRouter();

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      toast.error("يرجى اختيار صورة");
      return;
    }

    const file = fileList[0]?.originFileObj;
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
      });

      if (!response) {
        toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
        return;
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        router.replace("/");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
      console.error("Error fetching data: ", error);
    }
  };

  return (
    <div className={styles["step-panel"]}>
      <h2 className={styles["step-title"]}>أضف صورتك الشخصية</h2>

      <p className={styles["step-description"]}>
        اختر صورة تساعد أصدقاءك على التعرّف عليك
      </p>

      <form className={styles["photo-form"]} action={handleSubmit}>
        <div className={styles["upload-box"]}>
          <ProfileImageUploader fileList={fileList} setFileList={setFileList} />
        </div>

        <div className={styles["photo-actions"]}>
          <ActionButton
            title="حفظ ومتابعة"
            className={`btn btn-primary ${styles["submit-button"]}`}
          />
          <button
            type="button"
            className={`btn btn-muted ${styles["skip-button"]}`}
            onClick={() => router.replace("/")}
          >
            تخطي
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhotoStep;
