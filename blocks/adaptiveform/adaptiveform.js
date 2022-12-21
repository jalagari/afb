import ExcelToFormModel from "./libs/afb-transform.js";
import { createFormInstance } from "./libs/afb-runtime.js";
import * as builder from "./libs/afb-builder.js"

export class AdaptiveForm {
    model;
    #form;
    element;

     /**
   * @param {HTMLLinkElement} element
   * @param {any} formJson
   */
     constructor(element, formJson) {
        this.element = element;
        this.model = createFormInstance(formJson, undefined);
     }
 
  /**
   * @param {string} id
   */
     getModel(id)  {
         return this.model?.getElement(id);
     }

    render = async() => {
        const form = document.createElement('form');
        form.className = "cmp-adaptiveform-container cmp-container";
        this.#form = form;

        let state = this.model?.getState();
        await this.renderChildrens(form, state);
        this.element.replaceWith(form);
        return form;
    }
  /** 
   * @param {HTMLFormElement}  form
   * @param {import("afcore").State<import("afcore").FormJson>} state
   * */  
    renderChildrens = async (form, state) => {
        console.time("Rendering childrens")
        let fields = state?.items;
        if(fields && fields.length>0) {
          for(let index in fields) {
            let field = fields[index];
            let fieldModel = this.getModel(field.id);
            let element = await builder?.default?.getRender(fieldModel)
            form.append(element);
          }
        }
        console.timeEnd("Rendering childrens")
    }
 }

 /** 
  * @param {HTMLLinkElement} formLink
  * */
  let createFormContainer = async (formLink) => {
    if(formLink && formLink?.href) {
      
      let url = formLink.href;
      console.log("Loading & Converting excel form to Crispr Form")
      
      console.time('Json Transformation (including Get)');
      const transform = new ExcelToFormModel();
      const convertedData = await transform.getFormModel(url);
      console.timeEnd('Json Transformation (including Get)')
      console.log(convertedData);

      console.time('Form Model Instance Creation');
      let adaptiveform = new AdaptiveForm(formLink, convertedData?.formDef);
      await adaptiveform.render();
      //@ts-ignore
      window.adaptiveform = adaptiveform
      console.timeEnd('Form Model Instance Creation');
    }
  }
  
  /**
   * @param {{ querySelector: (arg0: string) => HTMLLinkElement | null; }} block
   */
  export default async function decorate(block) {
    const formLink = block?.querySelector('a[href$=".json"]');
    if(formLink && formLink?.href) {
        await createFormContainer(formLink);
    }
  }