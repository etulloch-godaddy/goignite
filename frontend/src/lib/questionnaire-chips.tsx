import type { ReactElement } from "react";
import AddFilledIcon from "@ux/icon/add-filled";
import AppsIcon from "@ux/icon/apps";
import BullseyeIcon from "@ux/icon/bullseye";
import ColorPaletteIcon from "@ux/icon/color-palette";
import DollarIcon from "@ux/icon/dollar";
import FoodIcon from "@ux/icon/food";
import HomeFilledIcon from "@ux/icon/home-filled";
import ImageGalleryIcon from "@ux/icon/image-gallery";
import MapIcon from "@ux/icon/map";
import MegaphoneIcon from "@ux/icon/megaphone";
import PlayIcon from "@ux/icon/play";
import ShieldCheckIcon from "@ux/icon/shield-check";
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
  { label: "Legal & business setup", icon: chipIcon(ShieldCheckIcon) },
  { label: "Finding customers", icon: chipIcon(BullseyeIcon) },
  { label: "Pricing & managing money", icon: chipIcon(DollarIcon) },
  { label: "Marketing & promoting", icon: chipIcon(MegaphoneIcon) },
  { label: "Just knowing what to do next", icon: chipIcon(MapIcon) },
  { label: "Building a website / brand", icon: chipIcon(WebsiteIcon) },
  { label: "Honestly… all of it", icon: chipIcon(AppsIcon) },
];

export const existingAssetChipOptions: QuestionnaireChipOption[] = [
  { label: "Name", icon: chipIcon(PlayIcon) },
  { label: "Logo", icon: chipIcon(SparklesFilledIcon) },
  { label: "Social profiles", icon: chipIcon(SmBusinessFilledIcon) },
  { label: "Clients", icon: chipIcon(UserWavingFilledIcon) },
  { label: "Website", icon: chipIcon(ImageGalleryIcon) },
  { label: "Domain", icon: chipIcon(FoodIcon) },
];
