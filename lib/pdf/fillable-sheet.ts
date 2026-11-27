import { PDFDocument, PDFHexString, PDFName, StandardFonts, rgb } from "pdf-lib";
import type { SheetItem, SheetModel } from "./sheet-model";

export async function createFillableSheet(model: SheetModel, logoBytes: Uint8Array) {
  const doc = await PDFDocument.create();
  doc.setTitle(`${model.title} - ${model.code} | B&B Consultoria Imobiliária`);
  doc.setAuthor("B&B Consultoria Imobiliária");
  doc.setSubject("Ficha preenchível. Assinatura manuscrita com Preencher e assinar em leitor compatível.");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await doc.embedPng(logoBytes);
  const form = doc.getForm();
  const ink = rgb(.09,.09,.1), gray = rgb(.4,.4,.43), gold = rgb(.65,.43,.08), border = rgb(.73,.73,.75);
  const width = 595.28, height = 841.89, margin = 38, content = width - margin * 2;
  let page = doc.addPage([width,height]);
  let y = 0;
  function text(value: string, x: number, at: number, size=9, strong=false) {
    page.drawText(value, {x,y:at,size,font:strong?bold:font,color:ink});
  }
  function lines(value: string, available: number, size=9): string[] {
    const result: string[] = [];
    for (const paragraph of value.replace(/\r/g, "").split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        const candidate=line?`${line} ${word}`:word;
        if(font.widthOfTextAtSize(candidate,size)<=available){line=candidate;continue;}
        if(line){result.push(line);line="";}
        for(const char of word){
          if(font.widthOfTextAtSize(line+char,size)>available&&line){result.push(line);line="";}
          line+=char;
        }
      }
      result.push(line);
    }
    return result;
  }
  function header() {
    page.drawImage(logo,{x:margin,y:height-102,width:72,height:72});
    text("B&B CONSULTORIA IMOBILIÁRIA",margin+86,height-45,10,true);
    text(model.title,margin+86,height-68,18,true);
    text(`Imóvel ${model.code}`,margin+86,height-89,10);
    page.drawLine({start:{x:margin,y:height-114},end:{x:width-margin,y:height-114},thickness:1.5,color:gold});
    y=height-133;
    text("Preencha os campos em um leitor de PDF compatível e salve uma cópia.",margin,y,8);y-=13;
    text("Para assinar com o dedo: use Preencher e assinar (ex.: Adobe Acrobat Reader).",margin,y,8);y-=25;
  }
  header();
  function room(amount: number) {if(y-amount<56){page=doc.addPage([width,height]);header();}}
  const style={borderColor:border,borderWidth:.6,backgroundColor:rgb(1,1,1),textColor:ink,font};
  function itemHeight(item:SheetItem,w:number) {
    if(item.kind==="signature")return 112;
    if(item.kind==="info")return 22+lines(item.value,w).length*12;
    if(item.kind==="radio")return 24+Math.ceil((item.options?.length || 0)/3)*28;
    if(item.kind==="checkbox")return 34;
    if(item.multiline)return 24+Math.max(60,lines(item.value,w-14).length*12+16);
    return 52;
  }
  async function draw(item:SheetItem,x:number,top:number,w:number,h:number) {
    const name=item.name;
    if(item.kind==="checkbox") {
      const field=form.createCheckBox(name);field.acroField.dict.set(PDFName.of("TU"),PDFHexString.fromText(item.label));
      field.addToPage(page,{...style,x,y:top-19,width:15,height:15});
      if(item.checked)field.check();
      text(item.label,x+23,top-16,9);return;
    }
    text(item.label,x,top-9,8,true);
    if(item.kind==="info") {lines(item.value,w).forEach((line,i)=>text(line,x,top-25-i*12));return;}
    if(item.kind==="signature") {
      page.drawRectangle({x,y:top-91,width:w,height:72,borderColor:border,borderWidth:.6});
      if(item.value){const image=await doc.embedPng(item.value);const scaled=image.scaleToFit(w-12,60);page.drawImage(image,{x:x+(w-scaled.width)/2,y:top-85+(60-scaled.height)/2,...scaled});}
      else text("Área reservada à assinatura à mão livre",x+10,top-59,8);
      return;
    }
    if(item.kind==="radio") {
      const field=form.createRadioGroup(name);field.acroField.dict.set(PDFName.of("TU"),PDFHexString.fromText(item.label));
      item.options?.forEach((option,i)=>{const left=x+(i%3)*w/3;const row=Math.floor(i/3)*28;field.addOptionToPage(option.value,page,{...style,x:left,y:top-39-row,width:14,height:14});text(option.label,left+23,top-36-row,9);});
      if(item.value)field.select(item.value);return;
    }
    if(item.kind==="select") {
      const field=form.createDropdown(name);field.acroField.dict.set(PDFName.of("TU"),PDFHexString.fromText(item.label));
      field.addOptions(item.options?.map(option=>option.label) || []);
      const selected=item.options?.find(option=>option.value===item.value);
      if(selected)field.select(selected.label);
      field.addToPage(page,{...style,x,y:top-40,width:w,height:25});field.setFontSize(9);return;
    }
    const field=form.createTextField(name);field.acroField.dict.set(PDFName.of("TU"),PDFHexString.fromText(item.label));
    if(item.multiline)field.enableMultiline();
    field.setText(item.value);
    field.addToPage(page,{...style,x,y:top-h+8,width:w,height:h-24});field.setFontSize(9);
  }
  for(const section of model.sections) {
    room(30+itemHeight(section.items[0],content));
    page.drawRectangle({x:margin,y:y-16,width:3,height:13,color:gold});
    text(section.title.toUpperCase(),margin+11,y-13,10,true);y-=30;
    for(let i=0;i<section.items.length;i++) {
      const item=section.items[i];
      const next=section.items[i+1];
      const pair=!item.wide&&next&&!next.wide;
      const w=pair?(content-20)/2:content;
      const h=Math.max(itemHeight(item,w),pair?itemHeight(next,w):0);
      if(h>600)throw new Error("Um texto é muito longo para a ficha. Reduza-o ou use Imprimir ficha.");
      room(h);await draw(item,margin,y,w,h);
      if(pair){await draw(next,margin+w+20,y,w,h);i++;}
      y-=h+6;
    }
    y-=10;
  }
  for (const note of model.notes || []) {
    for (const line of lines(note,content,8)) {room(12);text(line,margin,y,8);y-=12;}
    y-=8;
  }
  const pages=doc.getPages();
  pages.forEach((p,i)=>{
    p.drawText(`B&B Consultoria Imobiliária | ${model.code} | ${i+1}/${pages.length}`,{x:margin,y:31,size:8,font,color:gray});
    p.drawText("Alterações no PDF não atualizam o CRM. Guarde este documento com segurança.",{x:margin,y:18,size:7,font,color:gray});
  });
  form.updateFieldAppearances(font);
  return doc.save();
}
