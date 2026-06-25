import React from "react";
import { ReactCompareSlider } from "@/lib/src/ReactCompareSlider";
import { ReactCompareSliderImage } from "@/lib/src/ReactCompareSliderImage";
import ReactCompareImage from "react-compare-image";

const [image1, image2] = [
  `${
    import.meta.env.VITE_API_URL
  }/uploads/1742539595134-Weixin Image_20240327235012.jpg`,
  `${
    import.meta.env.VITE_API_URL
  }/uploads/1742539914995-3_eclipse_8k_68c85.jpg`,
];
export default function Compare(): JSX.Element {
  return (
    <>
      <div>ReactCompareSlider</div>
      <ReactCompareSlider
        itemOne={<ReactCompareSliderImage src={image1} alt="Image one" />}
        itemTwo={<ReactCompareSliderImage src={image2} alt="Image two" />}
      />
      <div>ReactCompareImage</div>
      {/* <div style={{ width: "100%" }}>
        <ReactCompareImage leftImage={image1} rightImage={image2} />
      </div> */}
    </>
  );
}
