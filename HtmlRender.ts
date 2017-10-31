// server.js 
//import * as express from './node_modules/express/lib/express'
import * as bodyParser from "body-parser";
import * as fs from "fs";
import View from "./View";
import Action from "./Action";


let pendingActions:Array<Action> = [];

//import ExampleResource from 'example-resource'
let noPadding:boolean = false;



const CENTER_HORIZONTAL = 0x00000001; //Place object in the horizontal center of its container, not changing its size.
const CENTER_VERTICAL = 0x00000010;  //Place object in the vertical center of its container, not changing its size.
const RELATIVE_LAYOUT_DIRECTION = 0x00800000;
const CENTER = CENTER_HORIZONTAL | CENTER_VERTICAL;
const LEFT = 0x00000003;
const TOP = 0x00000030;
const LEFT_TOP = LEFT | TOP;
const TOP_LEFT = LEFT | TOP | RELATIVE_LAYOUT_DIRECTION;
const FOO = 0x00800033;
export default
class HtmlRender {



  constructor () {}

  public  getNeededComponents(view:View, pieces:Array<string>):Array<string> {
    if (pieces == null) 
      pieces = [];
  
    for (let child of view.children) {
      this.getNeededComponents(child, pieces);
    }
    if (!this.doesImageExist(view)) {
      console.log("Need image file for: "+view.name);
      pieces.push(view.name);
    }
    return pieces;
  }
  
  private doesImageExist(view:View):boolean {
    if (view.hasPreview) {
      let crc:string = view.crc.toString(16);
      let imageFileName:string = "./Public/Images/" + view.name + "." + crc + ".PNG";
      return fs.existsSync(imageFileName);
    } 
    return true;
  }

  public createDocument(dataJson:any):string {
    let html = "<!DOCTYPE HTML>\n<html><head>"+
              "<style>\n"+
              "span.SanSerif {position:absolute;left:0;right:-2px;top:0;bottom:0;display:none;zoom:99%}"+
              "span {position:absolute;left:0;right:-2px;top:0;bottom:0;display:none;}"+
              "img {"+
                  "margin-top:0;margin-bottom:0;margin-left:0;margin-right:0;"+
                  "display:block;}"+
                "\n</style>"+
                
                              "<style id='spanHideShow'>\n"+
                              "span {display:none !important;}\n"+"img {display:flex !important;}"+
                              "\n</style>"+
              "<scr"+"ipt type='text/javascript' src='android.js'></sc"+"ript>"+
              "</head><body>"+
              

              
              this.formatIntoHtml(dataJson)+"</body></html>";
             return html;
  }

  private formatColor(color:number, _default:string):string {
    if (color!== 0 && color) {
      let fixedColor:number = (0x00FFFFFF & color) | 0x10000000;
      let colorSelection:string = fixedColor.toString(16);
      colorSelection = "#" + (colorSelection.substr(colorSelection.length-6));
  //  console.log("colorSelection: "+colorSelection);
      return colorSelection;
    }
    return _default;
  }

  private formatGravity(gravity:number):string {
    let css = "";
    switch(gravity) {
      case TOP_LEFT: css = "justify-content: left; align-items: top; "; break;
      case CENTER: css = "justify-content: center; align-items: center; "; break;
      case  1: css = "vertical-align: middle;"; break;
      case 0x00000003: css="foo-align: left;"; break; //LEFT
      case 16: css = "vertical-align: middle;"; break;
      case 80: css ="vertical-align: bottom;"; break;
      case 0x00000005: css = "vertical-align: right;"; break; // RIGHT
      case 0x00000030: css ="vertical-align: top;"; break; // TOP
      case 0x00800003: css ="horizontal-align: top;"; break; // START
      default:
        console.log("WARNING: Invalid Gravity: " + ( gravity.toString(16)));
        css ="";
    }
    return css;
  }
  
  private formatIntoHtml(view:View):string {
    let html:string = "\n\n";
    try {
      let displayState:string = (view.visibility == 0) ? "block" : "none";
      let tagName:string = (view.isButton) ? "BUTTON" : "DIV";
      let hasPreview:boolean = view.hasPreview;
      let id = view.id;
      let crcPrefix:string = (view.crc) ? "." + (view.crc.toString(16)) : "";
      let image = 
                  "<DIV style='position:absolute;top:0;bottom:0;right:0;left:0;display:flex;justify-content: center; align-items: center;'>" +
                      "<IMG id='IMG_"+id+"' style='display:flex;justify-content: center; align-items: center;' src='Images/"+view.name+crcPrefix+".PNG'>"+
                    "</DIV>";
      let children:Array<View> = view.children;
      let childrenHtml:string = "";
      let colorSelection :string = "";
      let backgroundColorStyle: string = "";
      let backgroundOpacityStyle: string = "";
      let toolTip:string = view.className;
      let text = "";
      let textFormatting = "";
      let textColor:string = this.formatColor(view.textColor, "black");
      
      if (view.color !== 0 && view.color) {
        let fixedColor:number = (0x00FFFFFF & view.color) | 0x10000000;
        colorSelection = fixedColor.toString(16);
        colorSelection = "#" + (colorSelection.substr(colorSelection.length-6));
        backgroundColorStyle = "background-color: #" + (colorSelection.substr(colorSelection.length-6))+";";
  //    console.log("colorSelection: "+colorSelection);
        let opacity:number = (((view.color >> 24) & 0x00FF)/0x00FF);
        if (opacity < 1.0) {
        //  backgroundOpacityStyle = "opacity:"+opacity+";";
        }
      }

      if (backgroundColorStyle == "" && view.isButton) {
        backgroundColorStyle = "background-color: transparent;";
      }

      toolTip += "\r\nid: " + view.id;
      if (view.gravity)  toolTip += "\r\ngravity: " + view.gravity;
      if (view.text) { toolTip  += "\r\ntext: " + view.text; }
      if (view.textSize) { toolTip  += "\r\n"+"textSize: " + view.textSize; }
      if (view.isBold || view.isBold == false) { toolTip  += "\r\n"+"isBold: " + view.isBold; }
      if (view.isItalic || view.isItalic == false) { toolTip  += "\r\n"+"isItalic: " + view.isItalic; }
      if (view.isChecked != null) { toolTip  += "\r\n"+"isChecked: " + view.isChecked; }
      if (view.url) { toolTip  += "\r\nurl: " + view.url; }
      if (view.title) { toolTip  += "\r\ntitle: " + view.title; }
      if (view.color) { toolTip += "\r\n" + "colorAsInteger" + view.color; }
      if (colorSelection) { toolTip += "\r\n" + "colorSelection" + colorSelection; }
      if (view.typefaceName != null) { toolTip  += "\r\n"+"typefaceName: " + view.typefaceName; }
      if (view.singleLine != null) { toolTip  += "\r\n"+"singleLine: " + view.singleLine; }
      if (view.text!=null) {
        text = "<span style='display:flex;position:absolute;top:0;left:0;bottom:0;right:0;justify-content:inherit;align-items:inherit;'>"+view.text+"</span>";
        if (view.typefaceName!=null) textFormatting += "fontFamily: " + view.typefaceName + ";";
        let fontFamily = "sans-serif";
        switch (view.typefaceName) {
          default:
          case "DEFAULT":
          case "DEFAULT_BOLD":
          case null: fontFamily = "sans-serif"; break;
          case "SAN_SERIF": fontFamily = "sans_serif"; break;
          case "SERIF": fontFamily = "serif"; break;
        }
        textFormatting += "font-family: " + fontFamily + ";";

        

        if (view.textSize!=null) { textFormatting += "font-size:"+ view.textSize + "px;"; }
        if (view.isBold) { textFormatting += "font-weight:bold;"; }
        if (view.isItalic) { textFormatting += "font-style:italic;"; }
      }

      let padding:string = "";
      if (view.paddingTop!=null) padding += "padding-top:" + view.paddingTop + "px;";
      if (view.paddingLeft!=null) padding += "padding-left:" + view.paddingLeft + "px;";
      if (view.paddingBottom!=null) padding += "padding-bottom:" + view.paddingBottom + "px;";
      if (view.paddingRight!=null) padding += "padding-right:" + view.paddingRight + "px;";

      if (noPadding) {
        padding += "margin-top:" + ((view.marginTop==null)?0:view.marginTop) + "px;";
        padding += "margin-left:" + ((view.marginLeft==null)?0:view.marginLeft) + "px;";
        padding += "margin-bottom:" + ((view.marginBottom==null)?0:view.marginBottom) + "px;";
        padding += "margin-right:" +  ((view.marginRight==null)?0:view.marginRight) + "px;";
      }
      let styles:string = padding;
      let decoration:string = "";
  if (view.allCaps) decoration += "text-transform: uppercase;"
      styles += decoration;
      if (view.gravity)  styles += this.formatGravity(view.gravity);

      if (view.singleLine) styles += "white-space: nowrap;";


      for (let child of children) {
        childrenHtml += this.formatIntoHtml(child);
      }
      
    html = "\n" +
        "<" + tagName + " " +
            ((id != -1) ? "id='DIV_"+id+"' " : "") +
            "name='" + view.name + "' " +
            "title='"+toolTip+"' "+
            "style='position:absolute;"+                  
                  "display:"+displayState+";"+
                    backgroundColorStyle +
                    backgroundOpacityStyle +
                    textFormatting +
                    styles +
                    "color:" + textColor + ";"+
                    "overflow: hidden;" +
                    "top:"+view.top+"px;" +
                    "left:"+view.left+"px;" +                
                    "width:"+view.width+"px;" +
                    "height:"+view.height+"px'>"+
            ((hasPreview) ? image : "") +
            childrenHtml +
            text +
        "</" + tagName + ">\n";
      } catch(e) {
        html = "\n<!--  ERROR: creating html -->\n";
        console.error("ERROR: creating html: ",e);
      }
      return html;
  }
}
