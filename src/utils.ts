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

export {resizeImage, randomImage, makeID, toTitleCase};