// Nix image component props
interface NixImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  image_id: string;
  thumbnail?: boolean;
  force_refresh?: boolean;
}

export default NixImageProps;
