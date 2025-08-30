// Avatar image component props
interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  user_id: string;
  thumbnail?: boolean;
  force_refresh?: boolean;
}

export default AvatarImageProps;
