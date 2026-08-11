import API from "@/services/API";
import React, { useEffect } from "react";
import { Spinner } from "../Spinner";
import NixImageProps from "@/types/nixImageProps";
import ErrorIcon from "@/assets/errorIcon";

export const NixImage: React.FC<NixImageProps> = ({ image_id, ...props }) => {
  const [image, setImage] = React.useState<string | ArrayBuffer>(null);

  useEffect(() => {
    let image_endpoint = `images/get/${image_id}`;
    if (props?.thumbnail) {
      image_endpoint = image_endpoint.concat(`?thumbnail=${props.thumbnail}`);
      if (props?.image_type) {
        image_endpoint = image_endpoint.concat(
          `&image_type=${props.image_type}`,
        );
      }
      if (props?.force_refresh) {
        image_endpoint = image_endpoint.concat(`&t=${new Date().getTime()}`);
      }
    } else {
      if (props?.force_refresh) {
        image_endpoint = image_endpoint.concat(`?t=${new Date().getTime()}`);
      }
    }
    API.get(image_endpoint, { responseType: "arraybuffer" })
      .then((response) => {
        const imageBlob = new Blob([response.data], { type: "image/png" });
        const reader = new FileReader();
        reader.onload = () => {
          const imageDataUrl = reader.result;
          setImage(imageDataUrl);
        };
        reader.readAsDataURL(imageBlob);
      })
      .catch((error) => {
        console.error(error);
        setImage("");
      });
  }, [image_id, props]);

  if (!image)
    return (
      <div
        className={`flex items-center justify-center w-full h-full ${props?.className}`}
      >
        {image === "" ? (
          <div className="flex items-center justify-center w-full h-full">
            <ErrorIcon className="mr-2" />
            <div>Image not found!</div>
          </div>
        ) : (
          <Spinner />
        )}
      </div>
    );

  return <img src={image as string} {...props} />;
};
