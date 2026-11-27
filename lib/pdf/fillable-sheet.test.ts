import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PDFDocument, PDFName } from "pdf-lib";
import { createFillableSheet } from "./fillable-sheet";
import type { SheetModel } from "./sheet-model";

test("PDF keeps editable fields, exclusive choices and independent payment options after saving", async () => {
  const logo = await readFile("public/logo-bb.png");
  const model: SheetModel = {title:"Ficha de visita",code:"TESTE",notes:["Condições de uso e confidencialidade."],sections:[{title:"Validação",items:[
    {kind:"text",name:"name",label:"Nome",value:"José da Conceição"},
    {kind:"text",name:"notes",label:"Observações",value:"Primeira linha\nCondição: financiamento.",multiline:true,wide:true},
    {kind:"checkbox",name:"own",label:"Recursos próprios",checked:true,value:"on"},
    {kind:"checkbox",name:"fgts",label:"FGTS",checked:true,value:"on"},
    {kind:"radio",name:"status",label:"Situação",value:"EM_ANALISE",wide:true,options:[{value:"EM_ANALISE",label:"Em análise"},{value:"ACEITA",label:"Aceita"}]},
    {kind:"select",name:"agent",label:"Corretor",value:"2",wide:true,options:[{value:"1",label:"Selecione"},{value:"2",label:"Corretor de teste"}]},
    {kind:"signature",name:"signature",label:"Assinatura",value:"data:image/png;base64,"+logo.toString("base64"),wide:true},
  ]}]};
  const doc=await PDFDocument.load(await createFillableSheet(model,logo));
  const form=doc.getForm();
  assert.equal(form.getFields().length,6);
  assert.equal(form.getTextField("name").getText(),"José da Conceição");
  assert.equal(form.getTextField("notes").getText(),model.sections[0].items[1].value);
  assert.ok(form.getCheckBox("own").isChecked());assert.ok(form.getCheckBox("fgts").isChecked());
  assert.equal(form.getRadioGroup("status").getSelected(),"EM_ANALISE");
  assert.deepEqual(form.getDropdown("agent").getSelected(),["Corretor de teste"]);
  form.getTextField("name").setText("Maria, edição no PDF");
  form.getCheckBox("fgts").uncheck();form.getRadioGroup("status").select("ACEITA");
  const reopened=await PDFDocument.load(await doc.save());
  assert.equal(reopened.getForm().getTextField("name").getText(),"Maria, edição no PDF");
  assert.ok(!reopened.getForm().getCheckBox("fgts").isChecked());
  assert.equal(reopened.getForm().getRadioGroup("status").getSelected(),"ACEITA");
  for(const field of reopened.getForm().getFields())for(const widget of field.acroField.getWidgets()){
    assert.ok(widget.dict.has(PDFName.of("AP")),"Widget needs an appearance");
    const rect=widget.getRectangle();assert.ok(rect.x>=37 && rect.y>=55 && rect.x+rect.width<560,JSON.stringify(rect));
  }
});

test("PDF refuses overflowing text instead of silently losing it",async()=>{
  const logo=await readFile("public/logo-bb.png");
  await assert.rejects(createFillableSheet({title:"Proposta",code:"TESTE",sections:[{title:"Condições",items:[{kind:"text",name:"terms",label:"Condições",value:"Condição extensa. ".repeat(800),wide:true,multiline:true}]}]},logo),/muito longo/);
});
