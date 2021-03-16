<template>
    <div>
        title: {{this.data.page.title}}
        layout: {{this.data.page.layout}}
        <hr>

        <iframe
          :src='preview'
        ></iframe>
    </div>
    
</template>

<script>
import { Liquid } from 'liquidjs'
import store from '@/store'
import {Base64} from 'js-base64';

const engine = new Liquid({
    dynamicPartials: false,
    fs: {
        readFileSync (file) {
            if(!store.getters.git){debugger;}
            const st = store;
            const blob = store.getters.git.tree[file]
            const text = Base64.decode(blob.content)
            
            return text;
            // return db.model('Template').findByIdSync(file).text
        },
        // await readFile (file) {
        //     const template = await db.model('Template').findById(file)
        //     return template.text
        // },
        existsSync (path) {
            const st = store;
            const exists = path in store.getters.git.tree
            
            return exists
        },
        // await exists () {
        //     return true
        // },
        resolve(root, file, ext) {
            const path = `${root}/${file}`;
            
            return path;
        }
    },
    root: ['_layouts', '_includes'],
})
export default {
    props: ['template', 'data'],
    computed: {
        preview(){
            const header = "data:text/html;charset=utf-8,"
            // return "data:text/html;charset=utf-8,"+"<h1>TITLE</h1>"
            const tpl = engine.parse("{% layout default.html %}"+"\n"+"{{page.title}}")
            return "data:text/html;charset=utf-8,"+engine.renderSync(tpl, this.data)
        }
    },

    methods: {
        encode(txt){
            return Base64.encode(txt)
        }
    },

    filters: {
        encode(txt){
            return Base64.encode(txt)
        }
    }
}
</script>