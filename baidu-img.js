const puppeteer = require('puppeteer')
const url = require('url')
const path = require('path')
const imgLoad = require('./imgload')

const httpUrl = 'https://image.baidu.com/'
var argv = require('optimist').argv;

let options = {
    word:argv.word || '图片',
    num:argv.num || 60,
    dir:argv.dir || 'images',
    delay:argv.delay || 600

}
;( async function(){
    let config = {
        headless:true,//无界面操作 ，false表示有界面
        defaultViewport:{
            width:820,
            height:1000,
        },
    }
    let browser = await puppeteer.launch(config)
    let page = await browser.newPage()
    await page.goto(httpUrl)
    await page.focus('#kw')
    await page.keyboard.sendCharacter(options.word);//搜索词
    await page.click('.s_newBtn')
    //页面搜索跳转 执行的逻辑
    page.on('load',async ()=>{
        console.warn('正在为你检索【'+options.word+'】图片请耐心等待...');
        await page.evaluate((options)=>{
            ///获取当前窗口高度  处理懒加载
            let height = document.body.offsetHeight
            let timer = setInterval(()=>{
                //窗口每次滚动当前窗口的2倍
                height=height*2
                window.scrollTo(0,height);
            },2000)

            window.onscroll=function(){
                let arrs = document.querySelectorAll('.main_img')
                //符合指定图片数
                if(arrs.length>=options.num){
                    clearInterval(timer)
                    console.log(`为你搜索到${arrs.length}张【${options.word}】相关的图片\n准备下载（${options.num}）张`);
                }  
            }
        },options)
    })

    await page.on('console',async msg=>{
        console.log(msg.text());
        //提取图片的src
        let res = await page.$$eval('.main_img',eles=>eles.map((e=>e.getAttribute('src'))))
        res.length = options.num
        res.forEach(async (item,i)=>{
            await page.waitFor(options.delay*i)//延迟执行
            await imgLoad(item,options.dir)

        })
        
        await browser.close()
        
    })
})()
