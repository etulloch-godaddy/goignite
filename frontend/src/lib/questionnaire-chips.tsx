import type { ReactElement } from "react";
import AddFilledIcon from "@ux/icon/add-filled";
import BullseyeIcon from "@ux/icon/bullseye";
import ColorPaletteIcon from "@ux/icon/color-palette";
import DollarIcon from "@ux/icon/dollar";
import FoodIcon from "@ux/icon/food";
import HomeFilledIcon from "@ux/icon/home-filled";
import ImageGalleryIcon from "@ux/icon/image-gallery";
import MapIcon from "@ux/icon/map";
import MegaphoneIcon from "@ux/icon/megaphone";
import PlayIcon from "@ux/icon/play";
import SmBusinessFilledIcon from "@ux/icon/sm-business-filled";
import SparklesFilledIcon from "@ux/icon/sparkles-filled";
import UserWavingFilledIcon from "@ux/icon/user-waving-filled";
import WebsiteIcon from "@ux/icon/website";

const ICON_SIZE = 24;

function chipIcon(Icon: React.ComponentType<{ width?: number; height?: number }>): ReactElement {
  return <Icon width={ICON_SIZE} height={ICON_SIZE} />;
}

export type QuestionnaireChipOption = {
  label: string;
  icon: ReactElement;
};

export const businessTypeChipOptions: QuestionnaireChipOption[] = [
  { label: "Content & media", icon: chipIcon(PlayIcon) },
  { label: "Beauty & wellness", icon: chipIcon(SparklesFilledIcon) },
  { label: "Clothing & merch", icon: chipIcon(SmBusinessFilledIcon) },
  { label: "Services", icon: chipIcon(UserWavingFilledIcon) },
  { label: "Digital products", icon: chipIcon(ImageGalleryIcon) },
  { label: "Food & drink", icon: chipIcon(FoodIcon) },
  { label: "Home & handmade", icon: chipIcon(HomeFilledIcon) },
  { label: "Art & design", icon: chipIcon(ColorPaletteIcon) },
  { label: "Something else", icon: chipIcon(AddFilledIcon) },
];

export const confusionChipOptions: QuestionnaireChipOption[] = [
  { label: "Knowing where to start", icon: chipIcon(MapIcon) },
  { label: "Building my website", icon: chipIcon(WebsiteIcon) },
  { label: "Branding & design", icon: chipIcon(ColorPaletteIcon) },
  { label: "Marketing & social media", icon: chipIcon(MegaphoneIcon) },
  { label: "Getting customers & sales", icon: chipIcon(BullseyeIcon) },
  { label: "Pricing & making money", icon: chipIcon(DollarIcon) },
];

export const existingAssetChipOptions: QuestionnaireChipOption[] = [
  { label: "Business name", icon: chipIcon(SmBusinessFilledIcon) },
  { label: "Logo", icon: chipIcon(ColorPaletteIcon) },
  { label: "Website", icon: chipIcon(WebsiteIcon) },
  { label: "Social media", icon: chipIcon(MegaphoneIcon) },
  { label: "Product photos", icon: chipIcon(ImageGalleryIcon) },
  { label: "Paying customers", icon: chipIcon(UserWavingFilledIcon) },
];
