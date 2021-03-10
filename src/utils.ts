function resizeImage(dataUrl, fit="fit", target_rect={w: 1024, h: 1024} ,make_images_smaller_but_not_larger=true){
    return new Promise((resolve)=>{
        let img = document.createElement("img")
        img.src = dataUrl
        img.onload = ()=>{
            // calculate image rect
            let scale = Math.min(target_rect.w/img.width, target_rect.h/img.height)
            const x = 0;
            const y = 0;
            const w = img.width*scale;
            const h = img.height*scale

            if(make_images_smaller_but_not_larger && scale<1){
                // donwsize image
                let canvas = document.createElement('canvas')
                canvas.width  = w;
                canvas.height = h;
                let ctx = canvas.getContext('2d')

                ctx!.drawImage(img, x,y, w, h)
                dataUrl = canvas.toDataURL("image/jpeg", 0.92)

                resolve(dataUrl)
            }else{
                resolve(dataUrl)
            }
        }
    })
}

function randomColor(){
    return `rgb(${(Math.random()*256).toFixed(0)},${(Math.random()*256).toFixed(0)},${(Math.random()*256).toFixed(0)})`
}

function randomImage(width=128, height=128){
    const c = document.createElement("canvas")
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d")
    let grd = ctx!.createLinearGradient(0,0,width,0)
    grd.addColorStop(0, randomColor())
    grd.addColorStop(1, randomColor())
    ctx!.fillStyle = grd;
    ctx!.fillRect(0,0,200,200)
    return c.toDataURL("image/jpeg", 0.6);
}

function makeID(length=8){
	let str = ""
	const abc = "abcdefghijklmnopqrstuvwxyz"
		   +"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
           +"0123456789"
    const abcLength = abc.length;

    for(let i=0; i<length;i++){
    	str+=abc.charAt(Math.floor(Math.random() * abcLength));
    }
    return str
}

function toTitleCase(text:string):string{
    const minors = ["a", "an", "the", 
                    "and", "as", "but", "for", "if", "nor", "or", "so", "yet", "as", "at", "by", "for", "in", "of", "off", "per", "to", "up", "via", 
                    "too", "van", "egy"]

    return text
    .toLowerCase()
    .split(" ")
    .map((word, idx)=>((minors.indexOf(word)>=0) && idx!=0) ? word :  word.charAt(0).toUpperCase()+word.slice(1))
    .join(" ");
}

/* utilities */
function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1:number) {
            return String.fromCharCode(parseInt('0x' + p1, 16));
    }));
}

export {resizeImage, randomImage, makeID, toTitleCase, b64DecodeUnicode, b64EncodeUnicode};