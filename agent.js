import { Agent, run, tool } from "@openai/agents";
import { chromium } from "playwright";
import "dotenv/config"
import z from "zod"
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
  description: "this tool initiate a chromium browser instance",
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
    url: z.string().describe("this the url agent want to open"),
  }),
  execute: async ({url}) => {
   return  await page.goto(url);
  },
});
//screenshot
const screenshot=tool({
    name:'screenshot-tool',
    description:"this tool take screenshot of the page",
   parameters:z.object({
        path:z.string().describe("path to save the screenshot")
    }),
    execute:async({path})=>{
       return await page.screenshot({path:path})
    }
})
const closeBrowser=tool({
    name:'close-browser',
    descripton:'this tool closes the browser instance',
    parameters:z.object({}),
    execute:async()=>{
         await page.waitForTimeout(5000);
        await browser.close(); 
        return "browser closed succesfully"
    }
})
//click

const AutomationAgent = new Agent({
  name: "automation-agent",
  model: "gpt-4o-mini",
  instructions: `you will be given a url , you have to go to lanch a browser go to that url , take a screenshot and savee into the directory`,
  tools:[browserInstance,openwebsite,screenshot,closeBrowser]
});
 const result=await run(AutomationAgent,'go to https://zod.dev/basics and get a screenshot of that page and at the end close browser instance')
console.log(result.history)
 console.log(result.finalOutput)