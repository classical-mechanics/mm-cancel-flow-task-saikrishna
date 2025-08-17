import VisaSupportBase from "./VisaSupportBase";
import Image, {StaticImageData} from "next/image";

type Img = StaticImageData | string;

export default function VisaSupportModal(props: {
  cityImg: Img;
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  imageSrc?: string;
}) {
  return (
    <VisaSupportBase
      {...props}
      source="with_mm"
      heading="We helped you land the job, now let’s help you secure your visa."
      subheading="We’ve been there and we’re here to help with the visa side of things."
      partnerHint="We can connect you with one of our trusted partners."
    />
  );
}