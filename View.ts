export default
interface View {
  id: number,
  name: string,
  top: number;
  left: number;
  width: number;
  height: number;
  hasFocus: boolean;
  className: string;
  visibility: number;
  color?: number;
  hasPreview?: boolean;
  paddingRight: number;
  paddingLeft?: number;
  paddingTop?: number;
  paddingBottom?: number;
  marginTop?: number;
  marginLeft?:number;
  marginBottom?:number;
  marginRight?:number;
  text?: string;
  title?: string;
  crc?:number;
  url?: string;
  allCaps?: boolean;
  isBold?: boolean;
  isItalic?: boolean;
  isChecked?: boolean;
  textSize?: number;
  textColor?:number;
  singleLine?:boolean;
  isButton?:boolean;
  gravity?:number;
  typefaceName?: string;
  children: Array<View>;
}

