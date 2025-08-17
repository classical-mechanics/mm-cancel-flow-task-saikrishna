import VisaSupportBase from "./VisaSupportBase";
import Image, {StaticImageData} from "next/image";

type Img = StaticImageData | string;

export default function VisaSupportNoMMModal(props: {
  cityImg: Img;
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  imageSrc?: string;
}) {
  return (
    <VisaSupportBase
      {...props}
      source="no_mm"
      heading="You landed the job! That’s what we live for."
      subheading="Even if it wasn’t through Migrate Mate, let us help you get your visa sorted."
      partnerHint="We can connect you with one of our trusted partners."
    />
  );
}