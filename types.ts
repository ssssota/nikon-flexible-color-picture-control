export type ColorBlenderValues = {
  /** -100~100 */
  hue?: number;
  /** -100~100 */
  chroma?: number;
  /** -100~100 */
  brightness?: number;
};
export type ColorBlender = {
  red?: ColorBlenderValues;
  orange?: ColorBlenderValues;
  yellow?: ColorBlenderValues;
  green?: ColorBlenderValues;
  cyan?: ColorBlenderValues;
  blue?: ColorBlenderValues;
  purple?: ColorBlenderValues;
  magenta?: ColorBlenderValues;
};
export type ColorGradingValues = {
  /** 0~360 */
  hue?: number;
  /** -100~100 */
  chroma?: number;
  /** -100~100 */
  brightness?: number;
};
export type ColorGrading = {
  highlights?: ColorGradingValues;
  midTone?: ColorGradingValues;
  shadows?: ColorGradingValues;
  /** 0~100 */
  blending?: number;
  /** -100~100 */
  balance?: number;
};
export type FlexibleColorPictureControlOptions = {
  /** 1~19 alphanumeric characters */
  name: string;
  /** -3.0~9.0 */
  sharpning?: number;
  /** -5.0~5.0 */
  midRangeSharpning?: number;
  /** -5.0~5.0 */
  clarity?: number;
  /** -100~100 */
  contrast?: number;
  /** -100~100 */
  highlights?: number;
  /** -100~100 */
  shadows?: number;
  /** -100~100 */
  whiteLevel?: number;
  /** -100~100 */
  blackLevel?: number;
  /** -100~100 */
  saturation?: number;

  colorBlender?: ColorBlender;
  colorGrading?: ColorGrading;
};
