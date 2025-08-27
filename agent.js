import { Agent, run, tool } from "@openai/agents";
import { chromium } from "playwright";
import "dotenv/config";
import z from "zod";
//tools
//browser

const browser = await chromium.launch({
  headless: false,
  env: {},
  args: ["--disable-extensions", "--disable-file-system"],
});
const page = await browser.newPage();
const browserInstance = tool({
  name: "browser-instance",
  description: "this tool open a browser",
  parameters: z.object({}),
  execute: async () => {
    return "browser lanched";
  },
});
//website
const openwebsite = tool({
  name: "open-website",
  description: "this tool open the url specified ",
  parameters: z.object({
    url: z.string().describe(" url to open"),
  }),
  execute: async ({ url }) => {
    return await page.goto(url);
  },
});
//screenshot
const screenshot = tool({
  name: "screenshot-tool",
  description: " take screenshot of  page",
  parameters: z.object({
    path: z.string().describe("path to save the screenshot"),
  }),
  execute: async ({ path }) => {
    await page.screenshot({ path: path });
    return "screenshot taken successfully"
  },
});
const closeBrowser = tool({
  name: "close-browser",
  descripton: "closes browser instance",
  parameters: z.object({}),
  execute: async () => {
   await page.waitForTimeout(5000);
    await browser.close();
    return "browser closed succesfully";
  },
});
//fill label
const filllabel = tool({
  name: "fill_label",
  description: "this tool detect a label and fill the label",
  parameters: z.object({
    labelname: z
      .string()
      .describe("label in which you want to fill data"),
    data: z.string().describe("data you want to fill in corresponding label"),
  }),
  execute: async ({ labelname, data }) => {
    await page.getByLabel(labelname).fill(data);
    return "label filled succesfully";
  },
});
const fillplaceholder = tool({
  name: "fill_place-holder",
  description: "this tool find by placeholder and fill it",
  parameters: z.object({
    placeholdername: z
      .string()
      .describe("name of the placeholder in which you want to fill data"),
    data: z.string().describe("data you want to fill in label"),
  }),
  excute: async ({ placeholdername, data }) => {
    await page.getByPlaceholder(placeholdername).fill(data);
    return "label filled succesfully";
  },
});
const fillById = tool({
  name: "fill-by-id",
  description: "fills an input field using its HTML id attribute",
  parameters: z.object({
    id: z.string().describe("the id of the input element"),
    data: z.string().describe("the data you want to type in the input"),
  }),
  execute: async ({ id, data }) => {
    await page.locator(`#${id}`).fill(data);
    return `Filled input with id "${id}" successfully`;
  },
});

const clickElement = tool({
  name: "click-element",
  description: "click an element on the page by role and name",
  parameters: z.object({
    role: z.string().describe("the ARIA role of the element, e.g., 'button'"),
    name: z
      .string()
      .describe("the accessible name of the element, e.g., 'Submit'"),
  }),
  execute: async ({ role, name }) => {
    await page.getByRole(role, { name }).click();
    return `Clicked ${role} with name "${name}"`;
  },
});

const AutomationAgent = new Agent({
  name: "automation-agent",
  model: "gpt-4.1",
  instructions: `you are a web automation agent, if strict mode violation ocuur use diffrent tools order`,
  tools: [
    browserInstance,
    openwebsite,
    screenshot,
    closeBrowser,
    filllabel,
    fillplaceholder,
    clickElement,
    fillById
  ],
});
const result = await run(
  AutomationAgent,
  "go to https://ui.chaicode.com/auth/signup , fill all the field  one by one first name :fareha lastname: aslam  email :far@gmail.com password and confirm password as  123456  take screenshot and create Account after all close the browser"
);
console.log(result.history);
console.log(result.finalOutput);
