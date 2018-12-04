let needloadNum = 0;//需要load的图片数量
let hasLoad = 0;//已经load的图片数量
let loadImg  = (url,resolve,reject) => ({
    let img = document.createElement("img");
    img.onload = () = > ({
        if( ++hasLoad >= needloadNum ){
            resolve();
        }
    });
    if( typeof url === "undefined" ){
        img.onload();
    }else{
        img.src = url;
    }
})

let loadImgArray = (array,resolve,reject) => ({
    needloadNum = array.length;
    array.forEach(val => {
        loadImg(val.url,resolve,reject);
    });
})
export default{loadImgArray,loadImg}