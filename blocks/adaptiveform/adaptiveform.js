import ExcelToFormModel from "./libs/afb-transform.js";
import defaultInput from "./components/defaultInput.js";
import { createFormInstance } from "./libs/afb-runtime.js";

export class AdaptiveForm {

  defaultInputTypes = ["color", "date", "datetime-local", "email", "hidden",
                "month", "password", "tel", "text", "time",
                "url", "week"];
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
            let element = await this.getRender(field)
            form.append(element);
          }
        }
        console.timeEnd("Rendering childrens")
    }
    /** 
     * @param {(import("afcore").ContainerJson | import("afcore").FieldJson) & import("afcore").State<import("afcore").ContainerJson | import("afcore").FieldJson>} field
     **/
    getRender = async (field) => {
      const block = document.createElement('div');
      try {
          let fieldModel = this.getModel(field.id);
          let component, fieldType = field?.fieldType;
          if(!this.defaultInputTypes.includes(fieldType) && fieldType) {
            component = await this.loadComponent(fieldType);
          }
          if(component && component.default) {
              await component?.default(block, fieldModel);
          } else {
              defaultInput(block, fieldModel)
          }
      } catch (error) {
          console.error("Unexpected error ", error);
      }
      return block;
    }

    /**
     * @param {string} componentName 
     * @return {Promise<any>} component
     */
    loadComponent = async(componentName) => {
      let modulePath = `./components/${componentName}/${componentName}.js`;
      try {
        return await import(modulePath);
      } catch(error) {
        console.error(`Unable to find module ${componentName}`, error )
      }
      return undefined;
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