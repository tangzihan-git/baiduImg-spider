const path = require('path')
const fs = require('fs')
const http  = require('http')
const https = require('https')
const {promisify} = require('util')
const writeFile = promisify(fs.writeFile);

module.exports = async (src,dir)=>{
    if(/\.(jpg|png|jpeg|gif)$/.test(src)){
        await urlToImg(src,dir)
    } else {
        await base64ToImg(src,dir)
    }
}


const urlToImg = (url,dir)=>{
    const mod = /^https:/.test(url)?https:http
    const ext = path.extname(url)
    fs.mkdir(dir,function(err){
        if(!err){
            console.log('成功创建目录')
        }
    })
    const file = path.join(dir, `${Date.now()}${ext}`)
    //请求图片路径下载图片
    mod.get(url,res=>{
        res.pipe(fs.createWriteStream(file))
        .on('finish',()=>{
            console.log(file+' download successful');
        })
    })
  
}

//base64-download
const base64ToImg = async function(base64Str,dir){
    //data:image/jpg;base64,/fdsgfsdgdfghdfdfh
    try{
        const matches = base64Str.match(/^data:(.+?);base64,(.+)$/)
        const ext = matches[1].split('/')[1].replace('jpeg','jpg')//获取后缀
        fs.mkdir(dir,function(err){
            if(!err){
                console.log('成功创建'+dir+'目录')
            }
        })
        const file = path.join(dir, `${Date.now()}.${ext}`)
        const content = matches[2]
        await writeFile(file,content,'base64')
        console.log(file+' download successful');
      
    }catch(e){
        console.log(e);
    }
   
}