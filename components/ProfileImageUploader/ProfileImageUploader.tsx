"use client";

import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Image, Upload } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

  interface IProps {
    fileList: UploadFile<any>[],
    setFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
  }
const ProfileImageUploader: React.FC<IProps> = ({fileList, setFileList}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = async ({ fileList }) => {
    setFileList(fileList);
  };

  const uploadButton = (
    <button
      type="button"
      style={{
        border: 0,
        background: "none",
      }}
    >
      <PlusOutlined />
    </button>
  );

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        maxCount={1}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={() => false}
      >
        {fileList.length === 0 && uploadButton}
      </Upload>

      {previewImage && (
        <Image
          styles={{
            root: {
              display: "none",
            },
          }}
          preview={{
            open: previewOpen,
            onOpenChange: (visible) => {
              setPreviewOpen(visible);

              if (!visible) {
                setPreviewImage("");
              }
            },
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default ProfileImageUploader;
