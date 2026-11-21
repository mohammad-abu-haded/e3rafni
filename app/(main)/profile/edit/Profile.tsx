"use client";

import ActionButton from "@/components/ActionButton/ActionButton";
import ProfileImageUploader from "@/components/ProfileImageUploader/ProfileImageUploader";
import { ApiResponse, ProfileUser } from "@/types";
import { UploadFile } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./profile.module.css";
import { GetData, PatchData } from "@/services/api.service";
import { profilePlaceholderBase64 } from "@/constant/profilePlaceholder";
import { notifyProfileUpdated } from "@/utils/profile-events";

const Profile = () => {
  const router = useRouter();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result: ApiResponse = await GetData("/api/user/profile");

        if (!result?.success || !result.data) {
          toast.error(result?.message || "تعذر تحميل بيانات الحساب");
          return;
        }

        const userData: ProfileUser = result.data;

        setUser(userData);
        setName(userData.name);

        if (userData.profileImage) {
          setFileList([
            {
              uid: "-1",
              name: "profile-image",
              status: "done",
              url: userData.profileImage,
            },
          ]);
        }
      } catch (error) {
        toast.error("حدث خطأ أثناء تحميل بيانات الحساب");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveName = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("يرجى إدخال الاسم");
      return;
    }

    if (trimmedName.length > 50) {
      toast.error("الاسم يجب ألا يتجاوز 50 حرفاً");
      return;
    }

    if (trimmedName === user?.name) {
      toast.info("لم تقم بإجراء أي تعديل على الاسم");
      return;
    }

    setIsSavingName(true);

    try {
      const result: ApiResponse = await PatchData("/api/user/profile", {
        name: trimmedName,
      });

      if (result?.success) {
        setUser((prev) => (prev ? { ...prev, name: trimmedName } : prev));

        setName(trimmedName);
        notifyProfileUpdated();
        toast.success("تم تحديث الاسم بنجاح");
      } else {
        toast.error(result?.message || "فشل تحديث الاسم");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الاسم");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveImage = async () => {
    const file = fileList[0]?.originFileObj;

    if (!file) {
      toast.error("يرجى اختيار صورة جديدة");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsSavingImage(true);

    try {
      const response = await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
      });

      const result: ApiResponse<ProfileUser> = await response.json();

      if (result.success) {
        notifyProfileUpdated();
        toast.success("تم تحديث الصورة الشخصية بنجاح");

        const profileResult: ApiResponse<ProfileUser> =
          await GetData("/api/user/profile");

        if (profileResult?.success && profileResult.data) {
          setUser(profileResult.data);

          setFileList([
            {
              uid: "-1",
              name: "profile-image",
              status: "done",
              url: profileResult.data.profileImage || profilePlaceholderBase64,
            },
          ]);
        }
      } else {
        toast.error(result.message || "فشل تحديث الصورة");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الصورة");
    } finally {
      setIsSavingImage(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ar-PS", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <div className={styles["loading"]}>جاري تحميل بيانات الحساب...</div>;
  }

  if (!user) {
    return <div className={styles["loading"]}>تعذر تحميل بيانات الحساب</div>;
  }

  return (
    <main className={styles["profile-page"]}>
      <div className={styles["profile-container"]}>
        <header className={styles["profile-header"]}>
          <h1>تعديل الملف الشخصي</h1>
          <p>إدارة معلومات حسابك الشخصي</p>
        </header>

        <section className={styles["profile-section"]}>
          <div className={styles["section-header"]}>
            <h2>الصورة الشخصية</h2>
            <p>يمكنك تغيير صورتك الشخصية في أي وقت</p>
          </div>

          <div className={styles["image-content"]}>
            <ProfileImageUploader
              fileList={fileList}
              setFileList={setFileList}
            />

            <form action={handleSaveImage}>
              <ActionButton
                title={isSavingImage ? "جاري الحفظ..." : "حفظ الصورة"}
                className={`btn btn-primary ${styles["save-button"]}`}
              />
            </form>
          </div>
        </section>

        <section className={styles["profile-section"]}>
          <div className={styles["section-header"]}>
            <h2>معلومات الحساب</h2>
            <p>يمكنك تعديل اسمك والاطلاع على معلومات حسابك</p>
          </div>

          <form action={handleSaveName}>
            <div className={styles["form-group"]}>
              <label htmlFor="name">الاسم</label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك"
                disabled={isSavingName}
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="email">البريد الإلكتروني</label>

              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                readOnly
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="createdAt">تاريخ إنشاء الحساب</label>

              <input
                id="createdAt"
                type="text"
                value={formatDate(user.createdAt)}
                disabled
                readOnly
              />
            </div>
            <div className={styles["save-button-container"]}>
              <ActionButton
                title={isSavingName ? "جاري الحفظ..." : "حفظ التغييرات"}
                className={`btn btn-primary ${styles["save-button"]}`}
              />
            </div>
          </form>
        </section>

        <section className={styles["profile-section"]}>
          <div className={styles["section-header"]}>
            <h2>كلمة المرور</h2>
            <p>يمكنك إعادة تعيين كلمة المرور الخاصة بحسابك من هنا</p>
          </div>

          <div className={styles["password-content"]}>
            <div>
              <h3>تغيير كلمة المرور</h3>
              <p>سيتم نقلك إلى صفحة إعادة تعيين كلمة المرور</p>
            </div>

            <button
              type="button"
              className={`btn btn-muted ${styles["password-button"]}`}
              onClick={() => router.push("/forgot-password")}
            >
              تغيير كلمة المرور
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Profile;
