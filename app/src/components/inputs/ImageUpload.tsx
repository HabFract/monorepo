import React, { useState } from 'react';
import { LoadingOutlined, PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

import { createAvatar } from '@dicebear/core';
import { shapes } from '@dicebear/collection';

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const ImageUpload = ({
  field,
  form: { touched, errors, setFieldValue, values },
  ...props
}) => {
  const avatar = createAvatar(shapes, {
    "seed": "Molly" + values.name
    // ... other options
  });

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(avatar.toDataUriSync());
  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setImageUrl(url);
        setFieldValue(field.name, url);
      });
    }
  };

  const uploadButton = (
    <div className='absolute z-10 top-2 left-5 text-dark-gray '>
      <div className='absolute top-3 bg-secondary-transparent text-white hover:bg-secondary rounded-full p-2'>Upload
        <span className="pl-1">{loading ? <LoadingOutlined /> : <PlusCircleFilled />}</span>
      </div>
    </div>
  );

  return (
    <Upload
      name="avatar"
      listType="picture-circle"
      className="avatar-uploader"
      showUploadList={false}
      action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {imageUrl ? <div className='relative w-full h-full'><img src={imageUrl} alt="avatar" style={{ width: '100%' }} />{uploadButton}</div> : uploadButton}
    </Upload>
  );
};

export default ImageUpload;